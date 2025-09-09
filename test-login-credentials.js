const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = 'https://hnhzindsfuqnaxosujay.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaHppbmRzZnVxbmF4b3N1amF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MzU5NTIsImV4cCI6MjA2ODUxMTk1Mn0.cT7fe1wjee9HfZw_IVD7K_exMqu-LtUxiClCD-sDLyU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testLoginCredentials() {
  console.log('🔍 Testando credenciais de login...')
  
  try {
    // Testar login com professor@teste.com
    console.log('\n📧 Testando login: professor@teste.com')
    const { data: professorData, error: professorError } = await supabase.auth.signInWithPassword({
      email: 'professor@teste.com',
      password: '123456'
    })
    
    if (professorError) {
      console.error('❌ Erro no login professor:', professorError.message)
    } else {
      console.log('✅ Login professor funcionando:', professorData.user?.email)
    }
    
    // Testar login com admin@teste.com
    console.log('\n📧 Testando login: admin@teste.com')
    const { data: adminData, error: adminError } = await supabase.auth.signInWithPassword({
      email: 'admin@teste.com',
      password: '123456'
    })
    
    if (adminError) {
      console.error('❌ Erro no login admin:', adminError.message)
    } else {
      console.log('✅ Login admin funcionando:', adminData.user?.email)
    }
    
    // Testar login com aluno@teste.com
    console.log('\n📧 Testando login: aluno@teste.com')
    const { data: alunoData, error: alunoError } = await supabase.auth.signInWithPassword({
      email: 'aluno@teste.com',
      password: '123456'
    })
    
    if (alunoError) {
      console.error('❌ Erro no login aluno:', alunoError.message)
    } else {
      console.log('✅ Login aluno funcionando:', alunoData.user?.email)
    }
    
    // Verificar usuários existentes
    console.log('\n👥 Verificando usuários existentes...')
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.error('❌ Erro ao listar usuários:', usersError.message)
    } else {
      console.log(`✅ Usuários encontrados: ${users.users.length}`)
      users.users.forEach(user => {
        console.log(`   📧 ${user.email} (ID: ${user.id})`)
      })
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

testLoginCredentials()
