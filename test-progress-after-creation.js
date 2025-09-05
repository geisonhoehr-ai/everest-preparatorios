// Testar sistema de progresso após criação das tabelas
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testProgressAfterCreation() {
  console.log('🧪 Testando sistema de progresso após criação das tabelas...')
  
  try {
    // 1. Verificar se as tabelas existem agora
    console.log('\n📋 Verificando tabelas de progresso...')
    
    const tables = [
      'user_gamification_stats',
      'user_rankings', 
      'user_topic_progress',
      'user_quiz_scores'
    ]
    
    for (const table of tables) {
      try {
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
          }
        }
      } catch (err) {
        console.log(`❌ ${table}: Erro - ${err.message}`)
      }
    }
    
    // 2. Testar inserção de dados de progresso
    console.log('\n🎯 Testando inserção de progresso...')
    
    const testUserId = '00000000-0000-0000-0000-000000000001'
    
    // Inserir estatísticas de gamificação
    const { error: gamificationError } = await supabase
      .from("user_gamification_stats")
      .upsert({
        user_uuid: testUserId,
        total_xp: 150,
        level: 2,
        streak_days: 7,
        total_study_time: 7200,
        flashcards_studied: 25,
        quizzes_completed: 5,
        correct_answers: 20,
        total_answers: 25,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_uuid'
      })
    
    if (gamificationError) {
      console.log('❌ Erro ao inserir gamificação:', gamificationError.message)
    } else {
      console.log('✅ Estatísticas de gamificação inseridas')
    }
    
    // Inserir ranking
    const { error: rankingError } = await supabase
      .from("user_rankings")
      .upsert({
        user_id: testUserId,
        total_score: 200,
        rank_position: 1,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
    
    if (rankingError) {
      console.log('❌ Erro ao inserir ranking:', rankingError.message)
    } else {
      console.log('✅ Ranking inserido')
    }
    
    // Inserir progresso de tópico
    const { error: topicError } = await supabase
      .from("user_topic_progress")
      .upsert({
        user_id: testUserId,
        topic_id: 'portugues-gramatica',
        flashcards_studied: 15,
        correct_answers: 12,
        total_answers: 15,
        last_studied: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,topic_id'
      })
    
    if (topicError) {
      console.log('❌ Erro ao inserir progresso de tópico:', topicError.message)
    } else {
      console.log('✅ Progresso de tópico inserido')
    }
    
    // Inserir pontuação de quiz
    const { error: quizError } = await supabase
      .from("user_quiz_scores")
      .insert({
        user_id: testUserId,
        topic_id: 'portugues-gramatica',
        score: 8,
        total_questions: 10,
        percentage: 80.0,
        time_spent: 450,
        completed_at: new Date().toISOString()
      })
    
    if (quizError) {
      console.log('❌ Erro ao inserir pontuação de quiz:', quizError.message)
    } else {
      console.log('✅ Pontuação de quiz inserida')
    }
    
    // 3. Testar consultas
    console.log('\n📊 Testando consultas...')
    
    // Buscar estatísticas
    const { data: stats } = await supabase
      .from("user_gamification_stats")
      .select("*")
      .eq("user_uuid", testUserId)
      .single()
    
    if (stats) {
      console.log('✅ Estatísticas encontradas:', stats)
    } else {
      console.log('❌ Nenhuma estatística encontrada')
    }
    
    // Buscar ranking
    const { data: rankings } = await supabase
      .from("user_rankings")
      .select("*")
      .order("total_score", { ascending: false })
      .limit(5)
    
    if (rankings && rankings.length > 0) {
      console.log('✅ Ranking encontrado:', rankings)
    } else {
      console.log('❌ Nenhum ranking encontrado')
    }
    
    // Buscar progresso de tópico
    const { data: topicProgress } = await supabase
      .from("user_topic_progress")
      .select("*")
      .eq("user_id", testUserId)
    
    if (topicProgress && topicProgress.length > 0) {
      console.log('✅ Progresso de tópico encontrado:', topicProgress)
    } else {
      console.log('❌ Nenhum progresso de tópico encontrado')
    }
    
    // Buscar pontuações de quiz
    const { data: quizScores } = await supabase
      .from("user_quiz_scores")
      .select("*")
      .eq("user_id", testUserId)
      .order("completed_at", { ascending: false })
    
    if (quizScores && quizScores.length > 0) {
      console.log('✅ Pontuações de quiz encontradas:', quizScores)
    } else {
      console.log('❌ Nenhuma pontuação de quiz encontrada')
    }
    
    console.log('\n✅ Teste do sistema de progresso concluído!')
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error)
  }
}

testProgressAfterCreation()
