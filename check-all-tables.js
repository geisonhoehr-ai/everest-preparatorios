// Verificar todas as tabelas disponíveis no Supabase
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAllTables() {
  console.log('🔍 Verificando todas as tabelas disponíveis...')
  
  try {
    // Buscar todas as tabelas usando uma query SQL
    const { data, error } = await supabase.rpc('get_all_tables')
    
    if (error) {
      console.log('❌ Erro ao buscar tabelas:', error.message)
      
      // Tentar método alternativo
      console.log('\n🔍 Tentando método alternativo...')
      
      // Lista de possíveis tabelas baseada nos scripts
      const possibleTables = [
        'user_profiles', 'subjects', 'topics', 'flashcards', 'quizzes', 'quiz_questions',
        'user_roles', 'student_profiles', 'teacher_profiles', 'calendar_events',
        'audio_courses', 'audio_modules', 'audio_lessons', 'classes', 'access_plans',
        'page_permissions', 'student_subscriptions', 'temporary_passwords',
        'user_progress', 'quiz_attempts', 'redacoes', 'temas_redacao', 'provas',
        'questoes', 'opcoes_questao', 'tentativas_prova', 'respostas_tentativa'
      ]
      
      console.log('📋 Testando tabelas possíveis:')
      for (const tableName of possibleTables) {
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
    } else {
      console.log('✅ Tabelas encontradas:', data)
    }
  } catch (err) {
    console.log('❌ Erro geral:', err.message)
  }
}

checkAllTables().catch(console.error)