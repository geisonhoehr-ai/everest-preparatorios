import { createClient } from "@/lib/supabase/client"

export interface RPGRank {
  level: number
  title: string
  insignia: string
  blessing: string
  xpRequired: number
}

export interface Achievement {
  id?: number
  user_uuid: string
  achievement_type: string
  title: string
  description: string
  icon: string
  xp_reward: number
  unlocked_at?: string
  shared?: boolean
}

export interface StudyStreak {
  id?: number
  user_uuid: string
  start_date: string
  end_date?: string
  days_count: number
  is_active: boolean
  created_at?: string
}

export interface UserRPGProgress {
  user_uuid: string
  total_xp: number
  current_level: number
  general_rank: string
  flashcard_xp: number
  flashcard_level: number
  flashcard_rank: string
  quiz_xp: number
  quiz_level: number
  quiz_rank: string
  redacao_xp: number
  redacao_level: number
  redacao_rank: string
  prova_xp: number
  prova_level: number
  prova_rank: string
  current_streak_days: number
  longest_streak_days: number
  total_achievements: number
  last_level_up?: string
}

// Sistema de XP por atividade
export const XP_SYSTEM = {
  flashcard: {
    base: 5,
    streak_bonus: 2,
    max_daily: 50
  },
  quiz: {
    base: 15,
    perfect_bonus: 10,
    max_per_quiz: 100
  },
  redacao: {
    base: 50,
    high_score_bonus: 25,
    max_per_redacao: 200
  },
  prova: {
    base: 100,
    approval_bonus: 50,
    max_per_prova: 500
  }
}

// Sistema de conquistas
export const ACHIEVEMENTS = {
  first_level: {
    title: "Primeiro Passo",
    description: "Complete seu primeiro nível!",
    icon: "🎉",
    xp_reward: 100,
    type: "level_up"
  },
  streak_7: {
    title: "Semana de Dedicação",
    description: "7 dias seguidos estudando!",
    icon: "🔥",
    xp_reward: 200,
    type: "streak"
  },
  streak_30: {
    title: "Mestre da Persistência",
    description: "30 dias seguidos estudando!",
    icon: "⚡",
    xp_reward: 500,
    type: "streak"
  },
  perfect_quiz: {
    title: "Perfeição Absoluta",
    description: "Quiz com 100% de acerto!",
    icon: "💯",
    xp_reward: 150,
    type: "perfect_score"
  },
  redacao_10: {
    title: "Obra-Prima",
    description: "Redação com nota 10!",
    icon: "✍️",
    xp_reward: 300,
    type: "perfect_score"
  },
  prova_aprovada: {
    title: "Aprovado com Honra",
    description: "Prova aprovada com sucesso!",
    icon: "📝",
    xp_reward: 400,
    type: "approval"
  }
}

// Função para adicionar XP por atividade
export async function addActivityXP(
  userId: string, 
  activity: 'flashcard' | 'quiz' | 'redacao' | 'prova',
  xpAmount: number,
  bonus?: number
): Promise<{ newLevel: number, newRank: string, levelUp: boolean }> {
  const supabase = createClient()
  
  try {
    // Buscar progresso atual
    const { data: currentProgress, error: fetchError } = await supabase
      .from('student_profiles')
      .select(`${activity}_xp, ${activity}_level, ${activity}_rank`)
      .eq('user_uuid', userId)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar progresso:', fetchError)
      throw fetchError
    }

    const currentXP = currentProgress?.[`${activity}_xp`] || 0
    const currentLevel = currentProgress?.[`${activity}_level`] || 1
    const newXP = currentXP + xpAmount + (bonus || 0)

    // Calcular novo nível usando função do banco
    const { data: newLevelData, error: levelError } = await supabase
      .rpc('calculate_level', { xp_amount: newXP, category: activity })

    if (levelError) {
      console.error('Erro ao calcular nível:', levelError)
      throw levelError
    }

    const newLevel = newLevelData || 1
    const levelUp = newLevel > currentLevel

    // Calcular novo rank
    const { data: newRankData, error: rankError } = await supabase
      .rpc('calculate_rank', { xp_amount: newXP, category: activity })

    if (rankError) {
      console.error('Erro ao calcular rank:', rankError)
      throw rankError
    }

    const newRank = newRankData || 'Novato da Guilda'

    // Atualizar progresso
    const { error: updateError } = await supabase
      .from('student_profiles')
      .update({
        [`${activity}_xp`]: newXP,
        [`${activity}_level`]: newLevel,
        [`${activity}_rank`]: newRank,
        total_xp: (currentProgress?.total_xp || 0) + xpAmount + (bonus || 0),
        last_level_up: levelUp ? new Date().toISOString() : currentProgress?.last_level_up
      })
      .eq('user_uuid', userId)

    if (updateError) {
      console.error('Erro ao atualizar progresso:', updateError)
      throw updateError
    }

    // Se subiu de nível, criar conquista
    if (levelUp) {
      await createAchievement(userId, 'level_up', {
        title: `Evolução ${activity}`,
        description: `Você evoluiu para ${newRank}!`,
        icon: getRankInsignia(activity, newLevel),
        xp_reward: 50
      })
    }

    return { newLevel, newRank, levelUp }
  } catch (error) {
    console.error('Erro ao adicionar XP:', error)
    throw error
  }
}

// Função para criar conquista
export async function createAchievement(
  userId: string,
  achievementType: string,
  achievementData: Partial<Achievement>
): Promise<Achievement> {
  const supabase = createClient()
  
  try {
    const achievement: Achievement = {
      user_uuid: userId,
      achievement_type: achievementType,
      title: achievementData.title || '',
      description: achievementData.description || '',
      icon: achievementData.icon || '🏆',
      xp_reward: achievementData.xp_reward || 0
    }

    const { data: newAchievement, error } = await supabase
      .from('achievements')
      .insert(achievement)
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar conquista:', error)
      throw error
    }

    // Adicionar XP da conquista
    if (achievement.xp_reward > 0) {
      await addActivityXP(userId, 'flashcard', 0, achievement.xp_reward)
    }

    return newAchievement
  } catch (error) {
    console.error('Erro ao criar conquista:', error)
    throw error
  }
}

// Função para obter insignia do rank
export function getRankInsignia(activity: string, level: number): string {
  const insignias = {
    flashcard: ['🧿', '📜', '🔮', '🧙‍♂️', '🌟'],
    quiz: ['🛡️', '⚔️', '🎖️', '🏰', '⚡'],
    redacao: ['📖', '🎭', '🎻', '✍️', '📚'],
    prova: ['⚖️', '🛡️', '⚔️', '🏰', '🌟']
  }
  
  const activityInsignias = insignias[activity as keyof typeof insignias] || insignias.flashcard
  return activityInsignias[Math.min(level - 1, activityInsignias.length - 1)]
}

// Função para obter progresso RPG do usuário
export async function getUserRPGProgress(userId: string): Promise<UserRPGProgress | null> {
  const supabase = createClient()
  
  try {
    const { data: progress, error } = await supabase
      .from('student_profiles')
      .select(`
        user_uuid,
        total_xp,
        current_level,
        general_rank,
        flashcard_xp,
        flashcard_level,
        flashcard_rank,
        quiz_xp,
        quiz_level,
        quiz_rank,
        redacao_xp,
        redacao_level,
        redacao_rank,
        prova_xp,
        prova_level,
        prova_rank,
        current_streak_days,
        longest_streak_days,
        total_achievements,
        last_level_up
      `)
      .eq('user_uuid', userId)
      .single()

    if (error) {
      console.error('Erro ao buscar progresso RPG:', error)
      return null
    }

    return progress
  } catch (error) {
    console.error('Erro ao buscar progresso RPG:', error)
    return null
  }
}

// Função para obter ranking geral
export async function getGeneralRanking(limit: number = 50): Promise<any[]> {
  const supabase = createClient()
  
  try {
    const { data: ranking, error } = await supabase
      .from('student_profiles')
      .select(`
        user_uuid,
        nome_completo,
        total_xp,
        current_level,
        general_rank,
        flashcard_xp,
        quiz_xp,
        redacao_xp,
        prova_xp
      `)
      .order('total_xp', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Erro ao buscar ranking:', error)
      return []
    }

    return ranking || []
  } catch (error) {
    console.error('Erro ao buscar ranking:', error)
    return []
  }
}

// Função para obter ranking específico
export async function getCategoryRanking(
  category: 'flashcard' | 'quiz' | 'redacao' | 'prova',
  limit: number = 50
): Promise<any[]> {
  const supabase = createClient()
  
  try {
    const { data: ranking, error } = await supabase
      .from('student_profiles')
      .select(`
        user_uuid,
        nome_completo,
        ${category}_xp,
        ${category}_level,
        ${category}_rank
      `)
      .order(`${category}_xp`, { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Erro ao buscar ranking da categoria:', error)
      return []
    }

    return ranking || []
  } catch (error) {
    console.error('Erro ao buscar ranking da categoria:', error)
    return []
  }
}

// Função para obter conquistas do usuário
export async function getUserAchievements(userId: string): Promise<Achievement[]> {
  const supabase = createClient()
  
  try {
    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_uuid', userId)
      .order('unlocked_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar conquistas:', error)
      return []
    }

    return achievements || []
  } catch (error) {
    console.error('Erro ao buscar conquistas:', error)
    return []
  }
}

// Função para atualizar streak de estudo
export async function updateStudyStreak(userId: string): Promise<{ currentStreak: number, longestStreak: number }> {
  const supabase = createClient()
  
  try {
    const today = new Date().toISOString().split('T')[0]
    
    // Verificar se já estudou hoje
    const { data: todayStreak, error: todayError } = await supabase
      .from('study_streaks')
      .select('*')
      .eq('user_uuid', userId)
      .eq('start_date', today)
      .single()

    if (todayError && todayError.code !== 'PGRST116') {
      console.error('Erro ao verificar streak de hoje:', todayError)
    }

    if (todayStreak) {
      // Já estudou hoje, retornar streak atual
      const { data: currentProgress } = await supabase
        .from('student_profiles')
        .select('current_streak_days, longest_streak_days')
        .eq('user_uuid', userId)
        .single()

      return {
        currentStreak: currentProgress?.current_streak_days || 0,
        longestStreak: currentProgress?.longest_streak_days || 0
      }
    }

    // Buscar streak ativo
    const { data: activeStreak, error: activeError } = await supabase
      .from('study_streaks')
      .select('*')
      .eq('user_uuid', userId)
      .eq('is_active', true)
      .single()

    let newStreakDays = 1
    let startDate = today

    if (activeStreak) {
      // Continuar streak existente
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      if (activeStreak.start_date === yesterdayStr) {
        // Streak contínuo
        newStreakDays = activeStreak.days_count + 1
        startDate = activeStreak.start_date
      } else {
        // Streak quebrado, finalizar antigo
        await supabase
          .from('study_streaks')
          .update({ is_active: false, end_date: yesterdayStr })
          .eq('id', activeStreak.id)
      }
    }

    // Criar novo registro de streak
    const { data: newStreak, error: insertError } = await supabase
      .from('study_streaks')
      .insert({
        user_uuid: userId,
        start_date: startDate,
        days_count: newStreakDays,
        is_active: true
      })
      .select()
      .single()

    if (insertError) {
      console.error('Erro ao criar streak:', insertError)
      throw insertError
    }

    // Atualizar progresso do usuário
    const { data: currentProgress } = await supabase
      .from('student_profiles')
      .select('current_streak_days, longest_streak_days')
      .eq('user_uuid', userId)
      .single()

    const currentStreak = currentProgress?.current_streak_days || 0
    const longestStreak = currentProgress?.longest_streak_days || 0

    const newLongestStreak = Math.max(newStreakDays, longestStreak)

    await supabase
      .from('student_profiles')
      .update({
        current_streak_days: newStreakDays,
        longest_streak_days: newLongestStreak
      })
      .eq('user_uuid', userId)

    // Verificar conquistas de streak
    if (newStreakDays === 7) {
      await createAchievement(userId, 'streak', ACHIEVEMENTS.streak_7)
    } else if (newStreakDays === 30) {
      await createAchievement(userId, 'streak', ACHIEVEMENTS.streak_30)
    }

    return { currentStreak: newStreakDays, longestStreak: newLongestStreak }
  } catch (error) {
    console.error('Erro ao atualizar streak:', error)
    throw error
  }
}

// Função para compartilhar conquista
export async function shareAchievement(achievementId: number): Promise<boolean> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('achievements')
      .update({ shared: true })
      .eq('id', achievementId)

    if (error) {
      console.error('Erro ao marcar conquista como compartilhada:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao compartilhar conquista:', error)
    return false
  }
}

// Função para gerar texto de compartilhamento
export function generateShareText(achievement: Achievement, rank?: string): string {
  const baseText = `🎉 ${achievement.title} no Everest Preparatórios!`
  const description = achievement.description
  const hashtags = '#EverestPreparatorios #Conhecimento #Evolução'
  
  if (rank) {
    return `${baseText} ${description} Agora sou ${rank}! ${hashtags}`
  }
  
  return `${baseText} ${description} ${hashtags}`
} 