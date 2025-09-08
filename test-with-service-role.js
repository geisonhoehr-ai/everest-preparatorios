// Testar com service role key
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'

// Tentar diferentes chaves de service role
const serviceKeys = [
  // Chave truncada do arquivo
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE0NDcxOCwiZXhwIjoyMDY4NzIwNzE4fQ.8QZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ',
  // Chave anônima (para comparação)
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'
]

async function testServiceKeys() {
  console.log('🔍 Testando diferentes chaves do Supabase...')
  
  for (let i = 0; i < serviceKeys.length; i++) {
    const key = serviceKeys[i]
    const keyType = i === 0 ? 'Service Role' : 'Anon'
    
    console.log(`\n=== TESTANDO CHAVE ${keyType} ===`)
    console.log('Key (primeiros 20 chars):', key.substring(0, 20) + '...')
    
    const supabase = createClient(supabaseUrl, key)
    
    try {
      // Testar acesso às tabelas
      const tables = ['subjects', 'topics', 'flashcards', 'quizzes', 'user_profiles']
      
      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`)
        } else {
          console.log(`✅ ${table}: Acessível (${data?.length || 0} registros)`)
        }
      }
      
      // Se a chave funcionou, tentar inserir usuário
      if (i === 0) { // Service role
        console.log('\n--- Tentando inserir usuário ---')
        const testUserUuid = 'c8b5bff0-b5cc-4dab-9cfa-0a0cf4983dc5'
        
        const { data: insertData, error: insertError } = await supabase
          .from("user_profiles")
          .insert({
            user_id: testUserUuid,
            role: 'teacher',
            display_name: 'Professor Teste',
            created_at: new Date().toISOString()
          })
          .select()
        
        console.log('Usuário inserido:', insertData ? '✅ Sucesso' : '❌ Falhou', insertError?.message)
      }
      
    } catch (err) {
      console.log(`❌ Erro com chave ${keyType}:`, err.message)
    }
  }
}

testServiceKeys().catch(console.error)
