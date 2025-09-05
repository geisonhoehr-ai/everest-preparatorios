// Teste completo do sistema de progresso e ranking
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCompleteSystem() {
  console.log('🧪 Teste completo do sistema de progresso e ranking...')
  console.log('📋 Execute primeiro: create-progress-tables.sql no Supabase SQL Editor')
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
      console.log('🚨 ERRO: Execute primeiro o script SQL create-progress-tables.sql')
      console.log('📋 Vá para: Supabase Dashboard > SQL Editor > Execute o script')
      return
    }
    
    // 2. Testar inserção de dados
    console.log('')
    console.log('2️⃣ Testando inserção de dados...')
    
    const testUsers = [
      { id: '00000000-0000-0000-0000-000000000001', name: 'João Silva' },
      { id: '00000000-0000-0000-0000-000000000002', name: 'Maria Santos' },
      { id: '00000000-0000-0000-0000-000000000003', name: 'Pedro Costa' }
    ]
    
    for (const testUser of testUsers) {
      console.log(`   👤 Criando dados para ${testUser.name}...`)
      
      // Inserir estatísticas de gamificação
      const { error: gamificationError } = await supabase
        .from("user_gamification_stats")
        .upsert({
          user_uuid: testUser.id,
          total_xp: Math.floor(Math.random() * 1000) + 100,
          level: Math.floor(Math.random() * 5) + 1,
          streak_days: Math.floor(Math.random() * 30),
          total_study_time: Math.floor(Math.random() * 10000),
          flashcards_studied: Math.floor(Math.random() * 100),
          quizzes_completed: Math.floor(Math.random() * 20),
          correct_answers: Math.floor(Math.random() * 80),
          total_answers: Math.floor(Math.random() * 100),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_uuid'
        })
      
      if (gamificationError) {
        console.log(`   ❌ Erro gamificação: ${gamificationError.message}`)
      } else {
        console.log(`   ✅ Gamificação OK`)
      }
      
      // Inserir ranking
      const { error: rankingError } = await supabase
        .from("user_rankings")
        .upsert({
          user_id: testUser.id,
          total_score: Math.floor(Math.random() * 2000) + 100,
          rank_position: 999999,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
      
      if (rankingError) {
        console.log(`   ❌ Erro ranking: ${rankingError.message}`)
      } else {
        console.log(`   ✅ Ranking OK`)
      }
    }
    
    // 3. Testar consultas
    console.log('')
    console.log('3️⃣ Testando consultas...')
    
    // Buscar ranking
    const { data: rankings } = await supabase
      .from("user_rankings")
      .select("*")
      .order("total_score", { ascending: false })
      .limit(10)
    
    if (rankings && rankings.length > 0) {
      console.log('✅ Ranking carregado:')
      rankings.forEach((user, index) => {
        console.log(`   ${index + 1}. Usuário ${user.user_id}: ${user.total_score} pontos`)
      })
    } else {
      console.log('❌ Nenhum ranking encontrado')
    }
    
    // Buscar estatísticas
    const { data: stats } = await supabase
      .from("user_gamification_stats")
      .select("*")
      .limit(5)
    
    if (stats && stats.length > 0) {
      console.log('✅ Estatísticas carregadas:')
      stats.forEach((stat, index) => {
        console.log(`   ${index + 1}. XP: ${stat.total_xp}, Nível: ${stat.level}, Flashcards: ${stat.flashcards_studied}`)
      })
    } else {
      console.log('❌ Nenhuma estatística encontrada')
    }
    
    // 4. Testar funcionalidades específicas
    console.log('')
    console.log('4️⃣ Testando funcionalidades específicas...')
    
    // Simular progresso de flashcard
    const { error: flashcardError } = await supabase
      .from("user_topic_progress")
      .upsert({
        user_id: testUsers[0].id,
        topic_id: 'portugues-gramatica',
        flashcards_studied: 15,
        correct_answers: 12,
        total_answers: 15,
        last_studied: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,topic_id'
      })
    
    if (flashcardError) {
      console.log(`❌ Erro flashcard: ${flashcardError.message}`)
    } else {
      console.log('✅ Progresso de flashcard OK')
    }
    
    // Simular pontuação de quiz
    const { error: quizError } = await supabase
      .from("user_quiz_scores")
      .insert({
        user_id: testUsers[0].id,
        topic_id: 'portugues-gramatica',
        score: 8,
        total_questions: 10,
        percentage: 80.0,
        time_spent: 450,
        completed_at: new Date().toISOString()
      })
    
    if (quizError) {
      console.log(`❌ Erro quiz: ${quizError.message}`)
    } else {
      console.log('✅ Pontuação de quiz OK')
    }
    
    console.log('')
    console.log('🎉 Teste completo finalizado!')
    console.log('')
    console.log('📋 Próximos passos:')
    console.log('1. Execute o script SQL no Supabase')
    console.log('2. Teste o sistema no navegador')
    console.log('3. Faça login como estudante')
    console.log('4. Use flashcards e quizzes para ganhar XP')
    console.log('5. Verifique o ranking e progresso')
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error)
  }
}

testCompleteSystem()
