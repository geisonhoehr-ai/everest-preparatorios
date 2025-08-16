'use server'

import { createClient } from '@/lib/supabase-server'
import { getRank, getNextRankInfo, getRankProgress } from './ranking'

// ===================================================================
// TIPOS PARA O SISTEMA DE GAMIFICAÇÃO
// ===================================================================

export interface UserGamificationStats {
  user_uuid: string
  total_xp: number
  current_level: number
  current_rank: string
  current_league: string
  total_score: number
  flashcards_completed: number
  quizzes_completed: number
  lessons_completed: number
  current_streak: number
  longest_streak: number
  last_study_date: string
  achievements_unlocked: number
  total_study_time: number
  created_at: string
  updated_at: string
}

export interface Achievement {
  id: number
  achievement_key: string
  title: string
  description: string
  icon: string
  category: string
  xp_reward: number
  score_reward: number
  requirements: any
  is_active: boolean
}

export interface UserAchievementProgress {
  id: number
  user_uuid: string
  achievement_key: string
  current_progress: number
  required_progress: number
  is_unlocked: boolean
  unlocked_at: string | null
}

export interface ActivityLog {
  id: number
  user_uuid: string
  activity_type: string
  activity_id: number | null
  xp_earned: number
  score_earned: number
  metadata: any
  created_at: string
}

// ===================================================================
// FUNÇÕES PRINCIPAIS DE GAMIFICAÇÃO
// ===================================================================

/**
 * Obtém ou cria as estatísticas de gamificação do usuário
 */
export async function getUserGamificationStats(userId: string): Promise<UserGamificationStats | null> {
  try {
    const supabase = createClient()
    
    // Verifica se o usuário tem estatísticas
    let { data: stats, error } = await supabase
      .from('user_gamification_stats')
      .select('*')
      .eq('user_uuid', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar estatísticas:', error)
      return null
    }

    // Se não existir, cria com valores padrão
    if (!stats) {
      const defaultStats = {
        user_uuid: userId,
        total_xp: 0,
        current_level: 1,
        current_rank: 'Novato da Guilda',
        current_league: 'Aprendizes',
        total_score: 0,
        flashcards_completed: 0,
        quizzes_completed: 0,
        lessons_completed: 0,
        current_streak: 0,
        longest_streak: 0,
        last_study_date: new Date().toISOString().split('T')[0],
        achievements_unlocked: 0,
        total_study_time: 0
      }

      const { data: newStats, error: insertError } = await supabase
        .from('user_gamification_stats')
        .insert(defaultStats)
        .select()
        .single()

      if (insertError) {
        console.error('Erro ao criar estatísticas padrão:', insertError)
        return null
      }

      stats = newStats
    }

    return stats
  } catch (error) {
    console.error('Erro ao obter estatísticas de gamificação:', error)
    return null
  }
}

/**
 * Atualiza as estatísticas de gamificação do usuário
 */
export async function updateUserGamificationStats(
  userId: string,
  updates: Partial<UserGamificationStats>
): Promise<boolean> {
  try {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('user_gamification_stats')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_uuid', userId)

    if (error) {
      console.error('Erro ao atualizar estatísticas:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao atualizar estatísticas de gamificação:', error)
    return false
  }
}

/**
 * Registra uma atividade do usuário e calcula XP
 */
export async function logUserActivity(
  userId: string,
  activityType: string,
  activityId: number | null,
  score: number = 0,
  metadata: any = {}
): Promise<boolean> {
  try {
    const supabase = createClient()
    
    // Calcula XP baseado no tipo de atividade
    const xpEarned = calculateActivityXP(activityType, score)
    
    // Registra a atividade
    const { error: logError } = await supabase
      .from('user_activity_log')
      .insert({
        user_uuid: userId,
        activity_type: activityType,
        activity_id: activityId,
        xp_earned: xpEarned,
        score_earned: score,
        metadata
      })

    if (logError) {
      console.error('Erro ao registrar atividade:', logError)
      return false
    }

    // Atualiza estatísticas do usuário
    const stats = await getUserGamificationStats(userId)
    if (stats) {
      const newTotalXP = stats.total_xp + xpEarned
      const newTotalScore = stats.total_score + score
      
      // Calcula novo nível baseado no XP
      const newLevel = Math.floor(newTotalXP / 100) + 1
      
      // Obtém novo rank baseado na pontuação
      const newRankInfo = getRank(newTotalScore)
      
      await updateUserGamificationStats(userId, {
        total_xp: newTotalXP,
        total_score: newTotalScore,
        current_level: newLevel,
        current_rank: newRankInfo.name,
        current_league: newRankInfo.league,
        [activityType === 'flashcard' ? 'flashcards_completed' : 
         activityType === 'quiz' ? 'quizzes_completed' : 
         activityType === 'lesson' ? 'lessons_completed' : 'total_score']: 
          stats[activityType === 'flashcard' ? 'flashcards_completed' : 
                activityType === 'quiz' ? 'quizzes_completed' : 
                activityType === 'lesson' ? 'lessons_completed' : 'total_score'] + 1
      })
    }

    return true
  } catch (error) {
    console.error('Erro ao registrar atividade:', error)
    return false
  }
}

/**
 * Obtém todas as conquistas disponíveis
 */
export async function getAvailableAchievements(): Promise<Achievement[]> {
  try {
    const supabase = createClient()
    
    const { data: achievements, error } = await supabase
      .from('available_achievements')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })

    if (error) {
      console.error('Erro ao buscar conquistas:', error)
      return []
    }

    return achievements || []
  } catch (error) {
    console.error('Erro ao obter conquistas:', error)
    return []
  }
}

/**
 * Obtém o progresso do usuário em todas as conquistas
 */
export async function getUserAchievementProgress(userId: string): Promise<UserAchievementProgress[]> {
  try {
    const supabase = createClient()
    
    const { data: progress, error } = await supabase
      .from('user_achievement_progress')
      .select('*')
      .eq('user_uuid', userId)

    if (error) {
      console.error('Erro ao buscar progresso das conquistas:', error)
      return []
    }

    return progress || []
  } catch (error) {
    console.error('Erro ao obter progresso das conquistas:', error)
    return []
  }
}

/**
 * Verifica e desbloqueia conquistas baseado no progresso atual
 */
export async function checkAndUnlockAchievements(userId: string): Promise<string[]> {
  try {
    const supabase = createClient()
    
    const stats = await getUserGamificationStats(userId)
    const achievements = await getAvailableAchievements()
    const currentProgress = await getUserAchievementProgress(userId)
    
    if (!stats || !achievements.length) return []

    const unlockedAchievements: string[] = []
    
    for (const achievement of achievements) {
      const existingProgress = currentProgress.find(p => p.achievement_key === achievement.achievement_key)
      
      if (existingProgress?.is_unlocked) continue
      
      let shouldUnlock = false
      let currentProgressValue = 0
      
      // Verifica critérios baseado no tipo de conquista
      switch (achievement.requirements.type) {
        case 'flashcard':
          currentProgressValue = stats.flashcards_completed
          shouldUnlock = currentProgressValue >= achievement.requirements.count
          break
        case 'quiz':
          currentProgressValue = stats.quizzes_completed
          shouldUnlock = currentProgressValue >= achievement.requirements.count
          break
        case 'lesson':
          currentProgressValue = stats.lessons_completed
          shouldUnlock = currentProgressValue >= achievement.requirements.count
          break
        case 'streak':
          currentProgressValue = stats.current_streak
          shouldUnlock = currentProgressValue >= achievement.requirements.days
          break
        case 'level':
          currentProgressValue = stats.current_level
          shouldUnlock = currentProgressValue >= achievement.requirements.target
          break
        case 'league':
          shouldUnlock = stats.current_league === achievement.requirements.name
          break
      }
      
      if (shouldUnlock) {
        // Desbloqueia a conquista
        if (existingProgress) {
          await supabase
            .from('user_achievement_progress')
            .update({
              is_unlocked: true,
              unlocked_at: new Date().toISOString(),
              current_progress: currentProgressValue
            })
            .eq('id', existingProgress.id)
        } else {
          await supabase
            .from('user_achievement_progress')
            .insert({
              user_uuid: userId,
              achievement_key: achievement.achievement_key,
              current_progress: currentProgressValue,
              required_progress: achievement.requirements.count || 1,
              is_unlocked: true,
              unlocked_at: new Date().toISOString()
            })
        }
        
        // Adiciona XP e pontuação da conquista
        await logUserActivity(userId, 'achievement', null, achievement.score_reward, {
          achievement_key: achievement.achievement_key,
          xp_reward: achievement.xp_reward
        })
        
        unlockedAchievements.push(achievement.title)
      }
    }
    
    return unlockedAchievements
  } catch (error) {
    console.error('Erro ao verificar conquistas:', error)
    return []
  }
}

/**
 * Obtém o ranking geral dos usuários
 */
export async function getGlobalRanking(limit: number = 50): Promise<any[]> {
  try {
    const supabase = createClient()
    
    const { data: ranking, error } = await supabase
      .from('user_gamification_stats')
      .select(`
        user_uuid,
        total_score,
        total_xp,
        current_level,
        current_rank,
        current_league,
        profiles:user_uuid(
          full_name,
          avatar_url
        )
      `)
      .order('total_score', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Erro ao buscar ranking:', error)
      return []
    }

    return ranking || []
  } catch (error) {
    console.error('Erro ao obter ranking:', error)
    return []
  }
}

/**
 * Atualiza o streak do usuário
 */
export async function updateUserStreak(userId: string): Promise<boolean> {
  try {
    const supabase = createClient()
    
    const stats = await getUserGamificationStats(userId)
    if (!stats) return false
    
    const today = new Date().toISOString().split('T')[0]
    const lastStudyDate = stats.last_study_date
    
    // Se estudou hoje, mantém o streak
    if (lastStudyDate === today) return true
    
    // Se estudou ontem, incrementa o streak
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    
    if (lastStudyDate === yesterdayStr) {
      const newStreak = stats.current_streak + 1
      const newLongestStreak = Math.max(newStreak, stats.longest_streak)
      
      await updateUserGamificationStats(userId, {
        current_streak: newStreak,
        longest_streak: newLongestStreak,
        last_study_date: today
      })
    } else if (lastStudyDate !== today) {
      // Se não estudou ontem, reseta o streak
      await updateUserGamificationStats(userId, {
        current_streak: 1,
        last_study_date: today
      })
    }
    
    return true
  } catch (error) {
    console.error('Erro ao atualizar streak:', error)
    return false
  }
}

// ===================================================================
// FUNÇÕES AUXILIARES
// ===================================================================

/**
 * Calcula XP baseado no tipo de atividade
 */
function calculateActivityXP(activityType: string, score: number = 0): number {
  switch (activityType) {
    case 'flashcard':
      return 10
    case 'quiz':
      return Math.max(10, Math.floor(score / 10))
    case 'lesson':
      return 20
    case 'achievement':
      return 50
    default:
      return 5
  }
}

/**
 * Sincroniza dados das tabelas existentes com o sistema de gamificação
 */
export async function syncExistingData(userId: string): Promise<boolean> {
  try {
    const supabase = createClient()
    
    // Busca dados existentes
    const [flashcardProgress, quizScores, lessonProgress] = await Promise.all([
      supabase.from('user_flashcard_progress').select('*').eq('user_uuid', userId),
      supabase.from('user_quiz_scores').select('*').eq('user_uuid', userId),
      supabase.from('lesson_progress').select('*').eq('user_uuid', userId)
    ])
    
    // Calcula totais
    const totalFlashcards = flashcardProgress.data?.length || 0
    const totalQuizzes = quizScores.data?.length || 0
    const totalLessons = lessonProgress.data?.filter(l => l.is_completed).length || 0
    
    // Calcula pontuação total
    const totalScore = (quizScores.data || []).reduce((sum, quiz) => sum + quiz.score, 0)
    
    // Atualiza estatísticas
    await updateUserGamificationStats(userId, {
      flashcards_completed: totalFlashcards,
      quizzes_completed: totalQuizzes,
      lessons_completed: totalLessons,
      total_score: totalScore
    })
    
    return true
  } catch (error) {
    console.error('Erro ao sincronizar dados existentes:', error)
    return false
  }
}
