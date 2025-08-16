import { createClient } from "@/lib/supabase/client"

export interface StudentProgress {
  id?: number
  user_uuid: string
  nome_completo?: string
  total_flashcards: number
  completed_flashcards: number
  total_quizzes: number
  completed_quizzes: number
  average_score: number
  current_streak: number
  longest_streak: number
  total_study_time: number
  total_xp: number
  current_level: number
  first_login_at?: string
  last_login_at?: string
  created_at?: string
  updated_at?: string
}

// Função para obter ou criar o progresso do aluno
export async function getOrCreateStudentProgress(userId: string): Promise<StudentProgress> {
  const supabase = createClient()
  
  try {
    // Tentar buscar progresso existente na tabela student_profiles
    const { data: existingProgress, error: fetchError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_uuid', userId)
      .single()

    if (existingProgress) {
      // Atualizar last_login_at
      await supabase
        .from('student_profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('user_uuid', userId)
      
      return existingProgress
    }

    // Se não existe, criar perfil inicial com progresso zerado
    const initialProgress = {
      user_uuid: userId,
      nome_completo: 'Novo Aluno', // Será atualizado quando o usuário preencher o perfil
      total_flashcards: 0,
      completed_flashcards: 0,
      total_quizzes: 0,
      completed_quizzes: 0,
      average_score: 0,
      current_streak: 0,
      longest_streak: 0,
      total_study_time: 0,
      total_xp: 0,
      current_level: 1,
      last_login_at: new Date().toISOString()
    }

    const { data: newProgress, error: insertError } = await supabase
      .from('student_profiles')
      .insert(initialProgress)
      .select()
      .single()

    if (insertError) {
      console.error('Erro ao criar perfil inicial:', insertError)
      throw insertError
    }

    return newProgress
  } catch (error) {
    console.error('Erro ao obter/criar progresso do aluno:', error)
    throw error
  }
}

// Função para atualizar o progresso do aluno
export async function updateStudentProgress(
  userId: string, 
  updates: Partial<StudentProgress>
): Promise<StudentProgress> {
  const supabase = createClient()
  
  try {
    const { data: updatedProgress, error } = await supabase
      .from('student_profiles')
      .update(updates)
      .eq('user_uuid', userId)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar progresso:', error)
      throw error
    }

    return updatedProgress
  } catch (error) {
    console.error('Erro ao atualizar progresso do aluno:', error)
    throw error
  }
}

// Função para adicionar XP e calcular nível
export async function addXP(userId: string, xpToAdd: number): Promise<{ newLevel: number, totalXP: number }> {
  const supabase = createClient()
  
  try {
    // Buscar progresso atual
    const { data: currentProgress, error: fetchError } = await supabase
      .from('student_profiles')
      .select('total_xp, current_level')
      .eq('user_uuid', userId)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar progresso atual:', fetchError)
      throw fetchError
    }

    const newTotalXP = (currentProgress?.total_xp || 0) + xpToAdd
    const newLevel = Math.floor(newTotalXP / 1000) + 1 // 1000 XP por nível

    // Atualizar XP e nível
    const { error: updateError } = await supabase
      .from('student_profiles')
      .update({ 
        total_xp: newTotalXP,
        current_level: newLevel
      })
      .eq('user_uuid', userId)

    if (updateError) {
      console.error('Erro ao atualizar XP:', updateError)
      throw updateError
    }

    return { newLevel, totalXP: newTotalXP }
  } catch (error) {
    console.error('Erro ao adicionar XP:', error)
    throw error
  }
}

// Função para atualizar streak
export async function updateStreak(userId: string, hasStudiedToday: boolean): Promise<{ currentStreak: number, longestStreak: number }> {
  const supabase = createClient()
  
  try {
    // Buscar progresso atual
    const { data: currentProgress, error: fetchError } = await supabase
      .from('student_profiles')
      .select('current_streak, longest_streak, last_login_at')
      .eq('user_uuid', userId)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar streak atual:', fetchError)
      throw fetchError
    }

    let newCurrentStreak = currentProgress?.current_streak || 0
    let newLongestStreak = currentProgress?.longest_streak || 0

    if (hasStudiedToday) {
      newCurrentStreak += 1
      if (newCurrentStreak > newLongestStreak) {
        newLongestStreak = newCurrentStreak
      }
    } else {
      // Verificar se passou mais de 1 dia desde o último login
      const lastLogin = new Date(currentProgress?.last_login_at || 0)
      const today = new Date()
      const daysDiff = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff > 1) {
        newCurrentStreak = 0 // Reset streak se passou mais de 1 dia
      }
    }

    // Atualizar streak
    const { error: updateError } = await supabase
      .from('student_profiles')
      .update({ 
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        last_login_at: new Date().toISOString()
      })
      .eq('user_uuid', userId)

    if (updateError) {
      console.error('Erro ao atualizar streak:', updateError)
      throw updateError
    }

    return { currentStreak: newCurrentStreak, longestStreak: newLongestStreak }
  } catch (error) {
    console.error('Erro ao atualizar streak:', error)
    throw error
  }
} 