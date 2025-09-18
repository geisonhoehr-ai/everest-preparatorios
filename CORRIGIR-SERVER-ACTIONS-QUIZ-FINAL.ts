// ========================================
// CORREÇÕES PARA AS FUNÇÕES DE SERVER ACTIONS
// ========================================
// Este arquivo contém as correções necessárias para as funções de server actions

// PROBLEMA 1: getAllSubjects() retorna UUIDs, mas frontend espera numbers
export async function getAllSubjects() {
  console.log("🔍 [Server Action] getAllSubjects() iniciada")
  const supabase = await getSupabase()
  console.log("🔍 [Server Action] Supabase client obtido")
  
  try {
    const { data, error } = await supabase
      .from("subjects")
      .select("id, name, description")
      .order("name")
    
    if (error) {
      console.error("❌ [Server Action] Erro ao buscar matérias:", error)
      return []
    }
    
    // CORREÇÃO: Converter UUIDs para strings para compatibilidade com frontend
    const subjects = data?.map(subject => ({
      ...subject,
      id: subject.id // Manter como string (UUID)
    })) || []
    
    console.log(`✅ [Server Action] Matérias encontradas: ${subjects.length}`)
    return subjects
  } catch (error) {
    console.error("❌ [Server Action] Erro inesperado em getAllSubjects:", error)
    return []
  }
}

// PROBLEMA 2: getTopicsBySubject() usa number para subjectId, mas database usa UUID
export async function getTopicsBySubject(subjectId: string) { // CORREÇÃO: Mudado de number para string
  const supabase = await getSupabase()
  console.log(`🔍 [Server Action] getTopicsBySubject para subjectId: ${subjectId}`)
  
  const { data, error } = await supabase
    .from("topics")
    .select("id, name, subject_id")
    .eq("subject_id", subjectId) // CORREÇÃO: Usar string (UUID) em vez de number
    .order("name")
    
  if (error) {
    console.error("❌ [Server Action] Erro ao buscar tópicos por matéria:", error)
    return []
  }
  
  console.log(`✅ [Server Action] Tópicos encontrados: ${data?.length}`)
  return data || []
}

// PROBLEMA 3: getAllQuizzesByTopic() busca por quiz_id, mas deveria buscar por topic_id
export async function getAllQuizzesByTopic(topicId: string) { // CORREÇÃO: Mudado de quizId para topicId
  const supabase = await getSupabase()
  console.log(`❓ [Server Action] Buscando questões do tópico: ${topicId}`)

  const { data, error } = await supabase
    .from("quiz_questions")
    .select("id, quiz_id, topic_id, question_text, question_type, options, correct_answer, explanation, points")
    .eq("topic_id", topicId) // CORREÇÃO: Buscar por topic_id em vez de quiz_id
    .order("id")

  if (error) {
    console.error("❌ [Server Action] Erro ao buscar questões:", error)
    return []
  }

  console.log(`✅ [Server Action] Questões encontradas: ${data?.length}`)
  return data || []
}

// NOVA FUNÇÃO: Buscar quizzes por tópico
export async function getQuizzesByTopic(topicId: string) {
  const supabase = await getSupabase()
  console.log(`🔍 [Server Action] getQuizzesByTopic para topicId: ${topicId}`)

  const { data, error } = await supabase
    .from("quizzes")
    .select("id, topic_id, title, description, duration_minutes, created_by_user_id")
    .eq("topic_id", topicId)
    .order("title")

  if (error) {
    console.error("❌ [Server Action] Erro ao buscar quizzes por tópico:", error)
    return []
  }

  console.log(`✅ [Server Action] Quizzes encontrados: ${data?.length}`)
  return data || []
}

// NOVA FUNÇÃO: Buscar questões por quiz
export async function getQuestionsByQuiz(quizId: string) {
  const supabase = await getSupabase()
  console.log(`🔍 [Server Action] getQuestionsByQuiz para quizId: ${quizId}`)

  const { data, error } = await supabase
    .from("quiz_questions")
    .select("id, quiz_id, topic_id, question_text, question_type, options, correct_answer, explanation, points")
    .eq("quiz_id", quizId)
    .order("id")

  if (error) {
    console.error("❌ [Server Action] Erro ao buscar questões por quiz:", error)
    return []
  }

  console.log(`✅ [Server Action] Questões encontradas: ${data?.length}`)
  return data || []
}

// CORREÇÃO: Função para criar quiz
export async function createQuiz(userId: string, quizData: {
  topic_id: string // CORREÇÃO: Mudado de quiz_id para topic_id
  title: string
  description: string
  duration_minutes: number
}) {
  const supabase = await getSupabase()
  console.log(`📝 [Server Action] Criando quiz para tópico: ${quizData.topic_id}`)

  const { data, error } = await supabase
    .from("quizzes")
    .insert({
      topic_id: quizData.topic_id, // CORREÇÃO: Usar topic_id
      title: quizData.title,
      description: quizData.description,
      duration_minutes: quizData.duration_minutes,
      created_by_user_id: userId
    })
    .select()
    .single()

  if (error) {
    console.error("❌ [Server Action] Erro ao criar quiz:", error)
    return null
  }

  console.log(`✅ [Server Action] Quiz criado com sucesso: ${data.id}`)
  return data
}

// CORREÇÃO: Função para criar questão de quiz
export async function createQuizQuestion(userId: string, questionData: {
  quiz_id: string
  topic_id: string
  question_text: string
  question_type: string
  options: string[]
  correct_answer: string
  explanation: string
  points: number
}) {
  const supabase = await getSupabase()
  console.log(`📝 [Server Action] Criando questão de quiz: ${questionData.quiz_id}`)

  const { data, error } = await supabase
    .from("quiz_questions")
    .insert({
      quiz_id: questionData.quiz_id,
      topic_id: questionData.topic_id,
      question_text: questionData.question_text,
      question_type: questionData.question_type,
      options: questionData.options,
      correct_answer: questionData.correct_answer,
      explanation: questionData.explanation,
      points: questionData.points
    })
    .select()
    .single()

  if (error) {
    console.error("❌ [Server Action] Erro ao criar questão:", error)
    return null
  }

  console.log(`✅ [Server Action] Questão criada com sucesso: ${data.id}`)
  return data
}

// NOVA FUNÇÃO: Atualizar progresso do quiz
export async function updateQuizProgress(userId: string, quizId: string, progressData: {
  score: number
  total_questions: number
  correct_answers: number
  time_spent: number
  completed_at: string
}) {
  const supabase = await getSupabase()
  console.log(`📝 [Server Action] Atualizando progresso do quiz: ${quizId}`)

  const { data, error } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: userId,
      quiz_id: quizId,
      score: progressData.score,
      total_questions: progressData.total_questions,
      correct_answers: progressData.correct_answers,
      time_spent: progressData.time_spent,
      completed_at: progressData.completed_at
    })
    .select()
    .single()

  if (error) {
    console.error("❌ [Server Action] Erro ao atualizar progresso:", error)
    return null
  }

  console.log(`✅ [Server Action] Progresso atualizado com sucesso: ${data.id}`)
  return data
}
