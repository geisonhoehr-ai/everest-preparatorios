// 🔍 DEBUG ESPECÍFICO PARA NEXT.JS
// Execute este código no console do navegador (F12)

const debugNextJSAuth = async () => {
  console.log('🔍 Iniciando debug específico para Next.js...')
  
  try {
    // 1. Verificar sessão
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('🔐 Sessão:', session ? 'Existe' : 'Não existe')
    console.log('❌ Erro sessão:', sessionError)
    
    // 2. Verificar usuário
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('👤 Usuário:', user ? `${user.email} (${user.id})` : 'Não autenticado')
    console.log('❌ Erro usuário:', userError)
    
    // 3. Verificar configuração do cliente
    console.log('🌐 URL do Supabase:', supabase.supabaseUrl)
    console.log('🔑 Anon Key:', supabase.supabaseKey.substring(0, 20) + '...')
    
    // 4. Verificar headers de autorização
    if (session?.access_token) {
      console.log('🔑 Token presente:', session.access_token.substring(0, 20) + '...')
      console.log('🔑 Token completo:', session.access_token)
    } else {
      console.log('❌ Sem token de acesso')
    }
    
    // 5. Teste de conexão com storage
    console.log('📦 Testando conexão com storage...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    console.log('📦 Buckets disponíveis:', buckets)
    console.log('❌ Erro de buckets:', bucketsError)
    
    // 6. Verificar bucket específico
    console.log('🎯 Verificando bucket redacoes...')
    const { data: redacoesFiles, error: redacoesError } = await supabase.storage
      .from('redacoes')
      .list('', { limit: 1 })
    console.log('📄 Arquivos em redacoes:', redacoesFiles)
    console.log('❌ Erro de redacoes:', redacoesError)
    
    return {
      session,
      user,
      hasToken: !!session?.access_token,
      buckets,
      redacoesFiles
    }
    
  } catch (error) {
    console.error('💥 Erro no debug:', error)
    return { error: error.message }
  }
}

// Execute o debug
debugNextJSAuth().then(result => {
  console.log('🎯 Resultado do debug Next.js:', result)
})