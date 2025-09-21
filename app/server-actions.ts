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
          overallProgress: averageProgress,
          totalFlashcards: totalFlashcards
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

// ==================== DASHBOARD ANALYTICS ====================

// Função para obter estatísticas do dashboard baseadas no perfil do usuário
export async function getDashboardStats(userId?: string, userRole?: string) {
  console.log("🔍 [Server Action] getDashboardStats() iniciada")
  console.log("🔍 [Server Action] User ID:", userId)
  console.log("🔍 [Server Action] User Role:", userRole)
  
  const supabase = await getSupabase()
  
  try {
    if (userRole === 'student') {
      return await getStudentDashboardStats(userId)
    } else if (userRole === 'teacher') {
      return await getTeacherDashboardStats(userId)
    } else if (userRole === 'administrator') {
      return await getAdminDashboardStats()
    } else {
      return await getDefaultDashboardStats()
    }
  } catch (error) {
    console.error("❌ [Server Action] Erro em getDashboardStats:", error)
    return getDefaultDashboardStats()
  }
}

// Dashboard para Alunos
async function getStudentDashboardStats(userId?: string) {
  const supabase = await getSupabase()
  
  try {
    // Progresso em flashcards
    const { data: flashcardProgress } = await supabase
      .from("flashcard_progress")
      .select("flashcard_id, repetitions, ease_factor, quality")
      .eq("user_id", userId)
    
    // Progresso em quizzes
    const { data: quizAttempts } = await supabase
      .from("quiz_attempts")
      .select("score, total_questions, attempt_date")
      .eq("user_id", userId)
      .order("attempt_date", { ascending: false })
      .limit(10)
    
    // Progresso geral por tópico
    const { data: userProgress } = await supabase
      .from("user_progress")
      .select("topic_id, completion_percentage, last_accessed_at")
      .eq("user_id", userId)
    
    // Pontuações do usuário
    const { data: userScores } = await supabase
      .from("scores")
      .select("score_value, activity_type, recorded_at")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false })
      .limit(10)
    
    // Redações do aluno
    const { data: studentEssays } = await supabase
      .from("essays")
      .select("id, status, final_grade, submission_date")
      .eq("student_id", userId)
    
    // Progresso em áudio
    const { data: audioProgress } = await supabase
      .from("audio_progress")
      .select("lesson_id, progress_percentage, is_completed")
      .eq("user_id", userId)
    
    // Calcular estatísticas
    const totalFlashcardsStudied = flashcardProgress?.length || 0
    const averageQuizScore = quizAttempts?.length > 0 
      ? Math.round(quizAttempts.reduce((sum, attempt) => sum + (attempt.score / attempt.total_questions * 100), 0) / quizAttempts.length)
      : 0
    
    const totalScore = userScores?.reduce((sum, score) => sum + score.score_value, 0) || 0
    const completedEssays = studentEssays?.filter(essay => essay.status === 'corrected').length || 0
    const pendingEssays = studentEssays?.filter(essay => essay.status === 'pending').length || 0
    
    const completedAudioLessons = audioProgress?.filter(progress => progress.is_completed).length || 0
    
    // Streak de atividade (últimos 7 dias)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    })
    
    const activityStreak = last7Days.map(date => {
      const hasActivity = userScores?.some(score => 
        score.recorded_at.startsWith(date)
      ) || quizAttempts?.some(attempt => 
        attempt.attempt_date.startsWith(date)
      )
      return hasActivity
    }).reverse()
    
    const currentStreak = calculateStreak(activityStreak)
    
    return {
      userType: 'student',
      stats: {
        totalFlashcardsStudied,
        averageQuizScore,
        totalScore,
        completedEssays,
        pendingEssays,
        completedAudioLessons,
        currentStreak,
        activityStreak
      },
      recentActivity: {
        quizAttempts: quizAttempts?.slice(0, 5) || [],
        scores: userScores?.slice(0, 5) || [],
        essays: studentEssays?.slice(0, 3) || []
      }
    }
  } catch (error) {
    console.error("❌ [Server Action] Erro em getStudentDashboardStats:", error)
    return getDefaultDashboardStats()
  }
}

// Dashboard para Professores
async function getTeacherDashboardStats(userId?: string) {
  const supabase = await getSupabase()
  
  try {
    // Conteúdo criado pelo professor
    const { data: createdSubjects } = await supabase
      .from("subjects")
      .select("id, name")
      .eq("created_by_user_id", userId)
    
    const { data: createdTopics } = await supabase
      .from("topics")
      .select("id, name")
      .eq("created_by_user_id", userId)
    
    const { data: createdFlashcards } = await supabase
      .from("flashcards")
      .select("id, question")
      .eq("created_by_user_id", userId)
    
    const { data: createdQuizzes } = await supabase
      .from("quizzes")
      .select("id, title")
      .eq("created_by_user_id", userId)
    
    // Redações para corrigir
    const { data: essaysToCorrect } = await supabase
      .from("essays")
      .select("id, status, submission_date")
      .eq("teacher_id", userId)
      .eq("status", "pending")
    
    // Progresso dos alunos (se o professor tem turmas)
    const { data: teacherClasses } = await supabase
      .from("classes")
      .select("id, name")
      .eq("teacher_id", userId)
    
    let totalStudents = 0
    let averageStudentProgress = 0
    
    if (teacherClasses && teacherClasses.length > 0) {
      const classIds = teacherClasses.map(cls => cls.id)
      
      const { data: studentClasses } = await supabase
        .from("student_classes")
        .select("user_id")
        .in("class_id", classIds)
      
      totalStudents = studentClasses?.length || 0
      
      if (totalStudents > 0) {
        const { data: allStudentProgress } = await supabase
          .from("user_progress")
          .select("completion_percentage")
          .in("user_id", studentClasses?.map(sc => sc.user_id) || [])
        
        averageStudentProgress = allStudentProgress?.length > 0
          ? Math.round(allStudentProgress.reduce((sum, progress) => sum + parseFloat(progress.completion_percentage.toString()), 0) / allStudentProgress.length)
          : 0
      }
    }
    
    return {
      userType: 'teacher',
      stats: {
        subjectsCreated: createdSubjects?.length || 0,
        topicsCreated: createdTopics?.length || 0,
        flashcardsCreated: createdFlashcards?.length || 0,
        quizzesCreated: createdQuizzes?.length || 0,
        essaysToCorrect: essaysToCorrect?.length || 0,
        totalStudents: totalStudents,
        averageStudentProgress: averageStudentProgress
      },
      recentActivity: {
        essaysToCorrect: essaysToCorrect?.slice(0, 5) || [],
        classes: teacherClasses || []
      }
    }
  } catch (error) {
    console.error("❌ [Server Action] Erro em getTeacherDashboardStats:", error)
    return getDefaultDashboardStats()
  }
}

// Dashboard para Administradores
async function getAdminDashboardStats() {
  const supabase = await getSupabase()
  
  try {
    // Estatísticas gerais da plataforma
    const { data: totalUsers } = await supabase
      .from("users")
      .select("id", { count: 'exact' })
    
    const { data: totalStudents } = await supabase
      .from("users")
      .select("id", { count: 'exact' })
      .eq("role", "student")
    
    const { data: totalTeachers } = await supabase
      .from("users")
      .select("id", { count: 'exact' })
      .eq("role", "teacher")
    
    const { data: totalFlashcards } = await supabase
      .from("flashcards")
      .select("id", { count: 'exact' })
    
    const { data: totalQuizzes } = await supabase
      .from("quizzes")
      .select("id", { count: 'exact' })
    
    const { data: totalSubjects } = await supabase
      .from("subjects")
      .select("id", { count: 'exact' })
    
    // Atividade recente
    const { data: recentQuizAttempts } = await supabase
      .from("quiz_attempts")
      .select("id, attempt_date, score")
      .order("attempt_date", { ascending: false })
      .limit(10)
    
    const { data: recentScores } = await supabase
      .from("scores")
      .select("id, recorded_at, score_value")
      .order("recorded_at", { ascending: false })
      .limit(10)
    
    return {
      userType: 'admin',
      stats: {
        totalUsers: totalUsers?.length || 0,
        totalStudents: totalStudents?.length || 0,
        totalTeachers: totalTeachers?.length || 0,
        totalFlashcards: totalFlashcards?.length || 0,
        totalQuizzes: totalQuizzes?.length || 0,
        totalSubjects: totalSubjects?.length || 0
      },
      recentActivity: {
        quizAttempts: recentQuizAttempts || [],
        scores: recentScores || []
      }
    }
  } catch (error) {
    console.error("❌ [Server Action] Erro em getAdminDashboardStats:", error)
    return getDefaultDashboardStats()
  }
}

// Dashboard padrão (fallback)
function getDefaultDashboardStats() {
  return {
    userType: 'default',
    stats: {
      totalUsers: 0,
      totalContent: 0,
      totalTests: 0,
      userRanking: 0
    },
    recentActivity: {
      quizAttempts: [],
      scores: []
    }
  }
}

// Função auxiliar para calcular streak
function calculateStreak(activityArray: boolean[]): number {
  let streak = 0
  for (let i = activityArray.length - 1; i >= 0; i--) {
    if (activityArray[i]) {
      streak++
    } else {
      break
    }
  }
  return streak
}

// ==================== SISTEMA DE RANKING ====================

// Função para obter ranking global dos usuários
export async function getGlobalRanking(limit: number = 50) {
  console.log("🏆 [Server Action] getGlobalRanking() iniciada")
  
  const supabase = await getSupabase()
  
  try {
    // Busca usuários com suas pontuações da tabela scores
    const { data: users, error } = await supabase
      .from("users")
      .select(`
        id,
        first_name,
        last_name,
        role,
        scores!inner(score_value, activity_type, recorded_at)
      `)
      .eq("role", "student")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ [Server Action] Erro ao buscar usuários:", error)
      return { success: false, rankings: [] }
    }

    // Processa dados e calcula pontuação total por usuário
    const userScores = new Map()
    
    users?.forEach(user => {
      const totalScore = user.scores?.reduce((sum: number, score: any) => sum + score.score_value, 0) || 0
      
      if (!userScores.has(user.id) || userScores.get(user.id).totalScore < totalScore) {
        userScores.set(user.id, {
          user_id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          total_score: totalScore,
          scores_count: user.scores?.length || 0
        })
      }
    })

    // Converte para array e ordena por pontuação
    const rankings = Array.from(userScores.values())
      .sort((a, b) => b.total_score - a.total_score)
      .map((user, index) => ({
        ...user,
        rank_position: index + 1,
        user_profiles: [{
          display_name: `${user.first_name} ${user.last_name}`,
          role: 'student'
        }]
      }))
      .slice(0, limit)

    console.log("🏆 [Server Action] Ranking gerado:", rankings.length, "usuários")
    
    return { success: true, rankings }
  } catch (error) {
    console.error("❌ [Server Action] Erro em getGlobalRanking:", error)
    return { success: false, rankings: [] }
  }
}

// Função para obter progresso do usuário
export async function getUserProgress(userId: string) {
  console.log("📊 [Server Action] getUserProgress() para usuário:", userId)
  
  const supabase = await getSupabase()
  
  try {
    // Busca pontuações do usuário
    const { data: scores, error: scoresError } = await supabase
      .from("scores")
      .select("score_value, activity_type, recorded_at")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false })

    if (scoresError) {
      console.error("❌ [Server Action] Erro ao buscar scores:", scoresError)
      return { success: false, stats: null }
    }

    // Busca progresso em flashcards
    const { data: flashcardProgress } = await supabase
      .from("flashcard_progress")
      .select("id")
      .eq("user_id", userId)

    // Busca tentativas de quiz
    const { data: quizAttempts } = await supabase
      .from("quiz_attempts")
      .select("score, total_questions")
      .eq("user_id", userId)

    // Calcula estatísticas
    const totalScore = scores?.reduce((sum, score) => sum + score.score_value, 0) || 0
    const totalXP = totalScore // XP = Score por enquanto
    const level = Math.floor(totalXP / 100) + 1
    const flashcardsStudied = flashcardProgress?.length || 0
    const quizzesCompleted = quizAttempts?.length || 0
    
    // Calcula acertos em quizzes
    const correctAnswers = quizAttempts?.reduce((sum, attempt) => sum + attempt.score, 0) || 0
    const totalAnswers = quizAttempts?.reduce((sum, attempt) => sum + attempt.total_questions, 0) || 0

    const stats = {
      total_xp: totalXP,
      level: level,
      flashcards_studied: flashcardsStudied,
      quizzes_completed: quizzesCompleted,
      correct_answers: correctAnswers,
      total_answers: totalAnswers,
      total_score: totalScore
    }

    console.log("📊 [Server Action] Stats do usuário:", stats)
    
    return { success: true, stats }
  } catch (error) {
    console.error("❌ [Server Action] Erro em getUserProgress:", error)
    return { success: false, stats: null }
  }
}

// Função para registrar pontuação do usuário
export async function addUserScore(userId: string, activityType: string, scoreValue: number, activityId?: string) {
  console.log("🎯 [Server Action] addUserScore() - Usuário:", userId, "Tipo:", activityType, "Pontos:", scoreValue)
  
  const supabase = await getSupabase()
  
  try {
    const { error } = await supabase
      .from("scores")
      .insert({
        user_id: userId,
        activity_type: activityType,
        score_value: scoreValue,
        activity_id: activityId,
        recorded_at: new Date().toISOString()
      })

    if (error) {
      console.error("❌ [Server Action] Erro ao inserir score:", error)
      return { success: false }
    }

    console.log("✅ [Server Action] Score registrado com sucesso")
    return { success: true }
  } catch (error) {
    console.error("❌ [Server Action] Erro em addUserScore:", error)
    return { success: false }
  }
}

// Função para obter rank do usuário baseado na pontuação
export async function getUserRank(userId: string) {
  console.log("🏅 [Server Action] getUserRank() para usuário:", userId)
  
  const supabase = await getSupabase()
  
  try {
    // Busca pontuação total do usuário
    const { data: scores } = await supabase
      .from("scores")
      .select("score_value")
      .eq("user_id", userId)

    const totalScore = scores?.reduce((sum, score) => sum + score.score_value, 0) || 0
    
    // Busca posição no ranking
    const { data: allUsers } = await supabase
      .from("users")
      .select(`
        id,
        scores(score_value)
      `)
      .eq("role", "student")

    const userScores = allUsers?.map(user => ({
      id: user.id,
      totalScore: user.scores?.reduce((sum: any, score: any) => sum + score.score_value, 0) || 0
    })) || []

    userScores.sort((a, b) => b.totalScore - a.totalScore)
    
    const position = userScores.findIndex(user => user.id === userId) + 1
    const totalUsers = userScores.length

    // Determina rank baseado na pontuação
    let rank = "Novato da Guilda"
    let league = "Aprendizes"
    
    if (totalScore >= 1000) { rank = "Aprendiz de Batalha"; league = "Aprendizes" }
    else if (totalScore >= 600) { rank = "Portador da Chama"; league = "Aprendizes" }
    else if (totalScore >= 300) { rank = "Explorador das Ruínas"; league = "Aprendizes" }
    else if (totalScore >= 100) { rank = "Estudante Arcano"; league = "Aprendizes" }

    const rankInfo = {
      position,
      totalUsers,
      totalScore,
      rank,
      league,
      level: Math.floor(totalScore / 100) + 1
    }

    console.log("🏅 [Server Action] Rank do usuário:", rankInfo)
    
    return { success: true, rankInfo }
  } catch (error) {
    console.error("❌ [Server Action] Erro em getUserRank:", error)
    return { success: false, rankInfo: null }
  }
}

// Função para adicionar pontuações de exemplo (para teste)
export async function addSampleScores() {
  console.log("🎯 [Server Action] addSampleScores() - Adicionando pontuações de exemplo")
  
  const supabase = await getSupabase()
  
  try {
    // Busca usuários estudantes
    const { data: students } = await supabase
      .from("users")
      .select("id, first_name")
      .eq("role", "student")
      .limit(5)

    if (!students || students.length === 0) {
      console.log("❌ [Server Action] Nenhum estudante encontrado")
      return { success: false }
    }

    // Adiciona pontuações variadas para cada estudante
    const sampleScores = [
      { activityType: 'flashcard', scoreValue: 50 },
      { activityType: 'quiz', scoreValue: 75 },
      { activityType: 'flashcard', scoreValue: 25 },
      { activityType: 'lesson', scoreValue: 100 },
      { activityType: 'quiz', scoreValue: 60 }
    ]

    for (const student of students) {
      const randomScores = sampleScores.slice(0, Math.floor(Math.random() * 3) + 2)
      
      for (const score of randomScores) {
        const { error } = await supabase
          .from("scores")
          .insert({
            user_id: student.id,
            activity_type: score.activityType,
            score_value: score.scoreValue,
            recorded_at: new Date().toISOString()
          })

        if (error) {
          console.error(`❌ [Server Action] Erro ao inserir score para ${student.first_name}:`, error)
        }
      }
    }

    console.log("✅ [Server Action] Pontuações de exemplo adicionadas")
    return { success: true }
  } catch (error) {
    console.error("❌ [Server Action] Erro em addSampleScores:", error)
    return { success: false }
  }
}

// ==================== SISTEMA DE REPETIÇÃO ESPAÇADA ====================

// Função para registrar resposta de flashcard com qualidade
export async function recordFlashcardResponse(userId: string, flashcardId: string, isCorrect: boolean, quality: number = 3) {
  console.log("🎯 [Server Action] recordFlashcardResponse() - Usuário:", userId, "Flashcard:", flashcardId, "Correto:", isCorrect, "Qualidade:", quality)
  
  const supabase = await getSupabase()
  
  try {
    // Calcula pontuação baseada na qualidade da resposta
    let scoreValue = 0
    if (isCorrect) {
      switch (quality) {
        case 5: scoreValue = 25 // Excelente
        case 4: scoreValue = 20 // Bom
        case 3: scoreValue = 15 // Médio
        case 2: scoreValue = 10 // Ruim
        case 1: scoreValue = 5  // Muito ruim
        default: scoreValue = 15
      }
    } else {
      scoreValue = 2 // Pontos por tentativa
    }

    // Registra pontuação
    const { error: scoreError } = await supabase
      .from("scores")
      .insert({
        user_id: userId,
        activity_type: 'flashcard',
        score_value: scoreValue,
        activity_id: flashcardId,
        recorded_at: new Date().toISOString()
      })

    if (scoreError) {
      console.error("❌ [Server Action] Erro ao registrar pontuação:", scoreError)
      return { success: false }
    }

    // Busca progresso existente ou cria novo
    const { data: existingProgress } = await supabase
      .from("flashcard_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("flashcard_id", flashcardId)
      .single()

    const now = new Date().toISOString()
    let newProgress

    if (existingProgress) {
      // Atualiza progresso existente (algoritmo SM-2 simplificado)
      let repetitions = existingProgress.repetitions + 1
      let easeFactor = existingProgress.ease_factor || 2.5
      let intervalDays = existingProgress.interval_days || 1

      if (isCorrect) {
        if (repetitions === 1) {
          intervalDays = 1
        } else if (repetitions === 2) {
          intervalDays = 6
        } else {
          intervalDays = Math.round(intervalDays * easeFactor)
        }
        easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
      } else {
        repetitions = 1
        intervalDays = 1
        easeFactor = Math.max(1.3, easeFactor - 0.2)
      }

      const nextReview = new Date()
      nextReview.setDate(nextReview.getDate() + intervalDays)

      newProgress = {
        repetitions,
        ease_factor: easeFactor,
        interval_days: intervalDays,
        last_reviewed_at: now,
        next_review_at: nextReview.toISOString(),
        quality: quality
      }

      const { error: updateError } = await supabase
        .from("flashcard_progress")
        .update(newProgress)
        .eq("user_id", userId)
        .eq("flashcard_id", flashcardId)

      if (updateError) {
        console.error("❌ [Server Action] Erro ao atualizar progresso:", updateError)
      }
    } else {
      // Cria novo progresso
      const nextReview = new Date()
      nextReview.setDate(nextReview.getDate() + 1)

      newProgress = {
        user_id: userId,
        flashcard_id: flashcardId,
        repetitions: 1,
        ease_factor: 2.5,
        interval_days: 1,
        last_reviewed_at: now,
        next_review_at: nextReview.toISOString(),
        quality: quality
      }

      const { error: insertError } = await supabase
        .from("flashcard_progress")
        .insert(newProgress)

      if (insertError) {
        console.error("❌ [Server Action] Erro ao criar progresso:", insertError)
      }
    }

    console.log("✅ [Server Action] Flashcard processado e progresso registrado:", newProgress)
    
    // Verificar e conceder conquistas após cada resposta
    try {
      const achievementsResult = await checkAndGrantAchievements(userId)
      if (achievementsResult.success && achievementsResult.granted.length > 0) {
        console.log(`🏆 [Server Action] ${achievementsResult.granted.length} conquistas concedidas após resposta do flashcard`)
        return { 
          success: true, 
          score: scoreValue, 
          progress: newProgress, 
          achievements: achievementsResult.granted 
        }
      }
    } catch (error) {
      console.error("❌ [Server Action] Erro ao verificar conquistas:", error)
    }
    
    return { success: true, score: scoreValue, progress: newProgress }
  } catch (error) {
    console.error("❌ [Server Action] Erro em recordFlashcardResponse:", error)
    return { success: false }
  }
}

// Função para obter flashcards que precisam de revisão
export async function getFlashcardsForReview(userId: string, topicId?: string) {
  console.log("📚 [Server Action] getFlashcardsForReview() para usuário:", userId, "Tópico:", topicId)
  
  const supabase = await getSupabase()
  
  try {
    const now = new Date().toISOString()
    
    let query = supabase
      .from("flashcard_progress")
      .select(`
        *,
        flashcards!inner (
          id,
          question,
          answer,
          topic_id,
          topics!inner (
            id,
            name,
            subject_id
          )
        )
      `)
      .eq("user_id", userId)
      .lte("next_review_at", now)
      .order("next_review_at", { ascending: true })

    if (topicId) {
      query = query.eq("flashcards.topic_id", topicId)
    }

    const { data: reviewFlashcards, error } = await query

    if (error) {
      console.error("❌ [Server Action] Erro ao buscar flashcards para revisão:", error)
      return { success: false, flashcards: [] }
    }

    console.log("✅ [Server Action] Flashcards para revisão encontrados:", reviewFlashcards?.length || 0)
    return { success: true, flashcards: reviewFlashcards || [] }
  } catch (error) {
    console.error("❌ [Server Action] Erro em getFlashcardsForReview:", error)
    return { success: false, flashcards: [] }
  }
}

// Função para obter flashcards com maior dificuldade (mais erros)
export async function getDifficultFlashcards(userId: string, topicId?: string, limit: number = 10) {
  console.log("🔥 [Server Action] getDifficultFlashcards() para usuário:", userId, "Tópico:", topicId, "Limit:", limit)
  
  const supabase = await getSupabase()
  
  try {
    let query = supabase
      .from("flashcard_progress")
      .select(`
        *,
        flashcards!inner (
          id,
          question,
          answer,
          topic_id,
          topics!inner (
            id,
            name,
            subject_id
          )
        )
      `)
      .eq("user_id", userId)
      .order("ease_factor", { ascending: true })
      .order("repetitions", { ascending: true })
      .limit(limit)

    if (topicId) {
      query = query.eq("flashcards.topic_id", topicId)
    }

    const { data: difficultFlashcards, error } = await query

    if (error) {
      console.error("❌ [Server Action] Erro ao buscar flashcards difíceis:", error)
      return { success: false, flashcards: [] }
    }

    console.log("✅ [Server Action] Flashcards difíceis encontrados:", difficultFlashcards?.length || 0)
    return { success: true, flashcards: difficultFlashcards || [] }
  } catch (error) {
    console.error("❌ [Server Action] Erro em getDifficultFlashcards:", error)
    return { success: false, flashcards: [] }
  }
}

// ==================== SISTEMA DE CATEGORIZAÇÃO ====================

// Função para criar categorias básicas de flashcards
export async function createBasicFlashcardCategories() {
  console.log("🏷️ [Server Action] createBasicFlashcardCategories() - Criando categorias básicas")
  
  const supabase = await getSupabase()
  
  try {
    const categories = [
      { name: 'Definições', description: 'Flashcards com definições de conceitos e termos' },
      { name: 'Fórmulas', description: 'Flashcards com fórmulas matemáticas e científicas' },
      { name: 'Exemplos', description: 'Flashcards com exemplos práticos e aplicações' },
      { name: 'Conceitos', description: 'Flashcards com conceitos teóricos fundamentais' },
      { name: 'Vocabulário', description: 'Flashcards com vocabulário específico da matéria' }
    ]

    for (const category of categories) {
      const { error } = await supabase
        .from("flashcard_categories")
        .upsert(category, { onConflict: 'name' })

      if (error) {
        console.error("❌ [Server Action] Erro ao criar categoria:", category.name, error)
      }
    }

    console.log("✅ [Server Action] Categorias básicas criadas com sucesso")
    return { success: true }
  } catch (error) {
    console.error("❌ [Server Action] Erro em createBasicFlashcardCategories:", error)
    return { success: false }
  }
}

// Função para criar tags básicas de flashcards
export async function createBasicFlashcardTags() {
  console.log("🏷️ [Server Action] createBasicFlashcardTags() - Criando tags básicas")
  
  const supabase = await getSupabase()
  
  try {
    const tags = [
      'Importante', 'Revisar', 'Fácil', 'Difícil', 'ENEM', 'Concurso', 'Fundamental', 'Avançado'
    ]

    for (const tagName of tags) {
      const { error } = await supabase
        .from("flashcard_tags")
        .upsert({ name: tagName }, { onConflict: 'name' })

      if (error) {
        console.error("❌ [Server Action] Erro ao criar tag:", tagName, error)
      }
    }

    console.log("✅ [Server Action] Tags básicas criadas com sucesso")
    return { success: true }
  } catch (error) {
    console.error("❌ [Server Action] Erro em createBasicFlashcardTags:", error)
    return { success: false }
  }
}

// Função para criar dados de exemplo para o sistema de repetição espaçada
export async function createSampleFlashcardProgress() {
  console.log("📊 [Server Action] createSampleFlashcardProgress() - Criando dados de exemplo")
  
  const supabase = await getSupabase()
  
  try {
    // Busca usuários estudantes
    const { data: students } = await supabase
      .from("users")
      .select("id")
      .eq("role", "student")
      .limit(3)

    if (!students || students.length === 0) {
      console.log("⚠️ [Server Action] Nenhum estudante encontrado para criar dados de exemplo")
      return { success: false }
    }

    // Busca alguns flashcards
    const { data: flashcards } = await supabase
      .from("flashcards")
      .select("id")
      .limit(20)

    if (!flashcards || flashcards.length === 0) {
      console.log("⚠️ [Server Action] Nenhum flashcard encontrado para criar dados de exemplo")
      return { success: false }
    }

    const now = new Date()
    const progressData = []

    // Cria dados de progresso para cada estudante
    for (const student of students) {
      // Seleciona alguns flashcards aleatórios para este estudante
      const studentFlashcards = flashcards.slice(0, Math.min(10, flashcards.length))
      
      for (const flashcard of studentFlashcards) {
        // Gera dados aleatórios para simular progresso
        const repetitions = Math.floor(Math.random() * 5) + 1
        const quality = Math.floor(Math.random() * 5) + 1
        const easeFactor = 2.5 + (Math.random() - 0.5) * 0.5 // Entre 2.0 e 3.0
        const intervalDays = Math.floor(Math.random() * 10) + 1
        
        const lastReviewed = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Última semana
        const nextReview = new Date(lastReviewed.getTime() + intervalDays * 24 * 60 * 60 * 1000)

        progressData.push({
          user_id: student.id,
          flashcard_id: flashcard.id,
          repetitions,
          ease_factor: easeFactor,
          interval_days: intervalDays,
          last_reviewed_at: lastReviewed.toISOString(),
          next_review_at: nextReview.toISOString(),
          quality
        })
      }
    }

    // Insere os dados em lote
    const { error } = await supabase
      .from("flashcard_progress")
      .insert(progressData)

    if (error) {
      console.error("❌ [Server Action] Erro ao inserir dados de progresso:", error)
      return { success: false }
    }

    console.log(`✅ [Server Action] ${progressData.length} registros de progresso criados`)
    return { success: true, count: progressData.length }
  } catch (error) {
    console.error("❌ [Server Action] Erro em createSampleFlashcardProgress:", error)
    return { success: false }
  }
}

// ==================== OTIMIZAÇÃO DE BANCO DE DADOS ====================

// Função para otimizar índices do banco de dados
export async function optimizeDatabaseIndexes() {
  console.log("🔧 [Server Action] optimizeDatabaseIndexes() - Otimizando índices do banco")
  
  const supabase = await getSupabase()
  
  try {
    // Lista de índices para criar
    const indexes = [
      {
        name: 'idx_flashcards_topic_id',
        table: 'flashcards',
        column: 'topic_id',
        description: 'Índice para consultas por tópico'
      },
      {
        name: 'idx_flashcards_created_by',
        table: 'flashcards',
        column: 'created_by_user_id',
        description: 'Índice para consultas por criador'
      },
      {
        name: 'idx_flashcards_difficulty',
        table: 'flashcards',
        column: 'difficulty',
        description: 'Índice para consultas por dificuldade'
      },
      {
        name: 'idx_flashcard_progress_user_id',
        table: 'flashcard_progress',
        column: 'user_id',
        description: 'Índice para consultas de progresso por usuário'
      },
      {
        name: 'idx_flashcard_progress_flashcard_id',
        table: 'flashcard_progress',
        column: 'flashcard_id',
        description: 'Índice para consultas de progresso por flashcard'
      },
      {
        name: 'idx_flashcard_progress_next_review',
        table: 'flashcard_progress',
        column: 'next_review_at',
        description: 'Índice para consultas de revisão agendada'
      },
      {
        name: 'idx_flashcard_progress_ease_factor',
        table: 'flashcard_progress',
        column: 'ease_factor',
        description: 'Índice para consultas por fator de facilidade'
      },
      {
        name: 'idx_scores_user_id',
        table: 'scores',
        column: 'user_id',
        description: 'Índice para consultas de pontuação por usuário'
      },
      {
        name: 'idx_scores_activity_type',
        table: 'scores',
        column: 'activity_type',
        description: 'Índice para consultas por tipo de atividade'
      },
      {
        name: 'idx_scores_recorded_at',
        table: 'scores',
        column: 'recorded_at',
        description: 'Índice para consultas por data de registro'
      }
    ]

    const results = []
    
    for (const index of indexes) {
      try {
        // Verificar se o índice já existe
        const { data: existingIndexes } = await supabase.rpc('check_index_exists', {
          index_name: index.name
        })
        
        if (!existingIndexes) {
          // Criar o índice usando SQL direto
          const { error } = await supabase.rpc('create_index_if_not_exists', {
            index_name: index.name,
            table_name: index.table,
            column_name: index.column
          })
          
          if (error) {
            console.error(`❌ [Server Action] Erro ao criar índice ${index.name}:`, error)
            results.push({ name: index.name, status: 'error', message: error.message })
          } else {
            console.log(`✅ [Server Action] Índice ${index.name} criado com sucesso`)
            results.push({ name: index.name, status: 'success', message: 'Índice criado' })
          }
        } else {
          console.log(`ℹ️ [Server Action] Índice ${index.name} já existe`)
          results.push({ name: index.name, status: 'exists', message: 'Índice já existe' })
        }
      } catch (error) {
        console.error(`❌ [Server Action] Erro ao processar índice ${index.name}:`, error)
        results.push({ name: index.name, status: 'error', message: 'Erro na criação' })
      }
    }

    console.log(`✅ [Server Action] Processamento de índices concluído: ${results.length} índices processados`)
    return { success: true, results }
  } catch (error) {
    console.error("❌ [Server Action] Erro em optimizeDatabaseIndexes:", error)
    return { success: false, error: error.message }
  }
}

// Função para analisar estatísticas do banco de dados
export async function analyzeDatabaseStats() {
  console.log("📊 [Server Action] analyzeDatabaseStats() - Analisando estatísticas do banco")
  
  const supabase = await getSupabase()
  
  try {
    const stats = {}
    
    // Estatísticas de flashcards
    const { data: flashcardStats } = await supabase
      .from("flashcards")
      .select("difficulty")
    
    if (flashcardStats) {
      stats.flashcards = {
        total: flashcardStats.length,
        byDifficulty: flashcardStats.reduce((acc, card) => {
          acc[card.difficulty] = (acc[card.difficulty] || 0) + 1
          return acc
        }, {})
      }
    }
    
    // Estatísticas de progresso
    const { data: progressStats } = await supabase
      .from("flashcard_progress")
      .select("ease_factor, repetitions")
    
    if (progressStats) {
      const avgEaseFactor = progressStats.reduce((sum, p) => sum + parseFloat(p.ease_factor), 0) / progressStats.length
      const avgRepetitions = progressStats.reduce((sum, p) => sum + p.repetitions, 0) / progressStats.length
      
      stats.progress = {
        total: progressStats.length,
        avgEaseFactor: Math.round(avgEaseFactor * 100) / 100,
        avgRepetitions: Math.round(avgRepetitions * 100) / 100
      }
    }
    
    // Estatísticas de pontuação
    const { data: scoreStats } = await supabase
      .from("scores")
      .select("score_value, activity_type")
    
    if (scoreStats) {
      const totalScore = scoreStats.reduce((sum, s) => sum + s.score_value, 0)
      const byActivity = scoreStats.reduce((acc, s) => {
        acc[s.activity_type] = (acc[s.activity_type] || 0) + 1
        return acc
      }, {})
      
      stats.scores = {
        total: scoreStats.length,
        totalScore,
        avgScore: Math.round(totalScore / scoreStats.length),
        byActivity
      }
    }
    
    // Estatísticas de usuários
    const { data: userStats } = await supabase
      .from("users")
      .select("role")
    
    if (userStats) {
      stats.users = {
        total: userStats.length,
        byRole: userStats.reduce((acc, u) => {
          acc[u.role] = (acc[u.role] || 0) + 1
          return acc
        }, {})
      }
    }
    
    console.log("✅ [Server Action] Análise de estatísticas concluída")
    return { success: true, stats }
  } catch (error) {
    console.error("❌ [Server Action] Erro em analyzeDatabaseStats:", error)
    return { success: false, error: error.message }
  }
}

// Função para limpeza de dados antigos
export async function cleanupOldData() {
  console.log("🧹 [Server Action] cleanupOldData() - Limpando dados antigos")
  
  const supabase = await getSupabase()
  
  try {
    const results = []
    
    // Limpar progresso muito antigo (mais de 1 ano sem atividade)
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    
    const { data: oldProgress, error: progressError } = await supabase
      .from("flashcard_progress")
      .delete()
      .lt("last_reviewed_at", oneYearAgo.toISOString())
      .select()
    
    if (progressError) {
      console.error("❌ [Server Action] Erro ao limpar progresso antigo:", progressError)
      results.push({ table: 'flashcard_progress', status: 'error', message: progressError.message })
    } else {
      console.log(`✅ [Server Action] ${oldProgress?.length || 0} registros de progresso antigos removidos`)
      results.push({ table: 'flashcard_progress', status: 'success', count: oldProgress?.length || 0 })
    }
    
    // Limpar flashcards incorretos muito antigos (mais de 6 meses)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    const { data: oldIncorrect, error: incorrectError } = await supabase
      .from("user_incorrect_flashcards")
      .delete()
      .lt("last_incorrect_at", sixMonthsAgo.toISOString())
      .select()
    
    if (incorrectError) {
      console.error("❌ [Server Action] Erro ao limpar flashcards incorretos antigos:", incorrectError)
      results.push({ table: 'user_incorrect_flashcards', status: 'error', message: incorrectError.message })
    } else {
      console.log(`✅ [Server Action] ${oldIncorrect?.length || 0} registros de flashcards incorretos antigos removidos`)
      results.push({ table: 'user_incorrect_flashcards', status: 'success', count: oldIncorrect?.length || 0 })
    }
    
    console.log("✅ [Server Action] Limpeza de dados antigos concluída")
    return { success: true, results }
  } catch (error) {
    console.error("❌ [Server Action] Erro em cleanupOldData:", error)
    return { success: false, error: error.message }
  }
}

// ==================== MELHORIAS DE PERFORMANCE ====================

// Cache simples em memória para consultas frequentes
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

// Função para limpar cache expirado
function cleanExpiredCache() {
  const now = Date.now()
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > value.ttl) {
      cache.delete(key)
    }
  }
}

// Função para obter dados do cache
function getFromCache<T>(key: string): T | null {
  cleanExpiredCache()
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data
  }
  return null
}

// Função para salvar dados no cache
function setCache<T>(key: string, data: T, ttl: number = 5 * 60 * 1000) { // 5 minutos por padrão
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  })
}

// Função otimizada para buscar flashcards com cache
export async function getFlashcardsByTopicOptimized(topicId: string, limit = 10, offset = 0) {
  const cacheKey = `flashcards_${topicId}_${limit}_${offset}`
  
  // Verificar cache primeiro
  const cached = getFromCache(cacheKey)
  if (cached) {
    console.log("📦 [Server Action] Cache hit para flashcards do tópico:", topicId)
    return cached
  }

  console.log(`📚 [Server Action] getFlashcardsByTopicOptimized() - Tópico: ${topicId}, limite: ${limit}, offset: ${offset}`)
  
  const supabase = await getSupabase()

  try {
    // Buscar flashcards com informações relacionadas em uma única query
    const { data, error } = await supabase
      .from("flashcards")
      .select(`
        id,
        topic_id,
        question,
        answer,
        difficulty,
        created_at,
        topics!inner (
          id,
          name,
          subject_id,
          subjects!inner (
            id,
            name
          )
        )
      `)
      .eq("topic_id", topicId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("❌ [Server Action] Erro ao buscar flashcards:", error)
      return []
    }

    // Processar dados para incluir informações relacionadas
    const processedData = data?.map(flashcard => ({
      id: flashcard.id,
      topic_id: flashcard.topic_id,
      question: flashcard.question,
      answer: flashcard.answer,
      difficulty: flashcard.difficulty,
      created_at: flashcard.created_at,
      topic_name: flashcard.topics?.name,
      subject_name: flashcard.topics?.subjects?.name,
      subject_id: flashcard.topics?.subject_id
    })) || []

    // Salvar no cache por 5 minutos
    setCache(cacheKey, processedData, 5 * 60 * 1000)
    
    console.log(`✅ [Server Action] ${processedData.length} flashcards encontrados e cacheados`)
    return processedData
  } catch (error) {
    console.error("❌ [Server Action] Erro em getFlashcardsByTopicOptimized:", error)
    return []
  }
}

// Função otimizada para buscar estatísticas de tópicos
export async function getTopicsWithStatsOptimized(subjectId: string) {
  const cacheKey = `topics_stats_${subjectId}`
  
  // Verificar cache primeiro
  const cached = getFromCache(cacheKey)
  if (cached) {
    console.log("📦 [Server Action] Cache hit para estatísticas de tópicos:", subjectId)
    return cached
  }

  console.log(`📊 [Server Action] getTopicsWithStatsOptimized() - Matéria: ${subjectId}`)
  
  const supabase = await getSupabase()

  try {
    // Query otimizada para buscar tópicos com estatísticas
    const { data, error } = await supabase
      .from("topics")
      .select(`
        id,
        name,
        description,
        created_at,
        flashcards (
          id,
          difficulty
        ),
        user_progress (
          id,
          completion_percentage,
          last_accessed_at
        )
      `)
      .eq("subject_id", subjectId)
      .order("name", { ascending: true })

    if (error) {
      console.error("❌ [Server Action] Erro ao buscar tópicos:", error)
      return []
    }

    // Processar dados para incluir estatísticas
    const processedData = data?.map(topic => ({
      id: topic.id,
      name: topic.name,
      description: topic.description,
      created_at: topic.created_at,
      totalFlashcards: topic.flashcards?.length || 0,
      totalLessons: topic.flashcards?.length || 0, // Para compatibilidade
      completedLessons: topic.user_progress?.length || 0,
      completionPercentage: topic.user_progress?.[0]?.completion_percentage || 0,
      lastAccessed: topic.user_progress?.[0]?.last_accessed_at,
      difficulty: topic.flashcards?.reduce((sum, card) => sum + card.difficulty, 0) / (topic.flashcards?.length || 1)
    })) || []

    // Salvar no cache por 10 minutos
    setCache(cacheKey, processedData, 10 * 60 * 1000)
    
    console.log(`✅ [Server Action] ${processedData.length} tópicos processados e cacheados`)
    return processedData
  } catch (error) {
    console.error("❌ [Server Action] Erro em getTopicsWithStatsOptimized:", error)
    return []
  }
}

// Função para invalidar cache específico
export async function invalidateCache(pattern?: string) {
  console.log("🗑️ [Server Action] invalidateCache() - Limpando cache")
  
  if (pattern) {
    // Limpar apenas entradas que correspondem ao padrão
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key)
      }
    }
    console.log(`✅ [Server Action] Cache limpo para padrão: ${pattern}`)
  } else {
    // Limpar todo o cache
    cache.clear()
    console.log("✅ [Server Action] Cache completamente limpo")
  }
  
  return { success: true }
}

// Função para obter estatísticas do cache
export async function getCacheStats() {
  console.log("📊 [Server Action] getCacheStats() - Obtendo estatísticas do cache")
  
  cleanExpiredCache()
  
  const stats = {
    totalEntries: cache.size,
    entries: Array.from(cache.entries()).map(([key, value]) => ({
      key,
      age: Date.now() - value.timestamp,
      ttl: value.ttl,
      expiresIn: value.ttl - (Date.now() - value.timestamp)
    }))
  }
  
  console.log(`✅ [Server Action] Cache tem ${stats.totalEntries} entradas`)
  return { success: true, stats }
}

// ==================== SISTEMA DE CONQUISTAS E BADGES ====================

// Função para criar conquistas básicas
export async function createBasicAchievements() {
  console.log("🏆 [Server Action] createBasicAchievements() - Criando conquistas básicas")
  
  const supabase = await getSupabase()
  
  try {
    const achievements = [
      {
        name: 'Primeiro Passo',
        description: 'Estude seu primeiro flashcard',
        icon: '🎯',
        condition_type: 'flashcards_studied',
        condition_value: 1,
        points_reward: 10,
        category: 'study'
      },
      {
        name: 'Estudioso',
        description: 'Estude 50 flashcards',
        icon: '📚',
        condition_type: 'flashcards_studied',
        condition_value: 50,
        points_reward: 50,
        category: 'study'
      },
      {
        name: 'Maratonista',
        description: 'Estude 200 flashcards',
        icon: '🏃',
        condition_type: 'flashcards_studied',
        condition_value: 200,
        points_reward: 200,
        category: 'study'
      },
      {
        name: 'Perfeccionista',
        description: 'Mantenha 90% de acertos em 50 flashcards',
        icon: '⭐',
        condition_type: 'accuracy',
        condition_value: 90,
        points_reward: 100,
        category: 'performance'
      },
      {
        name: 'Consistente',
        description: 'Estude por 7 dias consecutivos',
        icon: '🔥',
        condition_type: 'streak',
        condition_value: 7,
        points_reward: 75,
        category: 'consistency'
      },
      {
        name: 'Revisor Expert',
        description: 'Revise 100 flashcards',
        icon: '🔄',
        condition_type: 'flashcards_reviewed',
        condition_value: 100,
        points_reward: 150,
        category: 'review'
      },
      {
        name: 'Conquistador',
        description: 'Alcance 1000 pontos totais',
        icon: '👑',
        condition_type: 'total_points',
        condition_value: 1000,
        points_reward: 300,
        category: 'milestone'
      },
      {
        name: 'Mestre dos Flashcards',
        description: 'Estude 500 flashcards com 80% de acertos',
        icon: '🎓',
        condition_type: 'mastery',
        condition_value: 500,
        points_reward: 500,
        category: 'mastery'
      }
    ]

    // Criar tabela de conquistas se não existir
    const { error: createTableError } = await supabase.rpc('create_achievements_table_if_not_exists')
    if (createTableError) {
      console.error("❌ [Server Action] Erro ao criar tabela de conquistas:", createTableError)
    }

    const results = []
    for (const achievement of achievements) {
      const { error } = await supabase
        .from("achievements")
        .upsert(achievement, { onConflict: 'name' })

      if (error) {
        console.error("❌ [Server Action] Erro ao criar conquista:", achievement.name, error)
        results.push({ name: achievement.name, status: 'error', message: error.message })
      } else {
        console.log(`✅ [Server Action] Conquista ${achievement.name} criada com sucesso`)
        results.push({ name: achievement.name, status: 'success', message: 'Conquista criada' })
      }
    }

    console.log("✅ [Server Action] Conquistas básicas criadas com sucesso")
    return { success: true, results }
  } catch (error) {
    console.error("❌ [Server Action] Erro em createBasicAchievements:", error)
    return { success: false, error: error.message }
  }
}

// Função para verificar e conceder conquistas
export async function checkAndGrantAchievements(userId: string) {
  console.log("🔍 [Server Action] checkAndGrantAchievements() - Usuário:", userId)
  
  const supabase = await getSupabase()
  
  try {
    // Buscar conquistas disponíveis
    const { data: achievements } = await supabase
      .from("achievements")
      .select("*")

    if (!achievements || achievements.length === 0) {
      console.log("⚠️ [Server Action] Nenhuma conquista encontrada")
      return { success: true, granted: [] }
    }

    // Buscar conquistas já concedidas ao usuário
    const { data: userAchievements } = await supabase
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", userId)

    const grantedAchievementIds = userAchievements?.map(ua => ua.achievement_id) || []

    // Buscar estatísticas do usuário
    const userStats = await getUserDetailedStats(userId)
    if (!userStats.success) {
      console.error("❌ [Server Action] Erro ao obter estatísticas do usuário")
      return { success: false, error: "Erro ao obter estatísticas" }
    }

    const stats = userStats.stats
    const granted = []

    // Verificar cada conquista
    for (const achievement of achievements) {
      if (grantedAchievementIds.includes(achievement.id)) {
        continue // Já concedida
      }

      let shouldGrant = false

      switch (achievement.condition_type) {
        case 'flashcards_studied':
          shouldGrant = stats.flashcardsStudied >= achievement.condition_value
          break
        case 'accuracy':
          shouldGrant = stats.accuracy >= achievement.condition_value
          break
        case 'streak':
          shouldGrant = stats.currentStreak >= achievement.condition_value
          break
        case 'flashcards_reviewed':
          shouldGrant = stats.flashcardsReviewed >= achievement.condition_value
          break
        case 'total_points':
          shouldGrant = stats.totalScore >= achievement.condition_value
          break
        case 'mastery':
          shouldGrant = stats.flashcardsStudied >= achievement.condition_value && stats.accuracy >= 80
          break
      }

      if (shouldGrant) {
        // Conceder conquista
        const { error: grantError } = await supabase
          .from("user_achievements")
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
            granted_at: new Date().toISOString()
          })

        if (grantError) {
          console.error("❌ [Server Action] Erro ao conceder conquista:", achievement.name, grantError)
        } else {
          // Adicionar pontos de recompensa
          await supabase
            .from("scores")
            .insert({
              user_id: userId,
              score_value: achievement.points_reward,
              activity_type: 'achievement',
              activity_id: achievement.id
            })

          granted.push({
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            points_reward: achievement.points_reward
          })

          console.log(`🏆 [Server Action] Conquista concedida: ${achievement.name}`)
        }
      }
    }

    console.log(`✅ [Server Action] ${granted.length} conquistas concedidas`)
    return { success: true, granted }
  } catch (error) {
    console.error("❌ [Server Action] Erro em checkAndGrantAchievements:", error)
    return { success: false, error: error.message }
  }
}

// Função para obter conquistas do usuário
export async function getUserAchievements(userId: string) {
  console.log("🏆 [Server Action] getUserAchievements() - Usuário:", userId)
  
  const supabase = await getSupabase()
  
  try {
    const { data, error } = await supabase
      .from("user_achievements")
      .select(`
        *,
        achievements (
          id,
          name,
          description,
          icon,
          category,
          points_reward
        )
      `)
      .eq("user_id", userId)
      .order("granted_at", { ascending: false })

    if (error) {
      console.error("❌ [Server Action] Erro ao buscar conquistas do usuário:", error)
      return { success: false, achievements: [] }
    }

    const achievements = data?.map(ua => ({
      id: ua.id,
      granted_at: ua.granted_at,
      achievement: ua.achievements
    })) || []

    console.log(`✅ [Server Action] ${achievements.length} conquistas encontradas`)
    return { success: true, achievements }
  } catch (error) {
    console.error("❌ [Server Action] Erro em getUserAchievements:", error)
    return { success: false, achievements: [] }
  }
}

// Função para obter todas as conquistas disponíveis
export async function getAllAchievements() {
  console.log("🏆 [Server Action] getAllAchievements() - Buscando todas as conquistas")
  
  const supabase = await getSupabase()
  
  try {
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .order("points_reward", { ascending: true })

    if (error) {
      console.error("❌ [Server Action] Erro ao buscar conquistas:", error)
      return { success: false, achievements: [] }
    }

    console.log(`✅ [Server Action] ${data?.length || 0} conquistas encontradas`)
    return { success: true, achievements: data || [] }
  } catch (error) {
    console.error("❌ [Server Action] Erro em getAllAchievements:", error)
    return { success: false, achievements: [] }
  }
}

// ==================== SISTEMA DE EXPORTAÇÃO E IMPORTAÇÃO ====================

// Função para exportar flashcards para arquivo TXT
export async function exportFlashcardsToTxt(subjectId?: string, topicId?: string) {
  console.log("📤 [Server Action] exportFlashcardsToTxt() - Subject:", subjectId, "Topic:", topicId)
  
  const supabase = await getSupabase()
  
  try {
    let query = supabase
      .from("flashcards")
      .select(`
        id,
        question,
        answer,
        difficulty,
        created_at,
        topics!inner (
          id,
          name,
          subject_id,
          subjects!inner (
            id,
            name
          )
        )
      `)
      .order("created_at", { ascending: true })

    // Filtrar por assunto se especificado
    if (subjectId) {
      query = query.eq("topics.subject_id", subjectId)
    }

    // Filtrar por tópico se especificado
    if (topicId) {
      query = query.eq("topic_id", topicId)
    }

    const { data: flashcards, error } = await query

    if (error) {
      console.error("❌ [Server Action] Erro ao buscar flashcards:", error)
      return { success: false, error: error.message }
    }

    if (!flashcards || flashcards.length === 0) {
      console.log("⚠️ [Server Action] Nenhum flashcard encontrado para exportação")
      return { success: false, error: "Nenhum flashcard encontrado" }
    }

    // Gerar conteúdo do arquivo TXT
    let content = `# EXPORTAÇÃO DE FLASHCARDS\n`
    content += `# Gerado em: ${new Date().toLocaleString('pt-BR')}\n`
    content += `# Total de flashcards: ${flashcards.length}\n\n`

    // Agrupar por assunto e tópico
    const groupedFlashcards = flashcards.reduce((acc, flashcard) => {
      const subjectName = flashcard.topics?.subjects?.name || 'Sem assunto'
      const topicName = flashcard.topics?.name || 'Sem tópico'
      
      if (!acc[subjectName]) {
        acc[subjectName] = {}
      }
      if (!acc[subjectName][topicName]) {
        acc[subjectName][topicName] = []
      }
      
      acc[subjectName][topicName].push(flashcard)
      return acc
    }, {} as Record<string, Record<string, any[]>>)

    // Gerar conteúdo organizado
    Object.entries(groupedFlashcards).forEach(([subjectName, topics]) => {
      content += `## ASSUNTO: ${subjectName.toUpperCase()}\n\n`
      
      Object.entries(topics).forEach(([topicName, topicFlashcards]) => {
        content += `### TÓPICO: ${topicName}\n\n`
        
        topicFlashcards.forEach((flashcard, index) => {
          content += `[${index + 1}] ID: ${flashcard.id}\n`
          content += `PERGUNTA: ${flashcard.question}\n`
          content += `RESPOSTA: ${flashcard.answer}\n`
          content += `DIFICULDADE: ${flashcard.difficulty}\n`
          content += `CRIADO EM: ${new Date(flashcard.created_at).toLocaleString('pt-BR')}\n`
          content += `---\n\n`
        })
      })
    })

    console.log(`✅ [Server Action] ${flashcards.length} flashcards exportados`)
    return { 
      success: true, 
      content, 
      filename: `flashcards_${new Date().toISOString().split('T')[0]}.txt`,
      count: flashcards.length
    }
  } catch (error) {
    console.error("❌ [Server Action] Erro em exportFlashcardsToTxt:", error)
    return { success: false, error: error.message }
  }
}

// Função para importar flashcards de arquivo TXT
export async function importFlashcardsFromTxt(content: string, userId: string) {
  console.log("📥 [Server Action] importFlashcardsFromTxt() - User:", userId)
  
  const supabase = await getSupabase()
  
  try {
    const lines = content.split('\n')
    const flashcards = []
    let currentFlashcard: any = null
    let currentSubject = ''
    let currentTopic = ''
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Pular comentários e linhas vazias
      if (line.startsWith('#') || line.startsWith('//') || line === '' || line === '---') {
        continue
      }
      
      // Detectar assunto
      if (line.startsWith('## ASSUNTO:')) {
        currentSubject = line.replace('## ASSUNTO:', '').trim()
        continue
      }
      
      // Detectar tópico
      if (line.startsWith('### TÓPICO:')) {
        currentTopic = line.replace('### TÓPICO:', '').trim()
        continue
      }
      
      // Detectar início de flashcard
      if (line.startsWith('[') && line.includes('] ID:')) {
        // Salvar flashcard anterior se existir
        if (currentFlashcard && currentFlashcard.question && currentFlashcard.answer) {
          flashcards.push(currentFlashcard)
        }
        
        // Iniciar novo flashcard
        const id = line.split('ID: ')[1]
        currentFlashcard = {
          id,
          question: '',
          answer: '',
          difficulty: 3, // Padrão
          subject: currentSubject,
          topic: currentTopic
        }
        continue
      }
      
      // Extrair dados do flashcard
      if (currentFlashcard) {
        if (line.startsWith('PERGUNTA:')) {
          currentFlashcard.question = line.replace('PERGUNTA:', '').trim()
        } else if (line.startsWith('RESPOSTA:')) {
          currentFlashcard.answer = line.replace('RESPOSTA:', '').trim()
        } else if (line.startsWith('DIFICULDADE:')) {
          currentFlashcard.difficulty = parseInt(line.replace('DIFICULDADE:', '').trim()) || 3
        }
      }
    }
    
    // Adicionar último flashcard se existir
    if (currentFlashcard && currentFlashcard.question && currentFlashcard.answer) {
      flashcards.push(currentFlashcard)
    }
    
    if (flashcards.length === 0) {
      console.log("⚠️ [Server Action] Nenhum flashcard válido encontrado no arquivo")
      return { success: false, error: "Nenhum flashcard válido encontrado no arquivo" }
    }
    
    console.log(`📥 [Server Action] ${flashcards.length} flashcards encontrados no arquivo`)
    
    // Buscar IDs de assuntos e tópicos
    const subjectTopicMap = new Map()
    const results = []
    
    for (const flashcard of flashcards) {
      try {
        // Buscar ou criar assunto
        let { data: subject } = await supabase
          .from("subjects")
          .select("id")
          .eq("name", flashcard.subject)
          .single()
        
        if (!subject) {
          const { data: newSubject, error: subjectError } = await supabase
            .from("subjects")
            .insert({
              name: flashcard.subject,
              description: `Assunto criado via importação - ${new Date().toLocaleString('pt-BR')}`,
              created_by_user_id: userId
            })
            .select("id")
            .single()
          
          if (subjectError) {
            console.error("❌ [Server Action] Erro ao criar assunto:", subjectError)
            results.push({ 
              flashcard, 
              status: 'error', 
              error: `Erro ao criar assunto: ${subjectError.message}` 
            })
            continue
          }
          subject = newSubject
        }
        
        // Buscar ou criar tópico
        const topicKey = `${subject.id}_${flashcard.topic}`
        let topicId = subjectTopicMap.get(topicKey)
        
        if (!topicId) {
          let { data: topic } = await supabase
            .from("topics")
            .select("id")
            .eq("name", flashcard.topic)
            .eq("subject_id", subject.id)
            .single()
          
          if (!topic) {
            const { data: newTopic, error: topicError } = await supabase
              .from("topics")
              .insert({
                name: flashcard.topic,
                description: `Tópico criado via importação - ${new Date().toLocaleString('pt-BR')}`,
                subject_id: subject.id,
                created_by_user_id: userId
              })
              .select("id")
              .single()
            
            if (topicError) {
              console.error("❌ [Server Action] Erro ao criar tópico:", topicError)
              results.push({ 
                flashcard, 
                status: 'error', 
                error: `Erro ao criar tópico: ${topicError.message}` 
              })
              continue
            }
            topic = newTopic
          }
          
          topicId = topic.id
          subjectTopicMap.set(topicKey, topicId)
        }
        
        // Atualizar flashcard existente ou criar novo
        const { data: existingFlashcard } = await supabase
          .from("flashcards")
          .select("id")
          .eq("id", flashcard.id)
          .single()
        
        if (existingFlashcard) {
          // Atualizar flashcard existente
          const { error: updateError } = await supabase
            .from("flashcards")
            .update({
              question: flashcard.question,
              answer: flashcard.answer,
              difficulty: flashcard.difficulty,
              topic_id: topicId
            })
            .eq("id", flashcard.id)
          
          if (updateError) {
            console.error("❌ [Server Action] Erro ao atualizar flashcard:", updateError)
            results.push({ 
              flashcard, 
              status: 'error', 
              error: `Erro ao atualizar: ${updateError.message}` 
            })
          } else {
            results.push({ 
              flashcard, 
              status: 'updated', 
              message: 'Flashcard atualizado com sucesso' 
            })
          }
        } else {
          // Criar novo flashcard
          const { error: insertError } = await supabase
            .from("flashcards")
            .insert({
              id: flashcard.id,
              question: flashcard.question,
              answer: flashcard.answer,
              difficulty: flashcard.difficulty,
              topic_id: topicId,
              created_by_user_id: userId
            })
          
          if (insertError) {
            console.error("❌ [Server Action] Erro ao criar flashcard:", insertError)
            results.push({ 
              flashcard, 
              status: 'error', 
              error: `Erro ao criar: ${insertError.message}` 
            })
          } else {
            results.push({ 
              flashcard, 
              status: 'created', 
              message: 'Flashcard criado com sucesso' 
            })
          }
        }
        
      } catch (error) {
        console.error("❌ [Server Action] Erro ao processar flashcard:", error)
        results.push({ 
          flashcard, 
          status: 'error', 
          error: `Erro no processamento: ${error.message}` 
        })
      }
    }
    
    const successCount = results.filter(r => r.status === 'updated' || r.status === 'created').length
    const errorCount = results.filter(r => r.status === 'error').length
    
    console.log(`✅ [Server Action] Importação concluída: ${successCount} sucessos, ${errorCount} erros`)
    
    return { 
      success: true, 
      results, 
      summary: {
        total: flashcards.length,
        success: successCount,
        errors: errorCount
      }
    }
  } catch (error) {
    console.error("❌ [Server Action] Erro em importFlashcardsFromTxt:", error)
    return { success: false, error: error.message }
  }
}

// ==================== SISTEMA DE PONTUAÇÃO AUTOMÁTICA ====================

// Função para registrar pontuação quando usuário completa flashcard
export async function recordFlashcardCompletion(userId: string, flashcardId: string, isCorrect: boolean, quality: number = 3) {
  console.log("🎯 [Server Action] recordFlashcardCompletion() - Usuário:", userId, "Flashcard:", flashcardId, "Correto:", isCorrect)
  
  const supabase = await getSupabase()
  
  try {
    // Calcula pontuação baseada na qualidade da resposta
    let scoreValue = 0
    if (isCorrect) {
      switch (quality) {
        case 5: scoreValue = 25 // Excelente
        case 4: scoreValue = 20 // Bom
        case 3: scoreValue = 15 // Médio
        case 2: scoreValue = 10 // Ruim
        case 1: scoreValue = 5  // Muito ruim
        default: scoreValue = 15
      }
    } else {
      scoreValue = 2 // Pontos por tentativa
    }

    // Registra pontuação
    const { error: scoreError } = await supabase
      .from("scores")
      .insert({
        user_id: userId,
        activity_type: 'flashcard',
        score_value: scoreValue,
        activity_id: flashcardId,
        recorded_at: new Date().toISOString()
      })

    if (scoreError) {
      console.error("❌ [Server Action] Erro ao registrar pontuação:", scoreError)
      return { success: false }
    }

    // Registra progresso do flashcard
    const { error: progressError } = await supabase
      .from("flashcard_progress")
      .upsert({
        user_id: userId,
        flashcard_id: flashcardId,
        last_reviewed_at: new Date().toISOString(),
        quality: quality,
        repetitions: 1,
        ease_factor: 2.5,
        interval_days: 1
      })

    if (progressError) {
      console.error("❌ [Server Action] Erro ao registrar progresso:", progressError)
    }

    console.log("✅ [Server Action] Flashcard completado e pontuação registrada:", scoreValue)
    return { success: true, score: scoreValue }
  } catch (error) {
    console.error("❌ [Server Action] Erro em recordFlashcardCompletion:", error)
    return { success: false }
  }
}

// Função para registrar pontuação quando usuário completa quiz
export async function recordQuizCompletion(userId: string, quizId: string, score: number, totalQuestions: number, durationSeconds: number) {
  console.log("🎯 [Server Action] recordQuizCompletion() - Usuário:", userId, "Quiz:", quizId, "Pontuação:", score, "/", totalQuestions)
  
  const supabase = await getSupabase()
  
  try {
    // Calcula pontuação baseada na performance
    const accuracy = (score / totalQuestions) * 100
    let scoreValue = 0
    
    if (accuracy >= 90) scoreValue = 100      // Excelente
    else if (accuracy >= 80) scoreValue = 80  // Muito bom
    else if (accuracy >= 70) scoreValue = 60  // Bom
    else if (accuracy >= 60) scoreValue = 40  // Médio
    else if (accuracy >= 50) scoreValue = 20  // Ruim
    else scoreValue = 10                      // Muito ruim

    // Bonus por velocidade (se completou em tempo razoável)
    if (durationSeconds < 300) { // Menos de 5 minutos
      scoreValue += 20
    } else if (durationSeconds < 600) { // Menos de 10 minutos
      scoreValue += 10
    }

    // Registra pontuação
    const { error: scoreError } = await supabase
      .from("scores")
      .insert({
        user_id: userId,
        activity_type: 'quiz',
        score_value: scoreValue,
        activity_id: quizId,
        recorded_at: new Date().toISOString()
      })

    if (scoreError) {
      console.error("❌ [Server Action] Erro ao registrar pontuação:", scoreError)
      return { success: false }
    }

    // Registra tentativa do quiz
    const { error: attemptError } = await supabase
      .from("quiz_attempts")
      .insert({
        user_id: userId,
        quiz_id: quizId,
        score: score,
        total_questions: totalQuestions,
        duration_seconds: durationSeconds,
        attempt_date: new Date().toISOString()
      })

    if (attemptError) {
      console.error("❌ [Server Action] Erro ao registrar tentativa:", attemptError)
    }

    console.log("✅ [Server Action] Quiz completado e pontuação registrada:", scoreValue)
    return { success: true, score: scoreValue, accuracy: Math.round(accuracy) }
  } catch (error) {
    console.error("❌ [Server Action] Erro em recordQuizCompletion:", error)
    return { success: false }
  }
}

// Função para registrar pontuação quando usuário completa aula/lição
export async function recordLessonCompletion(userId: string, lessonId: string, durationMinutes: number) {
  console.log("🎯 [Server Action] recordLessonCompletion() - Usuário:", userId, "Aula:", lessonId, "Duração:", durationMinutes, "min")
  
  const supabase = await getSupabase()
  
  try {
    // Calcula pontuação baseada na duração da aula
    let scoreValue = 50 // Pontuação base
    
    if (durationMinutes >= 30) scoreValue += 50      // Aula longa
    else if (durationMinutes >= 15) scoreValue += 25  // Aula média
    else scoreValue += 10                            // Aula curta

    // Registra pontuação
    const { error: scoreError } = await supabase
      .from("scores")
      .insert({
        user_id: userId,
        activity_type: 'lesson',
        score_value: scoreValue,
        activity_id: lessonId,
        recorded_at: new Date().toISOString()
      })

    if (scoreError) {
      console.error("❌ [Server Action] Erro ao registrar pontuação:", scoreError)
      return { success: false }
    }

    console.log("✅ [Server Action] Aula completada e pontuação registrada:", scoreValue)
    return { success: true, score: scoreValue }
  } catch (error) {
    console.error("❌ [Server Action] Erro em recordLessonCompletion:", error)
    return { success: false }
  }
}

// Função para obter estatísticas detalhadas do usuário
export async function getUserDetailedStats(userId: string) {
  console.log("📊 [Server Action] getUserDetailedStats() para usuário:", userId)
  
  const supabase = await getSupabase()
  
  try {
    // Busca todas as pontuações do usuário
    const { data: scores } = await supabase
      .from("scores")
      .select("activity_type, score_value, recorded_at")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false })

    // Busca progresso em flashcards
    const { data: flashcardProgress } = await supabase
      .from("flashcard_progress")
      .select("id, quality, repetitions")
      .eq("user_id", userId)

    // Busca tentativas de quiz
    const { data: quizAttempts } = await supabase
      .from("quiz_attempts")
      .select("score, total_questions, duration_seconds, attempt_date")
      .eq("user_id", userId)

    // Calcula estatísticas
    const totalScore = scores?.reduce((sum, score) => sum + score.score_value, 0) || 0
    const totalXP = totalScore
    const level = Math.floor(totalXP / 100) + 1
    
    // Estatísticas por tipo de atividade
    const flashcardScores = scores?.filter(s => s.activity_type === 'flashcard') || []
    const quizScores = scores?.filter(s => s.activity_type === 'quiz') || []
    const lessonScores = scores?.filter(s => s.activity_type === 'lesson') || []
    
    // Estatísticas de flashcards
    const flashcardsStudied = flashcardProgress?.length || 0
    const averageFlashcardQuality = flashcardProgress?.length > 0 
      ? flashcardProgress.reduce((sum, fp) => sum + (fp.quality || 0), 0) / flashcardProgress.length 
      : 0
    
    // Estatísticas de quizzes
    const quizzesCompleted = quizAttempts?.length || 0
    const averageQuizScore = quizAttempts?.length > 0
      ? quizAttempts.reduce((sum, qa) => sum + qa.score, 0) / quizAttempts.length
      : 0
    const averageQuizAccuracy = quizAttempts?.length > 0
      ? quizAttempts.reduce((sum, qa) => sum + (qa.score / qa.total_questions * 100), 0) / quizAttempts.length
      : 0
    
    // Estatísticas de aulas
    const lessonsCompleted = lessonScores?.length || 0
    
    // Streak (dias consecutivos estudando)
    const studyDates = scores?.map(s => new Date(s.recorded_at).toDateString()) || []
    const uniqueDates = [...new Set(studyDates)]
    const currentStreak = calculateStreak(uniqueDates.map(date => {
      const studyDate = new Date(date)
      const today = new Date()
      const diffTime = today.getTime() - studyDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 1 // Estudou hoje ou ontem
    }))

    const stats = {
      totalScore,
      totalXP,
      level,
      flashcardsStudied,
      averageFlashcardQuality: Math.round(averageFlashcardQuality * 10) / 10,
      quizzesCompleted,
      averageQuizScore: Math.round(averageQuizScore * 10) / 10,
      averageQuizAccuracy: Math.round(averageQuizAccuracy * 10) / 10,
      lessonsCompleted,
      currentStreak,
      totalActivities: scores?.length || 0,
      lastActivity: scores?.[0]?.recorded_at || null
    }

    console.log("📊 [Server Action] Estatísticas detalhadas:", stats)
    
    return { success: true, stats }
  } catch (error) {
    console.error("❌ [Server Action] Erro em getUserDetailedStats:", error)
    return { success: false, stats: null }
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