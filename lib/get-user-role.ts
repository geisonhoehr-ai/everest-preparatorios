import { createClient } from '@/lib/supabase/client'

export async function getUserRoleClient(userUuid: string): Promise<string> {
  try {
    console.log('🔍 [DEBUG] getUserRoleClient iniciado para:', userUuid)
    const supabase = createClient()
    
    if (!userUuid) {
      console.warn('⚠️ [DEBUG] Nenhum UUID de usuário fornecido')
      return 'student'
    }

    console.log('🔍 [DEBUG] Buscando role para usuário:', userUuid)

    // Verificar se o usuário está autenticado
    console.log('🔍 [DEBUG] Verificando autenticação...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('🔍 [DEBUG] Resultado da autenticação:', { user: user?.id, error: authError })
    
    if (authError || !user) {
      console.error('❌ [DEBUG] Erro de autenticação:', authError)
      return 'student'
    }

    console.log('✅ [DEBUG] Usuário autenticado, buscando role...')
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_uuid', userUuid)
      .single()

    console.log('🔍 [DEBUG] Resultado da busca de role:', { data, error })

    if (error) {
      console.error('❌ [DEBUG] Erro ao buscar role do usuário:', error)
      console.error('❌ [DEBUG] Código do erro:', error.code)
      console.error('❌ [DEBUG] Mensagem do erro:', error.message)
      console.error('❌ [DEBUG] Detalhes do erro:', error.details)
      
      // Se não encontrar o usuário, retorna 'student' como padrão
      if (error.code === 'PGRST116') {
        console.log('ℹ️ [DEBUG] Usuário não encontrado na tabela user_roles, retornando role padrão')
        return 'student'
      }
      return 'student'
    }

    console.log('✅ [DEBUG] Role encontrada:', data?.role)
    return data?.role || 'student'
  } catch (error) {
    console.error('❌ [DEBUG] Erro inesperado ao buscar role:', error)
    return 'student'
  }
}

export async function ensureUserRole(userUuid: string): Promise<string> {
  try {
    const supabase = createClient()
    
    if (!userUuid) {
      console.warn('Nenhum UUID de usuário fornecido')
      return 'student'
    }

    console.log('Iniciando ensureUserRole para usuário:', userUuid)

    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Erro de autenticação:', authError)
      return 'student'
    }

    console.log('Usuário autenticado:', user.id)

    // Primeiro, tenta buscar o role existente
    console.log('Buscando role existente...')
    const { data: existingRole, error: fetchError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_uuid', userUuid)
      .single()

    if (fetchError) {
      console.log('Erro ao buscar role existente:', fetchError)
      
      // Se o erro for que não encontrou o registro, tenta criar
      if (fetchError.code === 'PGRST116') {
        console.log('Usuário não encontrado, tentando criar novo registro...')
        
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_uuid: userUuid,
            role: 'student',
            first_login: true,
            profile_completed: false
          })

        if (insertError) {
          console.error('Erro ao criar role do usuário:', insertError)
          return 'student'
        }

        console.log('Novo registro de role criado com sucesso')
        return 'student'
      }
      
      // Se for outro tipo de erro, retorna role padrão
      console.error('Erro desconhecido ao buscar role:', fetchError)
      return 'student'
    }

    if (existingRole?.role) {
      console.log('Role existente encontrada:', existingRole.role)
      return existingRole.role
    }

    console.log('Nenhum role encontrado, retornando padrão')
    return 'student'
  } catch (error) {
    console.error('Erro inesperado ao garantir role do usuário:', error)
    return 'student'
  }
}

export async function checkAuthentication(): Promise<{ isAuthenticated: boolean; user: any }> {
  try {
    const supabase = createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      console.log('Usuário não autenticado')
      return { isAuthenticated: false, user: null }
    }
    
    console.log('Usuário autenticado:', user.id)
    return { isAuthenticated: true, user }
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error)
    return { isAuthenticated: false, user: null }
  }
}
