// Verificação detalhada da tabela subjects
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSubjectsDetailed() {
  console.log('🔍 Verificação detalhada da tabela subjects...')
  
  try {
    // 1. Tentar buscar com diferentes estratégias
    console.log('\n1. Tentando buscar subjects com select simples...')
    const { data: data1, error: error1 } = await supabase
      .from('subjects')
      .select('*')
    
    if (error1) {
      console.log('❌ Erro 1:', error1.message)
      console.log('Código:', error1.code)
      console.log('Detalhes:', error1.details)
    } else {
      console.log('✅ Sucesso! Dados:', data1)
    }
    
    // 2. Tentar com select específico
    console.log('\n2. Tentando buscar subjects com select específico...')
    const { data: data2, error: error2 } = await supabase
      .from('subjects')
      .select('id, name')
    
    if (error2) {
      console.log('❌ Erro 2:', error2.message)
    } else {
      console.log('✅ Sucesso! Dados:', data2)
    }
    
    // 3. Tentar inserir um registro de teste
    console.log('\n3. Tentando inserir registro de teste...')
    const { data: data3, error: error3 } = await supabase
      .from('subjects')
      .insert([{ name: 'Teste Matemática' }])
      .select()
    
    if (error3) {
      console.log('❌ Erro 3 (inserção):', error3.message)
    } else {
      console.log('✅ Inserção bem-sucedida! Dados:', data3)
    }
    
    // 4. Verificar se a tabela existe no schema
    console.log('\n4. Verificando schema...')
    const { data: data4, error: error4 } = await supabase
      .rpc('get_schema_info')
    
    if (error4) {
      console.log('❌ Erro 4 (schema):', error4.message)
    } else {
      console.log('✅ Schema info:', data4)
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

checkSubjectsDetailed()
