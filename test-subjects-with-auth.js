// Teste da tabela subjects com autenticação
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSubjectsWithAuth() {
  console.log('🔍 Testando tabela subjects com autenticação...')
  
  try {
    // 1. Primeiro, fazer login como aluno
    console.log('\n1. Fazendo login como aluno@teste.com...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'aluno@teste.com',
      password: '123456'
    })
    
    if (authError) {
      console.log('❌ Erro de autenticação:', authError.message)
      return
    }
    
    console.log('✅ Login realizado com sucesso!')
    console.log('Usuário:', authData.user?.email)
    
    // 2. Agora tentar buscar subjects
    console.log('\n2. Buscando subjects após login...')
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('id, name')
    
    if (subjectsError) {
      console.log('❌ Erro ao buscar subjects:', subjectsError.message)
      console.log('Código:', subjectsError.code)
      console.log('Detalhes:', subjectsError.details)
    } else {
      console.log('✅ Subjects encontrados!')
      console.log('Quantidade:', subjects?.length || 0)
      console.log('Dados:', subjects)
    }
    
    // 3. Fazer logout
    console.log('\n3. Fazendo logout...')
    await supabase.auth.signOut()
    console.log('✅ Logout realizado')
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

testSubjectsWithAuth()
