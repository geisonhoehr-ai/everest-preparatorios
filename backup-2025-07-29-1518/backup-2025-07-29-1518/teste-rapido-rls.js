// 🧪 TESTE RÁPIDO PARA RLS
// Execute este código no console do navegador (F12)

const testeRapidoRLS = async () => {
  console.log('🧪 Iniciando teste rápido para RLS...')
  
  try {
    // 1. Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Usuário não autenticado:', authError)
      return { error: 'Usuário não autenticado' }
    }
    
    console.log('✅ Usuário autenticado:', user.email)
    
    // 2. Criar arquivo de teste
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
    console.log('📁 Arquivo de teste criado:', testFile.name, testFile.size, 'bytes')
    
    // 3. Teste de upload simples
    console.log('🚀 Testando upload...')
    const { data, error } = await supabase.storage
      .from('redacoes')
      .upload(`test-${Date.now()}.txt`, testFile)
    
    if (error) {
      console.error('❌ Erro no upload:', error)
      return { error: error.message }
    }
    
    console.log('✅ Upload bem-sucedido!')
    console.log('📄 Dados retornados:', data)
    
    return { success: true, data }
    
  } catch (error) {
    console.error('💥 Erro no teste:', error)
    return { error: error.message }
  }
}

// Execute o teste
testeRapidoRLS().then(result => {
  console.log('🎯 Resultado do teste RLS:', result)
})