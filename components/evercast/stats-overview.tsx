'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  FileAudio, 
  Play, 
  Clock, 
  Users,
  TrendingUp,
  Star
} from 'lucide-react'
import { type AudioCourse } from '@/actions-evercast-client'

interface StatsOverviewProps {
  courses: AudioCourse[]
  currentCourse?: AudioCourse | null
}

export function StatsOverview({ courses, currentCourse }: StatsOverviewProps) {
  // Calcular estatísticas gerais
  const totalCourses = courses.length
  const totalModules = courses.reduce((total, course) => 
    total + (course.audio_modules?.length || 0), 0)
  const totalLessons = courses.reduce((total, course) => 
    total + (course.audio_modules?.reduce((moduleTotal, module) => 
      moduleTotal + (module.audio_lessons?.length || 0), 0) || 0), 0)
  
  // Calcular duração total estimada (assumindo 15 min por aula)
  const estimatedTotalDuration = totalLessons * 15 // em minutos
  const hours = Math.floor(estimatedTotalDuration / 60)
  const minutes = estimatedTotalDuration % 60

  // Estatísticas do curso atual
  const currentCourseModules = currentCourse?.audio_modules?.length || 0
  const currentCourseLessons = currentCourse?.audio_modules?.reduce((total, module) => 
    total + (module.audio_lessons?.length || 0), 0) || 0
  const currentCourseDuration = currentCourseLessons * 15 // em minutos
  const currentHours = Math.floor(currentCourseDuration / 60)
  const currentMinutes = currentCourseDuration % 60

  const stats = [
    {
      title: 'Total de Cursos',
      value: totalCourses,
      icon: <BookOpen className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Total de Módulos',
      value: totalModules,
      icon: <FileAudio className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Total de Aulas',
      value: totalLessons,
      icon: <Play className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      title: 'Duração Estimada',
      value: `${hours}h ${minutes}min`,
      icon: <Clock className="w-5 h-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <Card className="bg-white/80 dark:bg-black/20 backdrop-blur-sm border-gray-200 dark:border-white/10">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Estatísticas Gerais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${stat.bgColor} mb-2`}>
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.title}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas do Curso Atual */}
      {currentCourse && (
        <Card className="bg-white/80 dark:bg-black/20 backdrop-blur-sm border-gray-200 dark:border-white/10">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-orange-500" />
              Curso Selecionado: {currentCourse.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {currentCourseModules}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Módulos
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {currentCourseLessons}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Aulas
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {currentHours}h {currentMinutes}min
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Duração
                </div>
              </div>
            </div>
            
            {/* Progresso do curso */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Progresso do Curso</span>
                <span>0%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '0%' }} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Comece a reproduzir as aulas para acompanhar seu progresso
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dicas e Informações */}
      <Card className="bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-900/20 dark:to-blue-900/20 border-orange-200 dark:border-orange-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                Dicas para Professores
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Organize seus cursos em módulos temáticos</li>
                <li>• Use títulos descritivos para facilitar a busca</li>
                <li>• Adicione descrições detalhadas para cada aula</li>
                <li>• Marque aulas como preview para atrair novos alunos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
