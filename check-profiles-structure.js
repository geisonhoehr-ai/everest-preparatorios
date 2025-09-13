// Verificar estrutura da tabela profiles
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProfilesStructure() {
  console.log('🔍 Verificando estrutura da tabela profiles...')
  
  try {
    // Tentar inserir um registro de teste para ver a estrutura
    console.log('\n📋 Tentando inserir registro de teste...')
    
    const testData = {
      id: 'test-' + Date.now(),
      email: 'test@example.com',
      name: 'Test User',
      role: 'student'
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .insert(testData)
      .select()
    
    if (error) {
      console.log('❌ Erro ao inserir:', error.message)
      console.log('📄 Detalhes do erro:', error)
    } else {
      console.log('✅ Registro inserido com sucesso:', data)
      
      // Deletar o registro de teste
      await supabase
        .from('profiles')
        .delete()
        .eq('id', testData.id)
      
      console.log('🗑️ Registro de teste removido')
    }
    
    // Tentar buscar dados existentes
    console.log('\n📋 Buscando dados existentes...')
    const { data: existingData, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .limit(10)
    
    if (selectError) {
      console.log('❌ Erro ao buscar dados:', selectError.message)
    } else {
      console.log(`✅ Dados encontrados: ${existingData ? existingData.length : 0} registros`)
      if (existingData && existingData.length > 0) {
        console.log('📄 Estrutura do primeiro registro:')
        console.log(JSON.stringify(existingData[0], null, 2))
      }
    }
    
  } catch (err) {
    console.log('❌ Erro geral:', err.message)
  }
}

checkProfilesStructure().catch(console.error)
