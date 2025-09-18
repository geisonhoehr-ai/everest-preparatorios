// Script para testar login na instância correta do Supabase
const { createClient } = require('@supabase/supabase-js')

// Configurações corretas do Supabase
const supabaseUrl = 'https://hnhzindsfuqnaxosujay.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaHppbmRzZnVxbmF4b3N1amF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MzU5NTIsImV4cCI6MjA2ODUxMTk1Mn0.cT7fe1wjee9HfZw_IVD7K_exMqu-LtUxiClCD-sDLyU'

async function testLoginInstanciaCorreta() {
  console.log('🔧 Testando login na instância correta do Supabase...')
  console.log('🌐 URL:', supabaseUrl)
  console.log('🔑 Chave (primeiros 20 chars):', supabaseAnonKey.substring(0, 20) + '...')
  
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
        
        if (error.message.includes('Email not confirmed')) {
          console.log('📧 Email não confirmado - precisa executar o script SQL')
        } else if (error.message.includes('Invalid login credentials')) {
          console.log('🔐 Credenciais inválidas - usuário pode não existir')
        }
      } else {
        console.log(`✅ Login bem-sucedido para ${user.email}`)
        console.log(`👤 ID do usuário: ${data.user.id}`)
        console.log(`📧 Email confirmado: ${data.user.email_confirmed_at ? 'Sim' : 'Não'}`)
        
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
  
  // Testar conexão básica
  console.log('\n🔗 Testando conexão básica...')
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Erro na conexão:', error.message)
    } else {
      console.log('✅ Conexão com Supabase funcionando')
    }
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message)
  }
  
  console.log('\n🏁 Teste concluído!')
}

testLoginInstanciaCorreta().catch(console.error)
