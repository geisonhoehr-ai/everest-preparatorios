// Teste final do sistema de progresso e ranking (VERSÃO CORRIGIDA)
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testProgressFinal() {
  console.log('🧪 Teste final do sistema de progresso e ranking...')
  console.log('📋 Execute primeiro: create-progress-tables-fixed.sql no Supabase SQL Editor')
  console.log('')
  
  try {
    // 1. Verificar se as tabelas existem
    console.log('1️⃣ Verificando tabelas...')
    
    const tables = [
      'user_gamification_stats',
      'user_rankings', 
      'user_topic_progress',
      'user_quiz_scores'
    ]
    
    let allTablesExist = true
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`)
          allTablesExist = false
        } else {
          console.log(`✅ ${table}: OK`)
        }
      } catch (err) {
        console.log(`❌ ${table}: Erro - ${err.message}`)
        allTablesExist = false
      }
    }
    
    if (!allTablesExist) {
      console.log('')
      console.log('🚨 ERRO: Execute primeiro o script SQL create-progress-tables-fixed.sql')
      console.log('📋 Vá para: Supabase Dashboard > SQL Editor > Execute o script')
      return
    }
    
    // 2. Testar inserção de dados
    console.log('')
    console.log('2️⃣ Testando inserção de dados...')
    
    const testUserId = '00000000-0000-0000-0000-000000000001'
    
    // Inserir estatísticas de gamificação
    console.log('   📊 Inserindo estatísticas de gamificação...')
    const { error: gamificationError } = await supabase
      .from("user_gamification_stats")
      .upsert({
        user_uuid: testUserId,
        total_xp: 250,
        level: 2,
        streak_days: 5,
        total_study_time: 3600,
        flashcards_studied: 20,
        quizzes_completed: 3,
        correct_answers: 15,
        total_answers: 20,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_uuid'
      })
    
    if (gamificationError) {
      console.log(`   ❌ Erro gamificação: ${gamificationError.message}`)
    } else {
      console.log('   ✅ Estatísticas de gamificação inseridas')
    }
    
    // Inserir ranking
    console.log('   🏆 Inserindo ranking...')
    const { error: rankingError } = await supabase
      .from("user_rankings")
      .upsert({
        user_id: testUserId,
        total_score: 300,
        rank_position: 1,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
    
    if (rankingError) {
      console.log(`   ❌ Erro ranking: ${rankingError.message}`)
    } else {
      console.log('   ✅ Ranking inserido')
    }
    
    // Inserir progresso de tópico
    console.log('   📚 Inserindo progresso de tópico...')
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
      console.log(`   ❌ Erro tópico: ${topicError.message}`)
    } else {
      console.log('   ✅ Progresso de tópico inserido')
    }
    
    // Inserir pontuação de quiz
    console.log('   🧠 Inserindo pontuação de quiz...')
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
      console.log(`   ❌ Erro quiz: ${quizError.message}`)
    } else {
      console.log('   ✅ Pontuação de quiz inserida')
    }
    
    // 3. Testar consultas
    console.log('')
    console.log('3️⃣ Testando consultas...')
    
    // Buscar estatísticas
    console.log('   📊 Buscando estatísticas...')
    const { data: stats } = await supabase
      .from("user_gamification_stats")
      .select("*")
      .eq("user_uuid", testUserId)
      .single()
    
    if (stats) {
      console.log('   ✅ Estatísticas encontradas:')
      console.log(`      - XP: ${stats.total_xp}`)
      console.log(`      - Nível: ${stats.level}`)
      console.log(`      - Flashcards: ${stats.flashcards_studied}`)
      console.log(`      - Quizzes: ${stats.quizzes_completed}`)
    } else {
      console.log('   ❌ Nenhuma estatística encontrada')
    }
    
    // Buscar ranking
    console.log('   🏆 Buscando ranking...')
    const { data: rankings } = await supabase
      .from("user_rankings")
      .select("*")
      .order("total_score", { ascending: false })
      .limit(5)
    
    if (rankings && rankings.length > 0) {
      console.log('   ✅ Ranking encontrado:')
      rankings.forEach((user, index) => {
        console.log(`      ${index + 1}. Usuário ${user.user_id}: ${user.total_score} pontos`)
      })
    } else {
      console.log('   ❌ Nenhum ranking encontrado')
    }
    
    // Buscar progresso de tópico
    console.log('   📚 Buscando progresso de tópico...')
    const { data: topicProgress } = await supabase
      .from("user_topic_progress")
      .select("*")
      .eq("user_id", testUserId)
    
    if (topicProgress && topicProgress.length > 0) {
      console.log('   ✅ Progresso de tópico encontrado:')
      topicProgress.forEach((progress, index) => {
        console.log(`      ${index + 1}. ${progress.topic_id}: ${progress.flashcards_studied} flashcards`)
      })
    } else {
      console.log('   ❌ Nenhum progresso de tópico encontrado')
    }
    
    // Buscar pontuações de quiz
    console.log('   🧠 Buscando pontuações de quiz...')
    const { data: quizScores } = await supabase
      .from("user_quiz_scores")
      .select("*")
      .eq("user_id", testUserId)
      .order("completed_at", { ascending: false })
    
    if (quizScores && quizScores.length > 0) {
      console.log('   ✅ Pontuações de quiz encontradas:')
      quizScores.forEach((score, index) => {
        console.log(`      ${index + 1}. ${score.topic_id}: ${score.score}/${score.total_questions} (${score.percentage}%)`)
      })
    } else {
      console.log('   ❌ Nenhuma pontuação de quiz encontrada')
    }
    
    console.log('')
    console.log('🎉 Teste final concluído com sucesso!')
    console.log('')
    console.log('📋 Próximos passos:')
    console.log('1. Execute o script SQL no Supabase')
    console.log('2. Teste o sistema no navegador')
    console.log('3. Faça login como estudante')
    console.log('4. Use flashcards e quizzes para ganhar XP')
    console.log('5. Verifique o ranking e progresso no dashboard')
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error)
  }
}

testProgressFinal()

