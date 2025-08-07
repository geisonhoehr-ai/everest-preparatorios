"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { supabaseAdmin } from '@/lib/supabaseServer'
import { createClient } from '@/lib/supabase-server'
import { addActivityXP, updateStudyStreak, createAchievement } from '@/lib/rpg-system'

/**
 * Obtém uma instância do Supabase (server-side)
 */
async function getSupabase() {
  return await createClient()
}

/**
 * Obtém uma instância do Supabase com acesso ao storage (para uploads)
 */
async function getSupabaseWithStorage() {
  return await createClient()
}

// Função para verificar se o usuário tem acesso pago
export async function checkPaidAccess(email: string): Promise<boolean> {
  const supabase = await getSupabase()
  console.log(`🔍 [Server Action] checkPaidAccess para email: ${email}`)

  const { data, error } = await supabase.from("paid_users").select("status").eq("email", email).single()

  if (error) {
    console.error("❌ [Server Action] Erro ao verificar acesso pago:", error)
    return false
  }

  console.log(`✅ [Server Action] Acesso pago para ${email}: ${data?.status === "active"}`)
  return data?.status === "active"
}

// Função para obter a role do usuário
export async function getUserRoleFromSupabase(userUuid: string): Promise<"student" | "teacher" | null> {
  const supabase = await getSupabase()
  console.log(`👤 [Server Action] getUserRole para UUID: ${userUuid}`)

  const { data, error } = await supabase.from("user_roles").select("role").eq("user_uuid", userUuid).single()

  if (error) {
    console.error("[getUserRole] erro:", error)
    return null
  }
  return (data?.role as "student" | "teacher") ?? null
}

// Função para definir role do usuário
export async function setUserRole(userUuid: string, role: "student" | "teacher") {
  const supabase = await getSupabase()
  console.log(`🔧 [Server Action] setUserRole para UUID: ${userUuid}, Role: ${role}`)

  const { error } = await supabase.from("user_roles").upsert({ user_uuid: userUuid, role }, { onConflict: "user_uuid" })

  if (error) {
    console.error("[setUserRole] erro:", error)
    throw error
  }

  // revalida a página inicial para refletir mudanças imediatas
  revalidatePath("/")
  return { success: true }
}

// Função para criar perfil de usuário
export async function createUserProfile(userUuid: string, role: "student" | "teacher", profileData: any) {
  const supabase = await getSupabase()
  console.log(`📝 [Server Action] createUserProfile para UUID: ${userUuid}, Role: ${role}`)

  // Inserir ou atualizar role
  const { error: roleError } = await supabase.from("user_roles").upsert({
    user_uuid: userUuid,
    role: role,
    first_login: false,
    profile_completed: true,
  })

  if (roleError) {
    console.error("❌ [Server Action] Erro ao criar role:", roleError)
    return { success: false, error: roleError.message }
  }

  // Inserir perfil específico
  const tableName = role === "student" ? "student_profiles" : "teacher_profiles"
  const { error: profileError } = await supabase.from(tableName).upsert({
    user_uuid: userUuid,
    ...profileData,
  })

  if (profileError) {
    console.error("❌ [Server Action] Erro ao criar perfil:", profileError)
    return { success: false, error: profileError.message }
  }

  revalidatePath("/")
  console.log(`✅ [Server Action] Perfil criado com sucesso para UUID: ${userUuid}`)
  return { success: true }
}

// Funções de dados (mantidas como estavam, apenas adicionando logs para consistência)
export async function getTotalScore(): Promise<number> {
  const supabase = await getSupabase()
  console.log("📊 [Server Action] Buscando pontuação total...")
  // Simulação - em produção você buscaria do banco
  return 1250
}

export async function getTopicProgress() {
  const supabase = await getSupabase()
  console.log("📈 [Server Action] Buscando progresso por tópico...")
  // Simulação - retorna dados fictícios para demonstração
  return {
    "fonetica-fonologia": { correct: 15, incorrect: 3 },
    ortografia: { correct: 22, incorrect: 5 },
    "acentuacao-grafica": { correct: 18, incorrect: 2 },
    "morfologia-classes": { correct: 12, incorrect: 8 },
    "sintaxe-termos-essenciais": { correct: 25, incorrect: 4 },
  }
}

export async function updateScore(newScore: number) {
  const supabase = await getSupabase()
  console.log(`⬆️ [Server Action] Atualizando pontuação para: ${newScore}`)
  // Implementação da atualização de pontuação
  revalidatePath("/")
  return { success: true }
}

export async function updateTopicProgress(topicId: string, type: "correct" | "incorrect") {
  const supabase = await getSupabase()
  console.log(`🔄 [Server Action] Atualizando progresso do tópico ${topicId} (${type})...`)
  // Implementação da atualização de progresso
  revalidatePath("/")
  return { success: true }
}

export async function getFlashcardsForReview(topicId: string, limit = 10) {
  const supabase = await getSupabase()
  console.log(`📚 [Server Action] Buscando flashcards para revisão do tópico: ${topicId}, limite: ${limit}`)

  const { data, error } = await supabase
    .from("flashcards")
    .select("id, topic_id, question, answer")
    .eq("topic_id", topicId)
    .order("id", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("❌ [Server Action] Erro ao buscar flashcards:", error)
    return []
  }

  console.log(`✅ [Server Action] Flashcards encontrados: ${data?.length}`)
  console.log(`📋 [Server Action] IDs dos flashcards:`, data?.map(f => f.id))
  return data || []
}

// Função para verificar se o usuário é professor ou admin
export async function checkTeacherOrAdminAccess(userUuid: string): Promise<boolean> {
  const supabase = await getSupabase()
  console.log(`🔍 [Server Action] Verificando acesso de professor/admin para: ${userUuid}`)

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_uuid", userUuid)
    .single()

  if (error) {
    console.error("❌ [Server Action] Erro ao verificar role:", error)
    return false
  }

  const hasAccess = data?.role === "teacher" || data?.role === "admin"
  console.log(`✅ [Server Action] Acesso ${hasAccess ? 'permitido' : 'negado'} para role: ${data?.role}`)
  return hasAccess
}

// Função para obter todos os flashcards de um tópico (para professores/admins)
export async function getAllFlashcardsByTopic(userUuid: string, topicId: string, page = 1, limit = 20) {
  const supabase = await getSupabase()
  console.log(`📚 [Server Action] Buscando flashcards do tópico: ${topicId} para usuário: ${userUuid}`)

  // Verificar se o usuário tem acesso
  const hasAccess = await checkTeacherOrAdminAccess(userUuid)
  if (!hasAccess) {
    console.error("❌ [Server Action] Acesso negado para buscar flashcards")
    return { success: false, error: "Acesso negado" }
  }

  const offset = (page - 1) * limit

  const { data, error } = await supabase
    .from("flashcards")
    .select("id, topic_id, question, answer")
    .eq("topic_id", topicId)
    .order("id", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("❌ [Server Action] Erro ao buscar flashcards:", error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }

  console.log(`✅ [Server Action] Flashcards encontrados: ${data?.length}`)
  return { 
    success: true, 
    data: { 
      flashcards: data || [],
      page,
      limit,
      hasMore: data && data.length === limit
    }
  }
}

// Função para obter um flashcard específico
export async function getFlashcardById(userUuid: string, flashcardId: number) {
  const supabase = await getSupabase()
  console.log(`📚 [Server Action] Buscando flashcard: ${flashcardId}`)

  // Verificar se o usuário tem acesso
  const hasAccess = await checkTeacherOrAdminAccess(userUuid)
  if (!hasAccess) {
    console.error("❌ [Server Action] Acesso negado para buscar flashcard")
    return { success: false, error: "Acesso negado" }
  }

  const { data, error } = await supabase
    .from("flashcards")
    .select("id, topic_id, question, answer")
    .eq("id", flashcardId)
    .single()

  if (error) {
    console.error("❌ [Server Action] Erro ao buscar flashcard:", error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }

  console.log(`✅ [Server Action] Flashcard encontrado: ${data?.id}`)
  return { success: true, data }
}

// Função para criar um novo flashcard
export async function createFlashcard(userUuid: string, data: {
  topic_id: string
  question: string
  answer: string
}) {
  const supabase = await getSupabase()
  console.log(`📝 [Server Action] Criando flashcard para tópico: ${data.topic_id}`)

  // Verificar se o usuário tem acesso
  const hasAccess = await checkTeacherOrAdminAccess(userUuid)
  if (!hasAccess) {
    console.error("❌ [Server Action] Acesso negado para criar flashcard")
    return { success: false, error: "Acesso negado" }
  }

  const { data: newFlashcard, error } = await supabase
    .from("flashcards")
    .insert({
      topic_id: data.topic_id,
      question: data.question,
      answer: data.answer
    })
    .select()
    .single()

  if (error) {
    console.error("❌ [Server Action] Erro ao criar flashcard:", error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }

  console.log(`✅ [Server Action] Flashcard criado: ${newFlashcard.id}`)
  revalidatePath("/flashcards")
  return { success: true, data: newFlashcard }
}

// Função para atualizar um flashcard
export async function updateFlashcard(userUuid: string, flashcardId: number, question: string, answer: string) {
  const supabase = await getSupabase()
  console.log(`📝 [Server Action] Atualizando flashcard: ${flashcardId}`)

  // Verificar se o usuário tem acesso
  const hasAccess = await checkTeacherOrAdminAccess(userUuid)
  if (!hasAccess) {
    console.error("❌ [Server Action] Acesso negado para atualizar flashcard")
    return { success: false, error: "Acesso negado" }
  }

  const { data: updatedFlashcard, error } = await supabase
    .from("flashcards")
    .update({
      question: question.trim(),
      answer: answer.trim()
    })
    .eq("id", flashcardId)
    .select()
    .single()

  if (error) {
    console.error("❌ [Server Action] Erro ao atualizar flashcard:", error)
    return { success: false, error: error.message }
  }

  console.log(`✅ [Server Action] Flashcard atualizado: ${updatedFlashcard.id}`)
  revalidatePath("/flashcards")
  return { success: true, data: updatedFlashcard }
}

// Função para deletar um flashcard
export async function deleteFlashcard(userUuid: string, flashcardId: number) {
  const supabase = await getSupabase()
  console.log(`🗑️ [Server Action] Deletando flashcard: ${flashcardId}`)

  // Verificar se o usuário tem acesso
  const hasAccess = await checkTeacherOrAdminAccess(userUuid)
  if (!hasAccess) {
    console.error("❌ [Server Action] Acesso negado para deletar flashcard")
    return { success: false, error: "Acesso negado" }
  }

  const { error } = await supabase
    .from("flashcards")
    .delete()
    .eq("id", flashcardId)

  if (error) {
    console.error("❌ [Server Action] Erro ao deletar flashcard:", error)
    return { success: false, error: error.message }
  }

  console.log(`✅ [Server Action] Flashcard deletado: ${flashcardId}`)
  revalidatePath("/flashcards")
  return { success: true }
}

export async function getAllTopics() {
  const supabase = await getSupabase()
  console.log("📖 [Server Action] Buscando todos os tópicos...")

  const { data, error } = await supabase.from("topics").select("id, name").order("name")

  if (error) {
    console.error("❌ [Server Action] Erro ao buscar tópicos:", error)
    return []
  }

  console.log(`✅ [Server Action] Tópicos encontrados: ${data?.length}`)
  return data || []
}

export async function getSm2ProgressForCard(flashcardId: number) {
  const supabase = await getSupabase()
  console.log(`🧠 [Server Action] Buscando progresso SM2 para card: ${flashcardId}`)
  // Implementação do SM2
  return null
}

export async function updateSm2Progress(flashcardId: number, progress: any) {
  const supabase = await getSupabase()
  console.log(`🔄 [Server Action] Atualizando progresso SM2 para card: ${flashcardId}`)
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error("❌ [Server Action] Usuário não autenticado")
    return { success: false, error: "Usuário não autenticado" }
  }

  // Sistema RPG: Adicionar XP por estudar flashcard
  try {
    const { addActivityXP, updateStudyStreak } = await import('@/lib/rpg-system')
    const baseXP = 5 // XP base por flashcard estudado
    const result = await addActivityXP(user.id, 'flashcard', baseXP)
    
    if (result.levelUp) {
      // Achievement de level up - comentado temporariamente
      console.log(`🎉 [RPG] Usuário subiu de nível! Novo nível: ${result.newLevel}`)
    }

    // Atualizar streak de estudo
    await updateStudyStreak(user.id)

    console.log(`🎮 [RPG] XP adicionado por flashcard: ${baseXP} pontos`)
  } catch (rpgError) {
    console.error("❌ Erro no sistema RPG:", rpgError)
    // Não falhar a operação principal
  }

  // Implementação do SM2
  return { success: true }
}

export async function getQuizzesByTopic(topicId: string) {
  const supabase = await getSupabase()
  console.log(`📝 [Server Action] Buscando quizzes por tópico: ${topicId}`)

  const { data, error } = await supabase
    .from("quizzes")
    .select("id, topic_id, title, description")
    .eq("topic_id", topicId)
    .order("title")

  if (error) {
    console.error("❌ [Server Action] Erro ao buscar quizzes:", error)
    return []
  }

  console.log(`✅ [Server Action] Quizzes encontrados: ${data?.length}`)
  return data || []
}

export async function getQuizQuestions(quizId: number) {
  const supabase = await getSupabase()
  console.log(`❓ [Server Action] Buscando questões do quiz: ${quizId}`)

  const { data, error } = await supabase
    .from("quiz_questions")
    .select("id, quiz_id, question_text, options, correct_answer, explanation")
    .eq("quiz_id", quizId)
    .order("id")

  if (error) {
    console.error("❌ [Server Action] Erro ao buscar questões:", error)
    return []
  }

  console.log(`✅ [Server Action] Questões encontradas: ${data?.length}`)
  return data || []
}

export async function submitQuizResult(
  quizId: number,
  score: number,
  correct: number,
  incorrect: number,
  total: number,
) {
  const supabase = await getSupabase()
  console.log(`💯 [Server Action] Submetendo resultado do quiz ${quizId}: Score ${score}`)

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error("❌ [Server Action] Erro de autenticação:", authError)
    return { success: false, error: "Usuário não autenticado" }
  }

  // Salvar resultado do quiz
  const { error } = await supabase.from("quiz_results").insert({
    user_uuid: user.id,
    quiz_id: quizId,
    score: score,
    correct_answers: correct,
    incorrect_answers: incorrect,
    total_questions: total,
    completed_at: new Date().toISOString()
  })

  if (error) {
    console.error("❌ [Server Action] Erro ao salvar resultado do quiz:", error)
    return { success: false, error: error.message }
  }

  // Sistema RPG: Adicionar XP baseado no score
  try {
    const baseXP = 15 // XP base por quiz
    const perfectBonus = score === 100 ? 10 : 0 // Bônus por 100%
    const totalXP = baseXP + perfectBonus

    const result = await addActivityXP(user.id, 'quiz', totalXP)
    
    // Se subiu de nível, criar conquista
    if (result.levelUp) {
      await createAchievement(user.id, 'level_up', {
        title: `Evolução Quiz`,
        description: `Você evoluiu para ${result.newRank}!`,
        icon: '🧠',
        xp_reward: 50
      })
    }

    // Se fez 100%, criar conquista de perfeição
    if (score === 100) {
      await createAchievement(user.id, 'perfect_score', {
        title: 'Perfeição Absoluta',
        description: 'Quiz com 100% de acerto!',
        icon: '💯',
        xp_reward: 150
      })
    }

    // Atualizar streak de estudo
    await updateStudyStreak(user.id)

    console.log(`🎮 [RPG] XP adicionado: ${totalXP}, Novo nível: ${result.newLevel}`)
  } catch (error) {
    console.error("❌ [RPG] Erro ao adicionar XP:", error)
  }

  revalidatePath("/")
  return { success: true }
}

export async function getRedacoesUsuario() {
  const supabase = await getSupabase()
  console.log("✍️ [Server Action] Buscando redações do usuário...")
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log("❌ Usuário não autenticado")
      return []
    }

    const { data: redacoes, error } = await supabase
      .from('redacoes')
      .select(`
        *,
        temas_redacao(titulo)
      `)
      .eq('user_uuid', user.email || user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("❌ Erro ao buscar redações:", error)
      return []
    }

    // Buscar imagens para cada redação
    const redacoesComImagens = await Promise.all(
      redacoes?.map(async (redacao) => {
        // Buscar imagens da redação
        const { data: imagens, error: imagensError } = await supabase
          .from('redacao_imagens')
          .select('*')
          .eq('redacao_id', redacao.id)
          .order('ordem', { ascending: true })

        if (imagensError) {
          console.error(`❌ Erro ao buscar imagens da redação ${redacao.id}:`, imagensError)
        }

        return {
          id: redacao.id,
          titulo: redacao.titulo,
          tema: redacao.temas_redacao?.titulo || redacao.tema,
          tema_id: redacao.tema_id || 1,
          status: redacao.status as "rascunho" | "enviada" | "em_correcao" | "corrigida" | "revisada",
          nota_final: redacao.nota_final,
          nota_ia: redacao.nota_ia,
          data_criacao: redacao.created_at,
          data_envio: redacao.data_envio,
          data_correcao: redacao.data_correcao,
          feedback_professor: redacao.feedback_professor,
          feedback_audio_url: redacao.feedback_audio_url,
          correcao_ia: redacao.correcao_ia,
          imagens: imagens || [],
          comentarios: [],
          aluno_id: redacao.user_uuid,
          professor_id: redacao.professor_uuid
        }
      }) || []
    )

    console.log(`✅ Encontradas ${redacoesComImagens.length} redações para o usuário`)
    return redacoesComImagens
  } catch (error) {
    console.error("❌ Erro ao buscar redações do usuário:", error)
    return []
  }
}

export async function getTemplatesRedacao() {
  const supabase = await getSupabase()
  console.log("📄 [Server Action] Buscando templates de redação...")
  
  // Templates estáticos por enquanto
  return [
    { 
      id: 1, 
      nome: "ENEM - Modelo Oficial", 
      tipo: "enem", 
      descricao: "Folha oficial do ENEM com 30 linhas",
      arquivo_url: "/templates/enem-oficial.pdf"
    },
    { 
      id: 2, 
      nome: "CIAAR - Concurso da Aeronáutica", 
      tipo: "ciaar", 
      descricao: "Modelo para provas da Aeronáutica",
      arquivo_url: "/templates/ciaar.pdf"
    },
    { 
      id: 3, 
      nome: "EsPCEx - Escola de Sargentos", 
      tipo: "espcex", 
      descricao: "Template para EsPCEx",
      arquivo_url: "/templates/espcex.pdf"
    },
    { 
      id: 4, 
      nome: "Modelo Genérico", 
      tipo: "generico", 
      descricao: "Para prática geral de redação",
      arquivo_url: "/templates/generico.pdf"
    }
  ]
}

// Nova função para criar redação
export async function createRedacao(data: {
  titulo: string
  tema_id: number
  observacoes?: string
  imagens: File[]
}) {
  const supabase = await getSupabaseWithStorage()
  console.log("✍️ [Server Action] Criando nova redação...")
  console.log("📝 Dados recebidos:", { titulo: data.titulo, tema_id: data.tema_id, numImagens: data.imagens.length })
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error("❌ Usuário não autenticado")
      return { success: false, error: "Usuário não autenticado" }
    }
    console.log("✅ Usuário autenticado:", user.id)

    // Buscar o tema selecionado
    const { data: tema, error: temaError } = await supabase
      .from('temas_redacao')
      .select('titulo')
      .eq('id', data.tema_id)
      .single()

    if (temaError) {
      console.error("❌ Erro ao buscar tema:", temaError)
      return { success: false, error: "Tema não encontrado" }
    }
    console.log("✅ Tema encontrado:", tema?.titulo)

    // Criar registro da redação
    const redacaoData = {
      user_uuid: user.email || user.id,
      titulo: data.titulo,
      tema: tema?.titulo || "Tema não encontrado",
      tema_id: data.tema_id,
      tipo_redacao: 'dissertativa',
      status: 'enviada',
      data_envio: new Date().toISOString(),
      observacoes: data.observacoes
    }
    console.log("📝 Dados da redação:", redacaoData)

    const { data: redacao, error: redacaoError } = await supabase
      .from('redacoes')
      .insert(redacaoData)
      .select()
      .single()

    if (redacaoError) {
      console.error("❌ Erro ao criar redação:", redacaoError)
      return { success: false, error: "Erro ao criar redação: " + redacaoError.message }
    }
    console.log("✅ Redação criada no banco:", redacao.id)

    // Verificar se bucket 'redacoes' existe, se não, criar
    const { data: buckets } = await supabase.storage.listBuckets()
    const redacoesBucket = buckets?.find(bucket => bucket.name === 'redacoes')
    
    if (!redacoesBucket) {
      console.log("📦 Criando bucket 'redacoes'...")
      const { error: bucketError } = await supabase.storage.createBucket('redacoes', {
        public: false,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'],
        fileSizeLimit: 50 * 1024 * 1024 // 50MB
      })
      
      if (bucketError) {
        console.error("❌ Erro ao criar bucket:", bucketError)
        return { success: false, error: "Erro no sistema de storage. Verifique se o bucket 'redacoes' foi criado manualmente no painel do Supabase." }
      }
    } else {
      console.log("✅ Bucket 'redacoes' já existe")
    }

    // Upload das imagens com melhor tratamento
    const imagensUrls = []
    console.log("📤 Iniciando upload de", data.imagens.length, "imagens...")
    
    for (let i = 0; i < data.imagens.length; i++) {
      const file = data.imagens[i]
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `redacao-${redacao.id}-pagina-${i + 1}-${Date.now()}.${fileExtension}`
      
      console.log(`📁 Processando arquivo ${i + 1}/${data.imagens.length}:`, file.name, "Tamanho:", file.size, "Tipo:", file.type)
      
      // Verificar tamanho do arquivo (máximo 10MB por imagem)
      if (file.size > 10 * 1024 * 1024) {
        console.error(`❌ Arquivo muito grande: ${file.name} (${file.size} bytes)`)
        continue
      }

      // Verificar tipo do arquivo (aceitar imagens e PDFs)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        console.error(`❌ Tipo de arquivo inválido: ${file.type}`)
        continue
      }
      
      console.log(`⏳ [${i + 1}/${data.imagens.length}] Fazendo upload de: ${file.name}`)
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('redacoes')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error(`❌ Erro ao fazer upload da imagem ${i + 1}:`, uploadError)
        
        // Tratamento específico para erros de RLS
        if (uploadError.message.includes('row-level security policy') || uploadError.message.includes('must be owner')) {
          return { 
            success: false, 
            error: `Erro de permissão no upload. Configure manualmente o bucket 'redacoes' no painel do Supabase com políticas básicas. Detalhes: ${uploadError.message}` 
          }
        }
        
        continue
      }

      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from('redacoes')
          .getPublicUrl(fileName)
        
        imagensUrls.push({
          url: urlData.publicUrl,
          nome_arquivo: fileName
        })
        
        console.log(`✅ [${i + 1}/${data.imagens.length}] Upload concluído: ${fileName}`)
      }
    }

    console.log("📊 Total de imagens processadas:", imagensUrls.length)

    // Atualizar redação com URLs das imagens
    if (imagensUrls.length > 0) {
      const updateData = { 
        imagens: imagensUrls,
        total_imagens: imagensUrls.length,
        arquivo_url: imagensUrls[0].url, // Usar a primeira imagem como arquivo principal
        arquivo_nome: imagensUrls[0].nome_arquivo
      }
      console.log("🔄 Atualizando redação com imagens:", updateData)

      const { error: updateError } = await supabase
        .from('redacoes')
        .update(updateData)
        .eq('id', redacao.id)

      if (updateError) {
        console.error("❌ Erro ao atualizar redação com imagens:", updateError)
      } else {
        console.log("✅ Redação atualizada com imagens")
      }
    }

    // Sistema RPG - Adicionar XP por enviar redação
    try {
      const { addActivityXP, updateStudyStreak } = await import('@/lib/rpg-system')
      const baseXP = 15 // XP base por enviar redação
      const result = await addActivityXP(user.email || user.id, 'redacao', baseXP)
      
      if (result.levelUp) {
        // Criar achievement de level up
        const { createAchievement } = await import('@/lib/rpg-system')
        await createAchievement(user.email || user.id, 'level_up', {
          title: `Nível ${result.newLevel} - Redação`,
          description: `Você alcançou o nível ${result.newLevel} em redação!`,
          icon: '📝',
          xp_reward: 50
        })
      }

      // Atualizar streak de estudo
      await updateStudyStreak(user.email || user.id)

      console.log(`🎮 [RPG] XP adicionado por enviar redação: ${baseXP} pontos`)
    } catch (rpgError) {
      console.error("❌ Erro no sistema RPG:", rpgError)
      // Não falhar o envio se o RPG falhar
    }

    console.log("✅ Redação criada com sucesso:", redacao.id)
    revalidatePath('/redacao')
    return { success: true, data: redacao }
  } catch (error) {
    console.error("❌ Erro em createRedacao:", error)
    return { success: false, error: "Erro interno do servidor: " + (error as Error).message }
  }
}

export async function getTemasRedacao() {
  const supabase = await getSupabase()
  console.log("💡 [Server Action] Buscando temas de redação...")
  
  try {
    const { data: temas, error } = await supabase
      .from('temas_redacao')
      .select('*')
      .eq('ativo', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("❌ Erro ao buscar temas:", error)
      return []
    }

    const temasFormatados = temas?.map(tema => ({
      id: tema.id,
      titulo: tema.titulo,
      descricao: tema.descricao,
      enunciado: tema.descricao, // Usar descrição como enunciado por enquanto
      texto_motivador: tema.texto_motivador || "",
      tipo_prova: tema.tipo_prova,
      ano: tema.ano,
      dificuldade: tema.dificuldade as "facil" | "medio" | "dificil",
      tags: tema.tags || [],
      tempo_limite: 90, // Padrão ENEM
      criterios_avaliacao: [
        "Demonstrar domínio da modalidade escrita formal da Língua Portuguesa",
        "Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento", 
        "Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos",
        "Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação",
        "Elaborar proposta de intervenção para o problema abordado"
      ]
    })) || []

    console.log(`✅ Encontrados ${temasFormatados.length} temas de redação`)
    return temasFormatados
  } catch (error) {
    console.error("❌ Erro ao buscar temas de redação:", error)
    return []
  }
}

export async function getNotificacoesUsuario() {
  const supabase = await getSupabase()
  console.log("🔔 [Server Action] Buscando notificações do usuário...")
  // Implementação das notificações
  return []
}

// Funções específicas para professores - ATUALIZADAS
export async function getRedacoesProfessor() {
  const supabase = await getSupabase()
  console.log("��‍🏫 [Server Action] Buscando redações do professor...")

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    // Buscar redações das turmas do professor
    const { data: redacoes, error } = await supabase
      .from('redacoes')
      .select(`
        *,
        student_profiles!inner(nome_completo),
        turmas!inner(nome, id)
      `)
      .eq('turmas.professor_uuid', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("❌ Erro ao buscar redações:", error)
      return []
    }

    const redacoesFormatadas = redacoes?.map(redacao => ({
      id: redacao.id,
      titulo: redacao.titulo,
      tema: redacao.tema,
      status: redacao.status,
      aluno_nome: redacao.student_profiles?.nome_completo || "Nome não definido",
      turma_nome: redacao.turmas?.nome || "Turma não definida",
      turma_id: redacao.turmas?.id,
      data_envio: redacao.data_envio,
      nota_final: redacao.nota_final,
      nota_ia: redacao.nota_ia,
      correcao_ia: redacao.correcao_ia,
      urgente: redacao.status === 'enviada' && 
               (Date.now() - new Date(redacao.data_envio || redacao.created_at).getTime()) > 24 * 60 * 60 * 1000
    })) || []

    console.log(`✅ Encontradas ${redacoesFormatadas.length} redações`)
    return redacoesFormatadas
  } catch (error) {
    console.error("❌ Erro inesperado:", error)
    return []
  }
}

export async function getEstatisticasProfessor() {
  const supabase = await getSupabase()
  console.log("📊 [Server Action] Buscando estatísticas do professor...")

  // Dados simulados para demonstração
  return {
    total_redacoes: 45,
    pendentes: 7,
    corrigidas_hoje: 3,
    media_tempo_correcao: 15,
    total_alunos: 53,
  }
}

// Função para upload de áudio de feedback
export async function uploadAudioFeedback(redacaoId: number, audioBlob: Blob) {
  const supabase = await getSupabaseWithStorage()
  console.log(`🎵 [Server Action] Fazendo upload de áudio para redação ${redacaoId}...`)
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    // Criar nome único para o arquivo de áudio
    const fileName = `feedback-audio-${redacaoId}-${Date.now()}.wav`
    
    // Upload do áudio
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('feedback-audio')
      .upload(fileName, audioBlob, {
        contentType: 'audio/wav'
      })

    if (uploadError) {
      console.error("❌ Erro ao fazer upload do áudio:", uploadError)
      return { success: false, error: "Erro ao fazer upload do áudio" }
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('feedback-audio')
      .getPublicUrl(fileName)

    // Atualizar redação com URL do áudio
    const { error: updateError } = await supabase
      .from('redacoes')
      .update({ feedback_audio_url: publicUrl })
      .eq('id', redacaoId)

    if (updateError) {
      console.error("❌ Erro ao atualizar redação com áudio:", updateError)
      return { success: false, error: "Erro ao salvar URL do áudio" }
    }

    console.log(`✅ Áudio de feedback salvo com sucesso: ${publicUrl}`)
    revalidatePath("/redacao")
    revalidatePath("/dashboard")
    
    return { success: true, audioUrl: publicUrl }
  } catch (error) {
    console.error("❌ Erro inesperado no upload de áudio:", error)
    return { success: false, error: "Erro inesperado" }
  }
}

// Função para correção com IA
export async function corrigirRedacaoIA(redacaoId: number) {
  const supabase = await getSupabase()
  console.log(`🤖 [Server Action] Corrigindo redação ${redacaoId} com IA...`)

  try {
    // Simulação de correção com IA (em produção, conectar com OpenAI/Claude)
    const correcaoSimulada = {
      nota: Math.floor(Math.random() * 400) + 600, // Nota entre 600-1000
      feedback:
        "Redação bem estruturada com bons argumentos. Sugestões: melhorar conectivos e revisar concordância verbal.",
    }

    // Salvar correção IA no banco
    const { error: updateError } = await supabase
      .from('redacoes')
      .update({
        correcao_ia: correcaoSimulada.feedback,
        nota_ia: correcaoSimulada.nota,
        status: 'em_correcao'
      })
      .eq('id', redacaoId)

    if (updateError) {
      console.error("❌ Erro ao salvar correção IA:", updateError)
      return { success: false, error: "Erro ao salvar correção IA" }
    }

    console.log("✅ [Server Action] Correção IA salva para redação", redacaoId)
    revalidatePath("/dashboard")
    revalidatePath("/redacao")
    
    return { success: true, correcao: correcaoSimulada }
  } catch (error) {
    console.error("❌ Erro na correção IA:", error)
    return { success: false, error: "Erro inesperado" }
  }
}

// Função para salvar correção de redação pelo professor
export async function salvarCorrecaoRedacao(data: {
  redacaoId: number
  feedbackProfessor: string
  notaFinal: number
  comentarios?: string
}) {
  const supabase = await getSupabase()
  console.log(`👩‍🏫 [Server Action] Salvando correção da redação ${data.redacaoId}...`)
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    // Verificar se é professor
    const userRole = await getUserRoleFromSupabase(user.id)
    if (userRole !== 'teacher') {
      return { success: false, error: "Acesso negado" }
    }

    // Atualizar redação com correção
    const { error: updateError } = await supabase
      .from('redacoes')
      .update({
        feedback_professor: data.feedbackProfessor,
        nota_final: data.notaFinal,
        professor_uuid: user.id,
        status: 'corrigida',
        data_correcao: new Date().toISOString()
      })
      .eq('id', data.redacaoId)

    if (updateError) {
      console.error("❌ Erro ao salvar correção:", updateError)
      return { success: false, error: "Erro ao salvar correção" }
    }

    // Buscar dados do aluno para sistema RPG
    const { data: redacao } = await supabase
      .from('redacoes')
      .select('user_uuid, titulo')
      .eq('id', data.redacaoId)
      .single()

    if (redacao) {
      // Sistema RPG - Adicionar XP para redação
      try {
        const { addActivityXP } = await import('@/lib/rpg-system')
        const baseXP = 25 // XP base para redação
        const notaBonus = Math.floor(data.notaFinal / 100) * 5 // Bônus por centena de pontos
        const totalXP = baseXP + notaBonus
        
        const result = await addActivityXP(redacao.user_uuid, 'redacao', totalXP)
        
        if (result.levelUp) {
          // Criar achievement de level up
          const { createAchievement } = await import('@/lib/rpg-system')
          await createAchievement(redacao.user_uuid, 'level_up', {
            title: `Nível ${result.newLevel} - Redação`,
            description: `Você alcançou o nível ${result.newLevel} em redação!`,
            icon: '📝',
            xp_reward: 50
          })
        }

        // Achievement para nota alta
        if (data.notaFinal >= 800) {
          const { createAchievement } = await import('@/lib/rpg-system')
          await createAchievement(redacao.user_uuid, 'high_score', {
            title: 'Nota Excelente',
            description: `Você obteve uma nota excelente de ${data.notaFinal} pontos!`,
            icon: '🏆',
            xp_reward: 100
          })
        }

        // Atualizar streak de estudo
        const { updateStudyStreak } = await import('@/lib/rpg-system')
        await updateStudyStreak(redacao.user_uuid)

        console.log(`🎮 [RPG] XP adicionado para redação: ${totalXP} pontos`)
      } catch (rpgError) {
        console.error("❌ Erro no sistema RPG:", rpgError)
        // Não falhar a correção se o RPG falhar
      }

      // Criar notificação para o aluno
      await supabase
        .from('notificacoes')
        .insert({
          user_uuid: redacao.user_uuid,
          tipo: 'redacao_corrigida',
          titulo: 'Redação Corrigida',
          mensagem: `Sua redação "${redacao.titulo}" foi corrigida e está disponível para visualização.`,
          redacao_id: data.redacaoId
        })
    }

    console.log(`✅ Correção salva com sucesso para redação ${data.redacaoId}`)
    revalidatePath("/redacao")
    revalidatePath("/dashboard")
    
    return { success: true }
  } catch (error) {
    console.error("❌ Erro inesperado ao salvar correção:", error)
    return { success: false, error: "Erro inesperado" }
  }
}

// Funções de autenticação
export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const supabase = await getSupabase()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect("/login?message=Could not authenticate user")
  }

  return redirect("/dashboard")
}

export async function signup(formData: FormData) {
  const origin = (await headers()).get("origin")
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const supabase = await getSupabase()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return redirect("/signup?message=Could not authenticate user")
  }

  return redirect("/signup?message=Check email to continue sign in process")
}

export async function signOut() {
  const supabase = await getSupabase()
  const { error } = await supabase.auth.signOut()

  if (error) {
    return redirect("/?message=Could not sign out")
  }

  return redirect("/")
}

export async function getUserRole() {
  const supabase = await getSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data } = await supabase
    .from("user_roles")
    .select("role")
          .eq("user_uuid", user.email || user.id)
    .single()

  return data?.role || "student"
}

export async function getAllSubjects() {
  console.log("🔍 [Server Action] getAllSubjects() iniciada")
  const supabase = await getSupabase()
  console.log("🔍 [Server Action] Supabase client obtido")
  
  try {
    const { data, error } = await supabase.from("subjects").select("id, name").order("name")
    console.log("🔍 [Server Action] Query executada, data:", data, "error:", error)
    
    if (error) {
      console.error("❌ [Server Action] Erro ao buscar matérias:", error)
      return []
    }
    
    console.log("✅ [Server Action] Matérias encontradas:", data)
    return data || []
  } catch (error) {
    console.error("❌ [Server Action] Erro inesperado em getAllSubjects:", error)
    return []
  }
}

export async function getTopicsBySubject(subjectId: number) {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from("topics").select("id, name, subject_id").eq("subject_id", subjectId).order("name")
  if (error) {
    console.error("❌ [Server Action] Erro ao buscar tópicos por matéria:", error)
    return []
  }
  return data || []
}

// Função para obter a role do usuário no servidor
export async function getUserRoleServer(userUuid: string): Promise<"student" | "teacher" | "admin" | null> {
  const supabase = await getSupabase()
  console.log(`👤 [Server Action] getUserRoleServer para UUID: ${userUuid}`)

  const { data, error } = await supabase.from("user_roles").select("role").eq("user_uuid", userUuid).single()

  if (error) {
    console.error("[getUserRoleServer] erro:", error)
    return null
  }
  return (data?.role as "student" | "teacher" | "admin") ?? null
}

// Funções para gerenciar turmas
export async function getTurmasProfessor() {
  const supabase = await getSupabase()
  console.log("🏫 [Server Action] Buscando turmas do professor...")

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const { data: turmas, error } = await supabase
      .from('turmas')
      .select(`
        *,
        alunos_turmas(count)
      `)
      .eq('professor_uuid', user.id)
      .eq('ativa', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("❌ Erro ao buscar turmas:", error)
      return { success: false, error: "Erro ao buscar turmas" }
    }

    const turmasFormatadas = turmas?.map(turma => ({
      id: turma.id,
      nome: turma.nome,
      descricao: turma.descricao,
      codigo_acesso: turma.codigo_acesso,
      periodo: turma.periodo,
      ano_letivo: turma.ano_letivo,
      max_alunos: turma.max_alunos,
      total_alunos: turma.alunos_turmas?.length || 0,
      // Removidas colunas Google Drive
      cor_tema: turma.cor_tema || '#FF6B35',
      created_at: turma.created_at
    })) || []

    console.log(`✅ Encontradas ${turmasFormatadas.length} turmas`)
    return { success: true, turmas: turmasFormatadas }
  } catch (error) {
    console.error("❌ Erro inesperado:", error)
    return { success: false, error: "Erro inesperado" }
  }
}

export async function criarTurma(data: {
  nome: string
  descricao?: string
  periodo: string
  maxAlunos?: number
  corTema?: string
}) {
  const supabase = await getSupabase()
  console.log(`🏫 [Server Action] Criando turma: ${data.nome}`)

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    // Verificar se é professor
    const userRole = await getUserRoleServer(user.id)
    if (userRole !== 'teacher' && userRole !== 'admin') {
      return { success: false, error: "Apenas professores podem criar turmas" }
    }

    // Gerar ID único para a turma
    const turmaId = `turma-${Date.now()}-${data.nome.toLowerCase().replace(/\s+/g, '-')}`
    
    // Gerar código de acesso único
    const codigoAcesso = `${data.nome.substring(0, 3).toUpperCase()}${new Date().getFullYear()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`

    // Criar turma no Supabase
    const { data: novaTurma, error: turmaError } = await supabase
      .from('turmas')
      .insert({
        id: turmaId,
        nome: data.nome,
        descricao: data.descricao || `Turma ${data.nome} - ${data.periodo}`,
        professor_uuid: user.id,
        codigo_acesso: codigoAcesso,
        periodo: data.periodo,
        ano_letivo: new Date().getFullYear(),
        max_alunos: data.maxAlunos || 30,
        cor_tema: data.corTema || '#FF6B35',
        auto_create_folders: true,
        ativa: true
      })
      .select()
      .single()

    if (turmaError) {
      console.error("❌ Erro ao criar turma:", turmaError)
      return { success: false, error: "Erro ao criar turma no banco de dados" }
    }

    // Integração Google Drive removida - usando apenas Supabase Storage

    console.log(`✅ Turma criada com sucesso: ${data.nome}`)
    console.log(`🔑 Código de acesso: ${codigoAcesso}`)

    revalidatePath("/dashboard")
    return { 
      success: true, 
      turma: novaTurma,
      codigo_acesso: codigoAcesso,
      message: `Turma "${data.nome}" criada com sucesso!`
    }
  } catch (error) {
    console.error("❌ Erro inesperado ao criar turma:", error)
    return { success: false, error: "Erro inesperado" }
  }
}

export async function vincularAlunoTurma(data: {
  email: string
  nomeCompleto: string
  turmaId: string
  telefone?: string
}) {
  const supabase = await getSupabase()
  console.log(`👨‍🎓 [Server Action] Vinculando aluno ${data.email} à turma ${data.turmaId}`)

  try {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      return { success: false, error: "Usuário não autenticado" }
    }

    // Verificar se é professor
    const userRole = await getUserRoleServer(currentUser.id)
    if (userRole !== 'teacher' && userRole !== 'admin') {
      return { success: false, error: "Apenas professores podem vincular alunos" }
    }

    // Verificar se a turma existe e pertence ao professor
    const { data: turma, error: turmaError } = await supabase
      .from('turmas')
      .select('*')
      .eq('id', data.turmaId)
      .eq('professor_uuid', currentUser.id)
      .single()

    if (turmaError || !turma) {
      return { success: false, error: "Turma não encontrada ou sem permissão" }
    }

    // Verificar se aluno já existe na tabela de perfis
    const { data: existingProfile } = await supabase
      .from('student_profiles')
      .select('user_uuid')
      .eq('nome_completo', data.nomeCompleto)
      .eq('email', data.email)
      .single()
    
    let alunoId: string
    
    if (existingProfile) {
      // Usuário já existe
      alunoId = existingProfile.user_uuid
    } else {
      // Criar novo usuário
      const senhaTemporaria = `everest${Math.random().toString(36).substring(2, 8)}`
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: senhaTemporaria,
        email_confirm: true
      })
      
      if (createError) {
        console.error("❌ Erro ao criar usuário:", createError)
        return { success: false, error: "Erro ao criar conta do aluno" }
      }
      
      alunoId = newUser.user.id

      // Criar perfil do aluno
      await supabase.from('user_roles').insert({
        user_uuid: alunoId,
        role: 'student',
        first_login: true,
        profile_completed: false
      })

      await supabase.from('student_profiles').insert({
        user_uuid: alunoId,
        nome_completo: data.nomeCompleto,
        email: data.email,
        escola: 'A definir',
        ano_escolar: '3ano' // padrão
      })
    }

    // Verificar se aluno já está vinculado à turma
    const { data: existingVinculo } = await supabase
      .from('alunos_turmas')
      .select('user_uuid')
      .eq('user_uuid', alunoId)
      .eq('turma_id', data.turmaId)
      .single()

    if (!existingVinculo) {
      // Vincular aluno à turma
      const { error: vinculoError } = await supabase
        .from('alunos_turmas')
        .insert({
          user_uuid: alunoId,
          turma_id: data.turmaId
        })

      if (vinculoError) {
        console.error("❌ Erro ao vincular aluno:", vinculoError)
        return { success: false, error: "Erro ao vincular aluno à turma" }
      }
    } else {
      console.log("ℹ️ Aluno já está vinculado à turma")
    }

    // Integração Google Drive removida - usando apenas Supabase Storage

    console.log(`✅ Aluno ${data.nomeCompleto} vinculado à turma ${turma.nome}`)

    revalidatePath("/dashboard")
    return { 
      success: true, 
      message: `${data.nomeCompleto} foi adicionado à turma "${turma.nome}"`,
      aluno: { id: alunoId, nome: data.nomeCompleto, email: data.email }
    }
  } catch (error) {
    console.error("❌ Erro inesperado ao vincular aluno:", error)
    return { success: false, error: "Erro inesperado" }
  }
}

export async function getAlunosDaTurma(turmaId: string) {
  const supabase = await getSupabase()
  console.log(`👥 [Server Action] Buscando alunos da turma ${turmaId}`)

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const { data: alunos, error } = await supabase
      .from('alunos_turmas')
      .select(`
        user_uuid,
        data_entrada,
        student_profiles(
          nome_completo,
          escola,
          ano_escolar
        )
      `)
      .eq('turma_id', turmaId)
      .order('data_entrada', { ascending: false })

    if (error) {
      console.error("❌ Erro ao buscar alunos:", error)
      return { success: false, error: "Erro ao buscar alunos" }
    }

    const alunosFormatados = alunos?.map(item => ({
      id: item.user_uuid,
      nome: item.student_profiles?.[0]?.nome_completo || 'Nome não definido',
      escola: item.student_profiles?.[0]?.escola || 'Escola não definida',
      ano_escolar: item.student_profiles?.[0]?.ano_escolar || '3ano',
      data_entrada: item.data_entrada
    })) || []

    console.log(`✅ Encontrados ${alunosFormatados.length} alunos`)
    return { success: true, alunos: alunosFormatados }
  } catch (error) {
    console.error("❌ Erro inesperado:", error)
    return { success: false, error: "Erro inesperado" }
  }
}

// ========================================
// SISTEMA DE PROVAS ONLINE
// ========================================

export async function getProvas() {
  try {
    console.log('🔍 [SERVER] Iniciando getProvas...')
    
    // Primeiro, vamos verificar todas as provas sem filtro
    console.log('🔍 [SERVER] Verificando todas as provas...')
    const { data: todasProvas, error: errorTodas } = await supabaseAdmin
      .from('provas')
      .select('*')
      .order('criado_em', { ascending: false });

    console.log('📊 [SERVER] Todas as provas:', todasProvas?.length || 0)
    todasProvas?.forEach((prova, index) => {
      console.log(`📝 [SERVER] Prova ${index + 1}:`, {
        id: prova.id,
        titulo: prova.titulo,
        status: prova.status,
        criado_por: prova.criado_por
      })
    })
    
    // Agora vamos buscar apenas as publicadas
    console.log('🔍 [SERVER] Buscando provas publicadas...')
    const { data: provas, error } = await supabaseAdmin
      .from('provas')
      .select(`
        *,
        questoes (
          id,
          tipo,
          enunciado,
          pontuacao,
          ordem
        )
      `)
      .eq('status', 'publicada')
      .order('criado_em', { ascending: false });

    if (error) {
      console.error('❌ [SERVER] Erro ao buscar provas:', error)
      throw error
    }
    
    console.log('✅ [SERVER] Provas publicadas encontradas:', provas?.length || 0)
    
    // Log detalhado de cada prova
    provas?.forEach((prova, index) => {
      console.log(`📝 [SERVER] Prova ${index + 1}:`, {
        id: prova.id,
        titulo: prova.titulo,
        status: prova.status,
        questoes: prova.questoes?.length || 0
      })
    })
    
    return { data: provas, error: null };
  } catch (error) {
    console.error('💥 [SERVER] Erro em getProvas:', error);
    return { data: null, error };
  }
}

export async function getProvasProfessor() {
  try {
    console.log('🔍 Iniciando getProvasProfessor...')
    
    const supabase = await getSupabase();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('👤 Usuário nas Server Actions:', user?.id)
    console.log('❌ Erro de auth:', authError)
    
    if (authError) {
      console.error('Erro de autenticação:', authError)
      throw new Error(`Erro de autenticação: ${authError.message}`)
    }
    
    if (!user) {
      console.error('Usuário não encontrado nas Server Actions')
      redirect('/login')
    }

    console.log('✅ Usuário autenticado nas Server Actions:', user.email);

    const { data: provas, error } = await supabaseAdmin
      .from('provas')
      .select(`
        *,
        questoes (
          id,
          tipo,
          enunciado,
          pontuacao,
          ordem
        )
      `)
      .eq('criado_por', user.id)
      .order('criado_em', { ascending: false });

    if (error) throw error;
    return { data: provas, error: null };
  } catch (error) {
    console.error('💥 Erro em getProvasProfessor:', error);
    
    // Se for erro de autenticação, redirecionar
    if (error instanceof Error && (error.message.includes('não autenticado') || error.message.includes('Auth'))) {
      redirect('/login')
    }
    
    return { data: null, error };
  }
}

export async function criarProva(provaData: {
  titulo: string;
  descricao: string;
  materia: string;
  dificuldade: 'facil' | 'medio' | 'dificil';
  tempo_limite: number;
  tentativas_permitidas: number;
  nota_minima: number;
  texto_base?: string;
  tem_texto_base?: boolean;
  titulo_texto_base?: string;
  fonte_texto_base?: string;
}) {
  try {
    console.log('🔍 Iniciando criarProva...')
    
    const supabase = await getSupabase();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Erro de autenticação:', authError);
      throw new Error('Usuário não autenticado');
    }

    console.log('✅ Usuário autenticado:', user.email);

    const { data: prova, error } = await supabaseAdmin
      .from('provas')
      .insert({
        titulo: provaData.titulo,
        descricao: provaData.descricao,
        materia: provaData.materia,
        dificuldade: provaData.dificuldade,
        tempo_limite: provaData.tempo_limite,
        tentativas_permitidas: provaData.tentativas_permitidas,
        nota_minima: provaData.nota_minima,
        criado_por: user.id,
        status: 'rascunho',
        texto_base: provaData.texto_base || null,
        tem_texto_base: provaData.tem_texto_base || false,
        titulo_texto_base: provaData.titulo_texto_base || null,
        fonte_texto_base: provaData.fonte_texto_base || null
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar prova:', error);
      throw error;
    }

    console.log('✅ Prova criada:', prova);
    revalidatePath('/provas');
    return { data: prova, error: null };
  } catch (error) {
    console.error('Erro ao criar prova:', error);
    return { data: null, error };
  }
}

export async function atualizarProva(provaId: string, dados: any) {
  try {
    const supabase = await getSupabase();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabaseAdmin
      .from('provas')
      .update(dados)
      .eq('id', provaId)
      .eq('criado_por', user.id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao atualizar prova:', error);
    return { data: null, error };
  }
}

export async function publicarProva(provaId: string) {
  try {
    const supabase = await getSupabase();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabaseAdmin
      .from('provas')
      .update({ status: 'publicada' })
      .eq('id', provaId)
      .eq('criado_por', user.id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao publicar prova:', error);
    return { success: false, error };
  }
}

export async function arquivarProva(provaId: string) {
  try {
    const supabase = await getSupabase();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabaseAdmin
      .from('provas')
      .update({ status: 'arquivada' })
      .eq('id', provaId)
      .eq('criado_por', user.id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao arquivar prova:', error);
    return { success: false, error };
  }
}

export async function deletarProva(provaId: string) {
  try {
    const supabase = await getSupabase();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Usuário não autenticado');

    const { error } = await supabaseAdmin
      .from('provas')
      .delete()
      .eq('id', provaId)
      .eq('criado_por', user.id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar prova:', error);
    return { success: false, error };
  }
}

export async function getProvaCompleta(provaId: string) {
  try {
    const { data: prova, error } = await supabaseAdmin
      .from('provas')
      .select(`
        *,
        questoes (
          id,
          tipo,
          enunciado,
          pontuacao,
          ordem,
          opcoes_questao (
            id,
            texto,
            is_correta
          )
        )
      `)
      .eq('id', provaId)
      .eq('status', 'publicada')
      .single();

    if (error) throw error;
    return { data: prova, error: null };
  } catch (error) {
    console.error('Erro ao buscar prova completa:', error);
    return { data: null, error };
  }
}

export async function iniciarTentativa(provaId: string) {
  try {
    console.log('🔍 [SERVER] Iniciando tentativa para prova:', provaId)
    
    const supabase = await getSupabase();
    console.log('✅ [SERVER] Supabase client obtido')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('👤 [SERVER] Usuário:', user?.id)
    console.log('❌ [SERVER] Erro de auth:', authError)
    
    if (authError || !user) {
      console.error('❌ [SERVER] Usuário não autenticado')
      throw new Error('Usuário não autenticado');
    }

    console.log('✅ [SERVER] Usuário autenticado:', user.email);

    // Verificar se já existe uma tentativa em andamento
    console.log('🔍 [SERVER] Verificando tentativa existente...')
    const { data: tentativaExistente, error: checkError } = await supabaseAdmin
      .from('tentativas_prova')
      .select('*')
      .eq('prova_id', provaId)
      .eq('aluno_id', user.id)
      .eq('finalizada', false)
      .single();

    console.log('🔍 [SERVER] Tentativa existente:', tentativaExistente)
    console.log('❌ [SERVER] Erro ao verificar tentativa:', checkError)

    if (tentativaExistente) {
      console.log('✅ [SERVER] Retornando tentativa existente')
      return { data: tentativaExistente, error: null };
    }

    console.log('🆕 [SERVER] Criando nova tentativa...')

    // Criar nova tentativa
    const { data: tentativa, error } = await supabaseAdmin
      .from('tentativas_prova')
      .insert({
        prova_id: provaId,
        aluno_id: user.id,
        iniciada_em: new Date().toISOString(),
        finalizada: false
      })
      .select()
      .single();

    console.log('✅ [SERVER] Nova tentativa criada:', tentativa)
    console.log('❌ [SERVER] Erro ao criar tentativa:', error)

    if (error) {
      console.error('💥 [SERVER] Erro ao criar tentativa:', error)
      throw error;
    }
    
    console.log('✅ [SERVER] Tentativa criada com sucesso:', tentativa)
    return { data: tentativa, error: null };
  } catch (error) {
    console.error('💥 [SERVER] Erro ao iniciar tentativa:', error);
    console.error('💥 [SERVER] Tipo do erro:', typeof error);
    console.error('💥 [SERVER] Mensagem do erro:', error instanceof Error ? error.message : 'Erro desconhecido');
    console.error('💥 [SERVER] Stack do erro:', error instanceof Error ? error.stack : 'Sem stack');
    return { data: null, error };
  }
}

export async function salvarResposta(tentativaId: string, questaoId: string, resposta: string) {
  try {
    const supabase = await getSupabase();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabaseAdmin
      .from('respostas_tentativa')
      .upsert({
        tentativa_id: tentativaId,
        questao_id: questaoId,
        resposta: resposta,
        respondida_em: new Date().toISOString()
      }, { onConflict: 'tentativa_id,questao_id' })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao salvar resposta:', error);
    return { data: null, error };
  }
}

export async function finalizarTentativa(tentativaId: string) {
  try {
    const supabase = await getSupabase();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Usuário não autenticado');

    // Buscar tentativa e respostas
    const { data: tentativa } = await supabaseAdmin
      .from('tentativas_prova')
      .select(`
        *,
        prova:provas (
          questoes (
            id,
            pontuacao,
            resposta_correta
          )
        ),
        respostas:respostas_tentativa (
          questao_id,
          resposta
        )
      `)
      .eq('id', tentativaId)
      .eq('aluno_id', user.id)
      .single();

    if (!tentativa) throw new Error('Tentativa não encontrada');

    // Calcular nota
    let notaFinal = 0;
    let totalPontos = 0;

    tentativa.prova.questoes.forEach((questao: any) => {
      totalPontos += questao.pontuacao;
      const resposta = tentativa.respostas.find((r: any) => r.questao_id === questao.id);
      if (resposta && resposta.resposta === questao.resposta_correta) {
        notaFinal += questao.pontuacao;
      }
    });

    const notaPercentual = totalPontos > 0 ? (notaFinal / totalPontos) * 10 : 0;

    // Atualizar tentativa
    const { data, error } = await supabaseAdmin
      .from('tentativas_prova')
      .update({
        finalizada: true,
        finalizada_em: new Date().toISOString(),
        nota_final: notaPercentual,
        tempo_gasto: Math.floor((new Date().getTime() - new Date(tentativa.iniciada_em).getTime()) / 1000)
      })
      .eq('id', tentativaId)
      .select()
      .single();

    if (error) throw error;

    // Sistema RPG: Adicionar XP por completar prova
    try {
      const { addActivityXP, updateStudyStreak } = await import('@/lib/rpg-system')
      const baseXP = 30 // XP base por completar prova
      const notaBonus = Math.floor(notaPercentual) * 2 // Bônus por ponto na nota
      const totalXP = baseXP + notaBonus
      
      const result = await addActivityXP(user.id, 'prova', totalXP)
      
      if (result.levelUp) {
        // Criar achievement de level up
        const { createAchievement } = await import('@/lib/rpg-system')
        await createAchievement(user.id, 'level_up', {
          title: `Nível ${result.newLevel} - Prova`,
          description: `Você alcançou o nível ${result.newLevel} em provas!`,
          icon: '📊',
          xp_reward: 75
        })
      }

      // Achievement para nota alta
      if (notaPercentual >= 8.0) {
        const { createAchievement } = await import('@/lib/rpg-system')
        await createAchievement(user.id, 'high_score', {
          title: 'Nota Alta',
          description: `Você obteve uma nota alta de ${notaPercentual.toFixed(1)}!`,
          icon: '🥇',
          xp_reward: 150
        })
      }

      // Achievement para nota perfeita
      if (notaPercentual >= 9.5) {
        const { createAchievement } = await import('@/lib/rpg-system')
        await createAchievement(user.id, 'perfect_score', {
          title: 'Nota Perfeita',
          description: `Você obteve uma nota perfeita de ${notaPercentual.toFixed(1)}!`,
          icon: '👑',
          xp_reward: 300
        })
      }

      // Atualizar streak de estudo
      await updateStudyStreak(user.id)

      console.log(`🎮 [RPG] XP adicionado por prova: ${totalXP} pontos (nota: ${notaPercentual.toFixed(1)})`)
    } catch (rpgError) {
      console.error("❌ Erro no sistema RPG:", rpgError)
      // Não falhar a operação principal
    }

    return { data, error: null };
  } catch (error) {
    console.error('Erro ao finalizar tentativa:', error);
    return { data: null, error };
  }
}

export async function getTentativasAluno() {
  try {
    console.log('🔍 Iniciando getTentativasAluno...')
    
    // Usar o supabaseAdmin para acessar dados sem autenticação do servidor
    const { data: tentativas, error } = await supabaseAdmin
      .from('tentativas_prova')
      .select(`
        *,
        prova:provas (
          titulo,
          materia,
          dificuldade
        )
      `)
      .order('iniciada_em', { ascending: false });

    if (error) throw error;
    
    console.log('✅ Tentativas encontradas:', tentativas?.length || 0);
    return { data: tentativas, error: null };
  } catch (error) {
    console.error('💥 Erro em getTentativasAluno:', error);
    return { data: null, error };
  }
}

export async function getTentativasProfessor() {
  try {
    console.log('🔍 Iniciando getTentativasProfessor...')
    
    // Usar o supabaseAdmin para acessar dados sem autenticação do servidor
    const { data: tentativas, error } = await supabaseAdmin
      .from('tentativas_prova')
      .select(`
        *,
        prova:provas (
          titulo,
          materia,
          dificuldade
        ),
        aluno:auth.users (
          email
        )
      `)
      .order('iniciada_em', { ascending: false });

    if (error) throw error;
    
    console.log('✅ Tentativas encontradas:', tentativas?.length || 0);
    return { data: tentativas, error: null };
  } catch (error) {
    console.error('💥 Erro em getTentativasProfessor:', error);
    return { data: null, error };
  }
}

export async function adicionarQuestao(provaId: string, questaoData: {
  tipo: 'multipla_escolha' | 'dissertativa' | 'verdadeiro_falso' | 'completar' | 'associacao' | 'ordenacao';
  enunciado: string;
  pontuacao: number;
  ordem: number;
  opcoes?: string[];
  resposta_correta?: string;
  explicacao?: string;
  imagem_url?: string;
  tempo_estimado?: number;
}) {
  try {
    console.log('🔍 Iniciando adicionarQuestao...')
    
    const supabase = await getSupabase();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Erro de autenticação:', authError);
      throw new Error('Usuário não autenticado');
    }

    console.log('✅ Usuário autenticado:', user.email);

    // Inserir questão
    const { data: questao, error: questaoError } = await supabaseAdmin
      .from('questoes')
      .insert({
        prova_id: provaId,
        tipo: questaoData.tipo,
        enunciado: questaoData.enunciado,
        pontuacao: questaoData.pontuacao,
        ordem: questaoData.ordem,
        explicacao: questaoData.explicacao,
        imagem_url: questaoData.imagem_url,
        tempo_estimado: questaoData.tempo_estimado || 60
      })
      .select()
      .single();

    if (questaoError) {
      console.error('Erro ao inserir questão:', questaoError);
      throw questaoError;
    }

    console.log('✅ Questão criada:', questao);

    // Se for múltipla escolha, inserir opções
    if (questaoData.tipo === 'multipla_escolha' && questaoData.opcoes) {
      const opcoesData = questaoData.opcoes.map((opcao, index) => ({
        questao_id: questao.id,
        texto: opcao,
        ordem: index + 1,
        is_correta: opcao === questaoData.resposta_correta
      }));

      const { error: opcoesError } = await supabaseAdmin
        .from('opcoes_questao')
        .insert(opcoesData);

      if (opcoesError) {
        console.error('Erro ao inserir opções:', opcoesError);
        throw opcoesError;
      }

      console.log('✅ Opções inseridas');
    }

    return { data: questao, error: null };
  } catch (error) {
    console.error('Erro ao adicionar questão:', error);
    return { data: null, error };
  }
}

export async function atualizarQuestao(questaoId: string, questaoData: {
  tipo: 'multipla_escolha' | 'dissertativa' | 'verdadeiro_falso' | 'completar' | 'associacao' | 'ordenacao';
  enunciado: string;
  pontuacao: number;
  ordem: number;
  opcoes?: string[];
  resposta_correta?: string;
  explicacao?: string;
  imagem_url?: string;
  tempo_estimado?: number;
}) {
  try {
    const supabase = await getSupabase();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Usuário não autenticado');

    // Atualizar questão
    const { data: questao, error: questaoError } = await supabaseAdmin
      .from('questoes')
      .update({
        tipo: questaoData.tipo,
        enunciado: questaoData.enunciado,
        pontuacao: questaoData.pontuacao,
        ordem: questaoData.ordem,
        explicacao: questaoData.explicacao,
        imagem_url: questaoData.imagem_url,
        tempo_estimado: questaoData.tempo_estimado
      })
      .eq('id', questaoId)
      .select()
      .single();

    if (questaoError) throw questaoError;

    // Deletar opções existentes para todos os tipos que usam opções
    if (['multipla_escolha', 'verdadeiro_falso', 'associacao', 'ordenacao'].includes(questaoData.tipo)) {
      await supabaseAdmin
        .from('opcoes_questao')
        .delete()
        .eq('questao_id', questaoId);
    }

    // Inserir novas opções para tipos que precisam
    if (questaoData.opcoes && questaoData.opcoes.length > 0) {
      const opcoesData = questaoData.opcoes.map((opcao, index) => ({
        questao_id: questaoId,
        texto: opcao,
        ordem: index + 1,
        is_correta: questaoData.tipo === 'multipla_escolha' ? opcao === questaoData.resposta_correta : false
      }));

      const { error: opcoesError } = await supabaseAdmin
        .from('opcoes_questao')
        .insert(opcoesData);

      if (opcoesError) throw opcoesError;
    }

    return { data: questao, error: null };
  } catch (error) {
    console.error('Erro ao atualizar questão:', error);
    return { data: null, error };
  }
}

export async function deletarQuestao(questaoId: string) {
  try {
    const supabase = await getSupabase();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Usuário não autenticado');

    // Deletar opções primeiro
    await supabaseAdmin
      .from('opcoes_questao')
      .delete()
      .eq('questao_id', questaoId);

    // Deletar questão
    const { error } = await supabaseAdmin
      .from('questoes')
      .delete()
      .eq('id', questaoId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar questão:', error);
    return { success: false, error };
  }
}

export async function getQuestoesProva(provaId: string) {
  try {
    const { data: questoes, error } = await supabaseAdmin
      .from('questoes')
      .select(`
        *,
        opcoes_questao (
          id,
          texto,
          is_correta
        )
      `)
      .eq('prova_id', provaId)
      .order('ordem');

    if (error) throw error;
    return { data: questoes, error: null };
  } catch (error) {
    console.error('Erro ao buscar questões da prova:', error);
    return { data: null, error };
  }
}

export async function checkPublishedExams() {
  try {
    console.log('🔍 [DEBUG] Verificando provas publicadas...')
    
    const { data: provas, error } = await supabaseAdmin
      .from('provas')
      .select('*')
      .eq('status', 'publicada');

    if (error) {
      console.error('❌ [DEBUG] Erro ao verificar provas:', error)
      return { data: null, error }
    }
    
    console.log('✅ [DEBUG] Provas publicadas encontradas:', provas?.length || 0)
    provas?.forEach((prova, index) => {
      console.log(`📝 [DEBUG] Prova ${index + 1}:`, {
        id: prova.id,
        titulo: prova.titulo,
        status: prova.status,
        criado_por: prova.criado_por
      })
    })
    
    return { data: provas, error: null };
  } catch (error) {
    console.error('💥 [DEBUG] Erro ao verificar provas:', error);
    return { data: null, error };
  }
}

// Função para atualizar role de outro usuário
export async function updateUserRole(userEmail: string, newRole: "student" | "teacher" | "admin") {
  const supabase = await getSupabase()
  console.log(`🔧 [Server Action] updateUserRole para email: ${userEmail}, Role: ${newRole}`)

  try {
    // Buscar o UUID do usuário pelo email usando uma query direta
    const { data: userData, error: userError } = await supabase
      .from("user_roles")
      .select("user_uuid")
      .eq("user_uuid", userEmail)
      .single()

    if (userError) {
      // Se não encontrar, criar um novo registro
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({ 
          user_uuid: userEmail, 
          role: newRole 
        })

      if (insertError) {
        console.error("[updateUserRole] erro ao inserir:", insertError)
        throw insertError
      }
    } else {
      // Se encontrar, atualizar o role
      const { error: updateError } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_uuid", userEmail)

      if (updateError) {
        console.error("[updateUserRole] erro ao atualizar:", updateError)
        throw updateError
      }
    }

    revalidatePath("/membros")
    return { success: true }
  } catch (error) {
    console.error("[updateUserRole] erro:", error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }
}
