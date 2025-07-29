// 🎯 TESTE DEFINITIVO DE UPLOAD
// Execute este código no console do navegador (modo privado)

const testeDefinitivoUpload = async () => {
  console.log('🎯 Iniciando teste definitivo de upload...')
  
  try {
    // 1. Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Usuário não autenticado:', authError)
      return { error: 'Usuário não autenticado' }
    }
    
    console.log('✅ Usuário autenticado:', user.email)
    
    // 2. Verificar bucket
    console.log('📦 Verificando bucket...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Erro ao listar buckets:', bucketsError)
      return { error: bucketsError.message }
    }
    
    const redacoesBucket = buckets.find(b => b.name === 'redacoes')
    console.log('📦 Bucket redacoes:', redacoesBucket)
    
    if (!redacoesBucket) {
      console.error('❌ Bucket redacoes não encontrado')
      return { error: 'Bucket redacoes não encontrado' }
    }
    
    if (!redacoesBucket.public) {
      console.error('❌ Bucket não está público')
      return { error: 'Bucket não está público' }
    }
    
    console.log('✅ Bucket redacoes encontrado e público')
    
    // 3. Criar arquivo de teste
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
    console.log('📁 Arquivo de teste criado:', testFile.name, testFile.size, 'bytes')
    
    // 4. Teste de upload
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
    
    // 5. Verificar se o arquivo foi salvo
    console.log('🔍 Verificando se arquivo foi salvo...')
    const { data: files, error: listError } = await supabase.storage
      .from('redacoes')
      .list('')
    
    if (listError) {
      console.error('❌ Erro ao listar arquivos:', listError)
    } else {
      console.log('📄 Arquivos no bucket:', files)
    }
    
    return { success: true, data, files }
    
  } catch (error) {
    console.error('💥 Erro no teste:', error)
    return { error: error.message }
  }
}

// Execute o teste
testeDefinitivoUpload().then(result => {
  console.log('🎯 Resultado do teste definitivo:', result)
})