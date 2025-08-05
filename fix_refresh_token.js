// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 [CONFIG] Verificando variáveis de ambiente...')
console.log('URL:', supabaseUrl ? '✅ Configurada' : '❌ Não configurada')
console.log('KEY:', supabaseAnonKey ? '✅ Configurada' : '❌ Não configurada')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

async function diagnoseAuthIssues() {
  console.log('🔍 [DIAGNÓSTICO] Iniciando diagnóstico de autenticação...')
  
  try {
    // 1. Verificar configuração do cliente
    console.log('✅ [CONFIG] Cliente Supabase criado com sucesso')
    
    // 2. Verificar sessão atual
    console.log('🔍 [SESSÃO] Verificando sessão atual...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ [SESSÃO] Erro ao verificar sessão:', sessionError)
      
      if (sessionError.message?.includes('Refresh Token')) {
        console.log('🔄 [TOKEN] Problema detectado com refresh token')
        await fixRefreshTokenIssue()
      }
    } else if (session) {
      console.log('✅ [SESSÃO] Sessão ativa encontrada:', session.user.email)
    } else {
      console.log('ℹ️ [SESSÃO] Nenhuma sessão ativa')
    }
    
    // 3. Verificar configurações de autenticação
    console.log('🔍 [CONFIG] Verificando configurações de auth...')
    const { data: authData, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('❌ [AUTH] Erro ao obter usuário:', authError)
    } else if (authData.user) {
      console.log('✅ [AUTH] Usuário autenticado:', authData.user.email)
    }
    
  } catch (error) {
    console.error('❌ [DIAGNÓSTICO] Erro geral:', error)
  }
}

async function fixRefreshTokenIssue() {
  console.log('🔧 [CORREÇÃO] Iniciando correção do refresh token...')
  
  try {
    // 1. Limpar sessão atual
    console.log('🧹 [LIMPEZA] Limpando sessão atual...')
    const { error: signOutError } = await supabase.auth.signOut()
    
    if (signOutError) {
      console.error('❌ [LOGOUT] Erro ao fazer logout:', signOutError)
    } else {
      console.log('✅ [LOGOUT] Logout realizado com sucesso')
    }
    
    // 2. Limpar localStorage (simulado)
    console.log('🗑️ [STORAGE] Limpando dados locais...')
    console.log('💡 [DICA] Execute no navegador: localStorage.clear()')
    
    // 3. Verificar se a limpeza funcionou
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ [VERIFICAÇÃO] Erro após limpeza:', error)
    } else if (!session) {
      console.log('✅ [VERIFICAÇÃO] Sessão limpa com sucesso')
    }
    
  } catch (error) {
    console.error('❌ [CORREÇÃO] Erro durante correção:', error)
  }
}

async function testAuthFlow() {
  console.log('🧪 [TESTE] Testando fluxo de autenticação...')
  
  try {
    // Teste de login (substitua com credenciais válidas)
    const testEmail = 'test@example.com'
    const testPassword = 'testpassword'
    
    console.log('🔐 [TESTE] Tentando login com:', testEmail)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })
    
    if (error) {
      console.log('ℹ️ [TESTE] Login falhou (esperado para credenciais de teste):', error.message)
    } else {
      console.log('✅ [TESTE] Login bem-sucedido:', data.user.email)
      
      // Fazer logout após teste
      await supabase.auth.signOut()
      console.log('✅ [TESTE] Logout realizado')
    }
    
  } catch (error) {
    console.error('❌ [TESTE] Erro no teste:', error)
  }
}

async function main() {
  console.log('🚀 [INICIANDO] Script de correção de refresh token')
  console.log('=' * 50)
  
  await diagnoseAuthIssues()
  console.log('=' * 50)
  
  console.log('💡 [SOLUÇÕES] Possíveis soluções:')
  console.log('1. Limpe o cache do navegador')
  console.log('2. Execute localStorage.clear() no console do navegador')
  console.log('3. Faça logout e login novamente')
  console.log('4. Verifique se as variáveis de ambiente estão corretas')
  console.log('5. Reinicie o servidor de desenvolvimento')
  
  console.log('=' * 50)
  console.log('✅ [FINALIZADO] Diagnóstico concluído')
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  diagnoseAuthIssues,
  fixRefreshTokenIssue,
  testAuthFlow
} 