// 🎯 TESTE FINAL - Upload Funcionando
// Execute este código no console do navegador (modo privado)

console.log('🎯 Iniciando teste final de upload...')

// 1. Verificar autenticação
const { data: { user }, error: authError } = await supabase.auth.getUser()

if (authError || !user) {
  console.error('❌ Usuário não autenticado:', authError)
} else {
  console.log('✅ Usuário autenticado:', user.email)
  
  // 2. Criar arquivo de teste
  const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
  console.log('📁 Arquivo de teste criado:', testFile.name, testFile.size, 'bytes')
  
  // 3. Teste de upload
  console.log('🚀 Testando upload...')
  const { data, error } = await supabase.storage
    .from('redacoes')
    .upload(`test-${Date.now()}.txt`, testFile)
  
  if (error) {
    console.error('❌ Erro no upload:', error)
  } else {
    console.log('✅ Upload bem-sucedido!')
    console.log('📄 Dados retornados:', data)
  }
}