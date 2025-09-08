import { createClient } from '@/lib/supabase-server'

// Tipos para o sistema EverCast
export interface AudioCourse {
  id: string
  name: string
  description?: string
  thumbnail_url?: string
  total_duration?: string
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
  modules?: AudioModule[]
}

export interface AudioModule {
  id: string
  course_id: string
  name: string
  description?: string
  order_index: number
  total_duration?: string
  is_active: boolean
  created_at: string
  updated_at: string
  lessons?: AudioLesson[]
}

export interface AudioLesson {
  id: string
  module_id: string
  title: string
  description?: string
  duration?: string
  duration_seconds?: number
  hls_url?: string
  embed_url?: string
  audio_url?: string
  order_index: number
  is_active: boolean
  is_preview: boolean
  created_at: string
  updated_at: string
}

export interface AudioProgress {
  id: string
  user_id: string
  lesson_id: string
  progress_percentage: number
  current_time_seconds: number
  is_completed: boolean
  completed_at?: string
  created_at: string
  updated_at: string
}

// Verificar se o usuário é professor ou admin
export async function checkTeacherOrAdminAccess(userUuid: string): Promise<boolean> {
  const supabase = await createClient()
  console.log(`🔍 [EverCast] Verificando acesso de professor/admin para: ${userUuid}`)
  
  try {
    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("user_id", userUuid)
      .single()

    if (!profileError && profileData) {
      const hasAccess = profileData.role === 'teacher' || profileData.role === 'admin'
      console.log(`✅ [EverCast] Acesso ${hasAccess ? 'permitido' : 'negado'} para role: ${profileData.role}`)
      return hasAccess
    }

    // Fallback temporário para usuário professor conhecido
    if (userUuid === 'c8b5bff0-b5cc-4dab-9cfa-0a0cf4983dc5') {
      console.log("🔄 [EverCast] Fallback: permitindo acesso para usuário professor conhecido")
      return true
    }

    console.error("❌ [EverCast] Usuário não encontrado em user_profiles")
    return false
  } catch (error) {
    console.error("❌ [EverCast] Erro ao verificar acesso:", error)
    return false
  }
}

// ===== CURSOS DE ÁUDIO =====

export async function getAllAudioCourses(): Promise<AudioCourse[]> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('audio_courses')
      .select(`
        *,
        audio_modules (
          *,
          audio_lessons (*)
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ [EverCast] Erro ao buscar cursos:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('❌ [EverCast] Erro ao buscar cursos:', error)
    return []
  }
}

export async function getAudioCourseById(courseId: string): Promise<AudioCourse | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('audio_courses')
      .select(`
        *,
        audio_modules (
          *,
          audio_lessons (*)
        )
      `)
      .eq('id', courseId)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('❌ [EverCast] Erro ao buscar curso:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('❌ [EverCast] Erro ao buscar curso:', error)
    return null
  }
}

export async function createAudioCourse(userUuid: string, courseData: Partial<AudioCourse>): Promise<AudioCourse | null> {
  const hasAccess = await checkTeacherOrAdminAccess(userUuid)
  if (!hasAccess) {
    throw new Error('Acesso negado. Apenas professores e administradores podem criar cursos.')
  }

  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('audio_courses')
      .insert({
        name: courseData.name,
        description: courseData.description,
        thumbnail_url: courseData.thumbnail_url,
        total_duration: courseData.total_duration,
        created_by: userUuid,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('❌ [EverCast] Erro ao criar curso:', error)
      throw new Error('Erro ao criar curso')
    }

    console.log('✅ [EverCast] Curso criado com sucesso:', data.id)
    return data
  } catch (error) {
    console.error('❌ [EverCast] Erro ao criar curso:', error)
    throw error
  }
}

export async function updateAudioCourse(userUuid: string, courseId: string, courseData: Partial<AudioCourse>): Promise<AudioCourse | null> {
  const hasAccess = await checkTeacherOrAdminAccess(userUuid)
  if (!hasAccess) {
    throw new Error('Acesso negado. Apenas professores e administradores podem editar cursos.')
  }

  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('audio_courses')
      .update({
        name: courseData.name,
        description: courseData.description,
        thumbnail_url: courseData.thumbnail_url,
        total_duration: courseData.total_duration,
        is_active: courseData.is_active
      })
      .eq('id', courseId)
      .select()
      .single()

    if (error) {
      console.error('❌ [EverCast] Erro ao atualizar curso:', error)
      throw new Error('Erro ao atualizar curso')
    }

    console.log('✅ [EverCast] Curso atualizado com sucesso:', data.id)
    return data
  } catch (error) {
    console.error('❌ [EverCast] Erro ao atualizar curso:', error)
    throw error
  }
}

export async function deleteAudioCourse(userUuid: string, courseId: string): Promise<boolean> {
  const hasAccess = await checkTeacherOrAdminAccess(userUuid)
  if (!hasAccess) {
    throw new Error('Acesso negado. Apenas professores e administradores podem excluir cursos.')
  }

  const supabase = await createClient()
  
  try {
    const { error } = await supabase
      .from('audio_courses')
      .update({ is_active: false })
      .eq('id', courseId)

    if (error) {
      console.error('❌ [EverCast] Erro ao excluir curso:', error)
      throw new Error('Erro ao excluir curso')
    }

    console.log('✅ [EverCast] Curso excluído com sucesso:', courseId)
    return true
  } catch (error) {
    console.error('❌ [EverCast] Erro ao excluir curso:', error)
    throw error
  }
}

// ===== MÓDULOS DE ÁUDIO =====

export async function createAudioModule(userUuid: string, moduleData: Partial<AudioModule>): Promise<AudioModule | null> {
  const hasAccess = await checkTeacherOrAdminAccess(userUuid)
  if (!hasAccess) {
    throw new Error('Acesso negado. Apenas professores e administradores podem criar módulos.')
  }

  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('audio_modules')
      .insert({
        course_id: moduleData.course_id,
        name: moduleData.name,
        description: moduleData.description,
        order_index: moduleData.order_index || 0,
        total_duration: moduleData.total_duration,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('❌ [EverCast] Erro ao criar módulo:', error)
      throw new Error('Erro ao criar módulo')
    }

    console.log('✅ [EverCast] Módulo criado com sucesso:', data.id)
    return data
  } catch (error) {
    console.error('❌ [EverCast] Erro ao criar módulo:', error)
    throw error
  }
}

export async function updateAudioModule(userUuid: string, moduleId: string, moduleData: Partial<AudioModule>): Promise<AudioModule | null> {
  const hasAccess = await checkTeacherOrAdminAccess(userUuid)
  if (!hasAccess) {
    throw new Error('Acesso negado. Apenas professores e administradores podem editar módulos.')
  }

  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('audio_modules')
      .update({
        name: moduleData.name,
        description: moduleData.description,
        order_index: moduleData.order_index,
        total_duration: moduleData.total_duration,
        is_active: moduleData.is_active
      })
      .eq('id', moduleId)
      .select()
      .single()

    if (error) {
      console.error('❌ [EverCast] Erro ao atualizar módulo:', error)
      throw new Error('Erro ao atualizar módulo')
    }

    console.log('✅ [EverCast] Módulo atualizado com sucesso:', data.id)
    return data
  } catch (error) {
    console.error('❌ [EverCast] Erro ao atualizar módulo:', error)
    throw error
  }
}

export async function deleteAudioModule(userUuid: string, moduleId: string): Promise<boolean> {
  const hasAccess = await checkTeacherOrAdminAccess(userUuid)
  if (!hasAccess) {
    throw new Error('Acesso negado. Apenas professores e administradores podem excluir módulos.')
  }

  const supabase = await createClient()
  
  try {
    const { error } = await supabase
      .from('audio_modules')
      .update({ is_active: false })
      .eq('id', moduleId)

    if (error) {
      console.error('❌ [EverCast] Erro ao excluir módulo:', error)
      throw new Error('Erro ao excluir módulo')
    }

    console.log('✅ [EverCast] Módulo excluído com sucesso:', moduleId)
    return true
  } catch (error) {
    console.error('❌ [EverCast] Erro ao excluir módulo:', error)
    throw error
  }
}

// ===== AULAS DE ÁUDIO =====

export async function createAudioLesson(userUuid: string, lessonData: Partial<AudioLesson>): Promise<AudioLesson | null> {
  const hasAccess = await checkTeacherOrAdminAccess(userUuid)
  if (!hasAccess) {
    throw new Error('Acesso negado. Apenas professores e administradores podem criar aulas.')
  }

  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('audio_lessons')
      .insert({
        module_id: lessonData.module_id,
        title: lessonData.title,
        description: lessonData.description,
        duration: lessonData.duration,
        duration_seconds: lessonData.duration_seconds,
        hls_url: lessonData.hls_url,
        embed_url: lessonData.embed_url,
        audio_url: lessonData.audio_url,
        order_index: lessonData.order_index || 0,
        is_preview: lessonData.is_preview || false,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('❌ [EverCast] Erro ao criar aula:', error)
      throw new Error('Erro ao criar aula')
    }

    console.log('✅ [EverCast] Aula criada com sucesso:', data.id)
    return data
  } catch (error) {
    console.error('❌ [EverCast] Erro ao criar aula:', error)
    throw error
  }
}

export async function updateAudioLesson(userUuid: string, lessonId: string, lessonData: Partial<AudioLesson>): Promise<AudioLesson | null> {
  const hasAccess = await checkTeacherOrAdminAccess(userUuid)
  if (!hasAccess) {
    throw new Error('Acesso negado. Apenas professores e administradores podem editar aulas.')
  }

  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('audio_lessons')
      .update({
        title: lessonData.title,
        description: lessonData.description,
        duration: lessonData.duration,
        duration_seconds: lessonData.duration_seconds,
        hls_url: lessonData.hls_url,
        embed_url: lessonData.embed_url,
        audio_url: lessonData.audio_url,
        order_index: lessonData.order_index,
        is_preview: lessonData.is_preview,
        is_active: lessonData.is_active
      })
      .eq('id', lessonId)
      .select()
      .single()

    if (error) {
      console.error('❌ [EverCast] Erro ao atualizar aula:', error)
      throw new Error('Erro ao atualizar aula')
    }

    console.log('✅ [EverCast] Aula atualizada com sucesso:', data.id)
    return data
  } catch (error) {
    console.error('❌ [EverCast] Erro ao atualizar aula:', error)
    throw error
  }
}

export async function deleteAudioLesson(userUuid: string, lessonId: string): Promise<boolean> {
  const hasAccess = await checkTeacherOrAdminAccess(userUuid)
  if (!hasAccess) {
    throw new Error('Acesso negado. Apenas professores e administradores podem excluir aulas.')
  }

  const supabase = await createClient()
  
  try {
    const { error } = await supabase
      .from('audio_lessons')
      .update({ is_active: false })
      .eq('id', lessonId)

    if (error) {
      console.error('❌ [EverCast] Erro ao excluir aula:', error)
      throw new Error('Erro ao excluir aula')
    }

    console.log('✅ [EverCast] Aula excluída com sucesso:', lessonId)
    return true
  } catch (error) {
    console.error('❌ [EverCast] Erro ao excluir aula:', error)
    throw error
  }
}

// ===== PROGRESSO DO USUÁRIO =====

export async function updateAudioProgress(userUuid: string, lessonId: string, progress: Partial<AudioProgress>): Promise<AudioProgress | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('audio_progress')
      .upsert({
        user_id: userUuid,
        lesson_id: lessonId,
        progress_percentage: progress.progress_percentage || 0,
        current_time_seconds: progress.current_time_seconds || 0,
        is_completed: progress.is_completed || false,
        completed_at: progress.is_completed ? new Date().toISOString() : null
      })
      .select()
      .single()

    if (error) {
      console.error('❌ [EverCast] Erro ao atualizar progresso:', error)
      throw new Error('Erro ao atualizar progresso')
    }

    return data
  } catch (error) {
    console.error('❌ [EverCast] Erro ao atualizar progresso:', error)
    throw error
  }
}

export async function getUserAudioProgress(userUuid: string): Promise<AudioProgress[]> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('audio_progress')
      .select(`
        *,
        audio_lessons (
          *,
          audio_modules (
            *,
            audio_courses (*)
          )
        )
      `)
      .eq('user_id', userUuid)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('❌ [EverCast] Erro ao buscar progresso:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('❌ [EverCast] Erro ao buscar progresso:', error)
    return []
  }
}
