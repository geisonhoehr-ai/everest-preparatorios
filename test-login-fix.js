// Script para testar o login após as correções
const { createClient } = require('@supabase/supabase-js')

// Configurações do Supabase (mesmas do next.config.js)
const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'

async function testLogin() {
  console.log('🔧 Testando login com as configurações corrigidas...')
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  // Testar usuários de teste
  const testUsers = [
    { email: 'admin@teste.com', password: '123456', role: 'admin' },
    { email: 'professor@teste.com', password: '123456', role: 'teacher' },
    { email: 'aluno@teste.com', password: '123456', role: 'student' }
  ]
  
  for (const user of testUsers) {
    console.log(`\n🔐 Testando login para: ${user.email}`)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      })
      
      if (error) {
        console.error(`❌ Erro no login para ${user.email}:`, error.message)
        
        // Verificar se é erro de email não confirmado
        if (error.message.includes('Email not confirmed')) {
          console.log('📧 Email não confirmado - executando confirmação...')
          
          // Tentar confirmar o email
          const { error: confirmError } = await supabase.auth.admin.updateUserById(
            data?.user?.id || '', 
            { email_confirm: true }
          )
          
          if (confirmError) {
            console.error('❌ Erro ao confirmar email:', confirmError.message)
          } else {
            console.log('✅ Email confirmado com sucesso')
          }
        }
      } else {
        console.log(`✅ Login bem-sucedido para ${user.email}`)
        console.log(`👤 ID do usuário: ${data.user.id}`)
        console.log(`📧 Email: ${data.user.email}`)
        console.log(`✅ Email confirmado: ${data.user.email_confirmed_at ? 'Sim' : 'Não'}`)
        
        // Verificar perfil do usuário
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single()
        
        if (profileError) {
          console.error(`❌ Erro ao buscar perfil:`, profileError.message)
        } else {
          console.log(`👑 Role do usuário: ${profile.role}`)
        }
        
        // Fazer logout
        await supabase.auth.signOut()
        console.log('🚪 Logout realizado')
      }
    } catch (error) {
      console.error(`❌ Erro inesperado para ${user.email}:`, error.message)
    }
  }
  
  console.log('\n🏁 Teste de login concluído!')
}

// Executar teste
testLogin().catch(console.error)
