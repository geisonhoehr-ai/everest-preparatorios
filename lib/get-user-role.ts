import { createClient } from '@/lib/supabase/client'

// Cache para evitar múltiplas requisições
const userRoleCache = new Map<string, { role: string; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export async function getUserRoleClient(userUuid: string): Promise<string> {
  try {
    console.log('🔍 [ROLE] Iniciando busca para:', userUuid)
    const supabase = createClient()
    
    if (!userUuid) {
      console.warn('⚠️ [ROLE] Nenhum UUID de usuário fornecido')
      return 'student'
    }

    // Verificar cache primeiro
    const cached = userRoleCache.get(userUuid)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('✅ [ROLE] Usando cache:', cached.role)
      return cached.role
    }

    // Verificar se o usuário está autenticado primeiro
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ [ROLE] Erro de autenticação:', authError)
      return 'student'
    }

    console.log('✅ [ROLE] Usuário autenticado:', user.id)

    // Usar o ID do usuário autenticado se o userUuid fornecido for diferente
    const userIdToUse = userUuid === user.id ? userUuid : user.id
    console.log('🔍 [ROLE] Usando ID:', userIdToUse)

    // Buscar role diretamente sem verificar autenticação novamente
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_uuid', userIdToUse)
      .single()

    console.log('🔍 [ROLE] Resultado da busca:', { data, error })

    if (error) {
      console.error('❌ [ROLE] Erro ao buscar role:', error)
      
      // Se não encontrar o usuário, retorna 'student' como padrão
      if (error.code === 'PGRST116') {
        console.log('ℹ️ [ROLE] Usuário não encontrado na tabela user_roles, retornando student')
        return 'student'
      }
      return 'student'
    }

    const role = data?.role || 'student'
    console.log('✅ [ROLE] Role encontrada:', role)
    
    // Salvar no cache
    userRoleCache.set(userIdToUse, { role, timestamp: Date.now() })
    
    return role
  } catch (error) {
    console.error('❌ [ROLE] Erro inesperado:', error)
    return 'student'
  }
}

// Função otimizada para verificação rápida de autenticação e role
export async function getAuthAndRole(): Promise<{ user: any; role: string; isAuthenticated: boolean }> {
  try {
    console.log('🔍 [AUTH] Verificação rápida de autenticação e role...')
    const supabase = createClient()
    
    // Primeiro tentar obter a sessão diretamente
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ [AUTH] Erro ao obter sessão:', sessionError)
    }
    
    if (!session?.user) {
      console.log('❌ [AUTH] Nenhuma sessão encontrada')
      return { user: null, role: 'student', isAuthenticated: false }
    }

    console.log('✅ [AUTH] Sessão encontrada:', session.user.id)
    console.log('✅ [AUTH] Email do usuário:', session.user.email)
    
    // Verificar cache primeiro
    const cached = userRoleCache.get(session.user.id)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('✅ [AUTH] Usando cache para role:', cached.role)
      return { user: session.user, role: cached.role, isAuthenticated: true }
    }
    
    // Buscar role de forma otimizada
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_uuid', session.user.id)
      .single()

    if (error) {
      console.log('ℹ️ [AUTH] Role não encontrada na tabela user_roles')
      console.log('ℹ️ [AUTH] Erro:', error.message)
      
      // Se o usuário não tem role definido, vamos criar um padrão
      if (error.code === 'PGRST116') {
        console.log('ℹ️ [AUTH] Criando role padrão para o usuário...')
        
        try {
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert({
              user_uuid: session.user.id,
              role: 'student',
              first_login: true,
              profile_completed: false
            })
          
          if (insertError) {
            console.error('❌ [AUTH] Erro ao criar role padrão:', insertError)
          } else {
            console.log('✅ [AUTH] Role padrão criado com sucesso')
          }
        } catch (insertError) {
          console.error('❌ [AUTH] Erro ao criar role padrão:', insertError)
        }
      }
      
      const role = 'student'
      // Salvar no cache
      userRoleCache.set(session.user.id, { role, timestamp: Date.now() })
      
      // Retornar student como padrão
      return { user: session.user, role, isAuthenticated: true }
    }

    const role = data?.role || 'student'
    console.log('✅ [AUTH] Role encontrada:', role)
    
    // Salvar no cache
    userRoleCache.set(session.user.id, { role, timestamp: Date.now() })
    
    return { user: session.user, role, isAuthenticated: true }
  } catch (error) {
    console.error('❌ [AUTH] Erro na verificação rápida:', error)
    console.error('❌ [AUTH] Tipo do erro:', typeof error)
    console.error('❌ [AUTH] Mensagem do erro:', error instanceof Error ? error.message : 'Erro desconhecido')
    return { user: null, role: 'student', isAuthenticated: false }
  }
}

// Função para limpar cache
export function clearUserRoleCache(userId?: string) {
  if (userId) {
    userRoleCache.delete(userId)
    console.log('🧹 [CACHE] Cache limpo para usuário:', userId)
  } else {
    userRoleCache.clear()
    console.log('🧹 [CACHE] Cache limpo completamente')
  }
}

// Função para forçar atualização do role
export async function refreshUserRole(userId: string): Promise<string> {
  clearUserRoleCache(userId)
  return await getUserRoleClient(userId)
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
