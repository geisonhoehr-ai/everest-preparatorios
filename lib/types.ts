export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
}

export interface CommunityCategory {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface CommunityPost {
  id: string
  user_id: string
  category_id: string | null
  title: string
  content: string
  tags: string[] // Adicionado para tags
  created_at: string
  updated_at: string
  author_name?: string
  category_name?: string
  likes_count?: number // Adicionado para contagem de curtidas
  has_liked?: boolean // Adicionado para indicar se o usuário atual curtiu
}

export interface CommunityComment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  author_name?: string
}

export interface CommunityLike {
  post_id: string
  user_id: string
  created_at: string
}
