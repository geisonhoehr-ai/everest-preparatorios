'use client'

import { createClient } from '@/lib/supabase/client'
import { flashcardCache, createCacheKey } from '@/lib/cache'
import { Flashcard, Subject, Topic } from '@/hooks/use-flashcards'

export interface CreateFlashcardData {
  question: string
  answer: string
  topic_id: string
}

export interface UpdateFlashcardData {
  id: number
  question?: string
  answer?: string
  topic_id?: string
}

export interface FlashcardFilters {
  topic_id?: string
  subject_id?: string
  search?: string
  limit?: number
  offset?: number
}

class FlashcardService {
  private supabase = createClient()

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    const cacheKey = createCacheKey('subjects', 'all')
    const cached = flashcardCache.get(cacheKey) as Subject[] | null
    
    if (cached) {
      return cached
    }

    try {
      // Simular dados por enquanto - substituir por chamada real do Supabase
      const mockSubjects: Subject[] = [
        { id: 'portugues', name: 'Português', description: 'Gramática e Literatura' },
        { id: 'matematica', name: 'Matemática', description: 'Álgebra e Geometria' },
        { id: 'historia', name: 'História', description: 'História do Brasil e Mundial' }
      ]

      flashcardCache.set(cacheKey, mockSubjects, 10 * 60 * 1000) // 10 minutes
      return mockSubjects
    } catch (error) {
      console.error('Erro ao buscar matérias:', error)
      throw new Error('Falha ao carregar matérias')
    }
  }

  // Topics
  async getTopics(subjectId: string): Promise<Topic[]> {
    const cacheKey = createCacheKey('topics', subjectId)
    const cached = flashcardCache.get(cacheKey) as Topic[] | null
    
    if (cached) {
      return cached
    }

    try {
      // Simular dados por enquanto
      const mockTopics: Topic[] = [
        { id: 'regencia', name: 'Regência', subject_id: subjectId },
        { id: 'concordancia', name: 'Concordância', subject_id: subjectId },
        { id: 'sintaxe-termos-acessorios', name: 'Sintaxe - Termos Acessórios', subject_id: subjectId },
        { id: 'semantica-estilistica', name: 'Semântica e Estilística', subject_id: subjectId },
        { id: 'sintaxe-termos-essenciais', name: 'Sintaxe - Termos Essenciais', subject_id: subjectId },
        { id: 'ortografia', name: 'Ortografia', subject_id: subjectId },
        { id: 'acentuacao-grafica', name: 'Acentuação Gráfica', subject_id: subjectId }
      ]

      flashcardCache.set(cacheKey, mockTopics, 10 * 60 * 1000)
      return mockTopics
    } catch (error) {
      console.error('Erro ao buscar tópicos:', error)
      throw new Error('Falha ao carregar tópicos')
    }
  }

  // Flashcards
  async getFlashcards(filters: FlashcardFilters = {}): Promise<Flashcard[]> {
    const cacheKey = createCacheKey('flashcards', JSON.stringify(filters))
    const cached = flashcardCache.get(cacheKey) as Flashcard[] | null
    
    if (cached) {
      return cached
    }

    try {
      let query = this.supabase
        .from('flashcards')
        .select('*')

      if (filters.topic_id) {
        query = query.eq('topic_id', filters.topic_id)
      }

      if (filters.search) {
        query = query.or(`question.ilike.%${filters.search}%,answer.ilike.%${filters.search}%`)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao buscar flashcards:', error)
        // Fallback para dados mockados
        return this.getMockFlashcards(filters.topic_id || '')
      }

      const flashcards = data || []
      flashcardCache.set(cacheKey, flashcards, 5 * 60 * 1000) // 5 minutes
      return flashcards
    } catch (error) {
      console.error('Erro ao buscar flashcards:', error)
      return this.getMockFlashcards(filters.topic_id || '')
    }
  }

  async getFlashcardById(id: number): Promise<Flashcard | null> {
    const cacheKey = createCacheKey('flashcard', id.toString())
    const cached = flashcardCache.get(cacheKey) as Flashcard | null
    
    if (cached) {
      return cached
    }

    try {
      const { data, error } = await this.supabase
        .from('flashcards')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Erro ao buscar flashcard:', error)
        return null
      }

      if (data) {
        flashcardCache.set(cacheKey, data, 5 * 60 * 1000)
      }

      return data
    } catch (error) {
      console.error('Erro ao buscar flashcard:', error)
      return null
    }
  }

  async createFlashcard(data: CreateFlashcardData): Promise<Flashcard> {
    try {
      const { data: result, error } = await this.supabase
        .from('flashcards')
        .insert([data])
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar flashcard:', error)
        throw new Error('Falha ao criar flashcard')
      }

      // Invalidar cache relacionado
      this.invalidateTopicCache(data.topic_id)

      return result
    } catch (error) {
      console.error('Erro ao criar flashcard:', error)
      throw new Error('Falha ao criar flashcard')
    }
  }

  async updateFlashcard(data: UpdateFlashcardData): Promise<Flashcard> {
    try {
      const { id, ...updateData } = data
      
      const { data: result, error } = await this.supabase
        .from('flashcards')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar flashcard:', error)
        throw new Error('Falha ao atualizar flashcard')
      }

      // Invalidar cache
      this.invalidateFlashcardCache(id)
      if (data.topic_id) {
        this.invalidateTopicCache(data.topic_id)
      }

      return result
    } catch (error) {
      console.error('Erro ao atualizar flashcard:', error)
      throw new Error('Falha ao atualizar flashcard')
    }
  }

  async deleteFlashcard(id: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('flashcards')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Erro ao deletar flashcard:', error)
        throw new Error('Falha ao deletar flashcard')
      }

      // Invalidar cache
      this.invalidateFlashcardCache(id)
    } catch (error) {
      console.error('Erro ao deletar flashcard:', error)
      throw new Error('Falha ao deletar flashcard')
    }
  }

  // Cache management
  private invalidateFlashcardCache(id: number): void {
    const cacheKey = createCacheKey('flashcard', id.toString())
    flashcardCache.remove(cacheKey)
    
    // Invalidar listas de flashcards
    for (const key of flashcardCache.keys()) {
      if (key.startsWith('flashcards:')) {
        flashcardCache.remove(key)
      }
    }
  }

  private invalidateTopicCache(topicId: string): void {
    const cacheKey = createCacheKey('topics', topicId)
    flashcardCache.remove(cacheKey)
    
    // Invalidar flashcards do tópico
    for (const key of flashcardCache.keys()) {
      if (key.includes(topicId)) {
        flashcardCache.remove(key)
      }
    }
  }

  // Mock data fallback
  private getMockFlashcards(topicId: string): Flashcard[] {
    const mockFlashcards: Flashcard[] = [
      {
        id: 1,
        question: 'O que é regência verbal?',
        answer: 'Regência verbal é a relação de dependência que se estabelece entre um verbo e seus complementos.',
        topic_id: topicId
      },
      {
        id: 2,
        question: 'Qual é a regência do verbo "assistir"?',
        answer: 'O verbo "assistir" pode ser transitivo direto (assistir algo) ou transitivo indireto (assistir a algo).',
        topic_id: topicId
      },
      {
        id: 3,
        question: 'Explique a concordância verbal.',
        answer: 'Concordância verbal é a relação de concordância entre o verbo e o sujeito da oração.',
        topic_id: topicId
      }
    ]

    return mockFlashcards.filter(card => card.topic_id === topicId)
  }

  // Statistics
  async getFlashcardStats(topicId?: string): Promise<{
    total: number
    byTopic: { [topicId: string]: number }
    recent: Flashcard[]
  }> {
    try {
      const { data, error } = await this.supabase
        .from('flashcards')
        .select('*')

      if (error) {
        console.error('Erro ao buscar estatísticas:', error)
        return { total: 0, byTopic: {}, recent: [] }
      }

      const flashcards = data || []
      const byTopic: { [topicId: string]: number } = {}
      
      flashcards.forEach((card: Flashcard) => {
        byTopic[card.topic_id] = (byTopic[card.topic_id] || 0) + 1
      })

      const recent = flashcards
        .sort((a: Flashcard, b: Flashcard) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        .slice(0, 10)

      return {
        total: flashcards.length,
        byTopic,
        recent
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      return { total: 0, byTopic: {}, recent: [] }
    }
  }
}

export const flashcardService = new FlashcardService()
