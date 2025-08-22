const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 [TEST] Verificando tabela subjects...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey ? '✅ Configurada' : '❌ Não configurada')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSubjectsTable() {
  try {
    console.log('\n🔍 [TEST] Testando acesso à tabela subjects...')
    
    // 1. Testar se conseguimos acessar a tabela
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')
      .limit(5)
    
    if (subjectsError) {
      console.error('❌ [TEST] Erro ao acessar subjects:', subjectsError)
      return
    }
    
    console.log('✅ [TEST] Tabela subjects acessível')
    console.log('📊 [TEST] Dados encontrados:', subjects?.length || 0)
    
    if (subjects && subjects.length > 0) {
      console.log('📚 [TEST] Primeiras matérias:')
      subjects.forEach((subject, index) => {
        console.log(`  ${index + 1}. ID: ${subject.id}, Nome: ${subject.name}`)
      })
    } else {
      console.log('⚠️ [TEST] Tabela subjects está vazia!')
      
      // 2. Verificar se conseguimos inserir dados de teste
      console.log('\n🔍 [TEST] Tentando inserir dados de teste...')
      
      const testSubjects = [
        { name: 'Português' },
        { name: 'Regulamentos' }
      ]
      
      const { data: inserted, error: insertError } = await supabase
        .from('subjects')
        .insert(testSubjects)
        .select()
      
      if (insertError) {
        console.error('❌ [TEST] Erro ao inserir dados de teste:', insertError)
        console.log('💡 [TEST] Possível problema de RLS (Row Level Security)')
      } else {
        console.log('✅ [TEST] Dados de teste inseridos com sucesso!')
        console.log('📊 [TEST] Dados inseridos:', inserted)
      }
    }
    
  } catch (error) {
    console.error('❌ [TEST] Erro inesperado:', error)
  }
}

testSubjectsTable()
