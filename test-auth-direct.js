// Script para testar autenticação diretamente com Supabase
const { createClient } = require('@supabase/supabase-js')

// Configurações do Supabase
const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'

async function testAuth() {
  console.log('🔧 Testando autenticação direta com Supabase...')
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  // Testar com professor@teste.com
  console.log('\n🔐 Testando login para professor@teste.com...')
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'professor@teste.com',
      password: '123456'
    })
    
    if (error) {
      console.error('❌ Erro detalhado:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      
      // Verificar se é problema de configuração
      if (error.message.includes('Invalid API key')) {
        console.log('🔑 Problema: Chave API inválida')
      } else if (error.message.includes('Email not confirmed')) {
        console.log('📧 Problema: Email não confirmado')
      } else if (error.message.includes('Invalid login credentials')) {
        console.log('🔐 Problema: Credenciais inválidas')
      } else if (error.message.includes('Too many requests')) {
        console.log('⏰ Problema: Muitas tentativas')
      }
    } else {
      console.log('✅ Login bem-sucedido!')
      console.log('👤 Usuário:', data.user.email)
      console.log('🆔 ID:', data.user.id)
      console.log('📧 Email confirmado:', data.user.email_confirmed_at ? 'Sim' : 'Não')
      
      // Testar acesso ao perfil
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single()
      
      if (profileError) {
        console.error('❌ Erro ao buscar perfil:', profileError)
      } else {
        console.log('👑 Perfil encontrado:', profile.role)
      }
      
      // Fazer logout
      await supabase.auth.signOut()
      console.log('🚪 Logout realizado')
    }
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message)
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
}

testAuth().catch(console.error)
