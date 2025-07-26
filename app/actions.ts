"use server"

import { createClient } from "@/lib/supabaseServer"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

/**
 * Obtém uma instância do Supabase (server-side)
 */
async function getSupabase() {
  return createClient()
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
  console.log(`📚 [Server Action] Buscando flashcards para revisão do tópico: ${topicId}`)

  const { data, error } = await supabase
    .from("flashcards")
    .select("id, topic_id, question, answer")
    .eq("topic_id", topicId)
    .limit(limit)

  if (error) {
    console.error("❌ [Server Action] Erro ao buscar flashcards:", error)
    return []
  }

  console.log(`✅ [Server Action] Flashcards encontrados: ${data?.length}`)
  return data || []
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
  // Implementação da submissão
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
      .eq('user_uuid', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("❌ Erro ao buscar redações:", error)
      return []
    }

    const redacoesFormatadas = redacoes?.map(redacao => ({
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
      imagens: [], // Será implementado quando conectarmos as imagens
      comentarios: [],
      aluno_id: redacao.user_uuid,
      professor_id: redacao.professor_uuid
    })) || []

    console.log(`✅ Encontradas ${redacoesFormatadas.length} redações para o usuário`)
    return redacoesFormatadas
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
  const supabase = await getSupabase()
  console.log("✍️ [Server Action] Criando nova redação...")
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    // Buscar o tema selecionado
    const { data: tema } = await supabase
      .from('temas_redacao')
      .select('titulo')
      .eq('id', data.tema_id)
      .single()

    // Criar registro da redação
    const { data: redacao, error: redacaoError } = await supabase
      .from('redacoes')
      .insert({
        user_uuid: user.id,
        titulo: data.titulo,
        tema: tema?.titulo || "Tema não encontrado",
        tema_id: data.tema_id,
        status: 'enviada',
        data_envio: new Date().toISOString(),
        observacoes: data.observacoes
      })
      .select()
      .single()

    if (redacaoError) {
      console.error("❌ Erro ao criar redação:", redacaoError)
      return { success: false, error: "Erro ao criar redação" }
    }

         // Upload das imagens com melhor tratamento
     const imagensUrls = []
     for (let i = 0; i < data.imagens.length; i++) {
       const file = data.imagens[i]
       const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
       const fileName = `redacao-${redacao.id}-pagina-${i + 1}-${Date.now()}.${fileExtension}`
       
       // Verificar tamanho do arquivo (máximo 10MB por imagem)
       if (file.size > 10 * 1024 * 1024) {
         console.error(`❌ Arquivo muito grande: ${file.name} (${file.size} bytes)`)
         continue
       }

       // Verificar tipo do arquivo
       if (!file.type.startsWith('image/')) {
         console.error(`❌ Tipo de arquivo inválido: ${file.type}`)
         continue
       }
       
       const { data: uploadData, error: uploadError } = await supabase.storage
         .from('redacoes')
         .upload(fileName, file, {
           cacheControl: '3600',
           upsert: false
         })

       if (uploadError) {
         console.error(`❌ Erro ao fazer upload da imagem ${i + 1}:`, uploadError)
         // Se falhar o upload, não continuar com as outras
         return { success: false, error: `Erro no upload da imagem ${i + 1}: ${uploadError.message}` }
       }

       const { data: { publicUrl } } = supabase.storage
         .from('redacoes')
         .getPublicUrl(fileName)

       imagensUrls.push({
         url: publicUrl,
         ordem: i + 1,
         rotation: 0,
         file_name: fileName
       })
     }

    // Atualizar redação com URLs das imagens (simplificado)
    if (imagensUrls.length > 0) {
      await supabase
        .from('redacoes')
        .update({ 
          arquivo_url: imagensUrls[0].url, // Primeira imagem como arquivo principal
          imagens_urls: imagensUrls // Array das imagens (campo customizado)
        })
        .eq('id', redacao.id)
    }

    console.log(`✅ Redação criada com sucesso - ID: ${redacao.id}`)
    revalidatePath("/redacao")
    
    return { 
      success: true, 
      redacao: { 
        ...redacao, 
        imagens: imagensUrls.map((img, index) => ({
          id: index + 1,
          redacao_id: redacao.id,
          url: img.url,
          ordem: img.ordem,
          rotation: img.rotation
        }))
      } 
    }
  } catch (error) {
    console.error("❌ Erro inesperado ao criar redação:", error)
    return { success: false, error: "Erro inesperado" }
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
  console.log("👩‍🏫 [Server Action] Buscando redações do professor...")

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
  const supabase = await getSupabase()
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
    revalidatePath("/teacher")
    
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
    revalidatePath("/teacher")
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
    const userRole = await getUserRoleServer(user.id)
    if (userRole !== 'teacher' && userRole !== 'admin') {
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

    // Criar notificação para o aluno
    const { data: redacao } = await supabase
      .from('redacoes')
      .select('user_uuid, titulo')
      .eq('id', data.redacaoId)
      .single()

    if (redacao) {
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
    revalidatePath("/teacher")
    
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
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Login error:", error)
    redirect("/login?message=Could not authenticate user")
  }

  revalidatePath("/", "layout")
  redirect("/")
}

export async function signup(formData: FormData) {
  const origin = headers().get("origin")
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error("Signup error:", error)
    redirect("/signup?message=Could not authenticate user")
  }

  redirect("/signup?message=Check email to verify account")
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Logout error:", error)
    // Optionally, handle the error more gracefully, e.g., show a toast
  }

  revalidatePath("/", "layout")
  redirect("/login")
}

export async function getUserRole() {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error("Error getting user:", userError)
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_role")
    .eq("user_uuid", user.id)
    .single()

  if (profileError) {
    console.error("Error getting user role from profile:", profileError)
    return null
  }

  return profile?.user_role || null
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
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_uuid", userUuid).single()
  if (error) return null
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

    revalidatePath("/teacher")
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

    // Verificar se aluno já existe
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(data.email)
    
    let alunoId: string
    
    if (existingUser.user) {
      // Usuário já existe
      alunoId = existingUser.user.id
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
        escola: 'A definir',
        ano_escolar: '3ano' // padrão
      })
    }

    // Vincular aluno à turma
    const { error: vinculoError } = await supabase
      .from('alunos_turmas')
      .insert({
        user_uuid: alunoId,
        turma_id: data.turmaId
      })
      .on('conflict', { do: 'nothing' }) // Ignora se já existe

    if (vinculoError) {
      console.error("❌ Erro ao vincular aluno:", vinculoError)
      return { success: false, error: "Erro ao vincular aluno à turma" }
    }

    // Integração Google Drive removida - usando apenas Supabase Storage

    console.log(`✅ Aluno ${data.nomeCompleto} vinculado à turma ${turma.nome}`)

    revalidatePath("/teacher")
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
      nome: item.student_profiles?.nome_completo || 'Nome não definido',
      escola: item.student_profiles?.escola || 'Escola não definida',
      ano_escolar: item.student_profiles?.ano_escolar || '3ano',
      data_entrada: item.data_entrada
    })) || []

    console.log(`✅ Encontrados ${alunosFormatados.length} alunos`)
    return { success: true, alunos: alunosFormatados }
  } catch (error) {
    console.error("❌ Erro inesperado:", error)
    return { success: false, error: "Erro inesperado" }
  }
}
