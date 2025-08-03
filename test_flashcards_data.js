require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("🔍 Verificando qualidade dos dados dos flashcards...")

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variáveis de ambiente não configuradas!")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkFlashcardsData() {
  try {
    // 1. Verificar estrutura da tabela flashcards
    console.log("📋 Verificando estrutura da tabela flashcards...")
    const { data: flashcardsStructure, error: structureError } = await supabase
      .from("flashcards")
      .select("*")
      .limit(5)
    
    if (structureError) {
      console.error("❌ Erro ao verificar estrutura:", structureError)
      return
    }
    
    console.log("✅ Estrutura da tabela flashcards:")
    if (flashcardsStructure && flashcardsStructure.length > 0) {
      const sample = flashcardsStructure[0]
      console.log("📊 Campos disponíveis:")
      Object.keys(sample).forEach(key => {
        console.log(`  - ${key}: ${typeof sample[key]} (${sample[key]})`)
      })
    }
    
    // 2. Verificar flashcards com campos vazios ou nulos
    console.log("\n🔍 Verificando flashcards com campos vazios...")
    
    // Flashcards com question vazio
    const { data: emptyQuestions, error: emptyQuestionsError } = await supabase
      .from("flashcards")
      .select("id, topic_id, question, answer")
      .or("question.is.null,question.eq.''")
      .limit(10)
    
    if (emptyQuestionsError) {
      console.error("❌ Erro ao verificar questions vazias:", emptyQuestionsError)
    } else {
      console.log(`📝 Flashcards com question vazia: ${emptyQuestions?.length || 0}`)
      if (emptyQuestions && emptyQuestions.length > 0) {
        emptyQuestions.forEach((card, index) => {
          console.log(`  ${index + 1}. ID: ${card.id}, Topic: ${card.topic_id}, Question: "${card.question}"`)
        })
      }
    }
    
    // Flashcards com answer vazio
    const { data: emptyAnswers, error: emptyAnswersError } = await supabase
      .from("flashcards")
      .select("id, topic_id, question, answer")
      .or("answer.is.null,answer.eq.''")
      .limit(10)
    
    if (emptyAnswersError) {
      console.error("❌ Erro ao verificar answers vazias:", emptyAnswersError)
    } else {
      console.log(`📝 Flashcards com answer vazia: ${emptyAnswers?.length || 0}`)
      if (emptyAnswers && emptyAnswers.length > 0) {
        emptyAnswers.forEach((card, index) => {
          console.log(`  ${index + 1}. ID: ${card.id}, Topic: ${card.topic_id}, Answer: "${card.answer}"`)
        })
      }
    }
    
    // 3. Verificar flashcards com topic_id inválido
    console.log("\n🔍 Verificando flashcards com topic_id inválido...")
    const { data: invalidTopics, error: invalidTopicsError } = await supabase
      .from("flashcards")
      .select("id, topic_id, question")
      .or("topic_id.is.null,topic_id.eq.''")
      .limit(10)
    
    if (invalidTopicsError) {
      console.error("❌ Erro ao verificar topic_ids inválidos:", invalidTopicsError)
    } else {
      console.log(`📝 Flashcards com topic_id inválido: ${invalidTopics?.length || 0}`)
      if (invalidTopics && invalidTopics.length > 0) {
        invalidTopics.forEach((card, index) => {
          console.log(`  ${index + 1}. ID: ${card.id}, Topic: "${card.topic_id}", Question: "${card.question?.substring(0, 50)}..."`)
        })
      }
    }
    
    // 4. Verificar flashcards com conteúdo muito longo
    console.log("\n🔍 Verificando flashcards com conteúdo muito longo...")
    const { data: longContent, error: longContentError } = await supabase
      .from("flashcards")
      .select("id, topic_id, question, answer")
      .limit(10)
    
    if (longContentError) {
      console.error("❌ Erro ao verificar conteúdo longo:", longContentError)
    } else {
      console.log("📝 Flashcards com conteúdo longo:")
      if (longContent && longContent.length > 0) {
        longContent.forEach((card, index) => {
          const questionLength = card.question?.length || 0
          const answerLength = card.answer?.length || 0
          
          if (questionLength > 200 || answerLength > 500) {
            console.log(`  ${index + 1}. ID: ${card.id}`)
            console.log(`     Question (${questionLength} chars): "${card.question?.substring(0, 100)}..."`)
            console.log(`     Answer (${answerLength} chars): "${card.answer?.substring(0, 100)}..."`)
          }
        })
      }
    }
    
    // 5. Verificar flashcards com caracteres especiais problemáticos
    console.log("\n🔍 Verificando flashcards com caracteres especiais...")
    const { data: specialChars, error: specialCharsError } = await supabase
      .from("flashcards")
      .select("id, topic_id, question, answer")
      .limit(20)
    
    if (specialCharsError) {
      console.error("❌ Erro ao verificar caracteres especiais:", specialCharsError)
    } else {
      console.log("📝 Flashcards com caracteres especiais:")
      if (specialChars && specialChars.length > 0) {
        specialChars.forEach((card, index) => {
          const question = card.question || ""
          const answer = card.answer || ""
          
          // Verificar caracteres que podem causar problemas
          const problematicChars = ['\x00', '\x01', '\x02', '\x03', '\x04', '\x05', '\x06', '\x07', '\x08', '\x0B', '\x0C', '\x0E', '\x0F']
          const hasProblematicChars = problematicChars.some(char => question.includes(char) || answer.includes(char))
          
          if (hasProblematicChars) {
            console.log(`  ${index + 1}. ID: ${card.id} - Contém caracteres problemáticos`)
          }
        })
      }
    }
    
    // 6. Verificar total de flashcards por tópico
    console.log("\n🔍 Verificando total de flashcards por tópico...")
    const { data: topicCounts, error: topicCountsError } = await supabase
      .from("flashcards")
      .select("topic_id")
    
    if (topicCountsError) {
      console.error("❌ Erro ao verificar contagem por tópico:", topicCountsError)
    } else {
      const counts = {}
      topicCounts?.forEach(card => {
        counts[card.topic_id] = (counts[card.topic_id] || 0) + 1
      })
      
      console.log("📊 Total de flashcards por tópico:")
      Object.entries(counts).forEach(([topicId, count]) => {
        console.log(`  - ${topicId}: ${count} flashcards`)
      })
    }
    
    // 7. Verificar se há flashcards duplicados
    console.log("\n🔍 Verificando flashcards duplicados...")
    const { data: allFlashcards, error: allFlashcardsError } = await supabase
      .from("flashcards")
      .select("id, topic_id, question, answer")
      .limit(100)
    
    if (allFlashcardsError) {
      console.error("❌ Erro ao verificar duplicados:", allFlashcardsError)
    } else {
      const duplicates = []
      const seen = new Set()
      
      allFlashcards?.forEach(card => {
        const key = `${card.topic_id}-${card.question}-${card.answer}`
        if (seen.has(key)) {
          duplicates.push(card)
        } else {
          seen.add(key)
        }
      })
      
      console.log(`📝 Flashcards duplicados encontrados: ${duplicates.length}`)
      if (duplicates.length > 0) {
        duplicates.slice(0, 5).forEach((card, index) => {
          console.log(`  ${index + 1}. ID: ${card.id}, Topic: ${card.topic_id}`)
        })
      }
    }
    
  } catch (error) {
    console.error("❌ Erro no teste:", error)
  }
}

checkFlashcardsData() 