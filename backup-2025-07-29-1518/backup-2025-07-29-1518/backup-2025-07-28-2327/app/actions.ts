"use server"

import { createClient as createServerClient } from "@/lib/supabaseServer"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { supabaseAdmin } from '@/lib/supabaseServer'
import { getUserRoleServer } from '@/lib/get-user-role-server'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { createClient } from '@/lib/supabase-server'

/**
 * Obtém uma instância do Supabase (server-side)
 */
async function getSupabase() {
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

    // Verificar se o usuário está autenticado antes de fazer upload
    if (!user) {
      return { success: false, error: "Usuário não autenticado" }
    }

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

      // Verificar tipo do arquivo (aceitar imagens e PDFs)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
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
        
        // Tratamento específico para erros de RLS
        if (uploadError.message.includes('row-level security policy') || uploadError.message.includes('must be owner')) {
          return { 
            success: false, 
            error: `Erro de permissão no upload. Configure manualmente o bucket 'redacoes' no painel do Supabase com políticas básicas. Detalhes: ${uploadError.message}` 
          }
        }
        
        return { success: false, error: `Erro no upload da imagem ${i + 1}: ${uploadError.message}` }
      }

      const { data: { publicUrl } } = supabase.storage
        .from('redacoes')
        .getPublicUrl(fileName)

      // Inserir registro na tabela redacao_imagens
      const { error: insertError } = await supabase
        .from('redacao_imagens')
        .insert({
          redacao_id: redacao.id,
          url: publicUrl,
          ordem: i + 1,
          rotation: 0,
          file_name: fileName,
          file_size: file.size,
          mime_type: file.type
        })

      if (insertError) {
        console.error(`❌ Erro ao inserir registro da imagem ${i + 1}:`, insertError)
        // Tentar deletar o arquivo do storage se falhar ao inserir no banco
        await supabase.storage.from('redacoes').remove([fileName])
        return { success: false, error: `Erro ao salvar dados da imagem ${i + 1}` }
      }

      imagensUrls.push({
        url: publicUrl,
        ordem: i + 1,
        rotation: 0,
        file_name: fileName
      })
    }

    // Se nenhum arquivo foi enviado com sucesso
    if (imagensUrls.length === 0) {
      // Deletar a redação criada
      await supabase.from('redacoes').delete().eq('id', redacao.id)
      return { success: false, error: "Nenhum arquivo foi enviado com sucesso" }
    }

    console.log(`✅ Redação criada com sucesso - ID: ${redacao.id}, ${imagensUrls.length} arquivos enviados`)
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
  const supabase = createBrowserClient()

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
  const supabase = createBrowserClient()

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
  const supabase = createBrowserClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Logout error:", error)
    // Optionally, handle the error more gracefully, e.g., show a toast
  }

  revalidatePath("/", "layout")
  redirect("/login")
}

export async function getUserRole() {
  const supabase = createBrowserClient()
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

// ========================================
// SISTEMA DE PROVAS ONLINE
// ========================================

export async function getProvas() {
  try {
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

    if (error) throw error;
    return { data: provas, error: null };
  } catch (error) {
    console.error('Erro ao buscar provas:', error);
    return { data: null, error };
  }
}

export async function getProvasProfessor() {
  try {
    console.log('🔍 Iniciando getProvasProfessor...')
    
    const supabase = createClient();
    
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
    if (error.message.includes('não autenticado') || error.message.includes('Auth')) {
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
    
    const supabase = createClient();
    
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
    const supabase = createBrowserClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Usuário não autenticado');

    const { data: prova, error } = await supabase
      .from('provas')
      .update({
        ...dados,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', provaId)
      .eq('criado_por', user.id)
      .select()
      .single();

    if (error) throw error;
    return { data: prova, error: null };
  } catch (error) {
    console.error('Erro ao atualizar prova:', error);
    return { data: null, error };
  }
}

export async function publicarProva(provaId: string) {
  try {
    console.log('🔍 Iniciando publicarProva...', provaId)
    
    const supabase = createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Erro de autenticação:', authError);
      throw new Error('Usuário não autenticado');
    }

    console.log('✅ Usuário autenticado:', user.email);

    const { data, error } = await supabaseAdmin
      .from('provas')
      .update({ status: 'publicada' })
      .eq('id', provaId)
      .select();

    if (error) {
      console.error('❌ Erro ao publicar prova:', error);
      throw error;
    }

    console.log('✅ Prova publicada com sucesso:', data);
    revalidatePath('/provas');
    return { data, error: null };
  } catch (error) {
    console.error('❌ Erro em publicarProva:', error);
    return { data: null, error };
  }
}

export async function arquivarProva(provaId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('provas')
      .update({ status: 'arquivada' })
      .eq('id', provaId);
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deletarProva(provaId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('provas')
      .delete()
      .eq('id', provaId);
    if (error) throw error;
    return { data: { success: true }, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getProvaCompleta(provaId: string) {
  try {
    console.log('🔍 Iniciando getProvaCompleta...')
    
    const supabase = createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Erro de autenticação:', authError);
      throw new Error('Usuário não autenticado');
    }

    console.log('✅ Usuário autenticado:', user.email);

    // Buscar a prova com todas as informações
    const { data: prova, error: provaError } = await supabaseAdmin
      .from('provas')
      .select(`
        *,
        questoes (
          *,
          opcoes_questao (*)
        )
      `)
      .eq('id', provaId)
      .single();

    if (provaError) {
      console.error('Erro ao buscar prova:', provaError);
      throw provaError;
    }

    console.log('✅ Prova encontrada:', prova);
    return { data: prova, error: null };
  } catch (error) {
    console.error('Erro ao buscar prova completa:', error);
    return { data: null, error };
  }
}

export async function iniciarTentativa(provaId: string) {
  try {
    console.log('🔍 Iniciando iniciarTentativa...', provaId)
    
    const supabase = createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Erro de autenticação:', authError);
      throw new Error('Usuário não autenticado');
    }

    console.log('✅ Usuário autenticado:', user.email);

    // Verificar se já existe uma tentativa em andamento
    const { data: tentativaExistente, error: checkError } = await supabaseAdmin
      .from('tentativas_prova')
      .select('*')
      .eq('prova_id', provaId)
      .eq('aluno_id', user.id)
      .eq('status', 'em_andamento')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar tentativa existente:', checkError);
      throw checkError;
    }

    if (tentativaExistente) {
      console.log('✅ Tentativa existente encontrada:', tentativaExistente);
      return { data: tentativaExistente, error: null };
    }

    const { data: tentativa, error } = await supabaseAdmin
      .from('tentativas_prova')
      .insert({
        prova_id: provaId,
        aluno_id: user.id,
        status: 'em_andamento',
        iniciada_em: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar tentativa:', error);
      throw error;
    }

    console.log('✅ Tentativa criada com sucesso:', tentativa);
    return { data: tentativa, error: null };
  } catch (error) {
    console.error('❌ Erro em iniciarTentativa:', error);
    return { data: null, error };
  }
}

export async function salvarResposta(tentativaId: string, questaoId: string, resposta: string) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabaseAdmin
      .from('respostas_aluno')
      .upsert({
        tentativa_id: tentativaId,
        questao_id: questaoId,
        aluno_id: user.id,
        resposta: resposta,
        respondida_em: new Date().toISOString()
      })
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
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Usuário não autenticado');

    // Buscar todas as respostas da tentativa
    const { data: respostas, error: respostasError } = await supabaseAdmin
      .from('respostas_aluno')
      .select(`
        *,
        questao:questoes (
          pontuacao,
          resposta_correta
        )
      `)
      .eq('tentativa_id', tentativaId);

    if (respostasError) throw respostasError;

    // Calcular nota final
    let notaFinal = 0;
    let totalPontos = 0;

    respostas?.forEach((resposta) => {
      totalPontos += resposta.questao.pontuacao;
      if (resposta.resposta === resposta.questao.resposta_correta) {
        notaFinal += resposta.questao.pontuacao;
      }
    });

    const notaPercentual = totalPontos > 0 ? (notaFinal / totalPontos) * 10 : 0;

    // Atualizar tentativa
    const { data: tentativa, error } = await supabaseAdmin
      .from('tentativas_prova')
      .update({
        status: 'finalizada',
        nota_final: notaPercentual,
        finalizada_em: new Date().toISOString()
      })
      .eq('id', tentativaId)
      .select()
      .single();

    if (error) throw error;
    return { data: { ...tentativa, nota_final: notaPercentual }, error: null };
  } catch (error) {
    console.error('Erro ao finalizar tentativa:', error);
    return { data: null, error };
  }
}

export async function getTentativasAluno() {
  try {
    console.log('🔍 Iniciando getTentativasAluno...')
    
    const supabase = createClient();
    
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
      .eq('aluno_id', user.id)
      .order('iniciada_em', { ascending: false });

    if (error) throw error;
    
    console.log('✅ Tentativas encontradas:', tentativas?.length || 0);
    return { data: tentativas, error: null };
  } catch (error) {
    console.error('💥 Erro em getTentativasAluno:', error);
    
    // Se for erro de autenticação, redirecionar
    if (error.message.includes('não autenticado') || error.message.includes('Auth')) {
      redirect('/login')
    }
    
    return { data: null, error };
  }
}

export async function getTentativasProfessor() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Usuário não autenticado');

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
      .eq('prova.criado_por', user.id)
      .order('iniciada_em', { ascending: false });

    if (error) throw error;
    return { data: tentativas, error: null };
  } catch (error) {
    console.error('Erro ao buscar tentativas do professor:', error);
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
    
    const supabase = createClient();
    
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

    // Se for verdadeiro/falso, inserir opções
    if (questaoData.tipo === 'verdadeiro_falso') {
      const opcoesData = [
        {
          questao_id: questao.id,
          texto: 'Verdadeiro',
          ordem: 1,
          is_correta: questaoData.resposta_correta === 'verdadeiro'
        },
        {
          questao_id: questao.id,
          texto: 'Falso',
          ordem: 2,
          is_correta: questaoData.resposta_correta === 'falso'
        }
      ];

      const { error: opcoesError } = await supabaseAdmin
        .from('opcoes_questao')
        .insert(opcoesData);

      if (opcoesError) {
        console.error('Erro ao inserir opções V/F:', opcoesError);
        throw opcoesError;
      }

      console.log('✅ Opções V/F inseridas');
    }

    // Se for associação, inserir pares
    if (questaoData.tipo === 'associacao' && questaoData.opcoes) {
      const opcoesData = questaoData.opcoes
        .filter((opcao, index) => index % 2 === 0) // Pegar apenas os itens (não os correspondentes)
        .map((item, index) => ({
          questao_id: questao.id,
          texto: `${item} → ${questaoData.opcoes![index * 2 + 1]}`,
          ordem: index + 1,
          is_correta: true // Todas as associações são corretas
        }));

      const { error: opcoesError } = await supabaseAdmin
        .from('opcoes_questao')
        .insert(opcoesData);

      if (opcoesError) {
        console.error('Erro ao inserir associações:', opcoesError);
        throw opcoesError;
      }

      console.log('✅ Associações inseridas');
    }

    // Se for ordenação, inserir itens
    if (questaoData.tipo === 'ordenacao' && questaoData.opcoes) {
      const opcoesData = questaoData.opcoes.map((item, index) => ({
        questao_id: questao.id,
        texto: item,
        ordem: index + 1,
        is_correta: true // A ordem correta é a sequência original
      }));

      const { error: opcoesError } = await supabaseAdmin
        .from('opcoes_questao')
        .insert(opcoesData);

      if (opcoesError) {
        console.error('Erro ao inserir itens de ordenação:', opcoesError);
        throw opcoesError;
      }

      console.log('✅ Itens de ordenação inseridos');
    }

    revalidatePath('/provas');
    return { data: questao, error: null };
  } catch (error) {
    console.error('Erro ao adicionar questão:', error);
    return { data: null, error };
  }
}

export async function atualizarQuestao(questaoId: string, questaoData: {
  tipo: 'multipla_escolha' | 'dissertativa';
  enunciado: string;
  pontuacao: number;
  ordem: number;
  opcoes?: string[];
  resposta_correta?: string;
}) {
  try {
    console.log('🔍 Iniciando atualizarQuestao...')
    
    const supabase = createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Erro de autenticação:', authError);
      throw new Error('Usuário não autenticado');
    }

    console.log('✅ Usuário autenticado:', user.email);

    // Atualizar questão
    const { data: questao, error: questaoError } = await supabaseAdmin
      .from('questoes')
      .update({
        tipo: questaoData.tipo,
        enunciado: questaoData.enunciado,
        pontuacao: questaoData.pontuacao,
        ordem: questaoData.ordem
      })
      .eq('id', questaoId)
      .select()
      .single();

    if (questaoError) {
      console.error('Erro ao atualizar questão:', questaoError);
      throw questaoError;
    }

    console.log('✅ Questão atualizada:', questao);

    // Se for múltipla escolha, atualizar opções
    if (questaoData.tipo === 'multipla_escolha' && questaoData.opcoes) {
      // Deletar opções antigas
      await supabaseAdmin
        .from('opcoes_questao')
        .delete()
        .eq('questao_id', questaoId);

      // Inserir novas opções
      const opcoesData = questaoData.opcoes.map((opcao, index) => ({
        questao_id: questaoId,
        texto: opcao,
        ordem: index + 1,
        is_correta: opcao === questaoData.resposta_correta
      }));

      const { error: opcoesError } = await supabaseAdmin
        .from('opcoes_questao')
        .insert(opcoesData);

      if (opcoesError) {
        console.error('Erro ao atualizar opções:', opcoesError);
        throw opcoesError;
      }

      console.log('✅ Opções atualizadas');
    }

    revalidatePath('/provas');
    return { data: questao, error: null };
  } catch (error) {
    console.error('Erro ao atualizar questão:', error);
    return { data: null, error };
  }
}

export async function deletarQuestao(questaoId: string) {
  try {
    console.log('🔍 Iniciando deletarQuestao...')
    
    const supabase = createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Erro de autenticação:', authError);
      throw new Error('Usuário não autenticado');
    }

    console.log('✅ Usuário autenticado:', user.email);

    // Deletar opções primeiro (se existirem)
    await supabaseAdmin
      .from('opcoes_questao')
      .delete()
      .eq('questao_id', questaoId);

    // Deletar questão
    const { error } = await supabaseAdmin
      .from('questoes')
      .delete()
      .eq('id', questaoId);

    if (error) {
      console.error('Erro ao deletar questão:', error);
      throw error;
    }

    console.log('✅ Questão deletada');

    revalidatePath('/provas');
    return { success: true, error: null };
  } catch (error) {
    console.error('Erro ao deletar questão:', error);
    return { success: false, error };
  }
}

export async function getQuestoesProva(provaId: string) {
  try {
    console.log('🔍 Iniciando getQuestoesProva...')
    
    const supabase = createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Erro de autenticação:', authError);
      throw new Error('Usuário não autenticado');
    }

    console.log('✅ Usuário autenticado:', user.email);

    const { data: questoes, error } = await supabaseAdmin
      .from('questoes')
      .select(`
        *,
        opcoes:opcoes_questao (
          id,
          texto,
          ordem,
          is_correta
        )
      `)
      .eq('prova_id', provaId)
      .order('ordem', { ascending: true });

    if (error) {
      console.error('Erro ao buscar questões:', error);
      throw error;
    }

    console.log('✅ Questões encontradas:', questoes?.length || 0);
    return { data: questoes, error: null };
  } catch (error) {
    console.error('Erro ao buscar questões:', error);
    return { data: null, error };
  }
}
