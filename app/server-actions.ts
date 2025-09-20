"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { supabaseAdmin } from '@/lib/supabaseServer'
import { createClient } from '@/lib/supabase-server'
import bcrypt from 'bcryptjs'
// Cache functions will be implemented separately

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
    // const cached = await getCache(cacheKey) // Cache will be implemented
    
    // if (cached) {
    //   console.log("✅ [Server Action] Usando cache para subjects")
    //   return cached
    // }
    
    const { data, error } = await supabase.from("subjects").select("id, name").order("name")
    console.log("🔍 [Server Action] Query executada, data:", data, "error:", error)
    
    if (error) {
      console.error("❌ [Server Action] Erro ao buscar matérias:", error)
      return []
    }
    
    console.log("✅ [Server Action] Matérias encontradas:", data)
    
    // Salvar no cache por 10 minutos
    // await setCache(cacheKey, data, 10 * 60) // Cache will be implemented
    
    return data || []
  } catch (error) {
    console.error("❌ [Server Action] Erro inesperado em getAllSubjects:", error)
    return []
  }
}

export async function getTopicsBySubject(subjectId: string) {
  const supabase = await getSupabase()
  const { data, error } = await supabase.from("topics").select("id, name, subject_id").eq("subject_id", subjectId).order("name")
  if (error) {
    console.error("❌ [Server Action] Erro ao buscar tópicos por matéria:", error)
    return []
  }
  return data || []
}

// Função para buscar questões de quiz por quiz_id
export async function getAllQuizzesByTopic(topicId: string) {
  const supabase = await getSupabase()
  console.log(`❓ [Server Action] Buscando questões do tópico: ${topicId}`)

  // Primeiro buscar quizzes do tópico
  const { data: quizzes, error: quizzesError } = await supabase
    .from("quizzes")
    .select("id, title, description, topic_id")
    .eq("topic_id", topicId)

  if (quizzesError) {
    console.error("❌ [Server Action] Erro ao buscar quizzes:", quizzesError)
    return []
  }

  console.log(`🎮 [Server Action] Quizzes encontrados para o tópico:`, quizzes)

  if (!quizzes || quizzes.length === 0) {
    console.log("ℹ️ [Server Action] Nenhum quiz encontrado para este tópico")
    return []
  }

  // Buscar questões de todos os quizzes do tópico
  const quizIds = quizzes.map(q => q.id)
  console.log(`🆔 [Server Action] IDs dos quizzes para buscar questões:`, quizIds)
  
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("id, quiz_id, topic_id, question_text, options, correct_answer, explanation")
    .in("quiz_id", quizIds)
    .order("id")

  if (error) {
    console.error("❌ [Server Action] Erro ao buscar questões:", error)
    return []
  }

  console.log(`✅ [Server Action] Questões encontradas: ${data?.length}`)
  if (data && data.length > 0) {
    console.log(`📝 [Server Action] Primeira questão:`, data[0])
  }
  return data || []
}

// Nova função para buscar quiz e questões
export async function getQuizWithQuestions(topicId: string) {
  const supabase = await getSupabase()
  console.log(`❓ [Server Action] Buscando quiz e questões do tópico: ${topicId}`)

  // Primeiro buscar quizzes do tópico
  const { data: quizzes, error: quizzesError } = await supabase
    .from("quizzes")
    .select("id, title, description, topic_id")
    .eq("topic_id", topicId)

  if (quizzesError) {
    console.error("❌ [Server Action] Erro ao buscar quizzes:", quizzesError)
    return { quiz: null, questions: [] }
  }

  console.log(`🎮 [Server Action] Quizzes encontrados para o tópico:`, quizzes)

  if (!quizzes || quizzes.length === 0) {
    console.log("ℹ️ [Server Action] Nenhum quiz encontrado para este tópico")
    return { quiz: null, questions: [] }
  }

  // Pegar o primeiro quiz (assumindo que há um quiz por tópico)
  const quiz = quizzes[0]

  // Buscar questões do quiz
  const { data: questions, error: questionsError } = await supabase
    .from("quiz_questions")
    .select("id, quiz_id, topic_id, question_text, options, correct_answer, explanation")
    .eq("quiz_id", quiz.id)
    .order("id")

  if (questionsError) {
    console.error("❌ [Server Action] Erro ao buscar questões:", questionsError)
    return { quiz, questions: [] }
  }

  console.log(`✅ [Server Action] Quiz e questões encontrados:`, { quiz: quiz.title, questionsCount: questions?.length })
  return { quiz, questions: questions || [] }
}

// Função para criar uma nova questão de quiz
export async function createQuizQuestion(userId: string, quizData: {
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
export async function updateQuizQuestion(userId: string, quizId: string, updateData: {
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
export async function deleteQuizQuestion(userId: string, quizId: string) {
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
    // Por enquanto, retornar N/A até implementarmos o sistema de ranking
    console.log('ℹ️ Sistema de ranking ainda não implementado')
    return { position: 'N/A' }
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

    if (!profile || !['administrator', 'teacher'].includes(profile.role)) {
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

function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function getAllMembers() {
  try {
    console.log('🔍 [Server Action] getAllMembers() iniciada')
    const supabase = await getSupabase()
    console.log('🔍 [Server Action] Supabase client obtido')
    
    // Primeiro, vamos ver todos os usuários para debug
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, is_active')
      .order('created_at', { ascending: false })

    console.log('🔍 [Server Action] Todos os usuários encontrados:', allUsers)
    if (allUsersError) {
      console.error('❌ [Server Action] Erro ao buscar todos os usuários:', allUsersError)
    }
    
    // Se não há usuários, tentar criar usuários de teste
    if (!allUsers || allUsers.length === 0) {
      console.log('⚠️ [Server Action] Nenhum usuário encontrado na tabela users')
      console.log('🔧 [Server Action] Tentando criar usuários de teste...')
      
      try {
        // Tentar criar usuários usando uma abordagem diferente
        const usuariosTeste = [
          {
            email: 'aluno1@teste.com',
            first_name: 'João',
            last_name: 'Silva',
            role: 'student',
            password: '123456'
          },
          {
            email: 'aluno2@teste.com',
            first_name: 'Maria',
            last_name: 'Santos',
            role: 'student',
            password: '123456'
          },
          {
            email: 'aluno3@teste.com',
            first_name: 'Pedro',
            last_name: 'Oliveira',
            role: 'student',
            password: '123456'
          }
        ]

        for (const usuario of usuariosTeste) {
          try {
            const passwordHash = await bcrypt.hash(usuario.password, 10)
            
            // Tentar inserir usando upsert (insert ou update)
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .upsert({
                email: usuario.email,
                password_hash: passwordHash,
                first_name: usuario.first_name,
                last_name: usuario.last_name,
                role: usuario.role,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'email'
              })
              .select()

            if (createError) {
              console.error(`❌ [Server Action] Erro ao criar usuário ${usuario.email}:`, createError.message)
            } else {
              console.log(`✅ [Server Action] Usuário criado: ${usuario.email}`)
            }
          } catch (createError) {
            console.error(`❌ [Server Action] Erro inesperado ao criar usuário ${usuario.email}:`, createError)
          }
        }

        // Tentar buscar novamente após criação
        const { data: newUsers, error: newUsersError } = await supabase
          .from('users')
          .select('id, email, first_name, last_name, role, is_active')
          .order('created_at', { ascending: false })

        if (newUsersError) {
          console.error('❌ [Server Action] Erro ao buscar usuários após criação:', newUsersError)
        } else {
          console.log('🔍 [Server Action] Usuários após criação:', newUsers)
        }

      } catch (error) {
        console.error('❌ [Server Action] Erro ao tentar criar usuários:', error)
      }
    }
    
    // Buscar usuários com role 'student' da tabela users
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        role,
        is_active,
        created_at,
        last_login_at
      `)
      .eq('role', 'student')
      .order('created_at', { ascending: false })

    console.log('🔍 [Server Action] Query executada, data:', data, 'error:', error)

    if (error) {
      console.error('❌ Erro ao carregar membros:', error)
      return []
    }

    // Mapear dados para o formato esperado pela interface
    const members = (data || []).map(user => ({
      user_id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      class_id: undefined,
      access_expires_at: undefined,
      must_change_password: false,
      created_at: user.created_at,
      classes: undefined,
      student_subscriptions: []
    }))

    console.log('✅ [Server Action] Membros mapeados:', members.length, 'membros encontrados')
    return members
  } catch (error) {
    console.error('❌ Erro inesperado ao carregar membros:', error)
    return []
  }
}

export async function getAllClasses() {
  try {
    console.log('🔍 [Server Action] getAllClasses() iniciada')
    const supabase = await getSupabase()
    
    const { data, error } = await supabase
      .from('classes')
      .select('id, name, description, max_students')
      .order('name', { ascending: true })

    console.log('🔍 [Server Action] Classes encontradas:', data, 'error:', error)

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
    // Retornar planos de acesso mockados até a tabela ser criada
    const mockPlans = [
      {
        id: 'basic',
        name: 'Plano Básico',
        description: 'Acesso básico às funcionalidades',
        duration_months: 1,
        price: 29.90,
        features: {
          quiz: true,
          flashcards: true,
          evercast: false,
          calendario: false
        }
      },
      {
        id: 'premium',
        name: 'Plano Premium',
        description: 'Acesso completo a todas as funcionalidades',
        duration_months: 6,
        price: 149.90,
        features: {
          quiz: true,
          flashcards: true,
          evercast: true,
          calendario: true
        }
      },
      {
        id: 'annual',
        name: 'Plano Anual',
        description: 'Acesso completo por 12 meses com desconto',
        duration_months: 12,
        price: 299.90,
        features: {
          quiz: true,
          flashcards: true,
          evercast: true,
          calendario: true
        }
      }
    ]

    return mockPlans
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
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', createdBy)
      .single()

    if (!user || !['administrator', 'teacher'].includes(user.role)) {
      throw new Error('Acesso negado. Apenas professores e administradores podem criar membros.')
    }

    // Gerar senha temporária
    const temporaryPassword = generateTemporaryPassword()
    
    // Separar nome e sobrenome
    const nameParts = memberData.name.split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ') || ''

    // Criar usuário na tabela users
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        email: memberData.email,
        password_hash: await bcrypt.hash(temporaryPassword, 10),
        first_name: firstName,
        last_name: lastName,
        role: 'student',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (userError || !newUser) {
      throw new Error('Erro ao criar usuário: ' + (userError?.message || 'Usuário não criado'))
    }

    console.log(`✅ Membro criado com sucesso: ${memberData.name} (${memberData.email})`)
    return { 
      success: true, 
      userId: newUser.id, 
      temporaryPassword: temporaryPassword,
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
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', updatedBy)
      .single()

    if (!user || !['administrator', 'teacher'].includes(user.role)) {
      throw new Error('Acesso negado. Apenas professores e administradores podem editar membros.')
    }

    // Separar nome e sobrenome se necessário
    const updateFields: any = {}
    if (updateData.name) {
      const nameParts = updateData.name.split(' ')
      updateFields.first_name = nameParts[0]
      updateFields.last_name = nameParts.slice(1).join(' ') || ''
    }
    updateFields.updated_at = new Date().toISOString()

    // Atualizar usuário na tabela users
    const { error: updateError } = await supabase
      .from('users')
      .update(updateFields)
      .eq('id', memberId)

    if (updateError) {
      throw new Error('Erro ao atualizar usuário: ' + updateError.message)
    }

    console.log(`✅ Membro atualizado com sucesso: ${memberId}`)
    return { 
      success: true, 
      message: 'Membro atualizado com sucesso!'
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar membro:', error)
    throw error
  }
}

export async function deleteMember(memberId: string, deletedBy: string) {
  try {
    const supabase = await getSupabase()
    
    // Verificar se o usuário tem permissão
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', deletedBy)
      .single()

    if (!user || !['administrator', 'teacher'].includes(user.role)) {
      throw new Error('Acesso negado. Apenas professores e administradores podem deletar membros.')
    }

    // Desativar usuário em vez de deletar (soft delete)
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)

    if (updateError) {
      throw new Error('Erro ao desativar usuário: ' + updateError.message)
    }

    console.log(`✅ Membro desativado com sucesso: ${memberId}`)
    return { success: true, message: 'Membro desativado com sucesso!' }
  } catch (error) {
    console.error('❌ Erro ao deletar membro:', error)
    throw error
  }
}

export async function createTemporaryPassword(memberId: string, createdBy: string) {
  try {
    const supabase = await getSupabase()
    
    // Verificar se o usuário tem permissão
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', createdBy)
      .single()

    if (!user || !['administrator', 'teacher'].includes(user.role)) {
      throw new Error('Acesso negado. Apenas professores e administradores podem criar senhas provisórias.')
    }

    const tempPassword = generateTemporaryPassword()
    
    // Atualizar senha do usuário na tabela users
    const { error } = await supabase
      .from('users')
      .update({ 
        password_hash: await bcrypt.hash(tempPassword, 10),
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)

    if (error) {
      throw new Error('Erro ao atualizar senha: ' + error.message)
    }

    console.log(`✅ Senha provisória criada para: ${memberId}`)
    return { success: true, temporaryPassword: tempPassword, message: 'Senha provisória criada com sucesso!' }
  } catch (error) {
    console.error('❌ Erro ao criar senha provisória:', error)
    throw error
  }
}

export async function getMemberPagePermissions(memberId: string) {
  try {
    // Retornar permissões padrão até a tabela page_permissions ser criada
    return {
      quiz: true,
      flashcards: true,
      evercast: false,
      calendario: false
    }
  } catch (error) {
    console.error('❌ Erro inesperado ao carregar permissões:', error)
    return {}
  }
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
    // Primeiro, verificar se o usuário tem algum progresso
    const { data: progressData, error: progressError } = await supabase
      .from("flashcard_progress")
      .select("flashcard_id")
      .eq("user_id", userId)
      .limit(1)

    let query

    if (progressError || !progressData || progressData.length === 0) {
      // Se não há progresso, buscar todos os flashcards do tópico como "novos"
      console.log("🧠 [Server Action] Usuário sem progresso, buscando todos os flashcards como novos")
      query = supabase
        .from("flashcards")
        .select(`
          id,
          topic_id,
          question,
          answer
        `)
        .order("id", { ascending: true })
        .limit(limit)
    } else {
      // Se há progresso, buscar cards que precisam de revisão
      console.log("🧠 [Server Action] Usuário com progresso, buscando cards para revisão")
      query = supabase
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
    }

    if (topicId) {
      if (progressError || !progressData || progressData.length === 0) {
        query = query.eq("topic_id", topicId)
      } else {
        query = query.eq("flashcards.topic_id", topicId)
      }
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

// Função para obter todos os flashcards de um tópico (versão simplificada)
export async function getAllFlashcardsByTopicSimple(topicId: string, limit: number = 50) {
  const supabase = await getSupabase()
  console.log(`📚 [Server Action] Buscando todos os flashcards do tópico ${topicId}`)

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
      console.error("❌ [Server Action] Erro ao buscar todos os flashcards:", error)
      return { success: false, error: error.message }
    }

    console.log(`✅ [Server Action] Todos os flashcards encontrados: ${data?.length || 0}`)
    return { success: true, data: data || [] }
  } catch (error) {
    console.error("❌ [Server Action] Erro inesperado ao buscar todos os flashcards:", error)
    return { success: false, error: "Erro inesperado" }
  }
}

// Função para inicializar progresso de flashcards para um usuário
export async function initializeFlashcardProgress(userId: string, topicId?: string) {
  const supabase = await getSupabase()
  console.log(`🔄 [Server Action] Inicializando progresso de flashcards para usuário ${userId}`)

  try {
    // Buscar flashcards do tópico (ou todos se não especificado)
    let query = supabase
      .from("flashcards")
      .select("id")
      .not("id", "in", `(
        SELECT flashcard_id 
        FROM flashcard_progress 
        WHERE user_id = '${userId}'
      )`)

    if (topicId) {
      query = query.eq("topic_id", topicId)
    }

    const { data: flashcards, error: flashcardsError } = await query

    if (flashcardsError) {
      console.error("❌ [Server Action] Erro ao buscar flashcards:", flashcardsError)
      return { success: false, error: flashcardsError.message }
    }

    if (!flashcards || flashcards.length === 0) {
      console.log("✅ [Server Action] Nenhum flashcard novo para inicializar")
      return { success: true, data: { initialized: 0 } }
    }

    // Criar registros de progresso para cada flashcard
    const progressRecords = flashcards.map(flashcard => ({
      user_id: userId,
      flashcard_id: flashcard.id,
      status: 'new',
      ease_factor: 2.5,
      interval: 1,
      repetitions: 0,
      next_review: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    const { data: insertedData, error: insertError } = await supabase
      .from("flashcard_progress")
      .insert(progressRecords)

    if (insertError) {
      console.error("❌ [Server Action] Erro ao inserir progresso:", insertError)
      return { success: false, error: insertError.message }
    }

    console.log(`✅ [Server Action] Progresso inicializado para ${flashcards.length} flashcards`)
    return { success: true, data: { initialized: flashcards.length } }
  } catch (error) {
    console.error("❌ [Server Action] Erro inesperado ao inicializar progresso:", error)
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
    // Primeiro, verificar se o usuário tem algum progresso
    const { data: progressData, error: progressError } = await supabase
      .from("flashcard_progress")
      .select("flashcard_id")
      .eq("user_id", userId)
      .limit(1)

    let query

    if (progressError || !progressData || progressData.length === 0) {
      // Se não há progresso, buscar todos os flashcards do tópico
      console.log("🆕 [Server Action] Usuário sem progresso, buscando todos os flashcards")
      query = supabase
        .from("flashcards")
        .select(`
          id,
          topic_id,
          question,
          answer
        `)
        .order("id", { ascending: true })
        .limit(limit)
    } else {
      // Se há progresso, buscar flashcards que não têm progresso
      console.log("🆕 [Server Action] Usuário com progresso, buscando cards não estudados")
      query = supabase
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
    }

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

// CRUD para Quizzes
export async function createQuiz(quizData: {
  title: string
  description: string
  topic_id: string
  is_active: boolean
}) {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from("quizzes")
    .insert([quizData])
    .select()
    .single()

  if (error) {
    console.error("❌ [Server Action] Erro ao criar quiz:", error)
    return { success: false, error: error.message }
  }

  console.log("✅ [Server Action] Quiz criado com sucesso:", data.id)
  revalidatePath("/quiz")
  return { success: true, data }
}

export async function updateQuiz(quizId: string, quizData: {
  title: string
  description: string
  topic_id: string
  is_active: boolean
}) {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from("quizzes")
    .update(quizData)
    .eq("id", quizId)
    .select()
    .single()

  if (error) {
    console.error("❌ [Server Action] Erro ao atualizar quiz:", error)
    return { success: false, error: error.message }
  }

  console.log("✅ [Server Action] Quiz atualizado com sucesso:", data.id)
  revalidatePath("/quiz")
  return { success: true, data }
}

export async function deleteQuiz(quizId: string) {
  const supabase = await getSupabase()
  const { error } = await supabase.from("quizzes").delete().eq("id", quizId)
  if (error) {
    console.error("❌ [Server Action] Erro ao deletar quiz:", error)
    return { success: false, error: error.message }
  }
  console.log("✅ [Server Action] Quiz deletado com sucesso:", quizId)
  revalidatePath("/quiz")
  return { success: true }
}

// CRUD para Questões
export async function createQuestion(questionData: {
  question_text: string
  options: string[]
  correct_answer: number
  explanation: string
  quiz_id: string
}) {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from("quiz_questions")
    .insert([questionData])
    .select()
    .single()

  if (error) {
    console.error("❌ [Server Action] Erro ao criar questão:", error)
    return { success: false, error: error.message }
  }

  console.log("✅ [Server Action] Questão criada com sucesso:", data.id)
  revalidatePath("/quiz")
  return { success: true, data }
}

export async function updateQuestion(questionId: string, questionData: {
  question_text: string
  options: string[]
  correct_answer: number
  explanation: string
}) {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from("quiz_questions")
    .update(questionData)
    .eq("id", questionId)
    .select()
    .single()

  if (error) {
    console.error("❌ [Server Action] Erro ao atualizar questão:", error)
    return { success: false, error: error.message }
  }

  console.log("✅ [Server Action] Questão atualizada com sucesso:", data.id)
  revalidatePath("/quiz")
  return { success: true, data }
}

export async function deleteQuestion(questionId: string) {
  const supabase = await getSupabase()
  const { error } = await supabase.from("quiz_questions").delete().eq("id", questionId)
  if (error) {
    console.error("❌ [Server Action] Erro ao deletar questão:", error)
    return { success: false, error: error.message }
  }
  console.log("✅ [Server Action] Questão deletada com sucesso:", questionId)
  revalidatePath("/quiz")
  return { success: true }
}

// Função para obter dados completos das matérias com estatísticas
export async function getSubjectsWithStats(userId?: string) {
  console.log("🔍 [Server Action] getSubjectsWithStats() iniciada")
  const supabase = await getSupabase()
  
  try {
    // Buscar todas as matérias
    const { data: subjects, error: subjectsError } = await supabase
      .from("subjects")
      .select("id, name")
      .order("name")
    
    if (subjectsError) {
      console.error("❌ [Server Action] Erro ao buscar matérias:", subjectsError)
      return []
    }

    const subjectsWithStats = await Promise.all(
      subjects.map(async (subject) => {
        // Buscar tópicos da matéria
        const { data: topics, error: topicsError } = await supabase
          .from("topics")
          .select("id, name")
          .eq("subject_id", subject.id)
          .order("name")

        if (topicsError) {
          console.error(`❌ [Server Action] Erro ao buscar tópicos para ${subject.name}:`, topicsError)
        }

        const topicsData = topics || []
        
        // Buscar flashcards por tópico
        let totalFlashcards = 0
        let completedFlashcards = 0
        const includedItems = []

        for (const topic of topicsData) {
          const { data: flashcards, error: flashcardsError } = await supabase
            .from("flashcards")
            .select("id")
            .eq("topic_id", topic.id)

          if (!flashcardsError && flashcards) {
            const topicFlashcardCount = flashcards.length
            totalFlashcards += topicFlashcardCount

            // Calcular progresso se userId for fornecido
            let topicProgress = 0
            if (userId) {
              const { data: progress } = await supabase
                .from("user_topic_progress")
                .select("correct_answers, total_attempts")
                .eq("user_id", userId)
                .eq("topic_id", topic.id)
                .single()

              if (progress && progress.total_attempts > 0) {
                topicProgress = Math.round((progress.correct_answers / progress.total_attempts) * 100)
                completedFlashcards += progress.correct_answers
              }
            }

            includedItems.push({
              title: topic.name,
              progress: topicProgress
            })
          }
        }

        // Calcular estatísticas
        const averageProgress = includedItems.length > 0 
          ? Math.round(includedItems.reduce((sum, item) => sum + item.progress, 0) / includedItems.length)
          : 0

        const completedCount = includedItems.filter(item => item.progress === 100).length

        return {
          id: subject.id,
          title: subject.name,
          subtitle: `${topicsData.length} tópicos • ${totalFlashcards} flashcards`,
          completedCount,
          totalCount: topicsData.length,
          averageProgress,
          lessonsCompleted: completedFlashcards,
          includedItems: includedItems.slice(0, 3), // Mostrar apenas os primeiros 3
          overallProgress: averageProgress
        }
      })
    )

    console.log("✅ [Server Action] Matérias com estatísticas carregadas:", subjectsWithStats.length)
    return subjectsWithStats

  } catch (error) {
    console.error("❌ [Server Action] Erro inesperado em getSubjectsWithStats:", error)
    return []
  }
}

// ==================== SISTEMA COMPLETO DE FLASHCARDS ====================


// Função para obter flashcards por tópico
export async function getFlashcardsByTopic(topicId: string) {
  console.log(`🔍 [Server Action] getFlashcardsByTopic() para tópico: ${topicId}`)
  const supabase = await getSupabase()
  
  try {
    const { data, error } = await supabase
      .from("flashcards")
      .select("id, question, answer, topic_id, created_at")
      .eq("topic_id", topicId)
      .order("created_at", { ascending: true })
    
    if (error) {
      console.error("❌ [Server Action] Erro ao buscar flashcards:", error)
      return []
    }
    
    console.log("✅ [Server Action] Flashcards encontrados:", data?.length || 0)
    return data || []
  } catch (error) {
    console.error("❌ [Server Action] Erro inesperado em getFlashcardsByTopic:", error)
    return []
  }
}



// ==================== SISTEMA COMPLETO DE REDAÇÕES ====================

// Função para obter todos os temas de redação ativos
export async function getActiveEssayPrompts() {
  console.log("📝 [Server Action] getActiveEssayPrompts() iniciada");
  const supabase = await getSupabase();
  
  try {
    const { data, error } = await supabase
      .from('essay_prompts')
      .select('*')
      .eq('is_active', true)
      .gte('end_date', new Date().toISOString())
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log(`✅ [Server Action] getActiveEssayPrompts() - ${data?.length || 0} temas encontrados`);
    return data || [];
  } catch (error) {
    console.error("❌ [Server Action] getActiveEssayPrompts() - Erro:", error);
    return [];
  }
}

// Função para obter um tema de redação específico
export async function getEssayPromptById(promptId: string) {
  console.log(`📝 [Server Action] getEssayPromptById() para ID: ${promptId}`);
  const supabase = await getSupabase();
  
  try {
    const { data, error } = await supabase
      .from('essay_prompts')
      .select('*')
      .eq('id', promptId)
      .single();
    
    if (error) throw error;
    
    console.log(`✅ [Server Action] getEssayPromptById() - Tema encontrado: ${data?.title}`);
    return data;
  } catch (error) {
    console.error("❌ [Server Action] getEssayPromptById() - Erro:", error);
    return null;
  }
}

// Função para submeter uma redação
export async function submitEssay(essayData: {
  student_id: string;
  prompt_id: string;
  submission_text: string;
}) {
  console.log("📝 [Server Action] submitEssay() iniciada");
  const supabase = await getSupabase();
  
  try {
    const { data, error } = await supabase
      .from('essays')
      .insert({
        student_id: essayData.student_id,
        prompt_id: essayData.prompt_id,
        submission_text: essayData.submission_text,
        submission_date: new Date().toISOString(),
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`✅ [Server Action] submitEssay() - Redação submetida com ID: ${data.id}`);
    return data;
  } catch (error) {
    console.error("❌ [Server Action] submitEssay() - Erro:", error);
    throw error;
  }
}

// Função para obter redações pendentes (para professores)
export async function getPendingEssays() {
  console.log("📝 [Server Action] getPendingEssays() iniciada");
  const supabase = await getSupabase();
  
  try {
    const { data, error } = await supabase
      .from('essays')
      .select(`
        *,
        essay_prompts!inner(title, description),
        users!inner(name, email)
      `)
      .eq('status', 'pending')
      .order('submission_date', { ascending: true });
    
    if (error) throw error;
    
    console.log(`✅ [Server Action] getPendingEssays() - ${data?.length || 0} redações pendentes`);
    return data || [];
  } catch (error) {
    console.error("❌ [Server Action] getPendingEssays() - Erro:", error);
    return [];
  }
}

// Função para obter redações de um aluno específico
export async function getStudentEssays(studentId: string) {
  console.log(`📝 [Server Action] getStudentEssays() para aluno: ${studentId}`);
  const supabase = await getSupabase();
  
  try {
    const { data, error } = await supabase
      .from('essays')
      .select(`
        *,
        essay_prompts!inner(title, description)
      `)
      .eq('student_id', studentId)
      .order('submission_date', { ascending: false });
    
    if (error) throw error;
    
    console.log(`✅ [Server Action] getStudentEssays() - ${data?.length || 0} redações encontradas`);
    return data || [];
  } catch (error) {
    console.error("❌ [Server Action] getStudentEssays() - Erro:", error);
    return [];
  }
}

// Função para obter uma redação específica com anotações
export async function getEssayWithAnnotations(essayId: string) {
  console.log(`📝 [Server Action] getEssayWithAnnotations() para redação: ${essayId}`);
  const supabase = await getSupabase();
  
  try {
    // Buscar a redação
    const { data: essay, error: essayError } = await supabase
      .from('essays')
      .select(`
        *,
        essay_prompts!inner(title, description, suggested_repertoire, evaluation_criteria),
        users!inner(name, email)
      `)
      .eq('id', essayId)
      .single();
    
    if (essayError) throw essayError;
    
    // Buscar as anotações
    const { data: annotations, error: annotationsError } = await supabase
      .from('essay_annotations')
      .select(`
        *,
        error_categories!inner(name, description)
      `)
      .eq('essay_id', essayId)
      .order('start_offset', { ascending: true });
    
    if (annotationsError) throw annotationsError;
    
    const result = {
      ...essay,
      annotations: annotations || []
    };
    
    console.log(`✅ [Server Action] getEssayWithAnnotations() - Redação com ${annotations?.length || 0} anotações`);
    return result;
  } catch (error) {
    console.error("❌ [Server Action] getEssayWithAnnotations() - Erro:", error);
    return null;
  }
}

// Função para obter categorias de erro
export async function getErrorCategories() {
  console.log("📝 [Server Action] getErrorCategories() iniciada");
  const supabase = await getSupabase();
  
  try {
    const { data, error } = await supabase
      .from('error_categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    console.log(`✅ [Server Action] getErrorCategories() - ${data?.length || 0} categorias encontradas`);
    return data || [];
  } catch (error) {
    console.error("❌ [Server Action] getErrorCategories() - Erro:", error);
    return [];
  }
}

// Função para criar uma anotação
export async function createAnnotation(annotationData: {
  essay_id: string;
  teacher_id: string;
  start_offset: number;
  end_offset: number;
  annotation_text: string;
  error_category_id: string;
  suggested_correction?: string;
}) {
  console.log("📝 [Server Action] createAnnotation() iniciada");
  const supabase = await getSupabase();
  
  try {
    const { data, error } = await supabase
      .from('essay_annotations')
      .insert(annotationData)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`✅ [Server Action] createAnnotation() - Anotação criada com ID: ${data.id}`);
    return data;
  } catch (error) {
    console.error("❌ [Server Action] createAnnotation() - Erro:", error);
    throw error;
  }
}

// Função para finalizar a correção de uma redação
export async function finalizeEssayCorrection(essayId: string, correctionData: {
  teacher_id: string;
  final_grade: number;
  teacher_feedback_text?: string;
  teacher_feedback_audio_url?: string;
}) {
  console.log(`📝 [Server Action] finalizeEssayCorrection() para redação: ${essayId}`);
  const supabase = await getSupabase();
  
  try {
    const { data, error } = await supabase
      .from('essays')
      .update({
        status: 'corrected',
        teacher_id: correctionData.teacher_id,
        final_grade: correctionData.final_grade,
        teacher_feedback_text: correctionData.teacher_feedback_text,
        teacher_feedback_audio_url: correctionData.teacher_feedback_audio_url,
        correction_date: new Date().toISOString()
      })
      .eq('id', essayId)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`✅ [Server Action] finalizeEssayCorrection() - Correção finalizada para redação: ${essayId}`);
    return data;
  } catch (error) {
    console.error("❌ [Server Action] finalizeEssayCorrection() - Erro:", error);
    throw error;
  }
}

// ==================== GERENCIAMENTO DE PROMPTS DE REDAÇÃO ====================

// Função para obter prompts de um professor específico
export async function getPromptsForTeacher(teacherId?: string) {
  console.log("📝 [Server Action] getPromptsForTeacher() iniciada");
  const supabase = await getSupabase();
  
  try {
    let query = supabase
      .from('essay_prompts')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Se teacherId for fornecido, filtrar por criador
    if (teacherId) {
      query = query.eq('created_by_user_id', teacherId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    console.log(`✅ [Server Action] getPromptsForTeacher() - ${data?.length || 0} prompts encontrados`);
    return data || [];
  } catch (error) {
    console.error("❌ [Server Action] getPromptsForTeacher() - Erro:", error);
    return [];
  }
}

// Função para criar um novo prompt
export async function createPrompt(promptData: {
  title: string;
  description: string;
  suggested_repertoire?: string;
  course_id?: string;
  subject_id?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  evaluation_criteria: any;
  created_by_user_id: string;
}) {
  console.log("📝 [Server Action] createPrompt() iniciada");
  const supabase = await getSupabase();
  
  try {
    const { data, error } = await supabase
      .from('essay_prompts')
      .insert({
        title: promptData.title,
        description: promptData.description,
        suggested_repertoire: promptData.suggested_repertoire,
        course_id: promptData.course_id,
        subject_id: promptData.subject_id,
        start_date: promptData.start_date,
        end_date: promptData.end_date,
        is_active: promptData.is_active,
        evaluation_criteria: promptData.evaluation_criteria,
        created_by_user_id: promptData.created_by_user_id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`✅ [Server Action] createPrompt() - Prompt criado com ID: ${data.id}`);
    return data;
  } catch (error) {
    console.error("❌ [Server Action] createPrompt() - Erro:", error);
    throw error;
  }
}

// Função para atualizar um prompt existente
export async function updatePrompt(promptId: string, promptData: {
  title: string;
  description: string;
  suggested_repertoire?: string;
  course_id?: string;
  subject_id?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  evaluation_criteria: any;
}) {
  console.log(`📝 [Server Action] updatePrompt() para ID: ${promptId}`);
  const supabase = await getSupabase();
  
  try {
    const { data, error } = await supabase
      .from('essay_prompts')
      .update({
        title: promptData.title,
        description: promptData.description,
        suggested_repertoire: promptData.suggested_repertoire,
        course_id: promptData.course_id,
        subject_id: promptData.subject_id,
        start_date: promptData.start_date,
        end_date: promptData.end_date,
        is_active: promptData.is_active,
        evaluation_criteria: promptData.evaluation_criteria,
        updated_at: new Date().toISOString()
      })
      .eq('id', promptId)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`✅ [Server Action] updatePrompt() - Prompt atualizado: ${data.id}`);
    return data;
  } catch (error) {
    console.error("❌ [Server Action] updatePrompt() - Erro:", error);
    throw error;
  }
}

// Função para alternar status ativo de um prompt
export async function togglePromptActiveStatus(promptId: string, isActive: boolean) {
  console.log(`📝 [Server Action] togglePromptActiveStatus() para ID: ${promptId}`);
  const supabase = await getSupabase();
  
  try {
    const { data, error } = await supabase
      .from('essay_prompts')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', promptId)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`✅ [Server Action] togglePromptActiveStatus() - Status alterado para: ${isActive}`);
    return data;
  } catch (error) {
    console.error("❌ [Server Action] togglePromptActiveStatus() - Erro:", error);
    throw error;
  }
}

// Função para excluir um prompt
export async function deletePrompt(promptId: string) {
  console.log(`📝 [Server Action] deletePrompt() para ID: ${promptId}`);
  const supabase = await getSupabase();
  
  try {
    const { error } = await supabase
      .from('essay_prompts')
      .delete()
      .eq('id', promptId);
    
    if (error) throw error;
    
    console.log(`✅ [Server Action] deletePrompt() - Prompt excluído: ${promptId}`);
    return true;
  } catch (error) {
    console.error("❌ [Server Action] deletePrompt() - Erro:", error);
    throw error;
  }
}

// Função para obter um prompt específico
export async function getPromptById(promptId: string) {
  console.log(`📝 [Server Action] getPromptById() para ID: ${promptId}`);
  const supabase = await getSupabase();
  
  try {
    const { data, error } = await supabase
      .from('essay_prompts')
      .select('*')
      .eq('id', promptId)
      .single();
    
    if (error) throw error;
    
    console.log(`✅ [Server Action] getPromptById() - Prompt encontrado: ${data?.title}`);
    return data;
  } catch (error) {
    console.error("❌ [Server Action] getPromptById() - Erro:", error);
    return null;
  }
}

// ==================== SISTEMA COMPLETO DE QUIZZES ====================

// Função para obter todos os quizzes
export async function getAllQuizzes() {
  console.log("🔍 [Server Action] getAllQuizzes() iniciada")
  const supabase = await getSupabase()
  
  try {
    const { data, error } = await supabase
      .from("quizzes")
      .select(`
        id,
        title,
        description,
        subject_id,
        topic_id,
        created_at,
        subjects(name),
        topics(name)
      `)
      .order("created_at", { ascending: false })
    
    if (error) {
      console.error("❌ [Server Action] Erro ao buscar quizzes:", error)
      return []
    }
    
    console.log("✅ [Server Action] Quizzes encontrados:", data?.length || 0)
    return data || []
  } catch (error) {
    console.error("❌ [Server Action] Erro inesperado em getAllQuizzes:", error)
    return []
  }
}

// Função para obter um quiz específico com suas perguntas

// Função para iniciar uma tentativa de quiz
export async function startQuizAttempt(userId: string, quizId: string) {
  console.log(`🎯 [Server Action] Iniciando tentativa de quiz: ${quizId} para usuário: ${userId}`)
  const supabase = await getSupabase()
  
  try {
    const { data: attempt, error } = await supabase
      .from("user_quiz_attempts")
      .insert({
        user_id: userId,
        quiz_id: quizId,
        start_time: new Date().toISOString(),
        score: 0,
        is_completed: false
      })
      .select()
      .single()

    if (error) {
      console.error("❌ [Server Action] Erro ao iniciar tentativa:", error)
      return { success: false, error: error.message }
    }

    console.log("✅ [Server Action] Tentativa iniciada:", attempt.id)
    return { success: true, data: attempt }
  } catch (error) {
    console.error("❌ [Server Action] Erro inesperado ao iniciar tentativa:", error)
    return { success: false, error: "Erro interno" }
  }
}

// Função para submeter uma resposta de pergunta
export async function submitQuestionAnswer(
  attemptId: string,
  questionId: string,
  userAnswer: string
) {
  console.log(`📝 [Server Action] Submetendo resposta para pergunta: ${questionId}`)
  const supabase = await getSupabase()
  
  try {
    // Buscar a pergunta para verificar se a resposta está correta
    const { data: question, error: questionError } = await supabase
      .from("questions")
      .select("answer_text, question_type")
      .eq("id", questionId)
      .single()

    if (questionError) {
      console.error("❌ [Server Action] Erro ao buscar pergunta:", questionError)
      return { success: false, error: "Pergunta não encontrada" }
    }

    // Determinar se a resposta está correta
    let isCorrect = false
    if (question.question_type === 'multiple_choice') {
      // Para múltipla escolha, verificar se a opção selecionada está correta
      const { data: option } = await supabase
        .from("question_options")
        .select("is_correct")
        .eq("id", userAnswer)
        .single()
      
      isCorrect = option?.is_correct || false
    } else {
      // Para outras questões, comparar com a resposta correta
      isCorrect = userAnswer.toLowerCase().trim() === question.answer_text.toLowerCase().trim()
    }

    // Salvar a resposta
    const { data: answer, error: answerError } = await supabase
      .from("user_question_answers")
      .insert({
        attempt_id: attemptId,
        question_id: questionId,
        user_answer: userAnswer,
        is_correct: isCorrect
      })
      .select()
      .single()

    if (answerError) {
      console.error("❌ [Server Action] Erro ao salvar resposta:", answerError)
      return { success: false, error: "Erro ao salvar resposta" }
    }

    console.log("✅ [Server Action] Resposta salva:", answer.id)
    return { success: true, data: answer, isCorrect }
  } catch (error) {
    console.error("❌ [Server Action] Erro inesperado ao submeter resposta:", error)
    return { success: false, error: "Erro interno" }
  }
}

// Função para finalizar uma tentativa de quiz
export async function finishQuizAttempt(attemptId: string) {
  console.log(`🏁 [Server Action] Finalizando tentativa: ${attemptId}`)
  const supabase = await getSupabase()
  
  try {
    // Buscar todas as respostas da tentativa
    const { data: answers, error: answersError } = await supabase
      .from("user_question_answers")
      .select("is_correct")
      .eq("attempt_id", attemptId)

    if (answersError) {
      console.error("❌ [Server Action] Erro ao buscar respostas:", answersError)
      return { success: false, error: "Erro ao calcular pontuação" }
    }

    // Calcular pontuação
    const totalQuestions = answers?.length || 0
    const correctAnswers = answers?.filter(answer => answer.is_correct).length || 0
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

    // Atualizar a tentativa
    const { data: attempt, error: attemptError } = await supabase
      .from("user_quiz_attempts")
      .update({
        end_time: new Date().toISOString(),
        score: score,
        is_completed: true
      })
      .eq("id", attemptId)
      .select()
      .single()

    if (attemptError) {
      console.error("❌ [Server Action] Erro ao finalizar tentativa:", attemptError)
      return { success: false, error: "Erro ao finalizar tentativa" }
    }

    console.log("✅ [Server Action] Tentativa finalizada. Pontuação:", score)
    return { success: true, data: attempt }
  } catch (error) {
    console.error("❌ [Server Action] Erro inesperado ao finalizar tentativa:", error)
    return { success: false, error: "Erro interno" }
  }
}


// Cache buster - Build: ab44064 - Force cache clear - SERVER ACTIONS FILE