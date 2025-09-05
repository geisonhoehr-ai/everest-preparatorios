// Verificar todas as tabelas disponíveis no Supabase
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAllTables() {
  console.log('🔍 Verificando todas as tabelas disponíveis...')
  
  try {
    // Lista de tabelas que vimos no backup
    const tables = [
      'subjects',
      'topics', 
      'flashcards',
      'quizzes',
      'quiz_questions',
      'user_profiles',
      'events',
      'simulados',
      'simulado_questoes',
      'simulado_resultados',
      'subscriptions',
      'study_streaks',
      'rpg_ranks'
    ]
    
    for (const table of tables) {
      try {
        console.log(`\n📋 Verificando tabela: ${table}`)
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(2)
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`)
        } else {
          console.log(`✅ ${table}: Acessível`)
          if (data && data.length > 0) {
            console.log(`📊 Estrutura:`, Object.keys(data[0]))
            console.log(`📈 Registros: ${data.length} (mostrando 2 primeiros)`)
          } else {
            console.log(`📊 Tabela vazia`)
          }
        }
      } catch (err) {
        console.log(`❌ ${table}: Erro - ${err.message}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

checkAllTables()
