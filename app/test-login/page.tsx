'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestLoginPage() {
  const [session, setSession] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createClient()
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ [TEST] Erro ao obter sessão:', error)
        } else {
          console.log('✅ [TEST] Sessão:', session)
          setSession(session)
          
          if (session?.user?.email) {
            // Verificar role
            const { data: roleData, error: roleError } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_uuid', session.user.email)
              .single()

            if (roleError) {
              console.error('❌ [TEST] Erro ao buscar role:', roleError)
            } else {
              console.log('✅ [TEST] Role:', roleData.role)
              setUserRole(roleData.role)
            }
          }
        }
      } catch (error) {
        console.error('❌ [TEST] Erro inesperado:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Teste de Login</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Status da Sessão:</h3>
            <p className="text-sm text-blue-700">
              {session ? '✅ Logado' : '❌ Não logado'}
            </p>
            {session && (
              <div className="mt-2 text-xs text-blue-600">
                <p><strong>Email:</strong> {session.user.email}</p>
                <p><strong>ID:</strong> {session.user.id}</p>
                <p><strong>Role:</strong> {userRole || 'Carregando...'}</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Credenciais de Teste:</h3>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>Admin:</strong> geisonhoehr@gmail.com / 123456</p>
              <p><strong>Professor:</strong> professor@teste.com / 123456</p>
            </div>
          </div>

          <div className="flex gap-2">
            <a 
                              href="/login" 
              className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 text-center"
            >
              Ir para Login
            </a>
            <a 
              href="/dashboard" 
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-center"
            >
              Ir para Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 