// Testar conexão com diferentes configurações do Supabase
const { createClient } = require('@supabase/supabase-js')

// URLs possíveis
const possibleUrls = [
  'https://wruvehhfzkvmfyhxzmwo.supabase.co',
  'https://hnhzindsfuqnaxosujay.supabase.co' // Baseado na chave
]

// Chaves possíveis
const possibleKeys = [
  // Service role da chave fornecida
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaHppbmRzZnVxbmF4b3N1amF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkzNTk1MiwiZXhwIjoyMDY4NTExOTUyfQ.Fj2biXwZJNz-cqnma6_gJDMviVGo92ljDCIdFynojZ4',
  // Anon key da chave fornecida
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaHppbmRzZnVxbmF4b3N1amF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MzU5NTIsImV4cCI6MjA2ODUxMTk1Mn0.8QZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ',
  // Chave anônima que estava funcionando antes
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'
]

async function testConnections() {
  console.log('🔍 Testando diferentes configurações do Supabase...')
  
  for (const url of possibleUrls) {
    console.log(`\n=== TESTANDO URL: ${url} ===`)
    
    for (let i = 0; i < possibleKeys.length; i++) {
      const key = possibleKeys[i]
      const keyType = i === 0 ? 'Service Role' : i === 1 ? 'Anon (nova)' : 'Anon (antiga)'
      
      console.log(`\n--- Testando chave ${keyType} ---`)
      console.log('Key (primeiros 20 chars):', key.substring(0, 20) + '...')
      
      const supabase = createClient(url, key)
      
      try {
        // Testar conexão básica
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ user_profiles: ${error.message}`)
        } else {
          console.log(`✅ user_profiles: Acessível (${data?.length || 0} registros)`)
          
          // Se funcionou, testar outras tabelas
          const tables = ['subjects', 'topics', 'flashcards', 'quizzes']
          
          for (const table of tables) {
            const { data: tableData, error: tableError } = await supabase
              .from(table)
              .select('*')
              .limit(1)
            
            if (tableError) {
              console.log(`❌ ${table}: ${tableError.message}`)
            } else {
              console.log(`✅ ${table}: Acessível (${tableData?.length || 0} registros)`)
            }
          }
          
          // Se encontrou uma configuração que funciona, parar aqui
          console.log('\n🎉 CONFIGURAÇÃO FUNCIONANDO ENCONTRADA!')
          return { url, key, keyType }
        }
      } catch (err) {
        console.log(`❌ Erro inesperado: ${err.message}`)
      }
    }
  }
  
  console.log('\n❌ Nenhuma configuração funcionou')
  return null
}

testConnections().then(result => {
  if (result) {
    console.log('\n✅ Use esta configuração:')
    console.log('URL:', result.url)
    console.log('Key Type:', result.keyType)
  }
}).catch(console.error)
