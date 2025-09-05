// Verificar estrutura das tabelas de progresso
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProgressStructure() {
  console.log('🔍 Verificando estrutura das tabelas de progresso...')
  
  try {
    // Tabelas de progresso principais
    const progressTables = [
      'user_flashcard_progress',
      'user_quiz_scores', 
      'user_topic_progress',
      'user_achievements',
      'user_achievement_progress',
      'user_daily_stats',
      'user_gamification_stats',
      'user_rankings',
      'rpg_ranks',
      'study_streaks'
    ]
    
    for (const table of progressTables) {
      try {
        console.log(`\n📋 Verificando estrutura: ${table}`)
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`)
        } else {
          console.log(`✅ ${table}: Acessível`)
          if (data && data.length > 0) {
            console.log(`📊 Estrutura:`, Object.keys(data[0]))
            console.log(`📋 Exemplo:`, data[0])
          } else {
            console.log(`📊 Tabela vazia - verificando estrutura via schema`)
            // Tentar inserir um registro de teste para ver a estrutura
            const testData = {
              user_id: '00000000-0000-0000-0000-000000000000',
              topic_id: 'test',
              progress: 0,
              created_at: new Date().toISOString()
            }
            
            const { error: insertError } = await supabase
              .from(table)
              .insert(testData)
            
            if (insertError) {
              console.log(`📝 Erro ao inserir teste (esperado):`, insertError.message)
            } else {
              console.log(`✅ Estrutura validada - registro de teste inserido`)
              // Remover o registro de teste
              await supabase.from(table).delete().eq('user_id', '00000000-0000-0000-0000-000000000000')
            }
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

checkProgressStructure()
