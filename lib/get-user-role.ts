import { createClient } from '@/lib/supabase/client'

// Cache para evitar múltiplas requisições
const userRoleCache = new Map<string, { role: string; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

// Função para buscar role usando UUID do usuário
export async function getUserRoleClient(userId: string): Promise<string> {
  try {
    console.log('🔍 [ROLE] Iniciando busca para UUID:', userId)
    
    if (!userId || userId.trim() === '') {
      console.warn('⚠️ [ROLE] Nenhum UUID de usuário fornecido')
      return 'student'
    }

    const supabase = createClient()
    
    // Verificar cache primeiro
    const cached = userRoleCache.get(userId)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('✅ [ROLE] Usando cache:', cached.role)
      return cached.role
    }

    console.log('🔍 [ROLE] Tentando via RPC segura...')
    // Primeiro tenta via RPC para evitar problemas de RLS
    const { data: rpcRole, error: rpcError } = await supabase.rpc('get_role_for_current_user')

    if (!rpcError && rpcRole) {
      const roleFromRpc = (rpcRole as string) || 'student'
      userRoleCache.set(userId, { role: roleFromRpc, timestamp: Date.now() })
      console.log('✅ [ROLE] Role via RPC:', roleFromRpc)
      return roleFromRpc
    }

    console.log('ℹ️ [ROLE] RPC falhou, caindo para SELECT direto...')
    // Buscar role usando UUID (campo user_uuid agora armazena UUID real)
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_uuid', userId)
      .single()

    console.log('🔍 [ROLE] Resultado da busca:', { data, error })

    if (error) {
      console.error('❌ [ROLE] Erro ao buscar role:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        error: error
      })
      
      // Se não encontrar o usuário, retorna 'student' como padrão
      if (error.code === 'PGRST116') {
        console.log('ℹ️ [ROLE] Usuário não encontrado na tabela user_roles, retornando student')
        
        // Salvar no cache temporariamente
        userRoleCache.set(userId, { role: 'student', timestamp: Date.now() })
        return 'student'
      }
      
      // Para qualquer outro erro, retorna 'student' como padrão
      console.log('ℹ️ [ROLE] Erro desconhecido, retornando student como padrão')
      userRoleCache.set(userId, { role: 'student', timestamp: Date.now() })
      return 'student'
    }

    const role = data?.role || 'student'
    console.log('✅ [ROLE] Role encontrada:', role)
    
    // Salvar no cache
    userRoleCache.set(userId, { role, timestamp: Date.now() })
    
    return role
  } catch (error) {
    console.error('❌ [ROLE] Erro inesperado em getUserRoleClient:', {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      type: typeof error,
      error: error
    })
    
    // Em caso de erro inesperado, retorna 'student' como padrão
    userRoleCache.set(userId, { role: 'student', timestamp: Date.now() })
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
      return { user: null, role: 'student', isAuthenticated: false }
    }
    
    if (!session?.user) {
      console.log('ℹ️ [AUTH] Nenhuma sessão encontrada')
      return { user: null, role: 'student', isAuthenticated: false }
    }
    
    console.log('✅ [AUTH] Sessão encontrada:', session.user.email)
    
    // Verificar cache primeiro
    const cached = userRoleCache.get(session.user.id)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('✅ [AUTH] Usando cache para role:', cached.role)
      return { 
        user: session.user, 
        role: cached.role, 
        isAuthenticated: true 
      }
    }
    
    // Buscar role
    const role = await getUserRoleClient(session.user.id)
    
    return { 
      user: session.user, 
      role, 
      isAuthenticated: true 
    }
    
  } catch (error) {
    console.error('❌ [AUTH] Erro na verificação rápida:', error)
    return { user: null, role: 'student', isAuthenticated: false }
  }
}

// Função para limpar cache de roles
export function clearUserRoleCache(userId?: string) {
  if (userId) {
    userRoleCache.delete(userId)
    console.log('🧹 [ROLE] Cache limpo para usuário:', userId)
  } else {
    userRoleCache.clear()
    console.log('🧹 [ROLE] Cache de roles completamente limpo')
  }
}

// Função para obter estatísticas do cache
export function getRoleCacheStats() {
  return {
    size: userRoleCache.size,
    entries: Array.from(userRoleCache.entries()).map(([userId, data]) => ({
      userId,
      role: data.role,
      age: Date.now() - data.timestamp
    }))
  }
}

// Função para forçar atualização do role
export async function refreshUserRole(userId: string): Promise<string> {
  clearUserRoleCache(userId)
  return await getUserRoleClient(userId)
}

// Função simplificada para garantir que o usuário tem um role
export async function ensureUserRole(userId: string): Promise<string> {
  try {
    const supabase = createClient()
    
    if (!userId) {
      console.warn('Nenhum UUID de usuário fornecido')
      return 'student'
    }

    console.log('Garantindo role para usuário:', userId)

    // Verificar se o role já existe usando UUID
    const { data: existingRole, error: fetchError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_uuid', userId)
      .single()

    if (fetchError) {
      console.log('Role não encontrado, erro:', fetchError.message)
      
      // Se o erro for que não encontrou o registro, criar um novo
      if (fetchError.code === 'PGRST116') {
        console.log('Criando novo registro de role...')
        
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_uuid: userId,
            role: 'student'
          })

        if (insertError) {
          console.error('Erro ao criar role do usuário:', insertError)
          return 'student'
        }

        console.log('Novo registro de role criado com sucesso')
        
        // Salvar no cache
        userRoleCache.set(userId, { role: 'student', timestamp: Date.now() })
        
        return 'student'
      }
      
      // Se for outro tipo de erro, retorna role padrão
      console.error('Erro desconhecido ao buscar role:', fetchError)
      return 'student'
    }

    const role = existingRole?.role || 'student'
    console.log('Role existente encontrado:', role)
    
    // Salvar no cache
    userRoleCache.set(userId, { role, timestamp: Date.now() })
    
    return role
  } catch (error) {
    console.error('Erro inesperado ao garantir role do usuário:', error)
    return 'student'
  }
}

// Função simplificada para verificar autenticação
export async function checkAuthentication(): Promise<{ isAuthenticated: boolean; user: any }> {
  try {
    const supabase = createClient()
    
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.log('Erro ao verificar autenticação:', error.message)
      return { isAuthenticated: false, user: null }
    }
    
    if (!session?.user) {
      console.log('Usuário não autenticado')
      return { isAuthenticated: false, user: null }
    }
    
    console.log('Usuário autenticado:', session.user.id)
    return { isAuthenticated: true, user: session.user }
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error)
    return { isAuthenticated: false, user: null }
  }
}
