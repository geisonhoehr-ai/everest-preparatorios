'use server'

import { createClient } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'

// ========================================
// FUNÇÕES PARA MEMBERS
// ========================================

export async function getAllMembers() {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('members')
      .select(`
        *,
        subscriptions (
          id,
          course_name,
          class_name,
          progress,
          status,
          enrollment_date,
          expiration_date
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar membros:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Erro inesperado ao buscar membros:', error)
    return []
  }
}

export async function getMemberById(id: number) {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('members')
      .select(`
        *,
        subscriptions (
          id,
          course_name,
          class_name,
          progress,
          status,
          enrollment_date,
          expiration_date
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar membro:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Erro inesperado ao buscar membro:', error)
    return null
  }
}

export async function createMember(memberData: {
  full_name: string
  email: string
  cpf_cnpj?: string
  phone?: string
}) {
  const supabase = createClient()
  
  try {
    console.log('🔍 [ACTIONS-MEMBERS] Iniciando createMember com dados:', memberData)
    
    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ [ACTIONS-MEMBERS] Erro de autenticação:', authError)
      return { success: false, error: 'Usuário não autenticado' }
    }
    
    console.log('✅ [ACTIONS-MEMBERS] Usuário autenticado:', user.email)

    // Verificar se a tabela members existe
    const { data: tableCheck, error: tableError } = await supabase
      .from('members')
      .select('id')
      .limit(1)
    
    if (tableError) {
      console.error('❌ [ACTIONS-MEMBERS] Erro ao verificar tabela members:', tableError)
      return { success: false, error: 'Tabela members não encontrada. Execute o script SQL primeiro.' }
    }

    console.log('✅ [ACTIONS-MEMBERS] Tabela members existe')

    // Inserir o membro
    const { data, error } = await supabase
      .from('members')
      .insert({
        ...memberData,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('❌ [ACTIONS-MEMBERS] Erro ao criar membro:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ [ACTIONS-MEMBERS] Membro criado com sucesso:', data)
    revalidatePath('/membros')
    return { success: true, data }
  } catch (error) {
    console.error('❌ [ACTIONS-MEMBERS] Erro inesperado ao criar membro:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

export async function updateMember(id: number, memberData: {
  full_name?: string
  email?: string
  cpf_cnpj?: string
  phone?: string
  status?: 'active' | 'inactive' | 'suspended'
}) {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('members')
      .update(memberData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar membro:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/membros')
    return { success: true, data }
  } catch (error) {
    console.error('Erro inesperado ao atualizar membro:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

export async function deleteMember(id: number) {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar membro:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/membros')
    return { success: true }
  } catch (error) {
    console.error('Erro inesperado ao deletar membro:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// ========================================
// FUNÇÕES PARA SUBSCRIPTIONS
// ========================================

export async function createSubscription(subscriptionData: {
  member_id: number
  course_name: string
  class_name: string
  expiration_date?: string
  progress?: number
}) {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        ...subscriptionData,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar subscription:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/membros')
    revalidatePath('/turmas')
    return { success: true, data }
  } catch (error) {
    console.error('Erro inesperado ao criar subscription:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

export async function updateSubscription(id: number, subscriptionData: {
  course_name?: string
  class_name?: string
  progress?: number
  status?: 'active' | 'inactive' | 'expired'
  expiration_date?: string
}) {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(subscriptionData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar subscription:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/membros')
    revalidatePath('/turmas')
    return { success: true, data }
  } catch (error) {
    console.error('Erro inesperado ao atualizar subscription:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

export async function deleteSubscription(id: number) {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar subscription:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/membros')
    revalidatePath('/turmas')
    return { success: true }
  } catch (error) {
    console.error('Erro inesperado ao deletar subscription:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// ========================================
// FUNÇÕES PARA ESTATÍSTICAS
// ========================================

export async function getMemberStats() {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .rpc('get_member_counts')

    if (error) {
      console.error('Erro ao buscar estatísticas:', error)
      return null
    }

    return data?.[0] || null
  } catch (error) {
    console.error('Erro inesperado ao buscar estatísticas:', error)
    return null
  }
}

export async function getActiveSubscriptions() {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        members (
          id,
          full_name,
          email
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar subscriptions ativas:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Erro inesperado ao buscar subscriptions ativas:', error)
    return []
  }
}

// ========================================
// FUNÇÕES PARA VERIFICAÇÃO DE ACESSO
// ========================================

export async function checkMemberAccess(email: string) {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .rpc('has_active_access', { member_email: email })

    if (error) {
      console.error('Erro ao verificar acesso:', error)
      return false
    }

    return data || false
  } catch (error) {
    console.error('Erro inesperado ao verificar acesso:', error)
    return false
  }
}

// ========================================
// FUNÇÕES PARA IMPORTAR DADOS DO CSV
// ========================================

export async function importMembersFromCSV(csvData: string) {
  const supabase = createClient()
  
  try {
    // Parse CSV data
    const lines = csvData.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.replace(/"/g, ''))
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.replace(/"/g, ''))
      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index]
      })
      return row
    })

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    // Insert members
    const membersToInsert = data.map(row => ({
      full_name: row['Nome completo'] || row['Nome'],
      email: row['E-mail'] || row['Email'],
      cpf_cnpj: row['CPF/CNPJ'] || '',
      phone: row['Telefone'] || '',
      created_by: user?.id
    }))

    const { data: insertedMembers, error } = await supabase
      .from('members')
      .insert(membersToInsert)
      .select()

    if (error) {
      console.error('Erro ao importar membros:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/membros')
    return { success: true, data: insertedMembers }
  } catch (error) {
    console.error('Erro inesperado ao importar membros:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

export async function importSubscriptionsFromCSV(csvData: string) {
  const supabase = createClient()
  
  try {
    // Parse CSV data
    const lines = csvData.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.replace(/"/g, ''))
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.replace(/"/g, ''))
      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index]
      })
      return row
    })

    // Get all members for email mapping
    const { data: members } = await supabase
      .from('members')
      .select('id, email')

    const memberMap = new Map(members?.map((m: any) => [m.email, m.id]) || [])

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    // Insert subscriptions
    const subscriptionsToInsert = data
      .filter(row => memberMap.has(row['E-mail']))
      .map(row => ({
        member_id: memberMap.get(row['E-mail']),
        course_name: row['Curso'] || '',
        class_name: row['Turma'] || '',
        progress: parseInt(row['Progresso']) || 0,
        status: row['Status'] === 'Ativado' ? 'active' : 'inactive',
        enrollment_date: row['Data de matrícula'] || new Date().toISOString(),
        expiration_date: row['Data de expiração'] || null,
        created_by: user?.id
      }))

    const { data: insertedSubscriptions, error } = await supabase
      .from('subscriptions')
      .insert(subscriptionsToInsert)
      .select()

    if (error) {
      console.error('Erro ao importar subscriptions:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/membros')
    revalidatePath('/turmas')
    return { success: true, data: insertedSubscriptions }
  } catch (error) {
    console.error('Erro inesperado ao importar subscriptions:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
} 