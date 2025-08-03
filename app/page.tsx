"use client";

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getUserRoleClient } from '@/lib/get-user-role'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        const supabase = createClient()
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError) {
          console.error('Erro ao obter usuário:', userError)
          router.push('/login-simple')
          return
        }

        if (user) {
          try {
            const role = await getUserRoleClient(user.email || '')
            
            if (role === 'teacher') {
              router.push('/teacher')
            } else if (role === 'admin') {
              router.push('/admin')
            } else {
              router.push('/dashboard')
            }
          } catch (error) {
            console.warn('Erro ao verificar role, redirecionando para dashboard:', error)
            router.push('/dashboard')
          }
        } else {
          router.push('/login-simple')
        }
      } catch (error) {
        console.error('Erro geral na verificação de autenticação:', error)
        router.push('/login-simple')
      }
    }

    checkAndRedirect()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  )
}
