require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixProfessorRole() {
  try {
    console.log('🔍 [FIX] Iniciando correção do role do professor...')
    
    // 1. Buscar o usuário professor usando admin API
    console.log('🔍 [FIX] Buscando usuário professor@teste.com...')
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error('❌ [FIX] Erro ao buscar usuários:', userError)
      return
    }
    
    const user = users.find(u => u.email === 'professor@teste.com')
    
    if (userError) {
      console.error('❌ [FIX] Erro ao buscar usuário:', userError)
      return
    }
    
    if (!user) {
      console.error('❌ [FIX] Usuário professor@teste.com não encontrado!')
      return
    }
    
    console.log('✅ [FIX] Usuário encontrado:', user.id)
    
    // 2. Verificar se já existe role
    console.log('🔍 [FIX] Verificando role existente...')
    const { data: existingRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_uuid', user.id)
      .single()
    
    if (roleError && roleError.code !== 'PGRST116') {
      console.error('❌ [FIX] Erro ao verificar role:', roleError)
      return
    }
    
    if (existingRole) {
      console.log('ℹ️ [FIX] Role existente:', existingRole.role)
      
      // Se já é teacher, não precisa fazer nada
      if (existingRole.role === 'teacher') {
        console.log('✅ [FIX] Professor já tem role correto!')
        return
      }
      
      // Se não é teacher, atualizar
      console.log('🔄 [FIX] Atualizando role para teacher...')
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({ role: 'teacher' })
        .eq('user_uuid', user.id)
      
      if (updateError) {
        console.error('❌ [FIX] Erro ao atualizar role:', updateError)
        return
      }
      
      console.log('✅ [FIX] Role atualizado com sucesso!')
    } else {
      // 3. Criar novo role
      console.log('🔄 [FIX] Criando novo role para professor...')
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_uuid: user.id,
          role: 'teacher',
          first_login: false,
          profile_completed: true
        })
      
      if (insertError) {
        console.error('❌ [FIX] Erro ao criar role:', insertError)
        return
      }
      
      console.log('✅ [FIX] Role criado com sucesso!')
    }
    
    // 4. Verificar perfil do professor
    console.log('🔍 [FIX] Verificando perfil do professor...')
    const { data: profile, error: profileError } = await supabase
      .from('teacher_profiles')
      .select('*')
      .eq('user_uuid', user.id)
      .single()
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ [FIX] Erro ao verificar perfil:', profileError)
      return
    }
    
    if (!profile) {
      console.log('🔄 [FIX] Criando perfil do professor...')
      const { error: profileInsertError } = await supabase
        .from('teacher_profiles')
        .insert({
          user_uuid: user.id,
          nome_completo: 'Professor Teste',
          especialidade: 'Língua Portuguesa',
          formacao: 'Licenciatura em Letras'
        })
      
      if (profileInsertError) {
        console.error('❌ [FIX] Erro ao criar perfil:', profileInsertError)
        return
      }
      
      console.log('✅ [FIX] Perfil criado com sucesso!')
    } else {
      console.log('✅ [FIX] Perfil já existe!')
    }
    
    // 5. Verificar se está em paid_users
    console.log('🔍 [FIX] Verificando paid_users...')
    const { data: paidUser, error: paidError } = await supabase
      .from('paid_users')
      .select('*')
      .eq('email', 'professor@teste.com')
      .single()
    
    if (paidError && paidError.code !== 'PGRST116') {
      console.error('❌ [FIX] Erro ao verificar paid_users:', paidError)
      return
    }
    
    if (!paidUser) {
      console.log('🔄 [FIX] Adicionando à paid_users...')
      const { error: paidInsertError } = await supabase
        .from('paid_users')
        .insert({
          email: 'professor@teste.com',
          status: 'active'
        })
      
      if (paidInsertError) {
        console.error('❌ [FIX] Erro ao adicionar paid_users:', paidInsertError)
        return
      }
      
      console.log('✅ [FIX] Adicionado à paid_users!')
    } else {
      console.log('✅ [FIX] Já está em paid_users!')
    }
    
    console.log('🎉 [FIX] Correção concluída com sucesso!')
    console.log('📧 Email: professor@teste.com')
    console.log('🎭 Role: teacher')
    console.log('🆔 UUID: ' + user.id)
    
    // Limpar cache do role
    console.log('🧹 [FIX] Limpando cache do role...')
    const { error: cacheError } = await supabase
      .from('user_roles')
      .update({ updated_at: new Date().toISOString() })
      .eq('user_uuid', user.id)
    
    if (cacheError) {
      console.error('❌ [FIX] Erro ao limpar cache:', cacheError)
    } else {
      console.log('✅ [FIX] Cache limpo com sucesso!')
    }
    
  } catch (error) {
    console.error('❌ [FIX] Erro inesperado:', error)
  }
}

// Executar a correção
fixProfessorRole()
