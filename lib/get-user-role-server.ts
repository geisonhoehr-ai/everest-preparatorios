import { supabaseAdmin } from '@/lib/supabaseServer'

// Função para buscar role no servidor
export async function getUserRoleServer(userUuid: string): Promise<string> {
  try {
    console.log('🔍 [SERVER] getUserRoleServer iniciado para:', userUuid)
    
    if (!userUuid) {
      console.warn('⚠️ [SERVER] Nenhum UUID de usuário fornecido')
      return 'student'
    }

    if (!supabaseAdmin) {
      console.error('❌ [SERVER] supabaseAdmin não está disponível')
      return 'student'
    }

    console.log('✅ [SERVER] Buscando role no servidor para usuário:', userUuid)
    const { data, error } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_uuid', userUuid)
      .single()

    console.log('🔍 [SERVER] Resultado da busca de role:', { data, error })

    if (error) {
      console.error('❌ [SERVER] Erro ao buscar role do usuário:', error)
      
      // Se não encontrar o usuário, retorna 'student' como padrão
      if (error.code === 'PGRST116') {
        console.log('ℹ️ [SERVER] Usuário não encontrado na tabela user_roles, retornando role padrão')
        return 'student'
      }
      return 'student'
    }

    console.log('✅ [SERVER] Role encontrada:', data?.role)
    return data?.role || 'student'
  } catch (error) {
    console.error('❌ [SERVER] Erro inesperado ao buscar role:', error)
    return 'student'
  }
}