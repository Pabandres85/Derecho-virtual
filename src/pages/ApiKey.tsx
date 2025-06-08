import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';

const ApiKey = () => {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('openai');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
    };
    checkAuth();

    // Load saved API key and provider from localStorage
    const savedKey = localStorage.getItem('llm_api_key');
    const savedProvider = localStorage.getItem('llm_provider');
    if (savedKey) setApiKey(savedKey);
    if (savedProvider) setProvider(savedProvider);

    // Mostrar último error si existe
    const lastError = localStorage.getItem('llm_last_error');
    if (lastError) {
      toast({
        title: 'Error detectado',
        description: lastError,
        variant: 'destructive',
      });
    }
  }, [navigate, toast]);

  const handleSave = () => {
    if (!apiKey.trim() && provider !== 'lmstudio') {
      toast({
        title: "Error",
        description: "Por favor ingresa una API key válida",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('llm_api_key', apiKey);
    localStorage.setItem('llm_provider', provider);
    localStorage.removeItem('llm_last_error'); // Limpiar errores anteriores

    toast({
      title: "Éxito",
      description: "API key guardada correctamente",
    });

    navigate('/chat');
  };

  const handleClear = () => {
    localStorage.removeItem('llm_api_key');
    localStorage.removeItem('llm_provider');
    localStorage.removeItem('llm_last_error');
    setApiKey('');
    setProvider('openai');

    toast({
      title: "Éxito",
      description: "API key eliminada",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="bg-white/80 backdrop-blur-lg shadow-xl border-0">
          <CardHeader className="border-b border-gray-200/50">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Configuración de API Key
            </CardTitle>
            <CardDescription className="text-gray-700">
              Configura tu proveedor de IA y clave API. Tu clave se almacena localmente en tu navegador y nunca se envía a nuestros servidores.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="provider" className="text-gray-800">Proveedor de IA</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Selecciona un proveedor" />
                </SelectTrigger>
                <SelectContent className="bg-white/90 backdrop-blur-lg">
                  <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                  <SelectItem value="lmstudio">LM Studio (Servidor Local)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {provider !== 'lmstudio' && (
              <div className="space-y-2">
                <Label htmlFor="apikey" className="text-gray-800">API Key</Label>
                <Input
                  id="apikey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={provider === 'openai' ? 'sk-...' : provider === 'gemini' ? 'AI...' : 'No requerida o cualquier valor'}
                  className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-600">
                  {provider === 'openai' 
                    ? 'Obtén tu clave API de OpenAI en platform.openai.com'
                    : provider === 'gemini' 
                    ? 'Obtén tu clave API de Gemini en makersuite.google.com'
                    : 'Si LM Studio no requiere una clave, puedes ingresar cualquier valor o dejarlo vacío.'
                  }
                </p>
              </div>
            )}

            <div className="flex justify-between gap-4">
              <Button
                variant="outline"
                onClick={handleClear}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
              >
                Limpiar Clave
              </Button>
              <div className="flex space-x-2 w-full justify-end">
                <Button
                  variant="outline"
                  onClick={() => navigate('/chat')}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Guardar Clave
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApiKey;
