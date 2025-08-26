'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface AuthUser {
  id: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SafeAuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Simular um usuário logado para teste
    const testUser: AuthUser = {
      id: '67c33d88-b8d8-46a2-85f0-ed658cf6c85b',
      email: 'geisonhoehr@gmail.com',
      role: 'admin'
    };
    setAuthState({ user: testUser, isLoading: false, isAuthenticated: true });
  }, []);

  // Função de login simplificada
  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 [AUTH] Tentativa de login:', email);
      
      // Simulação simples para teste
      if (email === 'geisonhoehr@gmail.com' && password === '123456') {
        const user: AuthUser = {
          id: '67c33d88-b8d8-46a2-85f0-ed658cf6c85b',
          email: email,
          role: 'admin'
        };
        
        setAuthState({ user, isLoading: false, isAuthenticated: true });
        return { success: true, user };
      }
      
      return { success: false, error: 'Credenciais inválidas' };
    } catch (error: any) {
      console.error('❌ [AUTH] Erro no login:', error);
      return { success: false, error: error.message };
    }
  };

  // Função de cadastro simplificada
  const signUp = async (email: string, password: string) => {
    try {
      console.log('📝 [AUTH] Tentativa de cadastro:', email);
      return { success: true };
    } catch (error: any) {
      console.error('❌ [AUTH] Erro no cadastro:', error);
      return { success: false, error: error.message };
    }
  };

  // Função de logout simplificada
  const signOut = async () => {
    try {
      console.log('🚪 [AUTH] Logout');
      setAuthState({ user: null, isLoading: false, isAuthenticated: false });
      return { success: true };
    } catch (error: any) {
      console.error('❌ [AUTH] Erro no logout:', error);
      return { success: false, error: error.message };
    }
  };

  // Função para atualizar usuário
  const refreshUser = async () => {
    console.log('🔄 [AUTH] Refresh user');
  };

  const value: AuthContextType = {
    ...authState,
    signIn,
    signUp,
    signOut,
    refreshUser
  };

  // Renderizar sempre o mesmo conteúdo no servidor e cliente
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um SafeAuthProvider');
  }
  return context;
}
