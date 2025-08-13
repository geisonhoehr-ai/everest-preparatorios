"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getAuthAndRole, clearUserRoleCache } from '@/lib/get-user-role';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  role: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    role: 'student',
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  const router = useRouter();
  const supabase = createClient();
  const isInitialized = useRef(false);
  const authCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  // Função otimizada para verificar autenticação
  const checkAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const { user, role, isAuthenticated } = await getAuthAndRole();

      if (isAuthenticated && user) {
        setAuthState({
          user: {
            id: user.id,
            email: user.email || '',
            role: role
          },
          role,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } else {
        setAuthState({
          user: null,
          role: 'student',
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('❌ [AUTH] Erro ao verificar autenticação:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao verificar autenticação'
      }));
    }
  }, []);

  // Função para fazer logout
  const signOut = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      // Limpar cache e estado
      clearUserRoleCache();
      setAuthState({
        user: null,
        role: 'student',
        isAuthenticated: false,
        isLoading: false,
        error: null
      });

      // Redirecionar para login
      router.push('/login');
    } catch (error) {
      console.error('❌ [AUTH] Erro ao fazer logout:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao fazer logout'
      }));
    }
  }, [supabase.auth, router]);

  // Função para forçar atualização da autenticação
  const refreshAuth = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  // Verificar autenticação inicial e configurar listener
  useEffect(() => {
    if (isInitialized.current) return;
    
    isInitialized.current = true;

    // Verificação inicial
    checkAuth();

    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        console.log('🔄 [AUTH] Mudança de estado:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Usuário fez login
          await checkAuth();
        } else if (event === 'SIGNED_OUT') {
          // Usuário fez logout
          clearUserRoleCache();
          setAuthState({
            user: null,
            role: 'student',
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Token foi renovado
          await checkAuth();
        }
      }
    );

    // Cleanup
    return () => {
      subscription.unsubscribe();
      if (authCheckTimeout.current) {
        clearTimeout(authCheckTimeout.current);
      }
    };
  }, [supabase.auth, checkAuth]);

  // Verificar autenticação periodicamente (a cada 5 minutos)
  useEffect(() => {
    const interval = setInterval(() => {
      if (authState.isAuthenticated) {
        checkAuth();
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [authState.isAuthenticated, checkAuth]);

  return {
    ...authState,
    isInitialized: isInitialized.current,
    canAccess: (requiredRole: string) => authState.role === requiredRole || authState.role === 'admin',
    signOut,
    refreshAuth,
    checkAuth
  };
}

// Hook para proteção de componentes
export function useRequireAuth(requiredRole?: string) {
  const auth = useAuth()

  if (!auth.isInitialized) {
    return { ...auth, canRender: false, reason: 'loading' }
  }

  if (!auth.isAuthenticated) {
    return { ...auth, canRender: false, reason: 'unauthenticated' }
  }

  if (requiredRole && !auth.canAccess(requiredRole)) {
    return { ...auth, canRender: false, reason: 'insufficient_permissions' }
  }

  return { ...auth, canRender: true, reason: 'authorized' }
} 