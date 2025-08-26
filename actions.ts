"use server"

import { createClient } from "@/lib/supabaseServer"
import { revalidatePath } from "next/cache"

// Função para obter o cliente Supabase do servidor
async function getSupabaseClient() {
  const client = createClient()
  console.log("🔗 [DEBUG] Cliente Supabase criado:", !!client)
  return client
}

// Função para verificar se o usuário tem acesso pago
export async function checkPaidAccess(email: string): Promise<boolean> {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase.from("paid_users").select("status").eq("email", email).single()

  if (error) {
    console.error("Erro ao verificar acesso pago:", error)
    return false
  }

  return data?.status === "active"
}

// Função para obter a role do usuário
export async function getUserRole(userUuid: string): Promise<string | null> {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase.from("user_roles").select("role").eq("user_uuid", userUuid).single()

  if (error) {
    console.error("Erro ao buscar role do usuário:", error)
    return null
  }

  return data?.role || null
}

// Função para definir role do usuário
export async function setUserRole(userUuid: string, role: "student" | "teacher") {
  const supabase = await getSupabaseClient()

  const { error } = await supabase.from("user_roles").upsert({
    user_uuid: userUuid,
    role: role,
    first_login: false,
    profile_completed: true,
  })

  if (error) {
    console.error("Erro ao definir role:", error)
    throw error
  }

  revalidatePath("/")
  return { success: true }
}

// Função para criar perfil de usuário
export async function createUserProfile(userUuid: string, role: "student" | "teacher", profileData: any) {
  const supabase = await getSupabaseClient()

  // Inserir ou atualizar role
  const { error: roleError } = await supabase.from("user_roles").upsert({
    user_uuid: userUuid,
    role: role,
    first_login: false,
    profile_completed: true,
  })

  if (roleError) {
    console.error("Erro ao criar role:", roleError)
    return { success: false, error: roleError.message }
  }

  // Inserir perfil específico
  const tableName = role === "student" ? "student_profiles" : "teacher_profiles"
  const { error: profileError } = await supabase.from(tableName).upsert({
    user_uuid: userUuid,
    ...profileData,
  })

  if (profileError) {
    console.error("Erro ao criar perfil:", profileError)
    return { success: false, error: profileError.message }
  }

  revalidatePath("/")
  return { success: true }
}

// Função para obter pontuação total
export async function getTotalScore(): Promise<number> {
  const supabase = await getSupabaseClient()

  // Simulação - em produção você buscaria do banco
  return 1250
}

// Função para obter progresso por tópico
export async function getTopicProgress() {
  const supabase = await getSupabaseClient()

  // Simulação - retorna dados fictícios para demonstração
  return {
    "fonetica-fonologia": { correct: 15, incorrect: 3 },
    ortografia: { correct: 22, incorrect: 5 },
    "acentuacao-grafica": { correct: 18, incorrect: 2 },
    "morfologia-classes": { correct: 12, incorrect: 8 },
    "sintaxe-termos-essenciais": { correct: 25, incorrect: 4 },
  }
}

// Função para atualizar pontuação
export async function updateScore(newScore: number) {
  const supabase = await getSupabaseClient()
  // Implementação da atualização de pontuação
  revalidatePath("/")
  return { success: true }
}

// Função utilitária para atribuir conquista
async function grantAchievement(user_uuid: string, achievement_key: string) {
  const supabase = await getSupabaseClient();
  await supabase.from("user_achievements").upsert({
    user_uuid,
    achievement_key,
  });
}

// Função para atualizar progresso do tópico e atribuir conquistas
export async function updateTopicProgress(topicId: string, type: "correct" | "incorrect", user_uuid: string) {
  const supabase = await getSupabaseClient();
  // Atualize o progresso normalmente (exemplo fictício)
  // ... sua lógica de progresso ...

  // 1. Medalha: Primeira revisão de flashcard
  await grantAchievement(user_uuid, "first_flashcard");

  // 2. Medalha: 100 flashcards revisados
  // (Exemplo: conte o total de revisões do usuário)
  const { count } = await supabase
    .from("user_flashcard_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_uuid", user_uuid);
  if ((count || 0) >= 100) {
    await grantAchievement(user_uuid, "100_flashcards");
  }

  // 3. Medalha: Todos os tópicos de Português completos
  // (Exemplo: verifique se todos os tópicos de subject_id = 1 têm progresso)
  const { data: ptTopics } = await supabase.from("topics").select("id").eq("subject_id", 1);
  const { data: ptProgress } = await supabase.from("user_flashcard_progress").select("topic_id").eq("user_uuid", user_uuid);
  if (ptTopics && ptProgress && ptTopics.every(t => ptProgress.some(p => p.topic_id === t.id))) {
    await grantAchievement(user_uuid, "all_topics_portugues");
  }

  // 4. Medalha: Todos os tópicos de Regulamentos completos
  const { data: regTopics } = await supabase.from("topics").select("id").eq("subject_id", 2);
  const { data: regProgress } = await supabase.from("user_flashcard_progress").select("topic_id").eq("user_uuid", user_uuid);
  if (regTopics && regProgress && regTopics.every(t => regProgress.some(p => p.topic_id === t.id))) {
    await grantAchievement(user_uuid, "all_topics_regulamentos");
  }

  revalidatePath("/");
  return { success: true };
}

// Função para obter flashcards para revisão
export async function getFlashcardsForReview(topicId: string, limit = 10) {
  try {
    const supabase = await getSupabaseClient()

    console.log("🔍 [DEBUG] Buscando flashcards para tópico:", topicId)
    console.log("🔍 [DEBUG] Limit:", limit)
    
    try {
      const { data, error } = await supabase
        .from("flashcards")
        .select("id, topic_id, question, answer")
        .eq("topic_id", topicId)
        .limit(limit)

      if (error) {
        console.error("❌ [DEBUG] Erro ao buscar flashcards:", error)
        console.error("❌ [DEBUG] Detalhes do erro:", error.message)
        throw error
      }

      if (data && data.length > 0) {
        console.log("✅ [DEBUG] Flashcards encontrados no Supabase:", data.length)
        console.log("✅ [DEBUG] Primeiro flashcard:", data[0])
        return data
      } else {
        console.log("⚠️ [DEBUG] Nenhum flashcard encontrado no Supabase, gerando dados mockados")
        throw new Error("Nenhum flashcard encontrado")
      }
    } catch (supabaseError) {
      console.log("⚠️ [DEBUG] Usando dados mockados como fallback")
      
      // Gerar flashcards mockados baseados no tópico
      const mockFlashcards = generateMockFlashcards(topicId, limit)
      
      console.log("✅ [DEBUG] Flashcards mockados gerados:", mockFlashcards.length)
      return mockFlashcards
    }
  } catch (error) {
    console.error("❌ [DEBUG] Erro inesperado ao buscar flashcards:", error)
    return []
  }
}

// Função auxiliar para gerar flashcards mockados
function generateMockFlashcards(topicId: string, limit: number = 10) {
  // Mapear tópicos para conjuntos específicos de flashcards
  const flashcardsByTopic: Record<string, Array<{id: number, topic_id: string, question: string, answer: string}>> = {
    'fonetica-fonologia': [
      { id: 1, topic_id: 'fonetica-fonologia', question: 'O que é um fonema?', answer: 'Menor unidade sonora da fala que distingue significados.' },
      { id: 2, topic_id: 'fonetica-fonologia', question: 'O que são vogais?', answer: 'Sons produzidos sem obstrução da passagem de ar pela boca.' },
      { id: 3, topic_id: 'fonetica-fonologia', question: 'O que são consoantes?', answer: 'Sons produzidos com obstrução parcial ou total da passagem de ar.' },
      { id: 4, topic_id: 'fonetica-fonologia', question: 'O que é um dígrafo?', answer: 'Conjunto de duas letras que representam um único fonema.' },
      { id: 5, topic_id: 'fonetica-fonologia', question: 'Cite exemplos de dígrafos consonantais.', answer: 'ch, lh, nh, rr, ss, qu, gu, sc, sç, xc.' }
    ],
    'ortografia': [
      { id: 3, topic_id: 'ortografia', question: "Qual a diferença entre 'mas' e 'mais'?", answer: "'Mas' é conjunção adversativa; 'mais' é advérbio de intensidade." },
      { id: 4, topic_id: 'ortografia', question: "Quando usar 'há' e quando usar 'a'?", answer: "'Há' indica tempo passado (verbo haver); 'a' é preposição ou artigo." },
      { id: 5, topic_id: 'ortografia', question: "Qual a regra para uso de 'ss' e 'ç'?", answer: "'SS' é usado entre vogais para som de /s/; 'ç' é usado antes de a, o, u." },
      { id: 6, topic_id: 'ortografia', question: "Quando usar 'porque', 'por que', 'porquê' e 'por quê'?", answer: "'Porque' é conjunção; 'por que' é preposição+pronome; 'porquê' é substantivo; 'por quê' é usado no fim de frases." },
      { id: 7, topic_id: 'ortografia', question: "Qual a diferença entre 'sessão', 'seção' e 'cessão'?", answer: "'Sessão' é reunião; 'seção' é divisão/departamento; 'cessão' é ato de ceder." }
    ]
  }
  
  // Se temos flashcards específicos para este tópico, retorná-los
  if (flashcardsByTopic[topicId]) {
    return flashcardsByTopic[topicId].slice(0, limit)
  }
  
  // Caso contrário, gerar flashcards genéricos
  const mockCards = []
  for (let i = 1; i <= limit; i++) {
    mockCards.push({
      id: i,
      topic_id: topicId,
      question: `Pergunta de exemplo ${i} para o tópico ${topicId}`,
      answer: `Resposta de exemplo ${i} para o tópico ${topicId}`
    })
  }
  
  return mockCards
}

// Função para obter todos os tópicos
export async function getAllTopics() {
  try {
    const supabase = await getSupabaseClient()

    console.log("🔍 [DEBUG] Buscando tópicos...")
    const { data, error } = await supabase.from("topics").select("id, name").order("name")

    if (error) {
      console.error("❌ [DEBUG] Erro ao buscar tópicos:", error)
      return []
    }

    console.log("✅ [DEBUG] Tópicos encontrados:", data?.length || 0)
    return data || []
  } catch (error) {
    console.error("❌ [DEBUG] Erro inesperado ao buscar tópicos:", error)
    return []
  }
}

// Função para obter progresso SM2 de um card
export async function getSm2ProgressForCard(flashcardId: number) {
  const supabase = await getSupabaseClient()
  // Implementação do SM2
  return null
}

// Função para atualizar progresso SM2
export async function updateSm2Progress(flashcardId: number, progress: any) {
  const supabase = await getSupabaseClient()
  // Implementação do SM2
  return { success: true }
}

// Função para salvar um card errado
export async function saveWrongCard(userUuid: string, flashcardId: number, topicId: string) {
  const supabase = await getSupabaseClient()

  const { error } = await supabase
    .from("wrong_cards")
    .upsert({
      user_uuid: userUuid,
      flashcard_id: flashcardId,
      topic_id: topicId,
      created_at: new Date().toISOString(),
      reviewed: false
    }, {
      onConflict: "user_uuid,flashcard_id"
    })

  if (error) {
    console.error("Erro ao salvar card errado:", error)
    return { success: false, error }
  }

  return { success: true }
}

// Função para buscar cards errados do usuário por tópico
export async function getWrongCardsByTopic(userUuid: string, topicId: string, page = 1, limit = 20) {
  const supabase = await getSupabaseClient()

  const offset = (page - 1) * limit

  const { data, error } = await supabase
    .from("wrong_cards")
    .select(`
      flashcard_id,
      flashcards:flashcard_id (
        id,
        topic_id,
        question,
        answer
      )
    `)
    .eq("user_uuid", userUuid)
    .eq("topic_id", topicId)
    .eq("reviewed", false)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Erro ao buscar cards errados:", error)
    return { success: false, error: error.message }
  }

  // Contar total de cards errados
  const { count, error: countError } = await supabase
    .from("wrong_cards")
    .select("*", { count: "exact", head: true })
    .eq("user_uuid", userUuid)
    .eq("topic_id", topicId)
    .eq("reviewed", false)

  if (countError) {
    console.error("Erro ao contar cards errados:", countError)
    return { success: false, error: countError.message }
  }

  // Transformar os dados para o formato esperado
  const flashcards = data?.map(item => item.flashcards).filter(Boolean) || []

  return {
    success: true,
    data: {
      flashcards,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }
}

// Função para marcar cards errados como revisados
export async function markWrongCardsAsReviewed(userUuid: string, flashcardIds: number[]) {
  const supabase = await getSupabaseClient()

  const { error } = await supabase
    .from("wrong_cards")
    .update({ reviewed: true, reviewed_at: new Date().toISOString() })
    .eq("user_uuid", userUuid)
    .in("flashcard_id", flashcardIds)

  if (error) {
    console.error("Erro ao marcar cards como revisados:", error)
    return { success: false, error }
  }

  return { success: true }
}

// Função para contar cards errados por tópico
export async function getWrongCardsCount(userUuid: string, topicId: string) {
  const supabase = await getSupabaseClient()

  const { count, error } = await supabase
    .from("wrong_cards")
    .select("*", { count: "exact", head: true })
    .eq("user_uuid", userUuid)
    .eq("topic_id", topicId)
    .eq("reviewed", false)

  if (error) {
    console.error("Erro ao contar cards errados:", error)
    return 0
  }

  return count || 0
}

// Função para limpar todos os cards errados de um usuário (opcional - para reset)
export async function clearAllWrongCards(userUuid: string) {
  const supabase = await getSupabaseClient()

  const { error } = await supabase
    .from("wrong_cards")
    .delete()
    .eq("user_uuid", userUuid)

  if (error) {
    console.error("Erro ao limpar cards errados:", error)
    return { success: false, error }
  }

  return { success: true }
}

// Função para obter quizzes por tópico
export async function getQuizzesByTopic(topicId: string) {
  try {
    const supabase = await getSupabaseClient()

    console.log(`🔍 [DEBUG] Buscando quizzes para tópico: ${topicId} (tipo: ${typeof topicId})`)

    try {
      // Tentar buscar com string primeiro
      let { data, error } = await supabase
        .from("quizzes")
        .select("id, topic_id, title, description")
        .eq("topic_id", topicId)
        .order("title")

      if (error) {
        console.error("❌ [ERROR] Erro ao buscar quizzes com string:", error)
        
        // Tentar com number se falhou com string
        const topicIdNum = parseInt(topicId)
        if (!isNaN(topicIdNum)) {
          console.log(`🔄 [DEBUG] Tentando com number: ${topicIdNum}`)
          
          const { data: dataNum, error: errorNum } = await supabase
            .from("quizzes")
            .select("id, topic_id, title, description")
            .eq("topic_id", topicIdNum)
            .order("title")
            
          if (errorNum) {
            console.error("❌ [ERROR] Erro ao buscar quizzes com number:", errorNum)
            throw errorNum
          }
          
          if (dataNum && dataNum.length > 0) {
            console.log(`✅ [DEBUG] Quizzes encontrados com number: ${dataNum.length}`)
            return dataNum
          }
        }
        
        throw error
      }

      if (data && data.length > 0) {
        console.log(`✅ [DEBUG] Quizzes encontrados: ${data.length}`)
        console.log(`📋 [DEBUG] Dados dos quizzes:`, data)
        return data
      } else {
        console.log("⚠️ [DEBUG] Nenhum quiz encontrado no Supabase, gerando dados mockados")
        throw new Error("Nenhum quiz encontrado")
      }
    } catch (supabaseError) {
      console.log("⚠️ [DEBUG] Usando dados mockados como fallback")
      
      // Gerar quizzes mockados baseados no tópico
      const mockQuizzes = generateMockQuizzes(topicId)
      
      console.log(`✅ [DEBUG] Quizzes mockados gerados: ${mockQuizzes.length}`)
      return mockQuizzes
    }
  } catch (error) {
    console.error("❌ [DEBUG] Erro inesperado ao buscar quizzes:", error)
    return []
  }
}

// Função auxiliar para gerar quizzes mockados
function generateMockQuizzes(topicId: string) {
  // Mapear tópicos para conjuntos específicos de quizzes
  const quizzesByTopic: Record<string, Array<{id: number, topic_id: string, title: string, description: string | null}>> = {
    'fonetica-fonologia': [
      { id: 1, topic_id: 'fonetica-fonologia', title: 'Quiz Básico de Fonética', description: 'Teste seus conhecimentos básicos em fonética e fonologia.' },
      { id: 2, topic_id: 'fonetica-fonologia', title: 'Quiz Avançado de Fonologia', description: 'Desafie-se com questões avançadas sobre fonologia.' }
    ],
    'ortografia': [
      { id: 3, topic_id: 'ortografia', title: 'Quiz de Regras Ortográficas', description: 'Teste seus conhecimentos sobre as regras ortográficas da língua portuguesa.' },
      { id: 4, topic_id: 'ortografia', title: 'Quiz de Reforma Ortográfica', description: 'Questões sobre as mudanças trazidas pela reforma ortográfica.' }
    ],
    'estatuto-militares': [
      { id: 5, topic_id: 'estatuto-militares', title: 'Quiz sobre Estatuto dos Militares', description: 'Teste seus conhecimentos sobre o Estatuto dos Militares.' },
      { id: 6, topic_id: 'estatuto-militares', title: 'Quiz sobre Direitos e Deveres', description: 'Questões sobre direitos e deveres dos militares conforme o Estatuto.' }
    ]
  }
  
  // Se temos quizzes específicos para este tópico, retorná-los
  if (quizzesByTopic[topicId]) {
    return quizzesByTopic[topicId]
  }
  
  // Caso contrário, gerar quizzes genéricos
  return [
    { id: 100, topic_id: topicId, title: `Quiz Básico - ${topicId}`, description: `Teste seus conhecimentos básicos sobre ${topicId}.` },
    { id: 101, topic_id: topicId, title: `Quiz Avançado - ${topicId}`, description: `Questões avançadas sobre ${topicId}.` }
  ]
}

// Função de debug para verificar dados na tabela
export async function debugQuizzesTable() {
  const supabase = await getSupabaseClient()

  console.log("🔍 [DEBUG] Verificando tabela de quizzes...")

  // Verificar se a tabela existe e tem dados
  const { data: allQuizzes, error: allQuizzesError } = await supabase
    .from("quizzes")
    .select("*")
    .limit(10)

  if (allQuizzesError) {
    console.error("❌ [ERROR] Erro ao buscar todos os quizzes:", allQuizzesError)
  } else {
    console.log(`📊 [DEBUG] Total de quizzes na tabela: ${allQuizzes?.length || 0}`)
    console.log(`📋 [DEBUG] Primeiros quizzes:`, allQuizzes)
  }

  // Verificar topics também
  const { data: allTopics, error: topicsError } = await supabase
    .from("topics")
    .select("*")
    .limit(10)

  if (topicsError) {
    console.error("❌ [ERROR] Erro ao buscar topics:", topicsError)
  } else {
    console.log(`📊 [DEBUG] Total de topics na tabela: ${allTopics?.length || 0}`)
    console.log(`📋 [DEBUG] Primeiros topics:`, allTopics)
  }

  return { quizzes: allQuizzes || [], topics: allTopics || [] }
}

// Função de teste simples para quizzes
export async function testQuizzesConnection() {
  try {
    const supabase = await getSupabaseClient()
    console.log("🧪 [TEST] Testando conexão com tabela quizzes...")
    
    const { data, error, count } = await supabase
      .from("quizzes")
      .select("*", { count: "exact" })
    
    console.log("🧪 [TEST] Resultado do teste:")
    console.log("  - Error:", error)
    console.log("  - Count:", count) 
    console.log("  - Data length:", data?.length)
    console.log("  - First item:", data?.[0])
    
    return { data, error, count }
  } catch (err) {
    console.error("🧪 [TEST ERROR]:", err)
    return { data: null, error: err, count: 0 }
  }
}

// Função para criar quizzes de exemplo se a tabela estiver vazia
export async function createSampleQuizzes() {
  try {
    const supabase = await getSupabaseClient()
    console.log("🌱 [SEED] Verificando se precisamos criar quizzes de exemplo...")
    
    // Verificar se já existem quizzes
    const { data: existingQuizzes, error: checkError } = await supabase
      .from("quizzes")
      .select("id")
      .limit(1)
    
    if (checkError) {
      console.error("🌱 [SEED ERROR] Erro ao verificar quizzes existentes:", checkError)
      return { success: false, error: checkError }
    }
    
    if (existingQuizzes && existingQuizzes.length > 0) {
      console.log("🌱 [SEED] Já existem quizzes, não precisa criar exemplos")
      return { success: true, message: "Quizzes já existem" }
    }
    
    // Verificar se existem tópicos primeiro
    const { data: topics, error: topicsError } = await supabase
      .from("topics")
      .select("id")
      .limit(5)
    
    if (topicsError || !topics || topics.length === 0) {
      console.log("🌱 [SEED] Não há tópicos disponíveis para criar quizzes")
      return { success: false, error: "Sem tópicos disponíveis" }
    }
    
    // Criar quizzes de exemplo
    const sampleQuizzes = [
      {
        topic_id: topics[0].id,
        title: "Quiz Básico de Português",
        description: "Teste seus conhecimentos básicos em português"
      },
      {
        topic_id: topics[0].id,
        title: "Quiz Avançado de Gramática",
        description: "Desafie-se com questões avançadas de gramática"
      }
    ]
    
    for (const quiz of sampleQuizzes) {
      const { error: insertError } = await supabase
        .from("quizzes")
        .insert(quiz)
      
      if (insertError) {
        console.error("🌱 [SEED ERROR] Erro ao inserir quiz:", insertError)
      } else {
        console.log("🌱 [SEED] Quiz criado:", quiz.title)
      }
    }
    
    return { success: true, message: "Quizzes de exemplo criados" }
  } catch (err) {
    console.error("🌱 [SEED ERROR]:", err)
    return { success: false, error: err }
  }
}

// Função para investigar o problema específico dos quizzes
export async function investigateQuizIssue() {
  try {
    const supabase = await getSupabaseClient()
    console.log("🔍 [INVESTIGATE] Investigando problema dos quizzes...")
    
    // 1. Verificar tabela quizzes
    const { data: allQuizzes, error: quizzesError } = await supabase
      .from("quizzes")
      .select("*")
    
    console.log("📊 [INVESTIGATE] Tabela quizzes:")
    console.log("  - Error:", quizzesError)
    console.log("  - Count:", allQuizzes?.length || 0)
    console.log("  - Data:", allQuizzes)
    
    // 2. Verificar tabela topics
    const { data: allTopics, error: topicsError } = await supabase
      .from("topics")
      .select("*")
      .limit(5)
    
    console.log("📊 [INVESTIGATE] Tabela topics:")
    console.log("  - Error:", topicsError)
    console.log("  - Count:", allTopics?.length || 0)
    console.log("  - Data:", allTopics)
    
    // 3. Verificar quiz_questions
    const { data: allQuestions, error: questionsError } = await supabase
      .from("quiz_questions")
      .select("*, quizzes(*)")
      .limit(10)
    
    console.log("📊 [INVESTIGATE] Tabela quiz_questions:")
    console.log("  - Error:", questionsError)
    console.log("  - Count:", allQuestions?.length || 0)
    console.log("  - Sample data:", allQuestions?.slice(0, 3))
    
    // 4. Se não há quizzes mas há questões, criar quizzes para as questões órfãs
    if ((!allQuizzes || allQuizzes.length === 0) && allQuestions && allQuestions.length > 0) {
      console.log("🚨 [INVESTIGATE] PROBLEMA ENCONTRADO: Há questões sem quizzes!")
      
      // Agrupar questões por quiz_id
      const quizIds = [...new Set(allQuestions.map(q => q.quiz_id))]
      console.log("🔧 [INVESTIGATE] Quiz IDs encontrados nas questões:", quizIds)
      
      // Verificar se existem quizzes para esses IDs
      const { data: existingQuizzes } = await supabase
        .from("quizzes")
        .select("id")
        .in("id", quizIds)
      
      console.log("🔧 [INVESTIGATE] Quizzes existentes para esses IDs:", existingQuizzes)
      
      // Criar quizzes que estão faltando
      if (allTopics && allTopics.length > 0) {
        const missingQuizIds = quizIds.filter(id => !existingQuizzes?.some(eq => eq.id === id))
        console.log("🔧 [INVESTIGATE] Quiz IDs faltando:", missingQuizIds)
        
        for (const missingId of missingQuizIds) {
          const questionsForQuiz = allQuestions.filter(q => q.quiz_id === missingId)
          
          if (questionsForQuiz.length > 0) {
            const quizToCreate = {
              id: missingId,
              topic_id: allTopics[0].id, // Usar primeiro tópico disponível
              title: `Quiz ${missingId}`,
              description: `Quiz gerado automaticamente com ${questionsForQuiz.length} questões`
            }
            
            console.log("🔧 [INVESTIGATE] Criando quiz:", quizToCreate)
            
            const { error: insertError } = await supabase
              .from("quizzes")
              .insert(quizToCreate)
            
            if (insertError) {
              console.error("❌ [INVESTIGATE] Erro ao criar quiz:", insertError)
            } else {
              console.log("✅ [INVESTIGATE] Quiz criado com sucesso:", missingId)
            }
          }
        }
      }
    }
    
    // 5. Fazer uma busca de teste final
    if (allTopics && allTopics.length > 0) {
      console.log("🧪 [INVESTIGATE] Testando busca com primeiro tópico:", allTopics[0].id)
      
      const { data: testQuizzes, error: testError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("topic_id", allTopics[0].id)
      
      console.log("🧪 [INVESTIGATE] Resultado do teste:")
      console.log("  - Error:", testError)
      console.log("  - Quizzes encontrados:", testQuizzes?.length || 0)
      console.log("  - Data:", testQuizzes)
    }
    
    return {
      quizzes: allQuizzes || [],
      topics: allTopics || [],
      questions: allQuestions || []
    }
  } catch (err) {
    console.error("❌ [INVESTIGATE] Erro geral:", err)
    return { quizzes: [], topics: [], questions: [] }
  }
}

// Função para obter questões do quiz
export async function getQuizQuestions(quizId: number) {
  try {
    const supabase = await getSupabaseClient()
    
    console.log(`🔍 [DEBUG] Buscando questões para quiz: ${quizId}`)

    try {
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("id, quiz_id, question_text, options, correct_answer, explanation")
        .eq("quiz_id", quizId)
        .order("id")

      if (error) {
        console.error("❌ [DEBUG] Erro ao buscar questões:", error)
        throw error
      }

      if (data && data.length > 0) {
        console.log(`✅ [DEBUG] Questões encontradas no Supabase: ${data.length}`)
        return data
      } else {
        console.log("⚠️ [DEBUG] Nenhuma questão encontrada no Supabase, gerando dados mockados")
        throw new Error("Nenhuma questão encontrada")
      }
    } catch (supabaseError) {
      console.log("⚠️ [DEBUG] Usando dados mockados como fallback")
      
      // Gerar questões mockadas para o quiz
      const mockQuestions = generateMockQuizQuestions(quizId)
      
      console.log(`✅ [DEBUG] Questões mockadas geradas: ${mockQuestions.length}`)
      return mockQuestions
    }
  } catch (error) {
    console.error("❌ [DEBUG] Erro inesperado ao buscar questões do quiz:", error)
    return []
  }
}

// Função auxiliar para gerar questões de quiz mockadas
function generateMockQuizQuestions(quizId: number) {
  // Questões mockadas para diferentes quizzes
  const questionsByQuiz: Record<number, Array<{
    id: number, 
    quiz_id: number, 
    question_text: string, 
    options: string[], 
    correct_answer: string,
    explanation: string | null
  }>> = {
    1: [ // Quiz Básico de Fonética
      {
        id: 1,
        quiz_id: 1,
        question_text: "O que é um fonema?",
        options: [
          "Menor unidade sonora da fala que distingue significados",
          "Letra do alfabeto",
          "Sinal de pontuação",
          "Conjunto de letras que formam uma palavra"
        ],
        correct_answer: "Menor unidade sonora da fala que distingue significados",
        explanation: "O fonema é a menor unidade sonora que pode diferenciar significados entre palavras."
      },
      {
        id: 2,
        quiz_id: 1,
        question_text: "Quantas vogais orais existem na língua portuguesa?",
        options: ["5", "7", "12", "26"],
        correct_answer: "7",
        explanation: "Na língua portuguesa, temos 7 vogais orais: a, e (aberto), e (fechado), i, o (aberto), o (fechado), u."
      },
      {
        id: 3,
        quiz_id: 1,
        question_text: "O que é um dígrafo?",
        options: [
          "Uma palavra com duas sílabas",
          "Conjunto de duas letras que representam um único fonema",
          "Um encontro consonantal",
          "Uma palavra com dois significados"
        ],
        correct_answer: "Conjunto de duas letras que representam um único fonema",
        explanation: "Dígrafo é quando duas letras representam apenas um som, como em 'chave', 'ninho', 'carro'."
      }
    ],
    3: [ // Quiz de Regras Ortográficas
      {
        id: 4,
        quiz_id: 3,
        question_text: "Quando devemos usar 'ç'?",
        options: [
          "Antes de 'e' e 'i'",
          "Antes de 'a', 'o' e 'u'",
          "No início das palavras",
          "Em qualquer posição da palavra"
        ],
        correct_answer: "Antes de 'a', 'o' e 'u'",
        explanation: "A letra 'ç' só é usada antes das vogais 'a', 'o' e 'u', como em 'caça', 'moço' e 'açúcar'."
      },
      {
        id: 5,
        quiz_id: 3,
        question_text: "Qual alternativa apresenta o uso correto do hífen?",
        options: [
          "Anti-inflamatório",
          "Autoestima",
          "Semi-árido",
          "Contraataque"
        ],
        correct_answer: "Anti-inflamatório",
        explanation: "Usa-se hífen quando o prefixo termina com a mesma vogal que inicia o segundo elemento, exceto com o prefixo 'co-'."
      }
    ]
  }
  
  // Se temos questões específicas para este quiz, retorná-las
  if (questionsByQuiz[quizId]) {
    return questionsByQuiz[quizId]
  }
  
  // Caso contrário, gerar questões genéricas
  const mockQuestions = []
  for (let i = 1; i <= 5; i++) {
    mockQuestions.push({
      id: 1000 + i,
      quiz_id: quizId,
      question_text: `Pergunta de exemplo ${i} para o quiz ${quizId}?`,
      options: [
        `Opção A - Resposta correta ${i}`,
        `Opção B - Alternativa ${i}`,
        `Opção C - Alternativa ${i}`,
        `Opção D - Alternativa ${i}`
      ],
      correct_answer: `Opção A - Resposta correta ${i}`,
      explanation: `Explicação para a pergunta de exemplo ${i}`
    })
  }
  
  return mockQuestions
}

// Função para submeter resultado do quiz e atribuir conquistas
export async function submitQuizResult(
  quizId: number,
  score: number,
  correct: number,
  incorrect: number,
  total: number,
  user_uuid: string
) {
  const supabase = await getSupabaseClient();
  // ... sua lógica de submissão ...

  // Medalha: Quiz perfeito (100% de acerto)
  if (correct === total && total > 0) {
    await grantAchievement(user_uuid, "perfect_quiz");
  }

  revalidatePath("/");
  return { success: true };
}

// Função para obter redações do usuário
export async function getRedacoesUsuario() {
  const supabase = await getSupabaseClient()
  // Implementação das redações
  return []
}

// Função para obter templates de redação
export async function getTemplatesRedacao() {
  const supabase = await getSupabaseClient()
  // Implementação dos templates
  return []
}

// Função para obter temas de redação
export async function getTemasRedacao() {
  const supabase = await getSupabaseClient()
  // Implementação dos temas
  return []
}

// Função para obter notificações do usuário
export async function getNotificacoesUsuario() {
  const supabase = await getSupabaseClient()
  // Implementação das notificações
  return []
}

// Funções específicas para professores
export async function getRedacoesProfessor() {
  const supabase = await getSupabaseClient()

  // Dados simulados para demonstração
  return [
    {
      id: 1,
      titulo: "Redação sobre Meio Ambiente",
      tema: "Sustentabilidade no Brasil",
      status: "pendente",
      aluno_nome: "João Silva",
      turma_nome: "3º Ano A",
      data_envio: "2024-01-15T10:30:00Z",
      urgente: true,
    },
    {
      id: 2,
      titulo: "Redação sobre Tecnologia",
      tema: "Impactos da IA na Sociedade",
      status: "corrigida",
      aluno_nome: "Maria Santos",
      turma_nome: "3º Ano B",
      data_envio: "2024-01-14T14:20:00Z",
      nota_ia: 850,
      correcao_ia: "Redação bem estruturada com argumentos sólidos...",
      urgente: false,
    },
  ]
}

export async function getTurmasProfessor() {
  const supabase = await getSupabaseClient()

  // Dados simulados para demonstração
  return [
    {
      id: "turma-1",
      nome: "3º Ano A",
      codigo_acesso: "3A2024",
      total_alunos: 28,
      redacoes_pendentes: 5,
      periodo: "Matutino",
    },
    {
      id: "turma-2",
      nome: "3º Ano B",
      codigo_acesso: "3B2024",
      total_alunos: 25,
      redacoes_pendentes: 2,
      periodo: "Vespertino",
    },
  ]
}

export async function getEstatisticasProfessor() {
  const supabase = await getSupabaseClient()

  // Dados simulados para demonstração
  return {
    total_redacoes: 45,
    pendentes: 7,
    corrigidas_hoje: 3,
    media_tempo_correcao: 15,
    total_alunos: 53,
  }
}

// Função para correção com IA
export async function corrigirRedacaoIA(redacaoId: number) {
  const supabase = await getSupabaseClient()

  // Simulação de correção com IA
  const correcaoSimulada = {
    nota: Math.floor(Math.random() * 400) + 600, // Nota entre 600-1000
    feedback:
      "Redação bem estruturada com bons argumentos. Sugestões: melhorar conectivos e revisar concordância verbal.",
  }

  // Em produção, aqui você salvaria no banco
  console.log("Correção IA simulada para redação", redacaoId, correcaoSimulada)

  revalidatePath("/teacher")
  return { success: true, correcao: correcaoSimulada }
}

// Função para obter todas as matérias
export async function getAllSubjects() {
  console.log("🔍 [Server Action] getAllSubjects() iniciada")
  try {
    const supabase = await getSupabaseClient()
    console.log("🔍 [Server Action] Cliente Supabase criado")
    
    try {
      // Tentar buscar do Supabase primeiro
      const { data, error } = await supabase.from("subjects").select("id, name").order("name")
      
      console.log("🔍 [Server Action] Query executada")
      console.log("🔍 [Server Action] Data:", data)
      console.log("🔍 [Server Action] Error:", error)
      
      if (error) {
        throw error
      }
      
      if (data && data.length > 0) {
        console.log("✅ [Server Action] Matérias encontradas no Supabase:", data.length)
        return data
      } else {
        throw new Error("Nenhuma matéria encontrada no Supabase")
      }
    } catch (supabaseError) {
      console.error("⚠️ [Server Action] Erro ou nenhum dado no Supabase:", supabaseError)
      console.log("⚠️ [Server Action] Usando dados hardcoded como fallback")
      
      // Fallback para dados hardcoded
      const hardcodedSubjects = [
        { id: 1, name: "Português" },
        { id: 2, name: "Regulamentos" },
        { id: 3, name: "Direito Aeronáutico" }
      ]
      
      console.log("✅ [Server Action] Retornando matérias hardcoded:", hardcodedSubjects.length)
      return hardcodedSubjects
    }
  } catch (error) {
    console.error("❌ [Server Action] Erro inesperado em getAllSubjects:", error)
    return []
  }
}

// Função para obter tópicos por matéria
export async function getTopicsBySubject(subjectId: number) {
  try {
    console.log("🔍 [DEBUG] getTopicsBySubject - subjectId:", subjectId)
    
    // Dados hardcoded para fallback
    const hardcodedTopics = {
      1: [ // Português
        { id: "fonetica-fonologia", name: "Fonética e Fonologia", subject_id: 1 },
        { id: "ortografia", name: "Ortografia", subject_id: 1 },
        { id: "acentuacao-grafica", name: "Acentuação Gráfica", subject_id: 1 },
        { id: "morfologia-classes", name: "Morfologia: Classes de Palavras", subject_id: 1 },
        { id: "morfologia-flexao", name: "Morfologia: Flexão", subject_id: 1 },
        { id: "concordancia", name: "Concordância Verbal e Nominal", subject_id: 1 },
        { id: "regencia", name: "Regência Verbal e Nominal", subject_id: 1 },
        { id: "crase", name: "Crase", subject_id: 1 },
        { id: "semantica-estilistica", name: "Semântica e Estilística", subject_id: 1 },
        { id: "colocacao-pronominal", name: "Colocação Pronominal", subject_id: 1 }
      ],
      2: [ // Regulamentos
        { id: "estatuto-militares", name: "Estatuto dos Militares", subject_id: 2 },
        { id: "rdaer", name: "RDAER", subject_id: 2 },
        { id: "regulamentos-comuns", name: "Regulamentos Comuns", subject_id: 2 },
        { id: "ica-111-1", name: "ICA 111-1", subject_id: 2 },
        { id: "ica-111-2", name: "ICA 111-2", subject_id: 2 },
        { id: "ica-111-3", name: "ICA 111-3", subject_id: 2 },
        { id: "ica-111-6", name: "ICA 111-6", subject_id: 2 },
        { id: "portaria-gm-md-1143-2022", name: "Portaria GM-MD Nº 1.143/2022", subject_id: 2 },
        { id: "rca-34-1", name: "RCA 34-1", subject_id: 2 },
        { id: "lei-13954-2019", name: "Lei 13.954/2019", subject_id: 2 }
      ],
      3: [ // Direito Aeronáutico
        { id: "codigo-aeronautica", name: "Código Brasileiro de Aeronáutica", subject_id: 3 },
        { id: "convencoes-internacionais", name: "Convenções Internacionais", subject_id: 3 },
        { id: "seguranca-voo", name: "Segurança de Voo", subject_id: 3 },
        { id: "legislacao-complementar", name: "Legislação Complementar", subject_id: 3 }
      ]
    };
    
    try {
      const supabase = await getSupabaseClient()
      
      // Primeiro, tentar buscar com subject_id
      let { data, error } = await supabase
        .from("topics")
        .select("id, name, subject_id")
        .eq("subject_id", subjectId)
        .order("name")
      
      if (error) {
        console.log("⚠️ [DEBUG] Erro ao buscar com subject_id:", error.message)
        throw error
      }
      
      if (data && data.length > 0) {
        console.log("✅ [DEBUG] Tópicos encontrados no Supabase:", data.length)
        return data
      } else {
        console.log("⚠️ [DEBUG] Nenhum tópico encontrado no Supabase, usando fallback")
        throw new Error("Nenhum tópico encontrado")
      }
    } catch (supabaseError) {
      console.log("⚠️ [DEBUG] Usando dados hardcoded como fallback")
      console.log("✅ [DEBUG] Retornando tópicos hardcoded para subjectId:", subjectId)
      return hardcodedTopics[subjectId as keyof typeof hardcodedTopics] || []
    }
  } catch (error) {
    console.error("❌ [DEBUG] Erro inesperado ao buscar tópicos por matéria:", error)
    return []
  }
}

// ==================== FUNÇÕES CRUD PARA FLASHCARDS (PROFESSORES/ADMINS) ====================

// Função para verificar se o usuário é professor ou admin
export async function checkTeacherOrAdminAccess(userUuid: string): Promise<boolean> {
  try {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_uuid", userUuid)
      .single()

    if (error) {
      console.error("Erro ao verificar role:", error)
      return false
    }

    return data?.role === "teacher" || data?.role === "admin"
  } catch (error) {
    console.error("Erro ao verificar acesso:", error)
    return false
  }
}

// Função para criar um novo flashcard (apenas professores/admins)
export async function createFlashcard(userUuid: string, topicId: string, question: string, answer: string) {
  const supabase = await getSupabaseClient()

  // Verificar permissões
  const hasAccess = await checkTeacherOrAdminAccess(userUuid)
  if (!hasAccess) {
    return { success: false, error: "Acesso negado. Apenas professores e administradores podem criar flashcards." }
  }

  const { data, error } = await supabase
    .from("flashcards")
    .insert({
      topic_id: topicId,
      question: question.trim(),
      answer: answer.trim()
    })
    .select()
    .single()

  if (error) {
    console.error("Erro ao criar flashcard:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/flashcards")
  return { success: true, data }
}

// Função para atualizar um flashcard (apenas professores/admins)
export async function updateFlashcard(userUuid: string, flashcardId: number, question: string, answer: string) {
  const supabase = await getSupabaseClient()

  // Verificar permissões
  const hasAccess = await checkTeacherOrAdminAccess(userUuid)
  if (!hasAccess) {
    return { success: false, error: "Acesso negado. Apenas professores e administradores podem editar flashcards." }
  }

  const { data, error } = await supabase
    .from("flashcards")
    .update({
      question: question.trim(),
      answer: answer.trim()
    })
    .eq("id", flashcardId)
    .select()
    .single()

  if (error) {
    console.error("Erro ao atualizar flashcard:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/flashcards")
  return { success: true, data }
}

// Função para deletar um flashcard (apenas professores/admins)
export async function deleteFlashcard(userUuid: string, flashcardId: number) {
  const supabase = await getSupabaseClient()

  // Verificar permissões
  const hasAccess = await checkTeacherOrAdminAccess(userUuid)
  if (!hasAccess) {
    return { success: false, error: "Acesso negado. Apenas professores e administradores podem deletar flashcards." }
  }

  const { error } = await supabase
    .from("flashcards")
    .delete()
    .eq("id", flashcardId)

  if (error) {
    console.error("Erro ao deletar flashcard:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/flashcards")
  return { success: true }
}

// Função para obter todos os flashcards de um tópico com paginação (para administração)
export async function getAllFlashcardsByTopic(userUuid: string, topicId: string, page = 1, limit = 20) {
  const supabase = await getSupabaseClient()

  console.log("🔍 [DEBUG] getAllFlashcardsByTopic - userUuid:", userUuid)
  console.log("🔍 [DEBUG] getAllFlashcardsByTopic - topicId:", topicId)

  // Verificar permissões
  const hasAccess = await checkTeacherOrAdminAccess(userUuid)
  console.log("🔍 [DEBUG] hasAccess:", hasAccess)
  
  if (!hasAccess) {
    console.log("❌ [DEBUG] Acesso negado para getAllFlashcardsByTopic")
    return { success: false, error: "Acesso negado. Apenas professores e administradores podem ver todos os flashcards." }
  }

  const offset = (page - 1) * limit

  // Buscar flashcards com paginação
  const { data: flashcards, error: flashcardsError } = await supabase
    .from("flashcards")
    .select("id, topic_id, question, answer")
    .eq("topic_id", topicId)
    .order("id", { ascending: false })
    .range(offset, offset + limit - 1)

  if (flashcardsError) {
    console.error("❌ [DEBUG] Erro ao buscar flashcards:", flashcardsError)
    return { success: false, error: flashcardsError.message }
  }

  console.log("✅ [DEBUG] Flashcards encontrados:", flashcards?.length || 0)

  // Contar total de flashcards
  const { count, error: countError } = await supabase
    .from("flashcards")
    .select("*", { count: "exact", head: true })
    .eq("topic_id", topicId)

  if (countError) {
    console.error("❌ [DEBUG] Erro ao contar flashcards:", countError)
    return { success: false, error: countError.message }
  }

  console.log("✅ [DEBUG] Total de flashcards no tópico:", count)

  return {
    success: true,
    data: {
      flashcards: flashcards || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }
}

// Função para buscar um flashcard específico por ID (para edição)
export async function getFlashcardById(userUuid: string, flashcardId: number) {
  const supabase = await getSupabaseClient()

  // Verificar permissões
  const hasAccess = await checkTeacherOrAdminAccess(userUuid)
  if (!hasAccess) {
    return { success: false, error: "Acesso negado." }
  }

  const { data, error } = await supabase
    .from("flashcards")
    .select("id, topic_id, question, answer")
    .eq("id", flashcardId)
    .single()

  if (error) {
    console.error("Erro ao buscar flashcard:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

// CRUD para Quizzes
export async function createQuiz(userUuid: string, topicId: string, title: string, description?: string) {
  const supabase = await getSupabaseClient()
  
  try {
    // Verificar se é professor ou admin
    const hasAccess = await checkTeacherOrAdminAccess(userUuid)
    if (!hasAccess) {
      throw new Error("Acesso negado. Apenas professores e administradores podem criar quizzes.")
    }

    const { data, error } = await supabase
      .from('quizzes')
      .insert({
        topic_id: topicId,
        title: title.trim(),
        description: description?.trim() || null
      })
      .select('*')
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao criar quiz:', error)
    throw error
  }
}

export async function updateQuiz(userUuid: string, quizId: number, title: string, description?: string) {
  const supabase = await getSupabaseClient()
  
  try {
    // Verificar se é professor ou admin
    const hasAccess = await checkTeacherOrAdminAccess(userUuid)
    if (!hasAccess) {
      throw new Error("Acesso negado. Apenas professores e administradores podem editar quizzes.")
    }

    const { data, error } = await supabase
      .from('quizzes')
      .update({
        title: title.trim(),
        description: description?.trim() || null
      })
      .eq('id', quizId)
      .select('*')
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao atualizar quiz:', error)
    throw error
  }
}

export async function deleteQuiz(userUuid: string, quizId: number) {
  const supabase = await getSupabaseClient()
  
  try {
    // Verificar se é professor ou admin
    const hasAccess = await checkTeacherOrAdminAccess(userUuid)
    if (!hasAccess) {
      throw new Error("Acesso negado. Apenas professores e administradores podem excluir quizzes.")
    }

    // Primeiro excluir todas as questões do quiz
    await supabase
      .from('quiz_questions')
      .delete()
      .eq('quiz_id', quizId)

    // Depois excluir o quiz
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Erro ao excluir quiz:', error)
    throw error
  }
}

export async function getAllQuizzesByTopic(userUuid: string, topicId: string, page: number = 1, limit: number = 10) {
  const supabase = await getSupabaseClient()
  
  console.log("🔍 [DEBUG] getAllQuizzesByTopic - userUuid:", userUuid)
  console.log("🔍 [DEBUG] getAllQuizzesByTopic - topicId:", topicId)
  
  try {
    // Verificar se é professor ou admin
    const hasAccess = await checkTeacherOrAdminAccess(userUuid)
    console.log("🔍 [DEBUG] hasAccess para quizzes:", hasAccess)
    
    if (!hasAccess) {
      console.log("❌ [DEBUG] Acesso negado para getAllQuizzesByTopic")
      throw new Error("Acesso negado. Apenas professores e administradores podem acessar esta função.")
    }

    const offset = (page - 1) * limit

    // Buscar quizzes com paginação
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('topic_id', topicId)
      .order('id', { ascending: false })
      .range(offset, offset + limit - 1)

    if (quizzesError) {
      console.error("❌ [DEBUG] Erro ao buscar quizzes:", quizzesError)
      throw quizzesError
    }

    console.log("✅ [DEBUG] Quizzes encontrados:", quizzes?.length || 0)

    // Buscar total de quizzes
    const { count, error: countError } = await supabase
      .from('quizzes')
      .select('*', { count: 'exact', head: true })
      .eq('topic_id', topicId)

    if (countError) {
      console.error("❌ [DEBUG] Erro ao contar quizzes:", countError)
      throw countError
    }

    console.log("✅ [DEBUG] Total de quizzes no tópico:", count)

    return {
      quizzes: quizzes || [],
      total: count || 0
    }
  } catch (error) {
    console.error('❌ [DEBUG] Erro ao buscar quizzes do admin:', error)
    throw error
  }
}

// CRUD para Questões de Quiz
export async function createQuizQuestion(
  userUuid: string,
  quizId: number, 
  questionText: string, 
  options: string[], 
  correctAnswer: string, 
  explanation?: string
) {
  const supabase = await getSupabaseClient()
  
  try {
    // Verificar se é professor ou admin
    const hasAccess = await checkTeacherOrAdminAccess(userUuid)
    if (!hasAccess) {
      throw new Error("Acesso negado. Apenas professores e administradores podem criar questões.")
    }

    const { data, error } = await supabase
      .from('quiz_questions')
      .insert({
        quiz_id: quizId,
        question_text: questionText.trim(),
        options: options.filter(opt => opt.trim()),
        correct_answer: correctAnswer.trim(),
        explanation: explanation?.trim() || null
      })
      .select('*')
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao criar questão:', error)
    throw error
  }
}

export async function updateQuizQuestion(
  userUuid: string,
  questionId: number,
  questionText: string, 
  options: string[], 
  correctAnswer: string, 
  explanation?: string
) {
  const supabase = await getSupabaseClient()
  
  try {
    // Verificar se é professor ou admin
    const hasAccess = await checkTeacherOrAdminAccess(userUuid)
    if (!hasAccess) {
      throw new Error("Acesso negado. Apenas professores e administradores podem editar questões.")
    }

    const { data, error } = await supabase
      .from('quiz_questions')
      .update({
        question_text: questionText.trim(),
        options: options.filter(opt => opt.trim()),
        correct_answer: correctAnswer.trim(),
        explanation: explanation?.trim() || null
      })
      .eq('id', questionId)
      .select('*')
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao atualizar questão:', error)
    throw error
  }
}

export async function deleteQuizQuestion(userUuid: string, questionId: number) {
  const supabase = await getSupabaseClient()
  
  try {
    // Verificar se é professor ou admin
    const hasAccess = await checkTeacherOrAdminAccess(userUuid)
    if (!hasAccess) {
      throw new Error("Acesso negado. Apenas professores e administradores podem excluir questões.")
    }

    const { error } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('id', questionId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Erro ao excluir questão:', error)
    throw error
  }
}

export async function getAllQuestionsByQuiz(userUuid: string, quizId: number) {
  const supabase = await getSupabaseClient()
  
  console.log("🔍 [DEBUG] getAllQuestionsByQuiz - userUuid:", userUuid)
  console.log("🔍 [DEBUG] getAllQuestionsByQuiz - quizId:", quizId)
  
  try {
    // Verificar se é professor ou admin
    const hasAccess = await checkTeacherOrAdminAccess(userUuid)
    console.log("🔍 [DEBUG] hasAccess para questões:", hasAccess)
    
    if (!hasAccess) {
      console.log("❌ [DEBUG] Acesso negado para getAllQuestionsByQuiz")
      throw new Error("Acesso negado. Apenas professores e administradores podem acessar esta função.")
    }

    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('id', { ascending: true })

    if (error) {
      console.error("❌ [DEBUG] Erro ao buscar questões:", error)
      throw error
    }

    console.log("✅ [DEBUG] Questões encontradas:", data?.length || 0)
    return data || []
  } catch (error) {
    console.error('❌ [DEBUG] Erro ao buscar questões do quiz:', error)
    throw error
  }
}

// ====================
// CALENDAR EVENTS CRUD
// ====================

export interface CalendarEvent {
  id?: string
  title: string
  description?: string
  event_type: 'live' | 'simulado' | 'prova' | 'redacao' | 'aula'
  event_date: string // YYYY-MM-DD format
  event_time?: string // HH:MM format
  duration_minutes?: number
  instructor?: string
  location?: string
  is_mandatory?: boolean
  max_participants?: number
  registration_required?: boolean
  event_url?: string
  created_by?: string
  created_at?: string
  updated_at?: string
  updated_by?: string
}

// Função para verificar se usuário é professor ou admin para calendário
export async function checkCalendarAccess(userUuid: string) {
  try {
    const supabase = await getSupabaseClient()
    
    console.log('Verificando acesso ao calendário para usuário:', userUuid)
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_uuid', userUuid)
      .single()

    if (error) {
      console.error('Erro ao verificar role do usuário:', error)
      // Verificar se a tabela user_roles existe
      const { data: tables, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'user_roles')
      
      if (tableError || !tables || tables.length === 0) {
        throw new Error('Tabela user_roles não existe. Execute os scripts de configuração do banco.')
      }
      
      throw new Error('Erro ao verificar permissões: ' + error.message)
    }

    console.log('Role do usuário:', data?.role)
    return data?.role === 'teacher' || data?.role === 'admin'
  } catch (error) {
    console.error('Erro ao verificar acesso ao calendário:', error)
    throw error
  }
}

// Buscar todos os eventos do calendário
export async function getAllCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    const supabase = await getSupabaseClient()

    console.log('Buscando todos os eventos do calendário...')

    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('event_date', { ascending: true })

    if (error) {
      console.error('Erro SQL ao buscar eventos:', error)
      // Verificar se a tabela existe
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        throw new Error('Tabela calendar_events não existe. Execute o script: scripts/063_fix_calendar_events_table.sql')
      }
      throw new Error('Erro ao buscar eventos: ' + error.message)
    }

    console.log('Eventos encontrados:', data?.length || 0)
    return data || []
  } catch (error) {
    console.error('Erro ao buscar eventos do calendário:', error)
    throw error
  }
}

// Buscar eventos por mês
export async function getCalendarEventsByMonth(year: number, month: number): Promise<CalendarEvent[]> {
  try {
    const supabase = await getSupabaseClient()
    
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`

    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .gte('event_date', startDate)
      .lte('event_date', endDate)
      .order('event_date', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar eventos por mês:', error)
    throw error
  }
}

// Buscar evento por ID
export async function getCalendarEventById(eventId: string): Promise<CalendarEvent | null> {
  try {
    const supabase = await getSupabaseClient()

    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao buscar evento por ID:', error)
    throw error
  }
}

// Criar novo evento do calendário
export async function createCalendarEvent(userUuid: string, eventData: CalendarEvent): Promise<CalendarEvent> {
  try {
    console.log('Criando evento do calendário para usuário:', userUuid)
    console.log('Dados do evento:', eventData)
    
    // Verificar acesso
    const hasAccess = await checkCalendarAccess(userUuid)
    if (!hasAccess) {
      throw new Error('Acesso negado. Apenas professores e administradores podem criar eventos.')
    }

    const supabase = await getSupabaseClient()

    const { data, error } = await supabase
      .from('calendar_events')
      .insert([{
        ...eventData,
        created_by: userUuid,
        updated_by: userUuid
      }])
      .select()
      .single()

    if (error) {
      console.error('Erro SQL ao criar evento:', error)
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        throw new Error('Tabela calendar_events não existe. Execute o script: scripts/063_fix_calendar_events_table.sql')
      }
      if (error.code === '23514' && error.message?.includes('event_type')) {
        throw new Error('Tipo de evento inválido. Use: live, simulado, prova, redacao ou aula')
      }
      if (error.code === '23503') {
        throw new Error('Erro de referência: usuário não encontrado')
      }
      throw new Error('Erro ao criar evento: ' + error.message)
    }

    console.log('Evento criado com sucesso:', data)
    return data
  } catch (error) {
    console.error('Erro ao criar evento do calendário:', error)
    throw error
  }
}

// Atualizar evento do calendário
export async function updateCalendarEvent(userUuid: string, eventId: string, eventData: Partial<CalendarEvent>): Promise<CalendarEvent> {
  try {
    // Verificar acesso
    const hasAccess = await checkCalendarAccess(userUuid)
    if (!hasAccess) {
      throw new Error('Acesso negado. Apenas professores e administradores podem editar eventos.')
    }

    const supabase = await getSupabaseClient()

    const { data, error } = await supabase
      .from('calendar_events')
      .update({
        ...eventData,
        updated_by: userUuid
      })
      .eq('id', eventId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao atualizar evento do calendário:', error)
    throw error
  }
}

// Deletar evento do calendário
export async function deleteCalendarEvent(userUuid: string, eventId: string): Promise<void> {
  try {
    // Verificar acesso
    const hasAccess = await checkCalendarAccess(userUuid)
    if (!hasAccess) {
      throw new Error('Acesso negado. Apenas professores e administradores podem deletar eventos.')
    }

    const supabase = await getSupabaseClient()

    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId)

    if (error) throw error
  } catch (error) {
    console.error('Erro ao deletar evento do calendário:', error)
    throw error
  }
}
