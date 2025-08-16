// 🔍 DEBUG DE AUTENTICAÇÃO
// Execute este código no console do navegador (F12)

const debugAuth = async () => {
  console.log('🔍 Iniciando debug de autenticação...')
  
  try {
    // 1. Verificar sessão atual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('📋 Sessão atual:', session)
    console.log('❌ Erro de sessão:', sessionError)
    
    // 2. Verificar usuário
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('👤 Usuário:', user)
    console.log('❌ Erro de usuário:', userError)
    
    // 3. Verificar headers de autorização
    if (session?.access_token) {
      console.log('🔑 Token presente:', session.access_token.substring(0, 20) + '...')
      console.log('🔑 Token completo:', session.access_token)
    } else {
      console.log('❌ Sem token de acesso')
    }
    
    // 4. Verificar configuração do cliente
    console.log('🌐 URL do Supabase:', supabase.supabaseUrl)
    console.log('🔑 Anon Key:', supabase.supabaseKey.substring(0, 20) + '...')
    
    // 5. Teste de conexão com storage
    console.log('📦 Testando conexão com storage...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    console.log('📦 Buckets disponíveis:', buckets)
    console.log('❌ Erro de buckets:', bucketsError)
    
    return {
      session,
      user,
      hasToken: !!session?.access_token,
      buckets
    }
    
  } catch (error) {
    console.error('💥 Erro no debug:', error)
    return { error: error.message }
  }
}

// Execute o debug
debugAuth().then(result => {
  console.log('🎯 Resultado do debug:', result)
})