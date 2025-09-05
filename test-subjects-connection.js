// Teste de conexão com a tabela subjects no Supabase
const { createClient } = require('@supabase/supabase-js')

// Configurações do Supabase (hardcoded do supabase-config.ts)
const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'

console.log('🔗 Conectando ao Supabase...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? 'Definida' : 'Não definida')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSubjectsConnection() {
  console.log('🧪 Testando conexão com tabela subjects...')
  
  try {
    // Testar se a tabela existe
    console.log('📋 Verificando estrutura da tabela subjects...')
    const { data: tableInfo, error: tableError } = await supabase
      .from('subjects')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Erro ao acessar tabela subjects:', tableError)
      return
    }
    
    console.log('✅ Tabela subjects acessível')
    
    // Buscar todos os subjects
    console.log('📚 Buscando todas as matérias...')
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('id, name')
      .order('name')
    
    if (subjectsError) {
      console.error('❌ Erro ao buscar matérias:', subjectsError)
      return
    }
    
    console.log('📊 Resultado da busca:')
    console.log('Quantidade de matérias:', subjects?.length || 0)
    console.log('Dados:', subjects)
    
    if (!subjects || subjects.length === 0) {
      console.log('⚠️ Nenhuma matéria encontrada na tabela')
      console.log('💡 Vamos criar algumas matérias de teste...')
      
      // Criar matérias de teste
      const testSubjects = [
        { name: 'Matemática' },
        { name: 'Física' },
        { name: 'Química' },
        { name: 'Biologia' },
        { name: 'História' },
        { name: 'Geografia' }
      ]
      
      const { data: insertData, error: insertError } = await supabase
        .from('subjects')
        .insert(testSubjects)
        .select()
      
      if (insertError) {
        console.error('❌ Erro ao inserir matérias:', insertError)
      } else {
        console.log('✅ Matérias criadas com sucesso:', insertData)
      }
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

// Executar teste
testSubjectsConnection()
