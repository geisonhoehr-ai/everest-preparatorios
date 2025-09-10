'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/auth-context'
import { 
  getAllAudioCourses, 
  createAudioCourse, 
  updateAudioCourse, 
  deleteAudioCourse,
  createAudioModule,
  updateAudioModule,
  deleteAudioModule,
  createAudioLesson,
  updateAudioLesson,
  deleteAudioLesson,
  updateAudioLessonUrl,
  fixAllAudioUrls,
  type AudioCourse, 
  type AudioModule, 
  type AudioLesson 
} from '@/actions-evercast-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Clock,
  Download,
  Heart,
  Share2,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react'
import { HLSPlayer } from '@/components/evercast/hls-player'
import { MP3Player } from '@/components/evercast/mp3-player'
import { AudioUpload } from '@/components/evercast/audio-upload'
import { HLSDebug } from '@/components/evercast/hls-debug'
import { HLSTestPlayer } from '@/components/evercast/hls-test-player'
import { AudioSearch } from '@/components/evercast/audio-search'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

// Usar os tipos do actions-evercast.ts

export default function EverCastPage() {
  const { user, profile } = useAuth()
  const [courses, setCourses] = useState<AudioCourse[]>([])
  const [currentCourse, setCurrentCourse] = useState<AudioCourse | null>(null)
  const [currentModule, setCurrentModule] = useState<AudioModule | null>(null)
  const [currentLesson, setCurrentLesson] = useState<AudioLesson | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playlist, setPlaylist] = useState<AudioLesson[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Estados para busca de áudio PandaVideo
  const [currentAudioHLS, setCurrentAudioHLS] = useState<string | null>(null)
  
  // Estados para edição (professores/admins)
  const [isEditing, setIsEditing] = useState(false)
  const [editingType, setEditingType] = useState<'course' | 'module' | 'lesson' | null>(null)
  const [editingItem, setEditingItem] = useState<any>(null)
  
  // Estados para formulários
  const [courseForm, setCourseForm] = useState({
    name: '',
    description: '',
    thumbnail_url: '',
    total_duration: ''
  })

  const [moduleForm, setModuleForm] = useState({
    name: '',
    description: '',
    order_index: 0,
    total_duration: ''
  })

  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    duration: '',
    duration_seconds: 0,
    hls_url: '',
    embed_url: '',
    audio_url: '',
    order_index: 0,
    is_preview: false
  })
  
  const audioRef = useRef<HTMLAudioElement>(null)

  // Verificar se o usuário tem permissão de edição
  const canEdit = profile?.role === 'teacher' || profile?.role === 'admin'

  // Carregar cursos do banco de dados
  useEffect(() => {
    const loadCourses = async () => {
      try {
        console.log('🔍 [EverCast] Carregando cursos...')
        
        // Primeiro, corrigir URLs incorretas
        console.log('🔧 [EverCast] Verificando URLs de áudio...')
        await fixAllAudioUrls()
        
        const data = await getAllAudioCourses()
        console.log('📊 [EverCast] Cursos carregados:', data.length)
        console.log('📋 [EverCast] Dados completos:', data)
        
        setCourses(data)
        if (data.length > 0) {
          console.log('📖 [EverCast] Primeiro curso:', data[0])
          console.log('📂 [EverCast] Módulos do primeiro curso:', data[0].audio_modules)
          
          setCurrentCourse(data[0])
          if (data[0].audio_modules && data[0].audio_modules.length > 0) {
            console.log('📁 [EverCast] Primeiro módulo:', data[0].audio_modules[0])
            console.log('🎵 [EverCast] Aulas do primeiro módulo:', data[0].audio_modules[0].audio_lessons)
            
            setCurrentModule(data[0].audio_modules[0])
            setPlaylist(data[0].audio_modules[0].audio_lessons || [])
          } else {
            console.log('❌ [EverCast] Nenhum módulo encontrado no primeiro curso')
          }
        } else {
          console.log('❌ [EverCast] Nenhum curso encontrado')
        }
      } catch (error) {
        console.error('❌ [EverCast] Erro ao carregar cursos:', error)
      }
    }

    loadCourses()
  }, [])

  // Funções de CRUD para professores/admins
  const handleCreateCourse = async () => {
    if (!user?.id) return

    try {
      const newCourse = await createAudioCourse(user.id, courseForm)
      if (newCourse) {
        setCourses([newCourse, ...courses])
        setCourseForm({ name: '', description: '', thumbnail_url: '', total_duration: '' })
        setIsEditing(false)
        setEditingType(null)
      }
    } catch (error) {
      console.error('Erro ao criar curso:', error)
    }
  }

  const handleCreateModule = async () => {
    if (!user?.id || !currentCourse) return

    try {
      const newModule = await createAudioModule(user.id, {
        ...moduleForm,
        course_id: currentCourse.id
      })
      if (newModule) {
        const updatedCourse = { ...currentCourse }
        updatedCourse.audio_modules = [...(updatedCourse.audio_modules || []), newModule]
        setCurrentCourse(updatedCourse)
        setCourses(courses.map(c => c.id === currentCourse.id ? updatedCourse : c))
        setModuleForm({ name: '', description: '', order_index: 0, total_duration: '' })
        setIsEditing(false)
        setEditingType(null)
      }
    } catch (error) {
      console.error('Erro ao criar módulo:', error)
    }
  }

  const handleCreateLesson = async () => {
    if (!user?.id || !currentModule) return

    try {
      const newLesson = await createAudioLesson(user.id, {
        ...lessonForm,
        module_id: currentModule.id
      })
      if (newLesson) {
        const updatedModule = { ...currentModule }
        updatedModule.audio_lessons = [...(updatedModule.audio_lessons || []), newLesson]
        setCurrentModule(updatedModule)
        
        const updatedCourse = { ...currentCourse! }
        updatedCourse.audio_modules = updatedCourse.audio_modules?.map(m => 
          m.id === currentModule.id ? updatedModule : m
        )
        setCurrentCourse(updatedCourse)
        setCourses(courses.map(c => c.id === currentCourse!.id ? updatedCourse : c))
        
        setLessonForm({
          title: '',
          description: '',
          duration: '',
          duration_seconds: 0,
          hls_url: '',
          embed_url: '',
          audio_url: '',
          order_index: 0,
          is_preview: false
        })
        setIsEditing(false)
        setEditingType(null)
      }
    } catch (error) {
      console.error('Erro ao criar aula:', error)
    }
  }

  const handleAudioUpload = async (lessonId: string, audioUrl: string) => {
    try {
      console.log('🎵 [EverCast] Upload de áudio concluído:', { lessonId, audioUrl })
      
      // Atualizar no banco de dados
      const success = await updateAudioLessonUrl(lessonId, audioUrl)
      
      if (success) {
        // Atualizar a aula atual se for a mesma
        if (currentLesson?.id === lessonId) {
          setCurrentLesson({ ...currentLesson, audio_url: audioUrl })
        }
        
        // Atualizar na lista de aulas do módulo
        if (currentModule) {
          const updatedModule = { ...currentModule }
          updatedModule.audio_lessons = updatedModule.audio_lessons?.map(lesson => 
            lesson.id === lessonId ? { ...lesson, audio_url: audioUrl } : lesson
          )
          setCurrentModule(updatedModule)
          
          // Atualizar no curso
          const updatedCourse = { ...currentCourse! }
          updatedCourse.audio_modules = updatedCourse.audio_modules?.map(m => 
            m.id === currentModule.id ? updatedModule : m
          )
          setCurrentCourse(updatedCourse)
          setCourses(courses.map(c => c.id === currentCourse!.id ? updatedCourse : c))
        }
        
        console.log('✅ [EverCast] Aula atualizada com URL do áudio no banco de dados')
      } else {
        console.error('❌ [EverCast] Falha ao atualizar aula no banco de dados')
      }
    } catch (error) {
      console.error('❌ [EverCast] Erro ao atualizar aula com áudio:', error)
    }
  }

  const handleAudioDelete = async (lessonId: string) => {
    try {
      console.log('🗑️ [EverCast] Excluindo áudio da aula:', lessonId)
      
      // Atualizar no banco de dados (remover URL do áudio)
      const success = await updateAudioLessonUrl(lessonId, '')
      
      if (success) {
        // Atualizar a aula atual se for a mesma
        if (currentLesson?.id === lessonId) {
          setCurrentLesson({ ...currentLesson, audio_url: '' })
        }
        
        // Atualizar na lista de aulas do módulo
        if (currentModule) {
          const updatedModule = { ...currentModule }
          updatedModule.audio_lessons = updatedModule.audio_lessons?.map(lesson => 
            lesson.id === lessonId ? { ...lesson, audio_url: '' } : lesson
          )
          setCurrentModule(updatedModule)
          
          // Atualizar no curso
          const updatedCourse = { ...currentCourse! }
          updatedCourse.audio_modules = updatedCourse.audio_modules?.map(m => 
            m.id === currentModule.id ? updatedModule : m
          )
          setCurrentCourse(updatedCourse)
          setCourses(courses.map(c => c.id === currentCourse!.id ? updatedCourse : c))
        }
        
        console.log('✅ [EverCast] Áudio removido da aula no banco de dados')
      } else {
        console.error('❌ [EverCast] Falha ao remover áudio da aula no banco de dados')
      }
    } catch (error) {
      console.error('❌ [EverCast] Erro ao remover áudio da aula:', error)
    }
  }

  // Função para buscar áudio no PandaVideo
  const handleAudioFound = (audioData: any) => {
    console.log('🎵 [EverCast] Áudio encontrado no PandaVideo:', audioData)
    setCurrentAudioHLS(audioData.hls_url)
    
    // Atualizar a aula atual com o HLS se houver uma aula selecionada
    if (currentLesson) {
      updateAudioLessonUrl(currentLesson.id, audioData.hls_url)
      setCurrentLesson(prev => prev ? { ...prev, hls_url: audioData.hls_url } : null)
    }
  }

  const startEditing = (type: 'course' | 'module' | 'lesson', item?: any) => {
    setEditingType(type)
    setEditingItem(item)
    setIsEditing(true)

    if (type === 'course') {
      setCourseForm({
        name: item?.name || '',
        description: item?.description || '',
        thumbnail_url: item?.thumbnail_url || '',
        total_duration: item?.total_duration || ''
      })
    } else if (type === 'module') {
      setModuleForm({
        name: item?.name || '',
        description: item?.description || '',
        order_index: item?.order_index || 0,
        total_duration: item?.total_duration || ''
      })
    } else if (type === 'lesson') {
      setLessonForm({
        title: item?.title || '',
        description: item?.description || '',
        duration: item?.duration || '',
        duration_seconds: item?.duration_seconds || 0,
        hls_url: item?.hls_url || '',
        embed_url: item?.embed_url || '',
        audio_url: item?.audio_url || '',
        order_index: item?.order_index || 0,
        is_preview: item?.is_preview || false
      })
    }
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditingType(null)
    setEditingItem(null)
    setCourseForm({ name: '', description: '', thumbnail_url: '', total_duration: '' })
    setModuleForm({ name: '', description: '', order_index: 0, total_duration: '' })
    setLessonForm({
      title: '',
      description: '',
      duration: '',
      duration_seconds: 0,
      hls_url: '',
      embed_url: '',
      audio_url: '',
      order_index: 0,
      is_preview: false
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayPause = async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          audioRef.current.pause()
          setIsPlaying(false)
        } else {
          await audioRef.current.play()
          setIsPlaying(true)
        }
      } catch (error) {
        console.error('Erro ao reproduzir áudio:', error)
      }
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      setCurrentLesson(playlist[newIndex])
    }
  }

  const handleNext = () => {
    if (currentIndex < playlist.length - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      setCurrentLesson(playlist[newIndex])
    }
  }

  const handleLessonSelect = (lesson: AudioLesson, moduleIndex: number, lessonIndex: number) => {
    setCurrentLesson(lesson)
    setCurrentModule(currentCourse?.audio_modules?.[moduleIndex] || null)
    
    // Criar playlist a partir da aula selecionada
    const newPlaylist = currentCourse?.audio_modules?.[moduleIndex]?.audio_lessons?.slice(lessonIndex) || []
    setPlaylist(newPlaylist)
    setCurrentIndex(0)
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume
        setIsMuted(false)
      } else {
        audioRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">🎧 EverCast</h1>
              <p className="text-gray-300">Seus cursos em áudio para estudar em qualquer lugar</p>
            </div>
            <div className="flex items-center space-x-4">
              {canEdit && (
                <Button
                  onClick={() => startEditing('course')}
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Curso
                </Button>
              )}
              <Badge variant="secondary" className="bg-orange-600 text-white">
                {profile.role === 'teacher' ? 'Professor' : profile.role === 'admin' ? 'Admin' : 'Estudante'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Cursos e Módulos */}
          <div className="lg:col-span-1 space-y-6">
            {/* Cursos */}
            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Meus Cursos</CardTitle>
                  {canEdit && (
                    <Button
                      onClick={() => startEditing('course')}
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Novo
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      currentCourse?.id === course.id
                        ? 'bg-orange-600/30 border border-orange-500'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                    onClick={() => {
                      setCurrentCourse(course)
                      if (course.audio_modules && course.audio_modules.length > 0) {
                        setCurrentModule(course.audio_modules[0])
                        setPlaylist(course.audio_modules[0].audio_lessons || [])
                        setCurrentIndex(0)
                      }
                    }}
                  >
                    <h3 className="font-semibold text-white mb-2">{course.name}</h3>
                    <p className="text-sm text-gray-300 mb-3">{course.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{course.total_duration}</span>
                      <span className="text-orange-400">
                        {course.audio_modules?.length || 0} módulos
                      </span>
                    </div>
                    <Progress 
                      value={0} 
                      className="mt-2"
                    />
                    {canEdit && (
                      <div className="flex justify-end space-x-1 mt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditing('course', course)
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Módulos do Curso Atual */}
            {currentCourse && (
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Módulos</CardTitle>
                    {canEdit && (
                      <Button
                        onClick={() => startEditing('module')}
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Novo
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(() => {
                    console.log('🔍 [EverCast] Renderizando módulos...')
                    console.log('📂 [EverCast] currentCourse:', currentCourse)
                    console.log('📁 [EverCast] currentCourse.audio_modules:', currentCourse.audio_modules)
                    console.log('📊 [EverCast] Módulos length:', currentCourse.audio_modules?.length || 0)
                    
                    if (!currentCourse.audio_modules || currentCourse.audio_modules.length === 0) {
                      console.log('❌ [EverCast] Nenhum módulo para renderizar')
                      return (
                        <div className="text-center text-gray-400 py-4">
                          Nenhum módulo encontrado
                        </div>
                      )
                    }
                    
                    return currentCourse.audio_modules.map((module, moduleIndex) => {
                      console.log(`📁 [EverCast] Renderizando módulo ${moduleIndex + 1}:`, module)
                      return (
                        <div
                          key={module.id}
                          className={`p-3 rounded-lg cursor-pointer transition-all ${
                            currentModule?.id === module.id
                              ? 'bg-orange-600/30 border border-orange-500'
                              : 'bg-white/5 hover:bg-white/10'
                          }`}
                          onClick={() => {
                            setCurrentModule(module)
                            setPlaylist(module.audio_lessons || [])
                            setCurrentIndex(0)
                          }}
                        >
                          <h4 className="font-medium text-white mb-1">{module.name}</h4>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">{module.total_duration}</span>
                            <span className="text-orange-400">
                              {module.audio_lessons?.length || 0} aulas
                            </span>
                          </div>
                          {canEdit && (
                            <div className="flex justify-end space-x-1 mt-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  startEditing('module', module)
                                }}
                                className="text-gray-400 hover:text-white"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    })
                  })()}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content - Playlist */}
          <div className="lg:col-span-2 space-y-6">
            {/* Busca de áudio PandaVideo - Apenas para professores/admins */}
            {canEdit && (
              <AudioSearch 
                onAudioFound={handleAudioFound}
                currentVideoId={currentLesson?.pandavideo_id}
              />
            )}

            {/* Debug HLS - Apenas para professores/admins */}
            {canEdit && currentLesson?.hls_url && (
              <HLSDebug 
                hlsUrl={currentLesson.hls_url}
                onTestComplete={(success, details) => {
                  console.log('🔍 Debug HLS:', { success, details })
                }}
              />
            )}

            {/* Teste HLS com URL específica - Apenas para professores/admins */}
            {canEdit && (
              <HLSTestPlayer 
                hlsUrl="https://b-vz-e9d62059-4a4.tv.pandavideo.com.br/e13112a8-6545-49e7-ba1c-9825b15c9c09/playlist.m3u8"
                title="Teste URL HLS Pandavideo"
              />
            )}

            {currentModule && (
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">{currentModule.name}</CardTitle>
                      <p className="text-gray-300">
                        {currentModule.audio_lessons?.length || 0} aulas disponíveis
                      </p>
                    </div>
                    {canEdit && (
                      <Button
                        onClick={() => startEditing('lesson')}
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Aula
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentModule.audio_lessons?.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        className={`flex items-center p-4 rounded-lg cursor-pointer transition-all ${
                          currentLesson?.id === lesson.id
                            ? 'bg-orange-600/30 border border-orange-500'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                        onClick={() => handleLessonSelect(lesson, 
                          currentCourse?.audio_modules?.findIndex(m => m.id === currentModule.id) || 0, 
                          lessonIndex
                        )}
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mr-4">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-white mb-1">{lesson.title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {lesson.duration}
                            </span>
                            {lesson.audio_url && (
                              <span className="text-green-400">MP3</span>
                            )}
                            {lesson.hls_url && !lesson.audio_url && (
                              <span className="text-blue-400">HLS</span>
                            )}
                            {lesson.is_preview && (
                              <span className="text-yellow-400">Preview</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            <Download className="w-4 h-4" />
                          </Button>
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                startEditing('lesson', lesson)
                              }}
                              className="text-gray-400 hover:text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>


      {/* HLS Player Component */}
      {currentLesson?.hls_url && !currentLesson.audio_url && (
        <HLSPlayer
          hlsUrl={currentLesson.hls_url}
          title={currentLesson.title}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleNext}
          onPlayPause={setIsPlaying}
          className="fixed bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-50 max-w-6xl mx-auto" // Player responsivo fixo na parte inferior
        />
      )}

      {/* HLS Player para áudio do PandaVideo */}
      {currentAudioHLS && (
        <HLSPlayer
          hlsUrl={currentAudioHLS}
          title="Áudio do PandaVideo"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleNext}
          onPlayPause={setIsPlaying}
          className="fixed bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-50 max-w-6xl mx-auto"
        />
      )}
      
      {/* MP3 Player Component */}
      {currentLesson?.audio_url && (
        <MP3Player
          audioUrl={currentLesson.audio_url}
          title={currentLesson.title}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleNext}
          onPlayPause={setIsPlaying}
          className="fixed bottom-4 left-4 right-4 z-10" // Player fixo na parte inferior
        />
      )}
      
      {/* Fallback Audio Element para URLs não-HLS e não-MP3 */}
      {currentLesson && !currentLesson.hls_url && !currentLesson.audio_url && (
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleNext}
          src={currentLesson.embed_url}
          preload="metadata"
        />
      )}

      {/* Modal de Edição */}
      {isEditing && canEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl bg-black/90 backdrop-blur-sm border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">
                  {editingType === 'course' && (editingItem ? 'Editar Curso' : 'Novo Curso')}
                  {editingType === 'module' && 'Novo Módulo'}
                  {editingType === 'lesson' && 'Nova Aula'}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={cancelEditing}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingType === 'course' && (
                <>
                  <div>
                    <Label htmlFor="course-name" className="text-white">Nome do Curso</Label>
                    <Input
                      id="course-name"
                      value={courseForm.name}
                      onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Ex: Extensivo EAOF 2026 - Português e Redação"
                    />
                  </div>
                  <div>
                    <Label htmlFor="course-description" className="text-white">Descrição</Label>
                    <Textarea
                      id="course-description"
                      value={courseForm.description}
                      onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Descrição do curso..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="course-thumbnail" className="text-white">URL da Thumbnail</Label>
                    <Input
                      id="course-thumbnail"
                      value={courseForm.thumbnail_url}
                      onChange={(e) => setCourseForm({ ...courseForm, thumbnail_url: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="https://exemplo.com/thumbnail.jpg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="course-duration" className="text-white">Duração Total</Label>
                    <Input
                      id="course-duration"
                      value={courseForm.total_duration}
                      onChange={(e) => setCourseForm({ ...courseForm, total_duration: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Ex: 75h 26m"
                    />
                  </div>
                </>
              )}

              {editingType === 'module' && (
                <>
                  <div>
                    <Label htmlFor="module-name" className="text-white">Nome do Módulo</Label>
                    <Input
                      id="module-name"
                      value={moduleForm.name}
                      onChange={(e) => setModuleForm({ ...moduleForm, name: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Ex: FRENTE 1 - Fonética e Morfologia"
                    />
                  </div>
                  <div>
                    <Label htmlFor="module-description" className="text-white">Descrição</Label>
                    <Textarea
                      id="module-description"
                      value={moduleForm.description}
                      onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Descrição do módulo..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="module-duration" className="text-white">Duração do Módulo</Label>
                    <Input
                      id="module-duration"
                      value={moduleForm.total_duration}
                      onChange={(e) => setModuleForm({ ...moduleForm, total_duration: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Ex: 3h 45m"
                    />
                  </div>
                </>
              )}

              {editingType === 'lesson' && (
                <>
                  <div>
                    <Label htmlFor="lesson-title" className="text-white">Título da Aula</Label>
                    <Input
                      id="lesson-title"
                      value={lessonForm.title}
                      onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Ex: Aula 1 - Fonética"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lesson-description" className="text-white">Descrição</Label>
                    <Textarea
                      id="lesson-description"
                      value={lessonForm.description}
                      onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Descrição da aula..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lesson-duration" className="text-white">Duração</Label>
                      <Input
                        id="lesson-duration"
                        value={lessonForm.duration}
                        onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="Ex: 31:36"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lesson-duration-seconds" className="text-white">Duração (segundos)</Label>
                      <Input
                        id="lesson-duration-seconds"
                        type="number"
                        value={lessonForm.duration_seconds}
                        onChange={(e) => setLessonForm({ ...lessonForm, duration_seconds: parseInt(e.target.value) || 0 })}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="1896"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="lesson-hls-url" className="text-white">URL HLS (Pandavideo)</Label>
                    <Input
                      id="lesson-hls-url"
                      value={lessonForm.hls_url}
                      onChange={(e) => setLessonForm({ ...lessonForm, hls_url: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="https://b-vz-e9d62059-4a4.tv.pandavideo.com.br/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="lesson-embed-url" className="text-white">URL Embed (Pandavideo)</Label>
                    <Input
                      id="lesson-embed-url"
                      value={lessonForm.embed_url}
                      onChange={(e) => setLessonForm({ ...lessonForm, embed_url: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="https://player-vz-e9d62059-4a4.tv.pandavideo.com.br/embed/..."
                    />
                  </div>
                  
                  {/* Upload de MP3 */}
                  <div>
                    <Label className="text-white">Upload de Áudio MP3</Label>
                    <div className="mt-2">
                      <AudioUpload
                        lessonId={editingItem?.id || 'new'}
                        onUploadComplete={(audioUrl) => {
                          setLessonForm({ ...lessonForm, audio_url: audioUrl })
                          if (editingItem?.id) {
                            handleAudioUpload(editingItem.id, audioUrl)
                          }
                        }}
                        onDeleteAudio={() => {
                          setLessonForm({ ...lessonForm, audio_url: '' })
                          if (editingItem?.id) {
                            handleAudioDelete(editingItem.id)
                          }
                        }}
                        currentAudioUrl={lessonForm.audio_url}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="lesson-preview"
                      checked={lessonForm.is_preview}
                      onChange={(e) => setLessonForm({ ...lessonForm, is_preview: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="lesson-preview" className="text-white">Aula gratuita (preview)</Label>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={cancelEditing}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    if (editingType === 'course') {
                      handleCreateCourse()
                    } else if (editingType === 'module') {
                      handleCreateModule()
                    } else if (editingType === 'lesson') {
                      handleCreateLesson()
                    }
                  }}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
