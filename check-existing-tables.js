// Verificar tabelas existentes no Supabase
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  console.log('🔍 Verificando tabelas existentes no Supabase...')
  
  try {
    // Tentar acessar algumas tabelas conhecidas
    const tables = ['user_profiles', 'events', 'courses', 'topics', 'flashcards', 'subjects']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ Tabela '${table}': ${error.message}`)
        } else {
          console.log(`✅ Tabela '${table}': Acessível (${data?.length || 0} registros)`)
        }
      } catch (err) {
        console.log(`❌ Tabela '${table}': Erro - ${err.message}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

checkTables()
