import React from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { MessageSquare, Settings, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('llm_api_key');
      localStorage.removeItem('llm_provider');
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-bold text-primary">Derecho Virtual</h1>
          <div className="flex items-center space-x-4">
            <Link to="/chat">
              <Button 
                variant={location.pathname === '/chat' ? 'default' : 'ghost'} 
                size="sm"
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Chat
              </Button>
            </Link>
            <Link to="/api-key">
              <Button 
                variant={location.pathname === '/api-key' ? 'default' : 'ghost'} 
                size="sm"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                API Key
              </Button>
            </Link>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;

