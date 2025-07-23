"use server"

import { createClient } from "@/lib/supabaseServer"
import { revalidatePath } from "next/cache"

// Função para obter o cliente Supabase do servidor
async function getSupabaseClient() {
  return createClient()
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
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from("flashcards")
    .select("id, topic_id, question, answer")
    .eq("topic_id", topicId)
    .limit(limit)

  if (error) {
    console.error("Erro ao buscar flashcards:", error)
    return []
  }

  return data || []
}

// Função para obter todos os tópicos
export async function getAllTopics() {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase.from("topics").select("id, name").order("name")

  if (error) {
    console.error("Erro ao buscar tópicos:", error)
    return []
  }

  return data || []
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

// Função para obter quizzes por tópico
export async function getQuizzesByTopic(topicId: string) {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from("quizzes")
    .select("id, topic_id, title, description")
    .eq("topic_id", topicId)
    .order("title")

  if (error) {
    console.error("Erro ao buscar quizzes:", error)
    return []
  }

  return data || []
}

// Função para obter questões do quiz
export async function getQuizQuestions(quizId: number) {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from("quiz_questions")
    .select("id, quiz_id, question_text, options, correct_answer, explanation")
    .eq("quiz_id", quizId)
    .order("id")

  if (error) {
    console.error("Erro ao buscar questões:", error)
    return []
  }

  return data || []
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
  try {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase.from("subjects").select("id, name").order("name")
    if (error) {
      console.error("Erro ao buscar matérias:", error)
      return []
    }
    return data || []
  } catch (error) {
    console.error("Erro inesperado ao buscar matérias:", error)
    return []
  }
}

// Função para obter tópicos por matéria
export async function getTopicsBySubject(subjectId: number) {
  try {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase.from("topics").select("id, name, subject_id").eq("subject_id", subjectId).order("name")
    if (error) {
      console.error("Erro ao buscar tópicos por matéria:", error)
      return []
    }
    return data || []
  } catch (error) {
    console.error("Erro inesperado ao buscar tópicos por matéria:", error)
    return []
  }
}
