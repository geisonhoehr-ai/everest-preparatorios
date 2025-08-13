"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'teacher' | 'student';
  allowedRoles?: ('admin' | 'teacher' | 'student')[];
  fallback?: React.ReactNode;
}

export function RouteGuard({ 
  children, 
  requiredRole, 
  allowedRoles,
  fallback 
}: RouteGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setIsLoading(true);

        // Verificar se usuário está autenticado
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.user) {
          console.log('❌ [ROUTE_GUARD] Usuário não autenticado');
          router.push('/login-simple');
          return;
        }

        // Buscar role do usuário
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_uuid', session.user.id)
          .single();

        if (roleError || !roleData) {
          console.log('⚠️ [ROUTE_GUARD] Role não encontrado');
          router.push('/access-denied');
          return;
        }

        const role = roleData.role;
        setUserRole(role);

        // Verificar permissões
        let access = false;

        if (requiredRole) {
          // Verificar role específico
          if (role === 'admin') {
            access = true; // Admin tem acesso a tudo
          } else if (role === requiredRole) {
            access = true;
          }
        } else if (allowedRoles) {
          // Verificar se role está na lista permitida
          access = allowedRoles.includes(role as any) || role === 'admin';
        } else {
          // Sem restrições específicas
          access = true;
        }

        if (access) {
          setHasAccess(true);
        } else {
          console.log(`🚫 [ROUTE_GUARD] Acesso negado. Role: ${role}, Requerido: ${requiredRole || allowedRoles}`);
          router.push('/access-denied');
        }

      } catch (error) {
        console.error('❌ [ROUTE_GUARD] Erro ao verificar acesso:', error);
        router.push('/access-denied');
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [router, requiredRole, allowedRoles, supabase.auth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Verificando permissões..." />
      </div>
    );
  }

  if (!hasAccess) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
          <p className="text-sm text-gray-500 mt-2">Role atual: {userRole}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Componentes específicos para diferentes níveis de acesso
export function AdminOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RouteGuard requiredRole="admin" fallback={fallback}>
      {children}
    </RouteGuard>
  );
}

export function TeacherOrAdmin({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={['teacher', 'admin']} fallback={fallback}>
      {children}
    </RouteGuard>
  );
}

export function AuthenticatedOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RouteGuard fallback={fallback}>
      {children}
    </RouteGuard>
  );
} 