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

export function PageAuthWrapper({ children }: { children: React.ReactNode }) {
  console.log('🔐 [PAGE_AUTH_WRAPPER] Renderizando wrapper...');
  
  // Estado para controlar se o componente foi montado no cliente
  const [mounted, setMounted] = useState(false);
  
  // Estado inicial com carregamento
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  });

  console.log('🔐 [PAGE_AUTH_WRAPPER] Estado inicial:', authState);

  // Efeito para marcar o componente como montado
  useEffect(() => {
    setMounted(true);
  }, []);

  // Efeito para verificar a sessão do usuário
  useEffect(() => {
    if (!mounted) return; // Só executar após montar no cliente
    
    async function checkSession() {
      try {
        console.log('🔐 [AUTH] Verificando sessão...');
        
        // Importação dinâmica para evitar problemas de SSR
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        
        // Verificar sessão
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ [AUTH] Erro ao verificar sessão:', sessionError);
          setAuthState({ user: null, isLoading: false, isAuthenticated: false });
          return;
        }
        
        if (!session) {
          console.log('🔐 [AUTH] Nenhuma sessão encontrada');
          setAuthState({ user: null, isLoading: false, isAuthenticated: false });
          return;
        }
        
        console.log('✅ [AUTH] Sessão encontrada:', session.user.email);
        
        // Verificar role do usuário
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_uuid', session.user.id)
          .single();
        
        if (roleError) {
          console.error('❌ [AUTH] Erro ao verificar role:', roleError);
          setAuthState({ user: null, isLoading: false, isAuthenticated: false });
          return;
        }
        
        // Criar objeto de usuário com role
        const user: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          role: roleData?.role as 'student' | 'teacher' | 'admin'
        };
        
        console.log('✅ [AUTH] Usuário autenticado com role:', user);
        setAuthState({ user, isLoading: false, isAuthenticated: true });
      } catch (error) {
        console.error('❌ [AUTH] Erro ao verificar sessão:', error);
        
        console.log('❌ [AUTH] Erro ao verificar sessão:', error);
        setAuthState({ user: null, isLoading: false, isAuthenticated: false });
      }
    }
    
    checkSession();
  }, [mounted]); // Adicionado mounted como dependência

  // Função de login com Supabase
  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 [AUTH] Tentativa de login:', email);
      
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Importação dinâmica para evitar problemas de SSR
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      // Tentar login com Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('❌ [AUTH] Erro no login:', error);
        setAuthState({ user: null, isLoading: false, isAuthenticated: false });
        return { success: false, error: error.message };
      }
      
      if (!data.user) {
        console.error('❌ [AUTH] Login sem usuário retornado');
        setAuthState({ user: null, isLoading: false, isAuthenticated: false });
        return { success: false, error: 'Usuário não encontrado' };
      }
      
      // Verificar role do usuário
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_uuid', data.user.id)
        .single();
      
      if (roleError) {
        console.error('❌ [AUTH] Erro ao verificar role:', roleError);
        setAuthState({ user: null, isLoading: false, isAuthenticated: false });
        return { success: false, error: 'Erro ao verificar permissões do usuário' };
      }
      
      // Criar objeto de usuário com role
      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email || '',
        role: roleData?.role as 'student' | 'teacher' | 'admin'
      };
      
      console.log('✅ [AUTH] Login bem-sucedido:', user);
      setAuthState({ user, isLoading: false, isAuthenticated: true });
      return { success: true, user };
    } catch (error: any) {
      console.error('❌ [AUTH] Erro no login:', error);
      setAuthState({ user: null, isLoading: false, isAuthenticated: false });
      return { success: false, error: error.message };
    }
  };

  // Função de cadastro com Supabase
  const signUp = async (email: string, password: string) => {
    try {
      console.log('📝 [AUTH] Tentativa de cadastro:', email);
      
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Importação dinâmica para evitar problemas de SSR
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      // Tentar cadastro com Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/login'
        }
      });
      
      if (error) {
        console.error('❌ [AUTH] Erro no cadastro:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: error.message };
      }
      
      console.log('✅ [AUTH] Cadastro iniciado:', data);
      
      // Não autenticar automaticamente após o cadastro
      // O usuário precisa confirmar o email primeiro
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      return { 
        success: true, 
        message: 'Cadastro realizado! Verifique seu email para confirmar sua conta.' 
      };
    } catch (error: any) {
      console.error('❌ [AUTH] Erro no cadastro:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.message };
    }
  };

  // Função de logout com Supabase
  const signOut = async () => {
    try {
      console.log('🚪 [AUTH] Iniciando logout...');
      
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Importação dinâmica para evitar problemas de SSR
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      // Logout no Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ [AUTH] Erro no logout:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: error.message };
      }
      
      console.log('✅ [AUTH] Logout bem-sucedido');
      
      // Atualizar estado
      setAuthState({ user: null, isLoading: false, isAuthenticated: false });
      
      // Redirecionar para a página inicial após logout
      window.location.href = '/';
      
      return { success: true };
    } catch (error: any) {
      console.error('❌ [AUTH] Erro no logout:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.message };
    }
  };

  // Função para atualizar usuário
  const refreshUser = async () => {
    try {
      console.log('🔄 [AUTH] Iniciando refresh do usuário...');
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Importação dinâmica para evitar problemas de SSR
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      // Verificar sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ [AUTH] Erro ao verificar sessão:', sessionError);
        setAuthState({ user: null, isLoading: false, isAuthenticated: false });
        return;
      }
      
      if (!session) {
        console.log('🔐 [AUTH] Nenhuma sessão encontrada no refresh');
        setAuthState({ user: null, isLoading: false, isAuthenticated: false });
        return;
      }
      
      // Verificar role do usuário
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_uuid', session.user.id)
        .single();
      
      if (roleError) {
        console.error('❌ [AUTH] Erro ao verificar role no refresh:', roleError);
        setAuthState({ user: null, isLoading: false, isAuthenticated: false });
        return;
      }
      
      // Criar objeto de usuário com role
      const user: AuthUser = {
        id: session.user.id,
        email: session.user.email || '',
        role: roleData?.role as 'student' | 'teacher' | 'admin'
      };
      
      console.log('✅ [AUTH] Refresh bem-sucedido:', user);
      setAuthState({ user, isLoading: false, isAuthenticated: true });
    } catch (error) {
      console.error('❌ [AUTH] Erro no refresh do usuário:', error);
      setAuthState({ user: null, isLoading: false, isAuthenticated: false });
    }
  };

  const value: AuthContextType = {
    ...authState,
    signIn,
    signUp,
    signOut,
    refreshUser
  };

  console.log('🔐 [PAGE_AUTH_WRAPPER] Valor do contexto:', value);

  return (
    <AuthContext.Provider value={value}>
      {mounted ? children : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  console.log('🔐 [USE_AUTH] Hook sendo chamado...');
  
  // Verificar se estamos no cliente
  if (typeof window === 'undefined') {
    console.log('🔐 [USE_AUTH] Executando no servidor, retornando contexto vazio');
    return {
      user: null,
      isLoading: true,
      isAuthenticated: false,
      signIn: async () => ({ success: false, error: 'Executando no servidor' }),
      signUp: async () => ({ success: false, error: 'Executando no servidor' }),
      signOut: async () => ({ success: false, error: 'Executando no servidor' }),
      refreshUser: async () => {}
    };
  }
  
  const context = useContext(AuthContext);
  console.log('🔐 [USE_AUTH] Contexto encontrado:', !!context);
  
  if (context === undefined) {
    console.error('❌ [USE_AUTH] Contexto não encontrado!');
    throw new Error('useAuth deve ser usado dentro de um PageAuthWrapper');
  }
  
  console.log('🔐 [USE_AUTH] Retornando contexto:', context);
  return context;
}
