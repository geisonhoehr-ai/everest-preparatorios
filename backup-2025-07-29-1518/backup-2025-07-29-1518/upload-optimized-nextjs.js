// 🚀 UPLOAD OTIMIZADO PARA NEXT.JS
// Use este código na sua função de upload

const uploadFileOptimized = async (file) => {
  try {
    console.log('🚀 Iniciando upload otimizado...')
    
    // 1. Verificar autenticação ANTES do upload
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('❌ Erro de autenticação:', authError.message)
      throw new Error('Erro de autenticação: ' + authError.message)
    }
    
    if (!user) {
      console.error('❌ Usuário não autenticado')
      throw new Error('Usuário não está autenticado')
    }
    
    console.log('✅ Usuário autenticado:', user.email)
    
    // 2. Preparar arquivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`
    
    console.log('📁 Nome do arquivo:', fileName)
    console.log('📊 Tamanho do arquivo:', file.size, 'bytes')
    console.log('🏷️ Tipo do arquivo:', file.type)
    
    // 3. Upload com configurações específicas
    const { data, error } = await supabase.storage
      .from('redacoes')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })

    if (error) {
      console.error('❌ Erro detalhado do upload:', error)
      throw error
    }

    console.log('✅ Upload realizado com sucesso!')
    console.log('📄 Dados retornados:', data)
    
    return data
    
  } catch (error) {
    console.error('💥 Erro no upload:', error.message)
    console.error('🔍 Stack trace:', error.stack)
    throw error
  }
}

// Função de teste
const testUpload = async () => {
  try {
    // Simular um arquivo para teste
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
    
    console.log('🧪 Testando upload...')
    const result = await uploadFileOptimized(testFile)
    console.log('✅ Teste bem-sucedido:', result)
    
  } catch (error) {
    console.error('❌ Teste falhou:', error)
  }
}

// Execute o teste
// testUpload()