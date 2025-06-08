import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';
import { Send, LogOut, Loader2, Settings } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const Chat = () => {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setUser(session.user);
      loadMessages(session.user.id);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigate('/login');
        } else {
          setUser(session.user);
          loadMessages(session.user.id);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const typedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        created_at: msg.created_at,
      }));

      setMessages(typedMessages);
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to load messages', variant: 'destructive' });
    }
  };

  const saveMessage = async (role: 'user' | 'assistant', content: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert({ user_id: user?.id, role, content });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error saving message:', error);
    }
  };

  const callLLM = async (userMessage: string) => {
    const apiKey = localStorage.getItem('llm_api_key');
    const provider = localStorage.getItem('llm_provider') || 'openai';

    if (provider !== 'lmstudio' && !apiKey) {
      toast({
        title: 'API Key Requerida',
        description: 'Por favor configura tu API key en los ajustes.',
        variant: 'destructive',
      });
      navigate('/api-key');
      return;
    }

    const systemPrompt = 'You are LexIA, a legal assistant specialized in Spanish and European law. Always answer clearly and cite legal norms or case law when relevant.';

    try {
      let response;
      let responseContent;

      if (provider === 'openai') {
        const openaiMessages = [
          { role: 'system', content: systemPrompt },
          ...messages.map(msg => ({ role: msg.role, content: msg.content })),
          { role: 'user', content: userMessage }
        ];

        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ model: 'gpt-4o', messages: openaiMessages, max_tokens: 1000 }),
        });

        const data = await response.json();
        if (data?.error?.code === 'insufficient_quota') {
          localStorage.setItem('llm_api_error', 'Tu API Key de OpenAI no tiene créditos disponibles.');
        } else if (data?.error?.code === 'invalid_api_key') {
          localStorage.setItem('llm_api_error', 'La API Key de OpenAI no es válida.');
        }

        responseContent = data.choices?.[0]?.message?.content;
      } else if (provider === 'gemini') {
        const geminiMessages = messages.map(msg => ({ role: msg.role, parts: [{ text: msg.content }] }));

        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [...geminiMessages, { role: 'user', parts: [{ text: userMessage }] }],
            systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] },
            generationConfig: { maxOutputTokens: 1000, temperature: 0.4 }
          }),
        });

        const data = await response.json();
        if (data?.error?.code === 'API_KEY_INVALID') {
          localStorage.setItem('llm_api_error', 'La API Key de Gemini no es válida.');
        }
        responseContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      } else if (provider === 'lmstudio') {
        const lmstudioMessages = [
          { role: 'system', content: systemPrompt },
          ...messages.map(msg => ({ role: msg.role, content: msg.content })),
          { role: 'user', content: userMessage }
        ];

        response = await fetch('http://192.168.10.12:1234/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'mistral-7b-instruct-v0.1', // Modelo de LM Studio
            messages: lmstudioMessages,
            max_tokens: 1000,
          }),
        });

        const data = await response.json();
        // LM Studio no suele requerir una API Key, por lo que el manejo de errores es diferente
        responseContent = data.choices?.[0]?.message?.content;
      }

      if (!response?.ok || !responseContent) throw new Error();
      return responseContent;

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al obtener respuesta de la IA. Revisa tu clave y proveedor.',
        variant: 'destructive',
      });
      localStorage.setItem('llm_last_error', 'Error al obtener respuesta de la IA. Verifica si tu API key ha caducado o si tu cuenta tiene saldo.');
      return null;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user) return;
    const userMessage = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newUserMessage]);
    await saveMessage('user', userMessage);

    const aiResponse = await callLLM(userMessage);
    if (aiResponse) {
      const newAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, newAiMessage]);
      await saveMessage('assistant', aiResponse);
    }

    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({ title: 'Sesión cerrada', description: 'Has cerrado sesión exitosamente' });
      navigate('/login');
    } catch (error: any) {
      toast({ title: 'Error', description: 'Error al cerrar sesión', variant: 'destructive' });
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="bg-white/80 backdrop-blur-lg shadow-xl border-0">
          <CardHeader className="border-b border-gray-200/50">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LexIA Chat
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => navigate('/api-key')} className="hover:bg-gray-100">
                  <Settings className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-gray-100">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea ref={scrollAreaRef} className="h-[calc(100vh-280px)] p-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                  >
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                      <div className="text-sm mb-1">{message.role === 'user' ? 'Tú' : 'LexIA'}</div>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className="text-xs mt-1 opacity-70">{formatTime(message.created_at)}</div>
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start mb-4">
                    <div className="bg-gray-100 rounded-2xl px-4 py-2">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </ScrollArea>

            <div className="p-4 border-t border-gray-200/50">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chat;
