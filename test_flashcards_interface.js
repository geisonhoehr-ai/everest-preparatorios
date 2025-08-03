require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("🔍 Testando interface de flashcards...")

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variáveis de ambiente não configuradas!")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFlashcardsInterface() {
  try {
    // 1. Simular carregamento de subjects
    console.log("🔍 Simulando carregamento de subjects...")
    const { data: subjects, error: subjectsError } = await supabase
      .from("subjects")
      .select("id, name")
      .order("name")
    
    if (subjectsError) {
      console.error("❌ Erro ao carregar subjects:", subjectsError)
      return
    }
    
    console.log("✅ Subjects encontrados:")
    subjects?.forEach((subject, index) => {
      console.log(`  ${index + 1}. ID: ${subject.id}, Name: ${subject.name}`)
    })
    
    // 2. Simular carregamento de topics
    console.log("\n🔍 Simulando carregamento de topics...")
    const { data: topics, error: topicsError } = await supabase
      .from("topics")
      .select("id, name, subject_id")
      .order("name")
      .limit(10)
    
    if (topicsError) {
      console.error("❌ Erro ao carregar topics:", topicsError)
      return
    }
    
    console.log("✅ Topics encontrados:")
    topics?.forEach((topic, index) => {
      console.log(`  ${index + 1}. ID: ${topic.id}, Name: ${topic.name}, Subject: ${topic.subject_id}`)
    })
    
    // 3. Simular seleção de um tópico
    console.log("\n🔍 Simulando seleção de tópico...")
    const selectedTopic = "fonetica-fonologia"
    console.log(`📋 Tópico selecionado: ${selectedTopic}`)
    
    // 4. Simular carregamento de flashcards para o tópico
    console.log("🔍 Simulando carregamento de flashcards...")
    const { data: flashcards, error: flashcardsError } = await supabase
      .from("flashcards")
      .select("id, topic_id, question, answer")
      .eq("topic_id", selectedTopic)
      .order("id", { ascending: false })
      .limit(10)
    
    if (flashcardsError) {
      console.error("❌ Erro ao carregar flashcards:", flashcardsError)
      return
    }
    
    console.log(`✅ Flashcards encontrados: ${flashcards?.length || 0}`)
    
    if (flashcards && flashcards.length > 0) {
      console.log("📝 Primeiros 3 flashcards:")
      flashcards.slice(0, 3).forEach((card, index) => {
        console.log(`  ${index + 1}. ID: ${card.id}`)
        console.log(`     Question: "${card.question}"`)
        console.log(`     Answer: "${card.answer}"`)
        console.log("")
      })
    }
    
    // 5. Simular verificação de role
    console.log("\n🔍 Simulando verificação de role...")
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log("⚠️ Usuário não autenticado")
    } else if (user) {
      console.log(`✅ Usuário autenticado: ${user.email}`)
      
      // Verificar role
      const { data: userRole, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_uuid", user.email)
        .single()
      
      if (roleError) {
        console.log("ℹ️ Role não encontrado, usando padrão: student")
      } else {
        console.log(`✅ Role do usuário: ${userRole.role}`)
      }
    }
    
    // 6. Simular contagem de flashcards por tópico
    console.log("\n🔍 Simulando contagem de flashcards por tópico...")
    const topicCounts = {}
    
    for (const topic of topics || []) {
      const { data: count, error: countError } = await supabase
        .from("flashcards")
        .select("id", { count: "exact" })
        .eq("topic_id", topic.id)
      
      if (!countError) {
        topicCounts[topic.id] = count?.length || 0
      }
    }
    
    console.log("📊 Contagem de flashcards por tópico:")
    Object.entries(topicCounts).forEach(([topicId, count]) => {
      const topicName = topics?.find(t => t.id === topicId)?.name || topicId
      console.log(`  - ${topicName}: ${count} flashcards`)
    })
    
    // 7. Simular verificação de progresso
    console.log("\n🔍 Simulando verificação de progresso...")
    if (user) {
      const { data: progress, error: progressError } = await supabase
        .from("topic_progress")
        .select("topic_id, accuracy, total_studied")
        .eq("user_id", user.id)
        .limit(5)
      
      if (progressError) {
        console.log("ℹ️ Nenhum progresso encontrado")
      } else {
        console.log("✅ Progresso encontrado:")
        progress?.forEach((p, index) => {
          console.log(`  ${index + 1}. Topic: ${p.topic_id}, Accuracy: ${p.accuracy}%, Studied: ${p.total_studied}`)
        })
      }
    }
    
    console.log("\n✅ Simulação da interface concluída!")
    
  } catch (error) {
    console.error("❌ Erro na simulação:", error)
  }
}

testFlashcardsInterface() 