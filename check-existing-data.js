// Verificar dados existentes na tabela user_profiles
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkExistingData() {
  console.log('🔍 Verificando dados existentes...')
  
  try {
    // Verificar user_profiles
    console.log('\n📋 Verificando user_profiles:')
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(5)
    
    if (profilesError) {
      console.log('❌ Erro ao buscar user_profiles:', profilesError.message)
    } else {
      console.log(`✅ user_profiles: ${profiles ? profiles.length : 0} registros`)
      if (profiles && profiles.length > 0) {
        console.log('📄 Estrutura do primeiro registro:')
        console.log(JSON.stringify(profiles[0], null, 2))
      }
    }
    
    // Verificar se existem outras tabelas com nomes similares
    console.log('\n🔍 Verificando tabelas com nomes similares...')
    
    const similarTables = [
      'user_profile', 'users', 'profile', 'profiles',
      'subject', 'topic', 'flashcard', 'quiz', 'question',
      'calendar', 'event', 'course', 'module', 'lesson'
    ]
    
    for (const tableName of similarTables) {
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
    
  } catch (err) {
    console.log('❌ Erro geral:', err.message)
  }
}

checkExistingData().catch(console.error)
