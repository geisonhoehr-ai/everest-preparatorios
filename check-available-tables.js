// Verificar tabelas disponíveis
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  console.log('🔍 Verificando tabelas disponíveis...')
  
  // Lista de tabelas que esperamos encontrar
  const expectedTables = [
    'subjects',
    'topics', 
    'flashcards',
    'quizzes',
    'quiz_questions',
    'user_profiles',
    'user_roles',
    'student_profiles',
    'teacher_profiles'
  ]
  
  for (const tableName of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`)
      } else {
        console.log(`✅ ${tableName}: ${data ? data.length : 0} registros`)
      }
    } catch (err) {
      console.log(`❌ ${tableName}: ${err.message}`)
    }
  }
  
  // Verificar tabelas que podem ter nomes diferentes
  console.log('\n🔍 Verificando tabelas alternativas...')
  
  const alternativeTables = [
    'subject',
    'topic',
    'flashcard',
    'quiz',
    'quiz_question',
    'user_profile',
    'user_role'
  ]
  
  for (const tableName of alternativeTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`)
      } else {
        console.log(`✅ ${tableName}: ${data ? data.length : 0} registros`)
      }
    } catch (err) {
      console.log(`❌ ${tableName}: ${err.message}`)
    }
  }
}

checkTables().catch(console.error)
