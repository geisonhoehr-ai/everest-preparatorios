"use server"

import { createClient } from "@/lib/supabaseServer"
import { revalidatePath } from "next/cache"
import { inputValidator } from '@/lib/input-validation'
import { logger } from '@/lib/logger'
import type { CommunityPost, CommunityComment, CommunityCategory } from "@/lib/types"

// Função para obter todos os posts da comunidade
export async function getCommunityPosts(): Promise<CommunityPost[]> {
  try {
    const supabase = createClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()
    const currentUserId = userData?.user?.id

    const { data, error } = await supabase
      .from("community_posts")
      .select(`
        id,
        user_id,
        title,
        content,
        tags,
        created_at,
        updated_at,
        community_likes(user_id),
        profiles(full_name, avatar_url),
        auth_users(email)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar posts da comunidade:", error)
      return []
    }

    const postsWithDetails = data.map((post) => {
      const likes = post.community_likes as { user_id: string }[]
      const likes_count = likes ? likes.length : 0
      const has_liked = currentUserId ? likes?.some((like) => like.user_id === currentUserId) : false

      // Tenta pegar nome e avatar do perfil, senão usa email
      const author_name = (post.profiles as any)?.full_name || (post.auth_users as any)?.email || "Usuário"
      const author_avatar = (post.profiles as any)?.avatar_url || null

      return {
        ...post,
        author_name,
        author_avatar,
        likes_count,
        has_liked,
        category_id: null, // Adicionar campo obrigatório
      }
    }) as CommunityPost[]

    return postsWithDetails
  } catch (error) {
    console.error("Erro ao conectar com Supabase:", error)
    return []
  }
}

// Função para obter um post específico da comunidade e seus comentários
export async function getCommunityPostById(postId: string): Promise<CommunityPost | null> {
  try {
    const supabase = createClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()
    const currentUserId = userData?.user?.id

    const { data: postData, error: postError } = await supabase
      .from("community_posts")
      .select(`
        id,
        user_id,
        title,
        content,
        tags,
        created_at,
        updated_at,
        community_likes(user_id),
        profiles(full_name, avatar_url),
        auth_users(email)
      `)
      .eq("id", postId)
      .single()

    if (postError) {
      console.error("Erro ao buscar post da comunidade:", postError)
      return null
    }

    if (!postData) {
      return null
    }

    const likes = postData.community_likes as { user_id: string }[]
    const likes_count = likes ? likes.length : 0
    const has_liked = currentUserId ? likes?.some((like) => like.user_id === currentUserId) : false

    const author_name = (postData.profiles as any)?.full_name || (postData.auth_users as any)?.email || "Usuário"
    const author_avatar = (postData.profiles as any)?.avatar_url || null

    const post: CommunityPost = {
      ...postData,
      author_name,
      author_avatar,
      likes_count,
      has_liked,
      category_id: null, // Adicionar campo obrigatório
    } as CommunityPost

    return post
  } catch (error) {
    console.error("Erro ao conectar com Supabase:", error)
    return null
  }
}

export async function getCommunityCommentsByPostId(postId: string): Promise<CommunityComment[]> {
  try {
    const supabase = createClient()
    const { data: commentsData, error: commentsError } = await supabase
      .from("community_comments")
      .select(`
        id,
        post_id,
        user_id,
        content,
        created_at,
        auth_users(raw_user_meta_data)
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true })

    if (commentsError) {
      console.error("Erro ao buscar comentários do post:", commentsError)
      return []
    }

    const commentsWithAuthor = commentsData.map((comment) => ({
      ...comment,
      author_name:
        (comment.auth_users as any)?.raw_user_meta_data?.full_name ||
        (comment.auth_users as any)?.raw_user_meta_data?.user_name ||
        "Usuário Desconhecido",
    })) as CommunityComment[]

    return commentsWithAuthor
  } catch (error) {
    console.error("Erro ao conectar com Supabase:", error)
    return []
  }
}

// Função para criar um novo post
export async function createCommunityPost(formData: FormData) {
  try {
    const supabase = createClient()
    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const tagsString = formData.get("tags") as string // Nova entrada para tags

    // Validar entrada
    const validation = inputValidator.validate(
      { title, content, tags: tagsString },
      inputValidator.getSchemas().communityPost
    )

    if (!validation.isValid) {
      logger.warn('Tentativa de criar post com dados inválidos', 'SECURITY', { 
        errors: validation.errors 
      })
      return { 
        success: false, 
        error: "Dados inválidos: " + Object.values(validation.errors).join(", ") 
      }
    }

    const { title: validTitle, content: validContent, tags: validTags } = validation.sanitizedData

    const tags = validTags
      ? validTags
          .split(",")
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag.length > 0)
      : []

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Erro ao obter usuário para criar post:", userError)
      return { success: false, error: "Usuário não autenticado." }
    }

    const { error } = await supabase.from("community_posts").insert({
      user_id: user.id,
      title: validTitle,
      content: validContent,
      tags, // Incluir tags
    })

    if (error) {
      console.error("Erro ao criar post:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/community")
    return { success: true, message: "Post criado com sucesso!" }
  } catch (error) {
    console.error("Erro ao conectar com Supabase:", error)
    return { success: false, error: "Erro ao criar post: Supabase não disponível." }
  }
}

// Função para criar um novo comentário
export async function createCommunityComment(formData: FormData) {
  try {
    const supabase = createClient()
    const postId = formData.get("postId") as string
    const content = formData.get("content") as string

    if (!postId || !content) {
      return { success: false, error: "Conteúdo do comentário e ID do post são obrigatórios." }
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Erro ao obter usuário para criar comentário:", userError)
      return { success: false, error: "Usuário não autenticado." }
    }

    const { error } = await supabase.from("community_comments").insert({
      post_id: postId,
      user_id: user.id,
      content,
    })

    if (error) {
      console.error("Erro ao criar comentário:", error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/community/${postId}`)
    return { success: true, message: "Comentário adicionado com sucesso!" }
  } catch (error) {
    console.error("Erro ao conectar com Supabase:", error)
    return { success: false, error: "Erro ao criar comentário: Supabase não disponível." }
  }
}

// Função para curtir/descurtir um post
export async function toggleLike(postId: string) {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Erro ao obter usuário para curtir/descurtir:", userError)
      return { success: false, error: "Usuário não autenticado." }
    }

    const { data: existingLike, error: checkError } = await supabase
      .from("community_likes")
      .select("post_id, user_id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 means no rows found
      console.error("Erro ao verificar curtida existente:", checkError)
      return { success: false, error: checkError.message }
    }

    if (existingLike) {
      // Se já curtiu, descurtir
      const { error } = await supabase.from("community_likes").delete().eq("post_id", postId).eq("user_id", user.id)

      if (error) {
        console.error("Erro ao descurtir post:", error)
        return { success: false, error: error.message }
      }
      revalidatePath(`/community`)
      revalidatePath(`/community/${postId}`)
      return { success: true, message: "Post descurtido!" }
    } else {
      // Se não curtiu, curtir
      const { error } = await supabase.from("community_likes").insert({ post_id: postId, user_id: user.id })

      if (error) {
        console.error("Erro ao curtir post:", error)
        return { success: false, error: error.message }
      }
      revalidatePath(`/community`)
      revalidatePath(`/community/${postId}`)
      return { success: true, message: "Post curtido!" }
    }
  } catch (error) {
    console.error("Erro ao conectar com Supabase:", error)
    return { success: false, error: "Erro ao curtir/descurtir: Supabase não disponível." }
  }
}
