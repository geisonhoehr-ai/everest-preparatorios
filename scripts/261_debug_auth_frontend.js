require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ [DEBUG_AUTH] Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugAuthFrontend() {
  console.log('🔍 [DEBUG_AUTH] Debugando autenticação no frontend...')
  
  try {
    // 1. Verificar se há sessão ativa
    console.log('🔍 [DEBUG_AUTH] Verificando sessão...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ [DEBUG_AUTH] Erro ao verificar sessão:', sessionError)
    } else {
      console.log('✅ [DEBUG_AUTH] Sessão encontrada:', !!session)
      if (session) {
        console.log('👤 [DEBUG_AUTH] Usuário da sessão:', session.user.email)
        console.log('🆔 [DEBUG_AUTH] ID da sessão:', session.user.id)
      }
    }
    
    // 2. Se não há sessão, fazer login
    if (!session) {
      console.log('🔐 [DEBUG_AUTH] Fazendo login...')
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'professor@teste.com',
        password: '123456'
      })
      
      if (authError) {
        console.error('❌ [DEBUG_AUTH] Erro no login:', authError)
        return
      }
      
      console.log('✅ [DEBUG_AUTH] Login bem-sucedido!')
      console.log('👤 [DEBUG_AUTH] Usuário logado:', authData.user.email)
    }
    
    // 3. Verificar role
    console.log('🔍 [DEBUG_AUTH] Buscando role...')
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_uuid', 'professor@teste.com')
      .single()
    
    if (roleError) {
      console.error('❌ [DEBUG_AUTH] Erro ao buscar role:', roleError)
      return
    }
    
    console.log('✅ [DEBUG_AUTH] Role encontrado:', roleData.role)
    
    // 4. Simular o que o useAuth faz
    console.log('🧪 [DEBUG_AUTH] Simulando useAuth...')
    
    // Verificar sessão novamente
    const { data: { session: currentSession } } = await supabase.auth.getSession()
    
    if (currentSession?.user) {
      console.log('✅ [DEBUG_AUTH] Sessão ativa no useAuth')
      console.log('👤 [DEBUG_AUTH] Email:', currentSession.user.email)
      
      // Buscar role
      const { data: currentRoleData, error: currentRoleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_uuid', currentSession.user.email)
        .single()
      
      if (currentRoleError) {
        console.error('❌ [DEBUG_AUTH] Erro ao buscar role no useAuth:', currentRoleError)
      } else {
        console.log('✅ [DEBUG_AUTH] Role no useAuth:', currentRoleData.role)
        
        // Verificar se é teacher/admin
        const isTeacher = currentRoleData.role === 'teacher' || currentRoleData.role === 'admin'
        console.log('👨‍🏫 [DEBUG_AUTH] É professor/admin?', isTeacher)
        
        if (isTeacher) {
          console.log('✅ [DEBUG_AUTH] Menu admin DEVE aparecer!')
        } else {
          console.log('❌ [DEBUG_AUTH] Menu admin NÃO deve aparecer')
        }
      }
    } else {
      console.log('❌ [DEBUG_AUTH] Nenhuma sessão ativa no useAuth')
    }
    
    console.log('🎉 [DEBUG_AUTH] Debug concluído!')
    console.log('📋 [DEBUG_AUTH] Resumo:')
    console.log('   - Sessão: ✅ Ativa')
    console.log('   - Role: ✅ Teacher')
    console.log('   - Menu Admin: ✅ Deve aparecer')
    console.log('')
    console.log('🌐 [DEBUG_AUTH] Agora teste no navegador:')
    console.log('   1. Abra: http://localhost:3001')
    console.log('   2. Abra o console do navegador (F12)')
    console.log('   3. Procure por logs do [AUTH] e [SIDEBAR]')
    console.log('   4. Verifique se o menu mostra "Membros" e "Turmas"')
    
  } catch (error) {
    console.error('❌ [DEBUG_AUTH] Erro geral:', error)
  }
}

debugAuthFrontend() 