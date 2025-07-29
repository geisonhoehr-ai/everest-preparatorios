"use client"

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { AvatarUpload } from '@/components/avatar-upload'
import { AvatarWithAutoFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CalendarIcon, MailIcon, UserIcon } from 'lucide-react'

export default function ProfilePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      setIsLoading(true)
      
      // Obter usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('Erro ao obter usuário:', userError)
        return
      }

      setUserEmail(user.email)

      // Obter perfil do usuário (usando email para compatibilidade)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('avatar_url, full_name, email')
        .eq('email', user.email)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Erro ao obter perfil:', profileError)
      }

      if (profile) {
        setUserAvatarUrl(profile.avatar_url)
      }

      // Obter role do usuário
      const { data: userRoleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (roleError && roleError.code !== 'PGRST116') {
        console.error('Erro ao obter role:', roleError)
      }

      if (userRoleData) {
        setUserRole(userRoleData.role)
      }

    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpdate = async (newAvatarUrl: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.error('Usuário não encontrado')
        return
      }

      // Atualizar avatar_url no perfil (usando email para compatibilidade)
      const { error } = await supabase
        .from('profiles')
        .upsert({
          email: user.email,
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Erro ao atualizar avatar:', error)
        return
      }

      setUserAvatarUrl(newAvatarUrl)
      console.log('Avatar atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar avatar:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando perfil...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <AvatarWithAutoFallback
            email={userEmail}
            src={userAvatarUrl}
            size="xl"
            className="h-20 w-20"
          />
          <div>
            <h1 className="text-3xl font-bold">Meu Perfil</h1>
            <p className="text-muted-foreground">
              Gerencie suas informações pessoais e configurações
            </p>
          </div>
        </div>

        <Separator />

        {/* Informações do Usuário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5" />
              <span>Informações do Usuário</span>
            </CardTitle>
            <CardDescription>
              Suas informações básicas e status da conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <MailIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{userEmail}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Tipo de Usuário</p>
                  <Badge variant={userRole === 'admin' ? 'destructive' : userRole === 'teacher' ? 'default' : 'secondary'}>
                    {userRole === 'admin' ? 'Administrador' : 
                     userRole === 'teacher' ? 'Professor' : 
                     userRole === 'student' ? 'Estudante' : 'Usuário'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Membro desde</p>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload de Avatar */}
        <Card>
          <CardHeader>
            <CardTitle>Foto de Perfil</CardTitle>
            <CardDescription>
              Personalize sua foto de perfil. Suporte para JPG, PNG, GIF e WebP (máximo 5MB).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AvatarUpload
              email={userEmail}
              currentAvatarUrl={userAvatarUrl}
              onAvatarUpdate={handleAvatarUpdate}
            />
          </CardContent>
        </Card>

        {/* Configurações */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações</CardTitle>
            <CardDescription>
              Configurações adicionais da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Mais configurações serão adicionadas em breve...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
