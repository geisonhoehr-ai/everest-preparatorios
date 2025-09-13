"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { supabaseAdmin } from '@/lib/supabaseServer'
import { createClient } from '@/lib/supabase-server'
import { getCache, setCache } from '@/lib/cache'

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

  const offset = 0 // Sempre começar do início para revisão

  const { data, error } = await supabase
    .from("flashcards")
    .select("id, topic_id, question, answer")
    .eq("topic_id", topicId)
    .order("id", { ascending: false })
    .range(offset, offset + limit - 1)

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
    return { success: false, error: error.message }
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
    return { success: false, error: error.message }
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
    return { success: false, error: error.message }
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
      .eq('user_uuid', user.email)
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
      user_uuid: user.email,
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
    .eq("user_uuid", user.email)
    .single()

  return data?.role || "student"
}

export async function getAllSubjects() {
  console.log("🔍 [Server Action] getAllSubjects() iniciada")
  const supabase = await getSupabase()
  console.log("🔍 [Server Action] Supabase client obtido")
  
  try {
    // Verificar cache primeiro
    const cacheKey = 'subjects:all'
    const cached = await getCache(cacheKey)
    
    if (cached) {
      console.log("✅ [Server Action] Usando cache para subjects")
      return cached
    }
    
    const { data, error } = await supabase.from("subjects").select("id, name").order("name")
    console.log("🔍 [Server Action] Query executada, data:", data, "error:", error)
    
    if (error) {
      console.error("❌ [Server Action] Erro ao buscar matérias:", error)
      return []
    }
    
    console.log("✅ [Server Action] Matérias encontradas:", data)
    
    // Salvar no cache por 10 minutos
    await setCache(cacheKey, data, 10 * 60)
    
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

// Função para buscar questões de quiz por quiz_id
export async function getAllQuizzesByTopic(quizId: string) {
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

// Função para criar uma nova questão de quiz
export async function createQuiz(userId: string, quizData: {
  quiz_id: string
  question_text: string
  options: string[]
  correct_answer: string
  explanation: string
}) {
  const supabase = await getSupabase()
  console.log(`📝 [Server Action] Criando questão de quiz para quiz: ${quizData.quiz_id}`)

  const { data, error } = await supabase
    .from("quiz_questions")
    .insert({
      quiz_id: quizData.quiz_id,
      question_text: quizData.question_text,
      options: quizData.options,
      correct_answer: quizData.correct_answer,
      explanation: quizData.explanation
    })
    .select()
    .single()

  if (error) {
    console.error("❌ [Server Action] Erro ao criar questão de quiz:", error)
    return { success: false, error: error.message }
  }

  console.log(`✅ [Server Action] Questão de quiz criada: ${data.id}`)
  revalidatePath("/quiz")
  return { success: true, data }
}

// Função para atualizar uma questão de quiz
export async function updateQuiz(userId: string, quizId: string, updateData: {
  question_text: string
  options: string[]
  correct_answer: string
  explanation: string
}) {
  const supabase = await getSupabase()
  console.log(`📝 [Server Action] Atualizando questão de quiz: ${quizId}`)

  const { data, error } = await supabase
    .from("quiz_questions")
    .update({
      question_text: updateData.question_text,
      options: updateData.options,
      correct_answer: updateData.correct_answer,
      explanation: updateData.explanation
    })
    .eq("id", quizId)
    .select()
    .single()

  if (error) {
    console.error("❌ [Server Action] Erro ao atualizar questão de quiz:", error)
    return { success: false, error: error.message }
  }

  console.log(`✅ [Server Action] Questão de quiz atualizada: ${data.id}`)
  revalidatePath("/quiz")
  return { success: true, data }
}

// Função para deletar uma questão de quiz
export async function deleteQuiz(userId: string, quizId: string) {
  const supabase = await getSupabase()
  console.log(`🗑️ [Server Action] Deletando questão de quiz: ${quizId}`)

  const { error } = await supabase
    .from("quiz_questions")
    .delete()
    .eq("id", quizId)

  if (error) {
    console.error("❌ [Server Action] Erro ao deletar questão de quiz:", error)
    return { success: false, error: error.message }
  }

  console.log(`✅ [Server Action] Questão de quiz deletada: ${quizId}`)
  revalidatePath("/quiz")
  return { success: true }
}

// Função para criar um novo tópico
export async function createTopic(userId: string, topicData: {
  subject_id: number
  name: string
  description: string
}) {
  const supabase = await getSupabase()
  console.log(`📝 [Server Action] Criando tópico: ${topicData.name}`)

  const { data, error } = await supabase
    .from("topics")
    .insert({
      subject_id: topicData.subject_id,
      name: topicData.name,
      description: topicData.description
    })
    .select()
    .single()

  if (error) {
    console.error("❌ [Server Action] Erro ao criar tópico:", error)
    return { success: false, error: error.message }
  }

  console.log(`✅ [Server Action] Tópico criado: ${data.id}`)
  revalidatePath("/quiz")
  return { success: true, data }
}

// Função para atualizar um tópico
export async function updateTopic(userId: string, topicId: string, updateData: {
  name: string
  description: string
}) {
  const supabase = await getSupabase()
  console.log(`📝 [Server Action] Atualizando tópico: ${topicId}`)

  const { data, error } = await supabase
    .from("topics")
    .update({
      name: updateData.name,
      description: updateData.description
    })
    .eq("id", topicId)
    .select()
    .single()

  if (error) {
    console.error("❌ [Server Action] Erro ao atualizar tópico:", error)
    return { success: false, error: error.message }
  }

  console.log(`✅ [Server Action] Tópico atualizado: ${data.id}`)
  revalidatePath("/quiz")
  return { success: true, data }
}

// Função para deletar um tópico
export async function deleteTopic(userId: string, topicId: string) {
  const supabase = await getSupabase()
  console.log(`🗑️ [Server Action] Deletando tópico: ${topicId}`)

  const { error } = await supabase
    .from("topics")
    .delete()
    .eq("id", topicId)

  if (error) {
    console.error("❌ [Server Action] Erro ao deletar tópico:", error)
    return { success: false, error: error.message }
  }

  console.log(`✅ [Server Action] Tópico deletado: ${topicId}`)
  revalidatePath("/quiz")
  return { success: true }
}

// Função para atualizar progresso do quiz
export async function updateQuizProgress(
  userId: string,
  quizId: string,
  correctAnswers: number,
  totalQuestions: number,
  timeSpent: number
) {
  const supabase = await getSupabase()
  console.log(`📊 [Server Action] Atualizando progresso do quiz para usuário: ${userId}`)

  try {
    // Calcular XP baseado na performance
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
    const baseXP = Math.floor(accuracy / 10) * 10 // 10 XP por 10% de acerto
    const timeBonus = timeSpent > 0 ? Math.max(0, 5 - Math.floor(timeSpent / 60)) : 0 // Bônus por velocidade
    const xpGained = baseXP + timeBonus

    // Inserir ou atualizar progresso
    const { data, error } = await supabase
      .from("user_progress")
      .upsert({
        user_id: userId,
        quiz_id: quizId,
        correct_answers: correctAnswers,
        total_questions: totalQuestions,
        accuracy: accuracy,
        time_spent: timeSpent,
        xp_gained: xpGained,
        last_attempt: new Date().toISOString()
      }, { onConflict: 'user_id,quiz_id' })
      .select()
      .single()

    if (error) {
      console.error("❌ [Server Action] Erro ao atualizar progresso:", error)
      return { success: false, error: error.message }
    }

    console.log(`✅ [Server Action] Progresso atualizado: +${xpGained} XP`)
    revalidatePath("/quiz")
    return { success: true, xpGained, data }
  } catch (error) {
    console.error("❌ [Server Action] Erro inesperado ao atualizar progresso:", error)
    return { success: false, error: "Erro inesperado" }
  }
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
    if (userRole !== 'teacher') {
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
    if (userRole !== 'teacher') {
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
    const { data: existingUser } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', data.email)
      .single()
    
    let alunoId: string
    
    if (existingUser) {
      // Usuário já existe
      alunoId = existingUser.id
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
    
    if (!supabaseAdmin) {
      throw new Error('Supabase Admin não está configurado')
    }
    
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
    
    if (!supabaseAdmin) {
      throw new Error('Supabase Admin não está configurado')
    }
    
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
    
    if (!supabaseAdmin) {
      throw new Error('Supabase Admin não está configurado')
    }
    
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
    if (!supabaseAdmin) {
      throw new Error('Supabase admin não disponível');
    }
    
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
    if (!supabaseAdmin) {
      throw new Error('Supabase admin não disponível');
    }
    
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
    if (!supabaseAdmin) {
      throw new Error('Supabase admin não disponível');
    }
    
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
    if (!supabaseAdmin) {
      throw new Error('Supabase admin não disponível');
    }
    
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
    if (!supabaseAdmin) {
      throw new Error('Supabase admin não disponível');
    }
    
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
    if (!supabaseAdmin) {
      throw new Error('Supabase admin não disponível');
    }
    
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
    if (!supabaseAdmin) {
      throw new Error('Supabase admin não disponível');
    }
    
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
    if (!supabaseAdmin) {
      throw new Error('Supabase admin não disponível');
    }
    
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
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao finalizar tentativa:', error);
    return { data: null, error };
  }
}

export async function getTentativasAluno() {
  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin não disponível');
    }
    
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
    if (!supabaseAdmin) {
      throw new Error('Supabase admin não disponível');
    }
    
    console.log('🔍 Iniciando getTentativasProfessor...')
    
    // Usar o supabaseAdmin para acessar dados sem autenticação do servidor
    const { data: tentativas, error } = await supabaseAdmin
      .from('tentativas_prova')
      .select('*')
    
    if (error) {
      console.error('❌ Erro ao buscar tentativas:', error)
      throw error
    }

    console.log('✅ Tentativas encontradas:', tentativas?.length)
    return tentativas || []
  } catch (error) {
    console.error('❌ Erro em getTentativasProfessor:', error)
    throw error
  }
}

// Funções para Dashboard - Dados Reais
export async function getTotalUsers() {
  try {
    const supabase = await getSupabase()
    const { count, error } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('❌ Erro ao contar usuários:', error)
      return { count: 0 }
    }

    return { count: count || 0 }
  } catch (error) {
    console.error('❌ Erro inesperado ao contar usuários:', error)
    return { count: 0 }
  }
}

export async function getTotalContent() {
  try {
    const supabase = await getSupabase()
    
    const [flashcardsResult, quizzesResult, coursesResult] = await Promise.all([
      supabase.from('flashcards').select('*', { count: 'exact', head: true }),
      supabase.from('quizzes').select('*', { count: 'exact', head: true }),
      supabase.from('audio_courses').select('*', { count: 'exact', head: true })
    ])
    
    const total = (flashcardsResult.count || 0) + 
                  (quizzesResult.count || 0) + 
                  (coursesResult.count || 0)

    return { count: total }
  } catch (error) {
    console.error('❌ Erro inesperado ao contar conteúdo:', error)
    return { count: 0 }
  }
}

export async function getTotalTests() {
  try {
    const supabase = await getSupabase()
    const { count, error } = await supabase
      .from('quiz_attempts')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('❌ Erro ao contar tentativas de quiz:', error)
      return { count: 0 }
    }

    return { count: count || 0 }
  } catch (error) {
    console.error('❌ Erro inesperado ao contar tentativas:', error)
    return { count: 0 }
  }
}

export async function getUserRanking(userId: string) {
  try {
    const supabase = await getSupabase()
    const { data, error } = await supabase
      .from('user_progress')
      .select('rank_position')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('❌ Erro ao buscar ranking do usuário:', error)
      return { position: 'N/A' }
    }

    return { position: data?.rank_position || 'N/A' }
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar ranking:', error)
    return { position: 'N/A' }
  }
}

export async function getCalendarEvents() {
  try {
    const supabase = await getSupabase()
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })

    if (error) {
      console.error('❌ Erro ao carregar eventos:', error)
      return []
    }

    // Mapear os campos da tabela real para o formato esperado pelo frontend
    const mappedEvents = (data || []).map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.event_date,
      time: event.event_time,
      location: event.location,
      type: event.event_type,
      participants: event.max_participants || 0,
      duration_minutes: event.duration_minutes,
      instructor: event.instructor,
      is_mandatory: event.is_mandatory
    }))

    return mappedEvents
  } catch (error) {
    console.error('❌ Erro inesperado ao carregar eventos:', error)
    return []
  }
}

// Alias para compatibilidade
export const getAllCalendarEvents = getCalendarEvents

export async function importEaofCronograma(userId: string) {
  try {
    const supabase = await getSupabase()
    
    // Verificar se o usuário tem permissão
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', userId)
      .single()

    if (!profile || !['admin', 'teacher'].includes(profile.role)) {
      throw new Error('Acesso negado. Apenas professores e administradores podem importar cronogramas.')
    }

    // Dados do cronograma EAOF 2026
    const cronogramaEvents = [
      // MENTORIAS
      { title: 'Mentoria 01 - Aula Inaugural', description: 'Aula inaugural do curso EAOF 2026', event_date: '2026-05-26', event_time: '19:00:00', event_type: 'mentoria', duration_minutes: 120, instructor: 'Equipe Everest', location: 'Sala Virtual', is_mandatory: true, max_participants: 100 },
      { title: 'Mentoria 02 - Acentuação Gráfica, Ortografia, Estrutura e Formação', description: 'Revisão completa de acentuação gráfica e ortografia', event_date: '2026-06-02', event_time: '19:00:00', event_type: 'mentoria', duration_minutes: 120, instructor: 'Prof. Português', location: 'Sala Virtual', is_mandatory: true, max_participants: 100 },
      { title: 'Mentoria 03 - Substantivo, Adjetivo e Artigo', description: 'Estudo detalhado de substantivos, adjetivos e artigos', event_date: '2026-06-16', event_time: '19:00:00', event_type: 'mentoria', duration_minutes: 120, instructor: 'Prof. Português', location: 'Sala Virtual', is_mandatory: true, max_participants: 100 },
      { title: 'Mentoria 04 - Pronomes, Numeral, Advérbio e Preposição', description: 'Revisão de pronomes, numerais, advérbios e preposições', event_date: '2026-06-30', event_time: '19:00:00', event_type: 'mentoria', duration_minutes: 120, instructor: 'Prof. Português', location: 'Sala Virtual', is_mandatory: true, max_participants: 100 },
      { title: 'Mentoria 05 - Conjunções', description: 'Estudo completo das conjunções', event_date: '2026-07-14', event_time: '19:00:00', event_type: 'mentoria', duration_minutes: 120, instructor: 'Prof. Português', location: 'Sala Virtual', is_mandatory: true, max_participants: 100 },
      { title: 'Mentoria 06 - Verbo', description: 'Revisão detalhada de verbos', event_date: '2026-08-11', event_time: '19:00:00', event_type: 'mentoria', duration_minutes: 120, instructor: 'Prof. Português', location: 'Sala Virtual', is_mandatory: true, max_participants: 100 },
      { title: 'Mentoria 07 - Sintaxe: Período Simples', description: 'Estudo da sintaxe do período simples', event_date: '2026-08-25', event_time: '19:00:00', event_type: 'mentoria', duration_minutes: 120, instructor: 'Prof. Português', location: 'Sala Virtual', is_mandatory: true, max_participants: 100 },
      { title: 'Mentoria 08 - Período Composto e Pontuação', description: 'Sintaxe do período composto e pontuação', event_date: '2026-09-22', event_time: '19:00:00', event_type: 'mentoria', duration_minutes: 120, instructor: 'Prof. Português', location: 'Sala Virtual', is_mandatory: true, max_participants: 100 },
      { title: 'Mentoria 09 - Sintaxe de Colocação de Concordância', description: 'Concordância verbal e nominal', event_date: '2026-10-06', event_time: '19:00:00', event_type: 'mentoria', duration_minutes: 120, instructor: 'Prof. Português', location: 'Sala Virtual', is_mandatory: true, max_participants: 100 },
      { title: 'Mentoria 10 - Regência e Crase', description: 'Regência verbal, nominal e uso da crase', event_date: '2026-11-03', event_time: '19:00:00', event_type: 'mentoria', duration_minutes: 120, instructor: 'Prof. Português', location: 'Sala Virtual', is_mandatory: true, max_participants: 100 },
      { title: 'Mentoria 11 - Compreensão Interpretação', description: 'Técnicas de compreensão e interpretação de texto', event_date: '2026-11-17', event_time: '19:00:00', event_type: 'mentoria', duration_minutes: 120, instructor: 'Prof. Português', location: 'Sala Virtual', is_mandatory: true, max_participants: 100 },
      { title: 'Mentoria 12 - Tipos e Gêneros', description: 'Tipos textuais e gêneros literários', event_date: '2026-12-01', event_time: '19:00:00', event_type: 'mentoria', duration_minutes: 120, instructor: 'Prof. Português', location: 'Sala Virtual', is_mandatory: true, max_participants: 100 },
      { title: 'Mentoria 13 - Coesão e Coerência', description: 'Elementos de coesão e coerência textual', event_date: '2026-12-15', event_time: '19:00:00', event_type: 'mentoria', duration_minutes: 120, instructor: 'Prof. Português', location: 'Sala Virtual', is_mandatory: true, max_participants: 100 },
      { title: 'Mentoria 14 - Denotação, Conotação e Análise do Discurso', description: 'Denotação, conotação e análise do discurso', event_date: '2027-01-12', event_time: '19:00:00', event_type: 'mentoria', duration_minutes: 120, instructor: 'Prof. Português', location: 'Sala Virtual', is_mandatory: true, max_participants: 100 },
      { title: 'Mentoria 15 - Live Final', description: 'Aula final de revisão geral', event_date: '2027-01-26', event_time: '19:00:00', event_type: 'mentoria', duration_minutes: 120, instructor: 'Equipe Everest', location: 'Sala Virtual', is_mandatory: true, max_participants: 100 },
      
      // SIMULADOS
      { title: 'Simulado 01 - Diagnóstico', description: 'Simulado diagnóstico para avaliar conhecimentos iniciais', event_date: '2026-05-29', event_time: '14:00:00', event_type: 'simulado', duration_minutes: 240, instructor: 'Equipe Everest', location: 'Sala Virtual', is_mandatory: true, max_participants: 100 },
      { title: 'Simulado 02 - Conteúdo das Mentorias 2 e 3', description: 'Simulado sobre acentuação, ortografia, substantivos e adjetivos', event_date: '2026-06-28', event_time: '14:00:00', event_type: 'simulado', duration_minutes: 240, instructor: 'Equipe Everest', location: 'Sala Virtual', is_mandatory: true, max_participants: 100 },
      { title: 'Simulado 03 - Conteúdo das Mentorias 2, 3, 4 e 5', description: 'Simulado sobre morfologia completa', event_date: '2026-07-29', event_time: '14:00:00', event_type: 'simulado', duration_minutes: 240, instructor: 'Equipe Everest', location: 'Sala Virtual', is_mandatory: true, max_participants: 100 },
      { title: 'Simulado 04 - Conteúdo das Mentorias 2, 3, 4, 5 e 6', description: 'Simulado sobre morfologia e verbos', event_date: '2026-08-29', event_time: '14:00:00', event_type: 'simulado', duration_minutes: 240, instructor: 'Equipe Everest', location: 'Sala Virtual', is_mandatory: true, max_participants: 100 },
      { title: 'Simulado 05 - Conteúdo das Mentorias 2, 3, 4, 5, 6, 7 e 8', description: 'Simulado sobre morfologia e sintaxe básica', event_date: '2026-09-28', event_time: '14:00:00', event_type: 'simulado', duration_minutes: 240, instructor: 'Equipe Everest', location: 'Sala Virtual', is_mandatory: true, max_participants: 100 },
      { title: 'Simulado 06 - Conteúdo das Mentorias 2, 3, 4, 5, 6, 7, 8 e 9', description: 'Simulado sobre morfologia, sintaxe e concordância', event_date: '2026-10-29', event_time: '14:00:00', event_type: 'simulado', duration_minutes: 240, instructor: 'Equipe Everest', location: 'Sala Virtual', is_mandatory: true, max_participants: 100 },
      { title: 'Simulado 07 - Conteúdo das Mentorias 2 a 11', description: 'Simulado sobre morfologia, sintaxe e interpretação', event_date: '2026-11-28', event_time: '14:00:00', event_type: 'simulado', duration_minutes: 240, instructor: 'Equipe Everest', location: 'Sala Virtual', is_mandatory: true, max_participants: 100 },
      { title: 'Simulado 08 - Conteúdo das Mentorias 2 a 13', description: 'Simulado sobre todo conteúdo até coesão e coerência', event_date: '2026-12-29', event_time: '14:00:00', event_type: 'simulado', duration_minutes: 240, instructor: 'Equipe Everest', location: 'Sala Virtual', is_mandatory: true, max_participants: 100 },
      { title: 'Simulado 09 - Conteúdo das Mentorias 2 a 14', description: 'Simulado sobre todo conteúdo até análise do discurso', event_date: '2027-01-29', event_time: '14:00:00', event_type: 'simulado', duration_minutes: 240, instructor: 'Equipe Everest', location: 'Sala Virtual', is_mandatory: true, max_participants: 100 },
      { title: 'Simulado 10 - TODO CONTEÚDO', description: 'Simulado final com todo o conteúdo do curso', event_date: '2027-02-15', event_time: '14:00:00', event_type: 'simulado', duration_minutes: 240, instructor: 'Equipe Everest', location: 'Sala Virtual', is_mandatory: true, max_participants: 100 },
      
      // RESOLUÇÕES
      { title: 'Resolução 01 - Simulado Diagnóstico', description: 'Resolução comentada do simulado diagnóstico', event_date: '2026-05-31', event_time: '19:00:00', event_type: 'resolucao', duration_minutes: 120, instructor: 'Equipe Everest', location: 'Sala Virtual', is_mandatory: false, max_participants: 100 },
      { title: 'Resolução 02 - Simulado Mentorias 2 e 3', description: 'Resolução comentada do simulado 02', event_date: '2026-06-29', event_time: '19:00:00', event_type: 'resolucao', duration_minutes: 120, instructor: 'Equipe Everest', location: 'Sala Virtual', is_mandatory: false, max_participants: 100 },
      { title: 'Resolução 03 - Simulado Mentorias 2 a 5', description: 'Resolução comentada do simulado 03', event_date: '2026-07-31', event_time: '19:00:00', event_type: 'resolucao', duration_minutes: 120, instructor: 'Equipe Everest', location: 'Sala Virtual', is_mandatory: false, max_participants: 100 },
      { title: 'Resolução 04 - Simulado Mentorias 2 a 6', description: 'Resolução comentada do simulado 04', event_date: '2026-08-31', event_time: '19:00:00', event_type: 'resolucao', duration_minutes: 120, instructor: 'Equipe Everest', location: 'Sala Virtual', is_mandatory: false, max_participants: 100 },
      { title: 'Resolução 05 - Simulado Mentorias 2 a 8', description: 'Resolução comentada do simulado 05', event_date: '2026-09-30', event_time: '19:00:00', event_type: 'resolucao', duration_minutes: 120, instructor: 'Equipe Everest', location: 'Sala Virtual', is_mandatory: false, max_participants: 100 },
      { title: 'Resolução 06 - Simulado Mentorias 2 a 9', description: 'Resolução comentada do simulado 06', event_date: '2026-10-31', event_time: '19:00:00', event_type: 'resolucao', duration_minutes: 120, instructor: 'Equipe Everest', location: 'Sala Virtual', is_mandatory: false, max_participants: 100 },
      { title: 'Resolução 07 - Simulado Mentorias 2 a 11', description: 'Resolução comentada do simulado 07', event_date: '2026-11-30', event_time: '19:00:00', event_type: 'resolucao', duration_minutes: 120, instructor: 'Equipe Everest', location: 'Sala Virtual', is_mandatory: false, max_participants: 100 },
      { title: 'Resolução 08 - Simulado Mentorias 2 a 13', description: 'Resolução comentada do simulado 08', event_date: '2026-12-31', event_time: '19:00:00', event_type: 'resolucao', duration_minutes: 120, instructor: 'Equipe Everest', location: 'Sala Virtual', is_mandatory: false, max_participants: 100 },
      { title: 'Resolução 09 - Simulado Mentorias 2 a 14', description: 'Resolução comentada do simulado 09', event_date: '2027-01-31', event_time: '19:00:00', event_type: 'resolucao', duration_minutes: 120, instructor: 'Equipe Everest', location: 'Sala Virtual', is_mandatory: false, max_participants: 100 },
      
      // ENTREGAS DE REDAÇÃO
      { title: 'Entrega TEMA 01', description: 'Entrega da redação do tema 01', event_date: '2026-06-15', event_time: '23:59:00', event_type: 'entrega', duration_minutes: 0, instructor: 'Prof. Redação', location: 'Plataforma', is_mandatory: true, max_participants: 100 },
      { title: 'Recebimento TEMA 01', description: 'Recebimento da correção da redação tema 01', event_date: '2026-06-22', event_time: '18:00:00', event_type: 'recebimento', duration_minutes: 0, instructor: 'Prof. Redação', location: 'Plataforma', is_mandatory: false, max_participants: 100 },
      { title: 'Entrega TEMA 02', description: 'Entrega da redação do tema 02', event_date: '2026-07-15', event_time: '23:59:00', event_type: 'entrega', duration_minutes: 0, instructor: 'Prof. Redação', location: 'Plataforma', is_mandatory: true, max_participants: 100 },
      { title: 'Recebimento TEMA 02', description: 'Recebimento da correção da redação tema 02', event_date: '2026-07-22', event_time: '18:00:00', event_type: 'recebimento', duration_minutes: 0, instructor: 'Prof. Redação', location: 'Plataforma', is_mandatory: false, max_participants: 100 },
      { title: 'Entrega TEMA 03', description: 'Entrega da redação do tema 03', event_date: '2026-08-15', event_time: '23:59:00', event_type: 'entrega', duration_minutes: 0, instructor: 'Prof. Redação', location: 'Plataforma', is_mandatory: true, max_participants: 100 },
      { title: 'Recebimento TEMA 03', description: 'Recebimento da correção da redação tema 03', event_date: '2026-08-22', event_time: '18:00:00', event_type: 'recebimento', duration_minutes: 0, instructor: 'Prof. Redação', location: 'Plataforma', is_mandatory: false, max_participants: 100 },
      { title: 'Entrega TEMA 04', description: 'Entrega da redação do tema 04', event_date: '2026-09-15', event_time: '23:59:00', event_type: 'entrega', duration_minutes: 0, instructor: 'Prof. Redação', location: 'Plataforma', is_mandatory: true, max_participants: 100 },
      { title: 'Recebimento TEMA 04', description: 'Recebimento da correção da redação tema 04', event_date: '2026-09-22', event_time: '18:00:00', event_type: 'recebimento', duration_minutes: 0, instructor: 'Prof. Redação', location: 'Plataforma', is_mandatory: false, max_participants: 100 },
      { title: 'Entrega TEMA 05', description: 'Entrega da redação do tema 05', event_date: '2026-10-15', event_time: '23:59:00', event_type: 'entrega', duration_minutes: 0, instructor: 'Prof. Redação', location: 'Plataforma', is_mandatory: true, max_participants: 100 },
      { title: 'Recebimento TEMA 05', description: 'Recebimento da correção da redação tema 05', event_date: '2026-10-22', event_time: '18:00:00', event_type: 'recebimento', duration_minutes: 0, instructor: 'Prof. Redação', location: 'Plataforma', is_mandatory: false, max_participants: 100 }
    ]

    // Inserir todos os eventos
    const { data, error } = await supabase
      .from('calendar_events')
      .insert(cronogramaEvents.map(event => ({
        ...event,
        created_by: userId
      })))

    if (error) {
      console.error('❌ Erro ao importar cronograma:', error)
      throw error
    }

    console.log(`✅ Cronograma EAOF 2026 importado com sucesso! ${cronogramaEvents.length} eventos criados.`)
    return { success: true, count: cronogramaEvents.length }
  } catch (error) {
    console.error('❌ Erro inesperado ao importar cronograma:', error)
    throw error
  }
}

// ===== GESTÃO DE MEMBROS/ALUNOS =====

export async function getAllMembers() {
  try {
    const supabase = await getSupabase()
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        classes(name),
        student_subscriptions(
          id,
          access_plan_id,
          class_id,
          start_date,
          end_date,
          is_active,
          access_plans(id, name, duration_months, features),
          classes(name)
        )
      `)
      .eq('role', 'student')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro ao carregar membros:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('❌ Erro inesperado ao carregar membros:', error)
    return []
  }
}

export async function getAllClasses() {
  try {
    const supabase = await getSupabase()
    
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('❌ Erro ao carregar turmas:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('❌ Erro inesperado ao carregar turmas:', error)
    return []
  }
}

export async function getAllAccessPlans() {
  try {
    const supabase = await getSupabase()
    
    const { data, error } = await supabase
      .from('access_plans')
      .select('*')
      .eq('is_active', true)
      .order('duration_months', { ascending: true })

    if (error) {
      console.error('❌ Erro ao carregar planos de acesso:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('❌ Erro inesperado ao carregar planos de acesso:', error)
    return []
  }
}

export async function createMember(memberData: {
  email: string
  name: string
  class_id?: string
  access_plan_id: string
  start_date: string
  end_date: string
  page_permissions: Record<string, boolean>
}, createdBy: string) {
  try {
    const supabase = await getSupabase()
    
    // Verificar se o usuário tem permissão
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', createdBy)
      .single()

    if (!profile || !['admin', 'teacher'].includes(profile.role)) {
      throw new Error('Acesso negado. Apenas professores e administradores podem criar membros.')
    }

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: memberData.email,
      password: generateTemporaryPassword(),
      email_confirm: true
    })

    if (authError || !authData.user) {
      throw new Error('Erro ao criar usuário: ' + (authError?.message || 'Usuário não criado'))
    }

    const userId = authData.user.id

    // Criar perfil do usuário
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        name: memberData.name,
        email: memberData.email,
        role: 'student',
        class_id: memberData.class_id,
        access_expires_at: memberData.end_date,
        must_change_password: true,
        created_by: createdBy
      })

    if (profileError) {
      // Se falhar, deletar o usuário criado
      await supabase.auth.admin.deleteUser(userId)
      throw new Error('Erro ao criar perfil: ' + profileError.message)
    }

    // Criar assinatura
    const { error: subscriptionError } = await supabase
      .from('student_subscriptions')
      .insert({
        user_id: userId,
        access_plan_id: memberData.access_plan_id,
        class_id: memberData.class_id,
        start_date: memberData.start_date,
        end_date: memberData.end_date,
        created_by: createdBy
      })

    if (subscriptionError) {
      console.error('Erro ao criar assinatura:', subscriptionError)
    }

    // Criar permissões de página
    const pagePermissions = Object.entries(memberData.page_permissions).map(([page, hasAccess]) => ({
      user_id: userId,
      page_name: page,
      has_access: hasAccess,
      granted_by: createdBy,
      expires_at: memberData.end_date
    }))

    if (pagePermissions.length > 0) {
      const { error: permissionsError } = await supabase
        .from('page_permissions')
        .insert(pagePermissions)

      if (permissionsError) {
        console.error('Erro ao criar permissões:', permissionsError)
      }
    }

    // Criar senha provisória
    const tempPassword = generateTemporaryPassword()
    const { error: tempPasswordError } = await supabase
      .from('temporary_passwords')
      .insert({
        user_id: userId,
        temporary_password: tempPassword,
        created_by: createdBy
      })

    if (tempPasswordError) {
      console.error('Erro ao criar senha provisória:', tempPasswordError)
    }

    console.log(`✅ Membro criado com sucesso: ${memberData.name} (${memberData.email})`)
    return { 
      success: true, 
      userId, 
      temporaryPassword: tempPassword,
      message: 'Membro criado com sucesso!'
    }
  } catch (error) {
    console.error('❌ Erro ao criar membro:', error)
    throw error
  }
}

export async function updateMember(memberId: string, updateData: {
  name?: string
  class_id?: string
  access_plan_id?: string
  start_date?: string
  end_date?: string
  page_permissions?: Record<string, boolean>
}, updatedBy: string) {
  try {
    const supabase = await getSupabase()
    
    // Verificar se o usuário tem permissão
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', updatedBy)
      .single()

    if (!profile || !['admin', 'teacher'].includes(profile.role)) {
      throw new Error('Acesso negado. Apenas professores e administradores podem editar membros.')
    }

    // Atualizar perfil
    const profileUpdate: any = {}
    if (updateData.name) profileUpdate.name = updateData.name
    if (updateData.class_id !== undefined) profileUpdate.class_id = updateData.class_id
    if (updateData.end_date) profileUpdate.access_expires_at = updateData.end_date

    if (Object.keys(profileUpdate).length > 0) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update(profileUpdate)
        .eq('user_id', memberId)

      if (profileError) {
        throw new Error('Erro ao atualizar perfil: ' + profileError.message)
      }
    }

    // Atualizar assinatura se necessário
    if (updateData.access_plan_id || updateData.start_date || updateData.end_date) {
      const subscriptionUpdate: any = {}
      if (updateData.access_plan_id) subscriptionUpdate.access_plan_id = updateData.access_plan_id
      if (updateData.class_id !== undefined) subscriptionUpdate.class_id = updateData.class_id
      if (updateData.start_date) subscriptionUpdate.start_date = updateData.start_date
      if (updateData.end_date) subscriptionUpdate.end_date = updateData.end_date

      const { error: subscriptionError } = await supabase
        .from('student_subscriptions')
        .update(subscriptionUpdate)
        .eq('user_id', memberId)
        .eq('is_active', true)

      if (subscriptionError) {
        console.error('Erro ao atualizar assinatura:', subscriptionError)
      }
    }

    // Atualizar permissões de página se necessário
    if (updateData.page_permissions) {
      // Deletar permissões existentes
      await supabase
        .from('page_permissions')
        .delete()
        .eq('user_id', memberId)

      // Criar novas permissões
      const pagePermissions = Object.entries(updateData.page_permissions).map(([page, hasAccess]) => ({
        user_id: memberId,
        page_name: page,
        has_access: hasAccess,
        granted_by: updatedBy,
        expires_at: updateData.end_date
      }))

      if (pagePermissions.length > 0) {
        const { error: permissionsError } = await supabase
          .from('page_permissions')
          .insert(pagePermissions)

        if (permissionsError) {
          console.error('Erro ao atualizar permissões:', permissionsError)
        }
      }
    }

    console.log(`✅ Membro atualizado com sucesso: ${memberId}`)
    return { success: true, message: 'Membro atualizado com sucesso!' }
  } catch (error) {
    console.error('❌ Erro ao atualizar membro:', error)
    throw error
  }
}

export async function deleteMember(memberId: string, deletedBy: string) {
  try {
    const supabase = await getSupabase()
    
    // Verificar se o usuário tem permissão
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', deletedBy)
      .single()

    if (!profile || !['admin', 'teacher'].includes(profile.role)) {
      throw new Error('Acesso negado. Apenas professores e administradores podem deletar membros.')
    }

    // Deletar usuário do Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(memberId)
    
    if (authError) {
      console.error('Erro ao deletar usuário do auth:', authError)
    }

    // Deletar perfil e dados relacionados (cascade)
    const { error: profileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', memberId)

    if (profileError) {
      throw new Error('Erro ao deletar perfil: ' + profileError.message)
    }

    console.log(`✅ Membro deletado com sucesso: ${memberId}`)
    return { success: true, message: 'Membro deletado com sucesso!' }
  } catch (error) {
    console.error('❌ Erro ao deletar membro:', error)
    throw error
  }
}

export async function createTemporaryPassword(memberId: string, createdBy: string) {
  try {
    const supabase = await getSupabase()
    
    // Verificar se o usuário tem permissão
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', createdBy)
      .single()

    if (!profile || !['admin', 'teacher'].includes(profile.role)) {
      throw new Error('Acesso negado. Apenas professores e administradores podem criar senhas provisórias.')
    }

    const tempPassword = generateTemporaryPassword()
    
    // Criar senha provisória
    const { error } = await supabase
      .from('temporary_passwords')
      .insert({
        user_id: memberId,
        temporary_password: tempPassword,
        created_by: createdBy
      })

    if (error) {
      throw new Error('Erro ao criar senha provisória: ' + error.message)
    }

    // Marcar que o usuário deve trocar a senha
    await supabase
      .from('user_profiles')
      .update({ must_change_password: true })
      .eq('user_id', memberId)

    console.log(`✅ Senha provisória criada para: ${memberId}`)
    return { success: true, temporaryPassword: tempPassword, message: 'Senha provisória criada com sucesso!' }
  } catch (error) {
    console.error('❌ Erro ao criar senha provisória:', error)
    throw error
  }
}

export async function getMemberPagePermissions(memberId: string) {
  try {
    const supabase = await getSupabase()
    
    const { data, error } = await supabase
      .from('page_permissions')
      .select('*')
      .eq('user_id', memberId)

    if (error) {
      console.error('❌ Erro ao carregar permissões:', error)
      return {}
    }

    // Converter para objeto com page_name como chave
    const permissions: Record<string, boolean> = {}
    data?.forEach(perm => {
      permissions[perm.page_name] = perm.has_access
    })

    return permissions
  } catch (error) {
    console.error('❌ Erro inesperado ao carregar permissões:', error)
    return {}
  }
}

// Função auxiliar para gerar senha provisória
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let password = ''
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Função para atualizar progresso do flashcard
export async function updateFlashcardProgress(
  userId: string,
  topicId: string,
  isCorrect: boolean,
  timeSpent: number = 0
) {
  const supabase = await getSupabase()
  console.log(`📊 [Server Action] Atualizando progresso do flashcard para usuário: ${userId}`)

  try {
    // Calcular XP baseado na performance
    const baseXP = isCorrect ? 5 : 1 // 5 XP por acerto, 1 XP por tentativa
    const timeBonus = timeSpent > 0 ? Math.max(0, 2 - Math.floor(timeSpent / 30)) : 0 // Bônus por velocidade
    const xpGained = baseXP + timeBonus

    // Inserir ou atualizar progresso
    const { data, error } = await supabase
      .from("user_progress")
      .upsert({
        user_id: userId,
        topic_id: topicId,
        correct_answers: isCorrect ? 1 : 0,
        total_questions: 1,
        accuracy: isCorrect ? 100 : 0,
        time_spent: timeSpent,
        xp_gained: xpGained,
        last_attempt: new Date().toISOString()
      }, { onConflict: 'user_id,topic_id' })
      .select()
      .single()

    if (error) {
      console.error("❌ [Server Action] Erro ao atualizar progresso:", error)
      return { success: false, error: error.message }
    }

    console.log(`✅ [Server Action] Progresso atualizado: +${xpGained} XP`)
    revalidatePath("/flashcards")
    return { success: true, xpGained, data }
  } catch (error) {
    console.error("❌ [Server Action] Erro inesperado ao atualizar progresso:", error)
    return { success: false, error: "Erro inesperado" }
  }
}

// ========================================
// SISTEMA DE REPETIÇÃO ESPAÇADA (SM2/ANKI)
// ========================================

// Interface para progresso de flashcard
interface FlashcardProgress {
  id?: number
  user_id: string
  flashcard_id: number
  ease_factor: number
  interval_days: number
  repetitions: number
  quality: number
  last_reviewed?: string
  next_review: string
  status: 'new' | 'learning' | 'review' | 'relearning'
}

// Função para calcular próximo intervalo usando algoritmo SM2
function calculateSM2Interval(
  easeFactor: number,
  interval: number,
  repetitions: number,
  quality: number
): { newInterval: number; newEaseFactor: number; newRepetitions: number } {
  let newEaseFactor = easeFactor
  let newInterval = interval
  let newRepetitions = repetitions

  // Atualizar fator de facilidade
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  
  // Limitar fator de facilidade entre 1.3 e 2.5
  newEaseFactor = Math.max(1.3, Math.min(2.5, newEaseFactor))

  // Calcular novo intervalo baseado na qualidade
  if (quality < 3) {
    // Resposta incorreta - reiniciar
    newRepetitions = 0
    newInterval = 1
  } else {
    // Resposta correta
    newRepetitions += 1
    
    if (newRepetitions === 1) {
      newInterval = 1
    } else if (newRepetitions === 2) {
      newInterval = 6
    } else {
      newInterval = Math.round(newInterval * newEaseFactor)
    }
  }

  return { newInterval, newEaseFactor, newRepetitions }
}

// Função para obter progresso de um flashcard
export async function getFlashcardProgress(userId: string, flashcardId: number) {
  const supabase = await getSupabase()
  console.log(`🧠 [Server Action] Buscando progresso do flashcard ${flashcardId} para usuário ${userId}`)

  const { data, error } = await supabase
    .from("flashcard_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("flashcard_id", flashcardId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error("❌ [Server Action] Erro ao buscar progresso:", error)
    return { success: false, error: error.message }
  }

  console.log(`✅ [Server Action] Progresso encontrado:`, data ? 'Sim' : 'Não')
  return { success: true, data: data || null }
}

// Função para criar progresso inicial de um flashcard
export async function createFlashcardProgress(userId: string, flashcardId: number) {
  const supabase = await getSupabase()
  console.log(`🧠 [Server Action] Criando progresso inicial para flashcard ${flashcardId}`)

  const { data, error } = await supabase
    .from("flashcard_progress")
    .insert({
      user_id: userId,
      flashcard_id: flashcardId,
      ease_factor: 2.5,
      interval_days: 1,
      repetitions: 0,
      quality: 0,
      next_review: new Date().toISOString(),
      status: 'new'
    })
    .select()
    .single()

  if (error) {
    console.error("❌ [Server Action] Erro ao criar progresso:", error)
    return { success: false, error: error.message }
  }

  console.log(`✅ [Server Action] Progresso criado: ${data.id}`)
  return { success: true, data }
}

// Função para atualizar progresso usando algoritmo SM2
export async function updateFlashcardProgressSM2(
  userId: string,
  flashcardId: number,
  quality: number // 0-5 (qualidade da resposta)
) {
  const supabase = await getSupabase()
  console.log(`🧠 [Server Action] Atualizando progresso SM2 para flashcard ${flashcardId}, qualidade: ${quality}`)

  try {
    // Buscar progresso atual
    const { data: currentProgress, error: fetchError } = await supabase
      .from("flashcard_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("flashcard_id", flashcardId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("❌ [Server Action] Erro ao buscar progresso atual:", fetchError)
      return { success: false, error: fetchError.message }
    }

    let progressData: FlashcardProgress

    if (!currentProgress) {
      // Criar progresso inicial
      const createResult = await createFlashcardProgress(userId, flashcardId)
      if (!createResult.success) {
        return createResult
      }
      progressData = createResult.data
    } else {
      progressData = currentProgress
    }

    // Calcular novo progresso usando algoritmo SM2
    const { newInterval, newEaseFactor, newRepetitions } = calculateSM2Interval(
      progressData.ease_factor,
      progressData.interval_days,
      progressData.repetitions,
      quality
    )

    // Determinar novo status
    let newStatus: 'new' | 'learning' | 'review' | 'relearning' = progressData.status
    
    if (quality < 3) {
      newStatus = progressData.status === 'review' ? 'relearning' : 'learning'
    } else if (newRepetitions >= 2) {
      newStatus = 'review'
    } else {
      newStatus = 'learning'
    }

    // Calcular próxima revisão
    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + newInterval)

    // Atualizar progresso
    const { data: updatedProgress, error: updateError } = await supabase
      .from("flashcard_progress")
      .update({
        ease_factor: newEaseFactor,
        interval_days: newInterval,
        repetitions: newRepetitions,
        quality: quality,
        last_reviewed: new Date().toISOString(),
        next_review: nextReview.toISOString(),
        status: newStatus
      })
      .eq("user_id", userId)
      .eq("flashcard_id", flashcardId)
      .select()
      .single()

    if (updateError) {
      console.error("❌ [Server Action] Erro ao atualizar progresso:", updateError)
      return { success: false, error: updateError.message }
    }

    console.log(`✅ [Server Action] Progresso SM2 atualizado:`, {
      easeFactor: newEaseFactor,
      interval: newInterval,
      repetitions: newRepetitions,
      status: newStatus
    })

    return { success: true, data: updatedProgress }
  } catch (error) {
    console.error("❌ [Server Action] Erro inesperado ao atualizar progresso SM2:", error)
    return { success: false, error: "Erro inesperado" }
  }
}

// Função para obter cards para revisão
export async function getCardsForReview(userId: string, topicId?: string, limit: number = 20) {
  const supabase = await getSupabase()
  console.log(`🧠 [Server Action] Buscando cards para revisão do usuário ${userId}`)

  try {
    let query = supabase
      .from("flashcard_progress")
      .select(`
        *,
        flashcards (
          id,
          topic_id,
          question,
          answer
        )
      `)
      .eq("user_id", userId)
      .lte("next_review", new Date().toISOString())
      .order("next_review", { ascending: true })
      .limit(limit)

    if (topicId) {
      query = query.eq("flashcards.topic_id", topicId)
    }

    const { data, error } = await query

    if (error) {
      console.error("❌ [Server Action] Erro ao buscar cards para revisão:", error)
      return { success: false, error: error.message }
    }

    console.log(`✅ [Server Action] Cards para revisão encontrados: ${data?.length || 0}`)
    return { success: true, data: data || [] }
  } catch (error) {
    console.error("❌ [Server Action] Erro inesperado ao buscar cards para revisão:", error)
    return { success: false, error: "Erro inesperado" }
  }
}

// Função para obter estatísticas de progresso
export async function getFlashcardProgressStats(userId: string, topicId?: string) {
  const supabase = await getSupabase()
  console.log(`📊 [Server Action] Buscando estatísticas de progresso para usuário ${userId}`)

  try {
    let query = supabase
      .from("flashcard_progress")
      .select(`
        status,
        flashcards!inner (
          topic_id
        )
      `)
      .eq("user_id", userId)

    if (topicId) {
      query = query.eq("flashcards.topic_id", topicId)
    }

    const { data, error } = await query

    if (error) {
      console.error("❌ [Server Action] Erro ao buscar estatísticas:", error)
      return { success: false, error: error.message }
    }

    // Contar por status
    const stats = {
      new: 0,
      learning: 0,
      review: 0,
      relearning: 0,
      total: data?.length || 0
    }

    data?.forEach(item => {
      stats[item.status as keyof typeof stats]++
    })

    console.log(`✅ [Server Action] Estatísticas calculadas:`, stats)
    return { success: true, data: stats }
  } catch (error) {
    console.error("❌ [Server Action] Erro inesperado ao calcular estatísticas:", error)
    return { success: false, error: "Erro inesperado" }
  }
}

// Função para obter cards novos (nunca estudados)
export async function getNewCards(userId: string, topicId?: string, limit: number = 10) {
  const supabase = await getSupabase()
  console.log(`🆕 [Server Action] Buscando cards novos para usuário ${userId}`)

  try {
    // Buscar flashcards que não têm progresso
    let query = supabase
      .from("flashcards")
      .select(`
        id,
        topic_id,
        question,
        answer
      `)
      .not("id", "in", `(
        SELECT flashcard_id 
        FROM flashcard_progress 
        WHERE user_id = '${userId}'
      )`)
      .order("id", { ascending: true })
      .limit(limit)

    if (topicId) {
      query = query.eq("topic_id", topicId)
    }

    const { data, error } = await query

    if (error) {
      console.error("❌ [Server Action] Erro ao buscar cards novos:", error)
      return { success: false, error: error.message }
    }

    console.log(`✅ [Server Action] Cards novos encontrados: ${data?.length || 0}`)
    return { success: true, data: data || [] }
  } catch (error) {
    console.error("❌ [Server Action] Erro inesperado ao buscar cards novos:", error)
    return { success: false, error: "Erro inesperado" }
  }
}

// ========================================
// SISTEMA DE RASTREAMENTO DETALHADO DE PROGRESSO
// ========================================

// Interface para sessões de estudo
interface StudySession {
  id?: number
  user_id: string
  topic_id?: string
  start_time: string
  end_time?: string
  duration_seconds?: number
  cards_studied: number
  correct_answers: number
  incorrect_answers: number
  xp_gained: number
  session_type: 'review' | 'new' | 'learning' | 'all' | 'test' | 'timer' | 'goals' | 'intensive' | 'custom'
  study_mode_config?: any
  created_at?: string
}

// Interface para metas de estudo
interface StudyGoal {
  id?: number
  user_id: string
  goal_type: 'daily_cards' | 'weekly_time' | 'accuracy' | 'streak' | 'xp'
  target_value: number
  current_value: number
  is_completed: boolean
  start_date: string
  end_date?: string
  created_at?: string
  updated_at?: string
}

// Interface para analytics
interface StudyAnalytics {
  totalSessions: number
  totalStudyTime: number
  totalCardsStudied: number
  averageAccuracy: number
  currentStreak: number
  longestStreak: number
  weeklyProgress: Array<{
    date: string
    cardsStudied: number
    studyTime: number
    accuracy: number
  }>
  topTopics: Array<{
    topicId: string
    topicName: string
    cardsStudied: number
    accuracy: number
  }>
  studyPatterns: {
    mostActiveHour: number
    mostActiveDay: string
    averageSessionLength: number
  }
}

// Função para criar uma nova sessão de estudo
export async function createStudySession(userUuid: string, sessionData: Omit<StudySession, 'id' | 'user_id' | 'created_at'>) {
  try {
    const supabase = await getSupabase()
    const { data, error } = await supabase
      .from('study_sessions')
      .insert([{
        user_id: userUuid,
        ...sessionData
      }])
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao criar sessão de estudo:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('❌ Erro ao criar sessão de estudo:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Função para finalizar uma sessão de estudo
export async function endStudySession(sessionId: number, endData: {
  end_time: string
  duration_seconds: number
  cards_studied: number
  correct_answers: number
  incorrect_answers: number
  xp_gained: number
}) {
  try {
    const supabase = await getSupabase()
    const { data, error } = await supabase
      .from('study_sessions')
      .update(endData)
      .eq('id', sessionId)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao finalizar sessão de estudo:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('❌ Erro ao finalizar sessão de estudo:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Função para obter histórico de sessões
export async function getStudySessionsHistory(userUuid: string, limit: number = 50) {
  try {
    const supabase = await getSupabase()
    const { data, error } = await supabase
      .from('study_sessions')
      .select(`
        *,
        topics:topic_id (
          id,
          name,
          subject_id,
          subjects:subject_id (
            name
          )
        )
      `)
      .eq('user_id', userUuid)
      .order('start_time', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('❌ Erro ao obter histórico de sessões:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('❌ Erro ao obter histórico de sessões:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Função para obter analytics detalhados
export async function getStudyAnalytics(userUuid: string, days: number = 30) {
  try {
    const supabase = await getSupabase()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Obter sessões dos últimos N dias
    const { data: sessions, error: sessionsError } = await supabase
      .from('study_sessions')
      .select(`
        *,
        topics:topic_id (
          id,
          name,
          subject_id,
          subjects:subject_id (
            name
          )
        )
      `)
      .eq('user_id', userUuid)
      .gte('start_time', startDate.toISOString())
      .order('start_time', { ascending: true })

    if (sessionsError) {
      console.error('❌ Erro ao obter sessões para analytics:', sessionsError)
      return { success: false, error: sessionsError.message }
    }

    const sessionsData = sessions || []

    // Calcular estatísticas básicas
    const totalSessions = sessionsData.length
    const totalStudyTime = sessionsData.reduce((sum, session) => sum + (session.duration_seconds || 0), 0)
    const totalCardsStudied = sessionsData.reduce((sum, session) => sum + session.cards_studied, 0)
    const totalCorrect = sessionsData.reduce((sum, session) => sum + session.correct_answers, 0)
    const totalIncorrect = sessionsData.reduce((sum, session) => sum + session.incorrect_answers, 0)
    const averageAccuracy = totalCardsStudied > 0 ? (totalCorrect / totalCardsStudied) * 100 : 0

    // Calcular streak atual
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let currentStreak = 0
    let checkDate = new Date(today)
    
    while (true) {
      const dayStart = new Date(checkDate)
      const dayEnd = new Date(checkDate)
      dayEnd.setHours(23, 59, 59, 999)
      
      const hasSession = sessionsData.some(session => {
        const sessionDate = new Date(session.start_time)
        return sessionDate >= dayStart && sessionDate <= dayEnd
      })
      
      if (hasSession) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    // Calcular streak mais longo
    let longestStreak = 0
    let tempStreak = 0
    const sortedSessions = [...sessionsData].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    
    for (let i = 0; i < sortedSessions.length; i++) {
      if (i === 0) {
        tempStreak = 1
      } else {
        const prevDate = new Date(sortedSessions[i-1].start_time)
        const currDate = new Date(sortedSessions[i].start_time)
        const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff === 1) {
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    // Calcular progresso semanal
    const weeklyProgress = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)
      
      const daySessions = sessionsData.filter(session => {
        const sessionDate = new Date(session.start_time)
        return sessionDate >= dayStart && sessionDate <= dayEnd
      })
      
      const dayCardsStudied = daySessions.reduce((sum, session) => sum + session.cards_studied, 0)
      const dayStudyTime = daySessions.reduce((sum, session) => sum + (session.duration_seconds || 0), 0)
      const dayCorrect = daySessions.reduce((sum, session) => sum + session.correct_answers, 0)
      const dayIncorrect = daySessions.reduce((sum, session) => sum + session.incorrect_answers, 0)
      const dayAccuracy = (dayCorrect + dayIncorrect) > 0 ? (dayCorrect / (dayCorrect + dayIncorrect)) * 100 : 0
      
      weeklyProgress.push({
        date: date.toISOString().split('T')[0],
        cardsStudied: dayCardsStudied,
        studyTime: dayStudyTime,
        accuracy: dayAccuracy
      })
    }

    // Calcular tópicos mais estudados
    const topicStats = new Map()
    sessionsData.forEach(session => {
      if (session.topics) {
        const topicId = session.topics.id
        const topicName = session.topics.name
        const subjectName = session.topics.subjects?.name || 'Sem matéria'
        
        if (!topicStats.has(topicId)) {
          topicStats.set(topicId, {
            topicId,
            topicName: `${topicName} (${subjectName})`,
            cardsStudied: 0,
            correctAnswers: 0,
            incorrectAnswers: 0
          })
        }
        
        const stats = topicStats.get(topicId)
        stats.cardsStudied += session.cards_studied
        stats.correctAnswers += session.correct_answers
        stats.incorrectAnswers += session.incorrect_answers
      }
    })

    const topTopics = Array.from(topicStats.values())
      .map(topic => ({
        ...topic,
        accuracy: (topic.correctAnswers + topic.incorrectAnswers) > 0 
          ? (topic.correctAnswers / (topic.correctAnswers + topic.incorrectAnswers)) * 100 
          : 0
      }))
      .sort((a, b) => b.cardsStudied - a.cardsStudied)
      .slice(0, 5)

    // Calcular padrões de estudo
    const hourCounts = new Array(24).fill(0)
    const dayCounts = new Array(7).fill(0)
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    
    sessionsData.forEach(session => {
      const sessionDate = new Date(session.start_time)
      const hour = sessionDate.getHours()
      const day = sessionDate.getDay()
      
      hourCounts[hour]++
      dayCounts[day]++
    })

    const mostActiveHour = hourCounts.indexOf(Math.max(...hourCounts))
    const mostActiveDay = dayNames[dayCounts.indexOf(Math.max(...dayCounts))]
    const averageSessionLength = totalSessions > 0 ? totalStudyTime / totalSessions : 0

    const analytics: StudyAnalytics = {
      totalSessions,
      totalStudyTime,
      totalCardsStudied,
      averageAccuracy,
      currentStreak,
      longestStreak,
      weeklyProgress,
      topTopics,
      studyPatterns: {
        mostActiveHour,
        mostActiveDay,
        averageSessionLength
      }
    }

    return { success: true, data: analytics }
  } catch (error) {
    console.error('❌ Erro ao calcular analytics:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Função para criar meta de estudo
export async function createStudyGoal(userUuid: string, goalData: Omit<StudyGoal, 'id' | 'user_id' | 'current_value' | 'is_completed' | 'created_at' | 'updated_at'>) {
  try {
    const supabase = await getSupabase()
    const { data, error } = await supabase
      .from('study_goals')
      .insert([{
        user_id: userUuid,
        current_value: 0,
        is_completed: false,
        ...goalData
      }])
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao criar meta de estudo:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('❌ Erro ao criar meta de estudo:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Função para obter metas de estudo
export async function getStudyGoals(userUuid: string) {
  try {
    const supabase = await getSupabase()
    const { data, error } = await supabase
      .from('study_goals')
      .select('*')
      .eq('user_id', userUuid)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro ao obter metas de estudo:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('❌ Erro ao obter metas de estudo:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Função para atualizar progresso de meta
export async function updateStudyGoalProgress(userUuid: string, goalId: number, newValue: number) {
  try {
    const supabase = await getSupabase()
    // Primeiro, obter a meta atual
    const { data: goal, error: fetchError } = await supabase
      .from('study_goals')
      .select('*')
      .eq('id', goalId)
      .eq('user_id', userUuid)
      .single()

    if (fetchError || !goal) {
      return { success: false, error: 'Meta não encontrada' }
    }

    const isCompleted = newValue >= goal.target_value

    const { data, error } = await supabase
      .from('study_goals')
      .update({
        current_value: newValue,
        is_completed: isCompleted,
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId)
      .eq('user_id', userUuid)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao atualizar progresso da meta:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('❌ Erro ao atualizar progresso da meta:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// ========================================
// SISTEMA DE CATEGORIAS E TAGS
// ========================================

// Função para obter todas as categorias
export async function getAllFlashcardCategories() {
  const supabase = await getSupabase()
  console.log(`🏷️ [Server Action] Buscando todas as categorias de flashcards`)

  const { data, error } = await supabase
    .from("flashcard_categories")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    console.error("❌ [Server Action] Erro ao buscar categorias:", error)
    return { success: false, error: error.message }
  }

  console.log(`✅ [Server Action] Categorias encontradas: ${data?.length || 0}`)
  return { success: true, data: data || [] }
}

// Função para obter todas as tags
export async function getAllFlashcardTags() {
  const supabase = await getSupabase()
  console.log(`🏷️ [Server Action] Buscando todas as tags de flashcards`)

  const { data, error } = await supabase
    .from("flashcard_tags")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    console.error("❌ [Server Action] Erro ao buscar tags:", error)
    return { success: false, error: error.message }
  }

  console.log(`✅ [Server Action] Tags encontradas: ${data?.length || 0}`)
  return { success: true, data: data || [] }
}

// Função para criar uma nova categoria
export async function createFlashcardCategory(userUuid: string, data: {
  name: string
  description?: string
  color: string
  icon?: string
}) {
  const supabase = await getSupabase()
  console.log(`🏷️ [Server Action] Criando categoria: ${data.name}`)

  // Verificar se o usuário tem acesso
  const hasAccess = await checkTeacherOrAdminAccess(userUuid)
  if (!hasAccess) {
    console.error("❌ [Server Action] Acesso negado para criar categoria")
    return { success: false, error: "Acesso negado" }
  }

  const { data: newCategory, error } = await supabase
    .from("flashcard_categories")
    .insert({
      name: data.name.trim(),
      description: data.description?.trim(),
      color: data.color,
      icon: data.icon
    })
    .select()
    .single()

  if (error) {
    console.error("❌ [Server Action] Erro ao criar categoria:", error)
    return { success: false, error: error.message }
  }

  console.log(`✅ [Server Action] Categoria criada: ${newCategory.id}`)
  revalidatePath("/flashcards")
  return { success: true, data: newCategory }
}

// Função para criar uma nova tag
export async function createFlashcardTag(userUuid: string, data: {
  name: string
  color: string
}) {
  const supabase = await getSupabase()
  console.log(`🏷️ [Server Action] Criando tag: ${data.name}`)

  // Verificar se o usuário tem acesso
  const hasAccess = await checkTeacherOrAdminAccess(userUuid)
  if (!hasAccess) {
    console.error("❌ [Server Action] Acesso negado para criar tag")
    return { success: false, error: "Acesso negado" }
  }

  const { data: newTag, error } = await supabase
    .from("flashcard_tags")
    .insert({
      name: data.name.trim(),
      color: data.color
    })
    .select()
    .single()

  if (error) {
    console.error("❌ [Server Action] Erro ao criar tag:", error)
    return { success: false, error: error.message }
  }

  console.log(`✅ [Server Action] Tag criada: ${newTag.id}`)
  revalidatePath("/flashcards")
  return { success: true, data: newTag }
}

// Função para associar categoria a um flashcard
export async function addFlashcardCategory(userUuid: string, flashcardId: number, categoryId: number) {
  const supabase = await getSupabase()
  console.log(`🏷️ [Server Action] Associando categoria ${categoryId} ao flashcard ${flashcardId}`)

  // Verificar se o usuário tem acesso
  const hasAccess = await checkTeacherOrAdminAccess(userUuid)
  if (!hasAccess) {
    console.error("❌ [Server Action] Acesso negado para associar categoria")
    return { success: false, error: "Acesso negado" }
  }

  const { data, error } = await supabase
    .from("flashcard_category_relations")
    .insert({
      flashcard_id: flashcardId,
      category_id: categoryId
    })
    .select()
    .single()

  if (error) {
    console.error("❌ [Server Action] Erro ao associar categoria:", error)
    return { success: false, error: error.message }
  }

  console.log(`✅ [Server Action] Categoria associada: ${data.id}`)
  revalidatePath("/flashcards")
  return { success: true, data }
}

// Função para associar tag a um flashcard
export async function addFlashcardTag(userUuid: string, flashcardId: number, tagId: number) {
  const supabase = await getSupabase()
  console.log(`🏷️ [Server Action] Associando tag ${tagId} ao flashcard ${flashcardId}`)

  // Verificar se o usuário tem acesso
  const hasAccess = await checkTeacherOrAdminAccess(userUuid)
  if (!hasAccess) {
    console.error("❌ [Server Action] Acesso negado para associar tag")
    return { success: false, error: "Acesso negado" }
  }

  const { data, error } = await supabase
    .from("flashcard_tag_relations")
    .insert({
      flashcard_id: flashcardId,
      tag_id: tagId
    })
    .select()
    .single()

  if (error) {
    console.error("❌ [Server Action] Erro ao associar tag:", error)
    return { success: false, error: error.message }
  }

  console.log(`✅ [Server Action] Tag associada: ${data.id}`)
  revalidatePath("/flashcards")
  return { success: true, data }
}

// Função para remover categoria de um flashcard
export async function removeFlashcardCategory(userUuid: string, flashcardId: number, categoryId: number) {
  const supabase = await getSupabase()
  console.log(`🏷️ [Server Action] Removendo categoria ${categoryId} do flashcard ${flashcardId}`)

  // Verificar se o usuário tem acesso
  const hasAccess = await checkTeacherOrAdminAccess(userUuid)
  if (!hasAccess) {
    console.error("❌ [Server Action] Acesso negado para remover categoria")
    return { success: false, error: "Acesso negado" }
  }

  const { error } = await supabase
    .from("flashcard_category_relations")
    .delete()
    .eq("flashcard_id", flashcardId)
    .eq("category_id", categoryId)

  if (error) {
    console.error("❌ [Server Action] Erro ao remover categoria:", error)
    return { success: false, error: error.message }
  }

  console.log(`✅ [Server Action] Categoria removida`)
  revalidatePath("/flashcards")
  return { success: true }
}

// Função para remover tag de um flashcard
export async function removeFlashcardTag(userUuid: string, flashcardId: number, tagId: number) {
  const supabase = await getSupabase()
  console.log(`🏷️ [Server Action] Removendo tag ${tagId} do flashcard ${flashcardId}`)

  // Verificar se o usuário tem acesso
  const hasAccess = await checkTeacherOrAdminAccess(userUuid)
  if (!hasAccess) {
    console.error("❌ [Server Action] Acesso negado para remover tag")
    return { success: false, error: "Acesso negado" }
  }

  const { error } = await supabase
    .from("flashcard_tag_relations")
    .delete()
    .eq("flashcard_id", flashcardId)
    .eq("tag_id", tagId)

  if (error) {
    console.error("❌ [Server Action] Erro ao remover tag:", error)
    return { success: false, error: error.message }
  }

  console.log(`✅ [Server Action] Tag removida`)
  revalidatePath("/flashcards")
  return { success: true }
}

// Função para obter categorias e tags de um flashcard
export async function getFlashcardCategoriesAndTags(flashcardId: number) {
  const supabase = await getSupabase()
  console.log(`🏷️ [Server Action] Buscando categorias e tags do flashcard ${flashcardId}`)

  try {
    // Buscar categorias
    const { data: categories, error: categoriesError } = await supabase
      .from("flashcard_category_relations")
      .select(`
        flashcard_categories (
          id,
          name,
          color,
          icon
        )
      `)
      .eq("flashcard_id", flashcardId)

    if (categoriesError) {
      console.error("❌ [Server Action] Erro ao buscar categorias:", categoriesError)
      return { success: false, error: categoriesError.message }
    }

    // Buscar tags
    const { data: tags, error: tagsError } = await supabase
      .from("flashcard_tag_relations")
      .select(`
        flashcard_tags (
          id,
          name,
          color
        )
      `)
      .eq("flashcard_id", flashcardId)

    if (tagsError) {
      console.error("❌ [Server Action] Erro ao buscar tags:", tagsError)
      return { success: false, error: tagsError.message }
    }

    const result = {
      categories: categories?.map(item => item.flashcard_categories).filter(Boolean) || [],
      tags: tags?.map(item => item.flashcard_tags).filter(Boolean) || []
    }

    console.log(`✅ [Server Action] Categorias e tags encontradas:`, result)
    return { success: true, data: result }
  } catch (error) {
    console.error("❌ [Server Action] Erro inesperado ao buscar categorias e tags:", error)
    return { success: false, error: "Erro inesperado" }
  }
}

// Cache buster - Build: ab44064 - Force cache clear - SERVER ACTIONS FILE