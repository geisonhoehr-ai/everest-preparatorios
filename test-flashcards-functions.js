const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simular as funções do server-actions
async function getAllSubjects() {
  console.log("🔍 [Test] getAllSubjects() iniciada")
  console.log("🔍 [Test] Supabase client obtido")
  
  try {
    const { data, error } = await supabase.from("subjects").select("id, name").order("name")
    console.log("🔍 [Test] Query executada, data:", data, "error:", error)
    
    if (error) {
      console.error("❌ [Test] Erro ao buscar matérias:", error)
      return []
    }
    
    console.log("✅ [Test] Matérias encontradas:", data?.length)
    return data || []
  } catch (error) {
    console.error("❌ [Test] Erro inesperado em getAllSubjects:", error)
    return []
  }
}

async function getTopicsBySubject(subjectId) {
  console.log(`🔍 [Test] getTopicsBySubject(${subjectId}) iniciada`)
  
  const { data, error } = await supabase.from("topics").select("id, name, subject_id").eq("subject_id", subjectId).order("name")
  if (error) {
    console.error("❌ [Test] Erro ao buscar tópicos por matéria:", error)
    return []
  }
  console.log(`✅ [Test] Tópicos encontrados para subject ${subjectId}:`, data?.length)
  return data || []
}

async function getAllFlashcardsByTopicSimple(topicId, limit = 50) {
  console.log(`📚 [Test] getAllFlashcardsByTopicSimple(${topicId}) iniciada`)

  try {
    const { data, error } = await supabase
      .from("flashcards")
      .select(`
        id,
        topic_id,
        question,
        answer
      `)
      .eq("topic_id", topicId)
      .order("id", { ascending: true })
      .limit(limit)

    if (error) {
      console.error("❌ [Test] Erro ao buscar todos os flashcards:", error)
      return { success: false, error: error.message }
    }

    console.log(`✅ [Test] Todos os flashcards encontrados: ${data?.length || 0}`)
    return { success: true, data: data || [] }
  } catch (error) {
    console.error("❌ [Test] Erro inesperado ao buscar todos os flashcards:", error)
    return { success: false, error: "Erro inesperado" }
  }
}

async function testFlashcardsFlow() {
  console.log('🧪 Testando fluxo completo dos flashcards...\n');

  try {
    // 1. Testar getAllSubjects
    console.log('1️⃣ Testando getAllSubjects...');
    const subjects = await getAllSubjects();
    console.log(`✅ Subjects encontrados: ${subjects.length}`);
    subjects.forEach(subject => {
      console.log(`  - ID: ${subject.id}, Nome: ${subject.name}`);
    });

    if (subjects.length === 0) {
      console.log('❌ Nenhum subject encontrado!');
      return;
    }

    // 2. Testar getTopicsBySubject
    console.log('\n2️⃣ Testando getTopicsBySubject...');
    const firstSubject = subjects[0];
    const topics = await getTopicsBySubject(firstSubject.id);
    console.log(`✅ Tópicos encontrados para "${firstSubject.name}": ${topics.length}`);
    topics.forEach(topic => {
      console.log(`  - ID: ${topic.id}, Nome: ${topic.name}`);
    });

    if (topics.length === 0) {
      console.log('❌ Nenhum tópico encontrado!');
      return;
    }

    // 3. Testar getAllFlashcardsByTopicSimple
    console.log('\n3️⃣ Testando getAllFlashcardsByTopicSimple...');
    const firstTopic = topics[0];
    const flashcardsResult = await getAllFlashcardsByTopicSimple(firstTopic.id, 5);
    
    if (flashcardsResult.success) {
      console.log(`✅ Flashcards encontrados para "${firstTopic.name}": ${flashcardsResult.data.length}`);
      flashcardsResult.data.forEach(card => {
        console.log(`  - ID: ${card.id}, Pergunta: ${card.question?.substring(0, 50)}...`);
      });
    } else {
      console.log(`❌ Erro ao buscar flashcards: ${flashcardsResult.error}`);
    }

    console.log('\n🎉 Teste concluído!');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testFlashcardsFlow();
