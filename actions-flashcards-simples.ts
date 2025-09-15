// Server actions simplificadas para flashcards
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'

const supabase = createClient(supabaseUrl, supabaseKey)

// Função para obter todos os topic_ids únicos dos flashcards
export async function getAllTopicIds() {
  try {
    console.log('🔍 Buscando topic_ids únicos...')
    
    const { data, error } = await supabase
      .from('flashcards')
      .select('topic_id')
      .limit(100)
    
    if (error) {
      console.error('❌ Erro ao buscar topic_ids:', error)
      return []
    }
    
    // Extrair topic_ids únicos
    const uniqueTopics = [...new Set(data.map(f => f.topic_id))]
    console.log(`✅ Encontrados ${uniqueTopics.length} topic_ids únicos`)
    
    return uniqueTopics
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return []
  }
}

// Função para obter flashcards por topic_id
export async function getFlashcardsByTopic(topicId: string, limit = 20) {
  try {
    console.log(`🔍 Buscando flashcards para tópico: ${topicId}`)
    
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('topic_id', topicId)
      .limit(limit)
    
    if (error) {
      console.error('❌ Erro ao buscar flashcards:', error)
      return []
    }
    
    console.log(`✅ Encontrados ${data.length} flashcards para ${topicId}`)
    return data || []
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return []
  }
}

// Função para obter todos os flashcards (para busca)
export async function getAllFlashcards(limit = 50) {
  try {
    console.log('🔍 Buscando todos os flashcards...')
    
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .limit(limit)
    
    if (error) {
      console.error('❌ Erro ao buscar flashcards:', error)
      return []
    }
    
    console.log(`✅ Encontrados ${data.length} flashcards`)
    return data || []
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return []
  }
}

// Função para criar um novo flashcard
export async function createFlashcard(topicId: string, question: string, answer: string) {
  try {
    console.log(`📝 Criando flashcard para tópico: ${topicId}`)
    
    const { data, error } = await supabase
      .from('flashcards')
      .insert({
        topic_id: topicId,
        question: question.trim(),
        answer: answer.trim()
      })
      .select()
      .single()
    
    if (error) {
      console.error('❌ Erro ao criar flashcard:', error)
      return { success: false, error: error.message }
    }
    
    console.log(`✅ Flashcard criado: ${data.id}`)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return { success: false, error: 'Erro inesperado' }
  }
}

// Função para atualizar um flashcard
export async function updateFlashcard(flashcardId: number, question: string, answer: string) {
  try {
    console.log(`📝 Atualizando flashcard: ${flashcardId}`)
    
    const { data, error } = await supabase
      .from('flashcards')
      .update({
        question: question.trim(),
        answer: answer.trim()
      })
      .eq('id', flashcardId)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Erro ao atualizar flashcard:', error)
      return { success: false, error: error.message }
    }
    
    console.log(`✅ Flashcard atualizado: ${data.id}`)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return { success: false, error: 'Erro inesperado' }
  }
}

// Função para deletar um flashcard
export async function deleteFlashcard(flashcardId: number) {
  try {
    console.log(`🗑️ Deletando flashcard: ${flashcardId}`)
    
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', flashcardId)
    
    if (error) {
      console.error('❌ Erro ao deletar flashcard:', error)
      return { success: false, error: error.message }
    }
    
    console.log(`✅ Flashcard deletado: ${flashcardId}`)
    return { success: true }
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return { success: false, error: 'Erro inesperado' }
  }
}
