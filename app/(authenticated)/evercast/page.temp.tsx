'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { 
  getAllAudioCourses,
  type AudioCourse, 
  type AudioModule, 
  type AudioLesson 
} from '@/actions-evercast-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function EverCastPage() {
  const { user, profile } = useAuth()
  const [courses, setCourses] = useState<AudioCourse[]>([])
  const [loading, setLoading] = useState(true)

  // Carregar cursos
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const coursesData = await getAllAudioCourses()
        setCourses(coursesData)
      } catch (error) {
        console.error('Erro ao carregar cursos:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user && profile) {
      loadCourses()
    }
  }, [user, profile])

  // Verificação de acesso
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
          <p>Faça login para acessar o EverCast</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-50 dark:from-slate-900 dark:via-orange-900 dark:to-slate-900">
      <div className="container mx-auto px-6 py-8">
        <Card className="bg-white/80 dark:bg-black/20 backdrop-blur-sm border-gray-200 dark:border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  🎧 EverCast
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  Seus cursos em áudio para estudar em qualquer lugar
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Carregando cursos...
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Aguarde enquanto carregamos seus cursos de áudio
                </p>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Nenhum curso encontrado
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Não há cursos de áudio disponíveis no momento
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Cursos Disponíveis ({courses.length})
                </h3>
                {courses.map((course) => (
                  <Card key={course.id} className="bg-white/60 dark:bg-black/10">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {course.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {course.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {course.audio_modules?.length || 0} módulos
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
