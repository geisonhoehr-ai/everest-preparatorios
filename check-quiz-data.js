// Verificar se existem dados de quiz em alguma tabela
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkQuizData() {
  console.log('🔍 Verificando dados de quiz...')
  
  try {
    // Verificar se existem dados na tabela profiles
    console.log('\n📋 Verificando dados na tabela profiles...')
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(10)
    
    if (profilesError) {
      console.log('❌ Erro ao buscar profiles:', profilesError.message)
    } else {
      console.log(`✅ Profiles: ${profilesData ? profilesData.length : 0} registros`)
      if (profilesData && profilesData.length > 0) {
        console.log('📄 Primeiro registro:')
        console.log(JSON.stringify(profilesData[0], null, 2))
      }
    }
    
    // Verificar se existem dados em outras tabelas que podem conter quiz
    console.log('\n📋 Verificando outras tabelas possíveis...')
    
    const possibleQuizTables = [
      'questions', 'question', 'quiz_data', 'quiz_content', 'content',
      'materials', 'study_materials', 'educational_content'
    ]
    
    for (const tableName of possibleQuizTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`)
        } else {
          console.log(`✅ ${tableName}: ${data ? data.length : 0} registros`)
          if (data && data.length > 0) {
            console.log('📄 Estrutura do primeiro registro:')
            console.log(JSON.stringify(data[0], null, 2))
          }
        }
      } catch (err) {
        console.log(`❌ ${tableName}: ${err.message}`)
      }
    }
    
    // Verificar se existem dados em user_profiles
    console.log('\n📋 Verificando user_profiles...')
    const { data: userProfilesData, error: userProfilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(10)
    
    if (userProfilesError) {
      console.log('❌ Erro ao buscar user_profiles:', userProfilesError.message)
    } else {
      console.log(`✅ user_profiles: ${userProfilesData ? userProfilesData.length : 0} registros`)
      if (userProfilesData && userProfilesData.length > 0) {
        console.log('📄 Primeiro registro:')
        console.log(JSON.stringify(userProfilesData[0], null, 2))
      }
    }
    
  } catch (err) {
    console.log('❌ Erro geral:', err.message)
  }
}

checkQuizData().catch(console.error)
