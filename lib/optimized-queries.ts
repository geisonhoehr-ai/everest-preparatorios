import { createClient } from '@/lib/supabase-server'

const supabase = createClient()

// Cache para evitar queries repetidas
const queryCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

// Função para limpar cache expirado
function cleanExpiredCache() {
  const now = Date.now()
  for (const [key, value] of queryCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      queryCache.delete(key)
    }
  }
}

// Query otimizada para buscar múltiplos tópicos de uma vez
export async function getTopicsBatch(topicIds: string[]) {
  const cacheKey = `topics_batch_${topicIds.sort().join('_')}`
  
  // Verificar cache
  const cached = queryCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  
  // Limpar cache expirado
  cleanExpiredCache()
  
  try {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .in('id', topicIds)
    
    if (error) throw error
    
    // Salvar no cache
    queryCache.set(cacheKey, { data, timestamp: Date.now() })
    
    return data
  } catch (error) {
    console.error('Erro ao buscar tópicos em lote:', error)
    return []
  }
}

// Query otimizada para progresso de flashcards
export async function getFlashcardProgressBatch(userId: string, topicIds: string[]) {
  const cacheKey = `progress_batch_${userId}_${topicIds.sort().join('_')}`
  
  const cached = queryCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  
  cleanExpiredCache()
  
  try {
    const { data, error } = await supabase
      .from('flashcard_progress')
      .select('topic_id, status, count')
      .eq('user_uuid', userId)
      .in('topic_id', topicIds)
    
    if (error) throw error
    
    // Organizar dados por tópico
    const progressByTopic: { [topicId: string]: any } = {}
    data?.forEach(item => {
      if (!progressByTopic[item.topic_id]) {
        progressByTopic[item.topic_id] = {}
      }
      progressByTopic[item.topic_id][item.status] = item.count
    })
    
    queryCache.set(cacheKey, { data: progressByTopic, timestamp: Date.now() })
    
    return progressByTopic
  } catch (error) {
    console.error('Erro ao buscar progresso em lote:', error)
    return {}
  }
}

// Query otimizada para estatísticas do usuário
export async function getUserStatsOptimized(userId: string) {
  const cacheKey = `user_stats_${userId}`
  
  const cached = queryCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  
  cleanExpiredCache()
  
  try {
    // Buscar todas as estatísticas em uma única query
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_uuid', userId)
      .single()
    
    if (error) throw error
    
    queryCache.set(cacheKey, { data, timestamp: Date.now() })
    
    return data
  } catch (error) {
    console.error('Erro ao buscar estatísticas do usuário:', error)
    return null
  }
}

// Função para invalidar cache
export function invalidateCache(pattern?: string) {
  if (pattern) {
    for (const key of queryCache.keys()) {
      if (key.includes(pattern)) {
        queryCache.delete(key)
      }
    }
  } else {
    queryCache.clear()
  }
} 