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
  X,
  Star,
  Repeat,
  Menu,
  Smartphone
} from 'lucide-react'
import { HLSPlayer } from '@/components/evercast/hls-player'
import { MP3Player } from '@/components/evercast/mp3-player'
import { SoundCloudPlayer } from '@/components/evercast/soundcloud-player'
import AudioOnlyHLSPlayer from '@/components/evercast/audio-only-hls-player'
import { AudioPlayer } from '@/components/evercast/audio-player'
import PandaVideoManager from '@/components/evercast/panda-video-manager'
import MobileModuleAccordion from '@/components/evercast/mobile-module-accordion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Hls from 'hls.js'

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
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<'course' | 'module' | 'lesson' | null>(null)
  const [isLooping, setIsLooping] = useState(false)
  const [showPandaVideoManager, setShowPandaVideoManager] = useState(false)
  const [extractedAudio, setExtractedAudio] = useState<{ title: string; blob: Blob } | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentAudioHLS, setCurrentAudioHLS] = useState<string | null>(null)
  const [playlist, setPlaylist] = useState<AudioLesson[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cachedAudios, setCachedAudios] = useState<Set<string>>(new Set())
  const audioRef = useRef<HTMLAudioElement>(null)

  // Carregar cursos
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true)
        const coursesData = await getAllAudioCourses()
        setCourses(coursesData)
        
        // Selecionar o primeiro curso se houver
        if (coursesData.length > 0) {
          setCurrentCourse(coursesData[0])
        }
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

  // Funções de manipulação de áudio (da versão antiga)
  const handleNext = () => {
    if (isLooping) {
      // Se está em loop, reinicia a mesma aula
      setCurrentLesson(playlist[currentIndex])
      setIsPlaying(false)
    } else if (currentIndex < playlist.length - 1) {
      // Próxima aula na playlist
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      setCurrentLesson(playlist[nextIndex])
      setIsPlaying(false)
    } else {
      // Fim da playlist
      setIsPlaying(false)
    }
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

  const toggleLoop = () => {
    setIsLooping(!isLooping)
  }

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

  const canEdit = profile.role === 'teacher' || profile.role === 'admin'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-50 dark:from-slate-900 dark:via-orange-900 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-black/20 backdrop-blur-sm border-b border-gray-200 dark:border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🎧 EverCast</h1>
              <p className="text-gray-600 dark:text-gray-300">Seus cursos em áudio para estudar em qualquer lugar</p>
            </div>
            <div className="flex items-center space-x-4">
              {canEdit && (
                <Button
                  onClick={() => setShowModal(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Curso
                </Button>
              )}
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                {profile.role === 'teacher' ? 'Professor' : profile.role === 'admin' ? 'Admin' : 'Estudante'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Card Principal - Estilo Spotify */}
          <Card className="bg-white/80 dark:bg-black/20 backdrop-blur-sm border-gray-200 dark:border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    Cursos de Áudio
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-300">
                    Selecione um curso para começar
                  </p>
                </div>
                {canEdit && (
                  <Button
                    onClick={() => {
                      setEditingItem('course')
                      setShowModal(true)
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Curso
                  </Button>
                )}
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
                <div className="space-y-6">
                  {/* Seletor de Cursos */}
                  <div className="flex flex-wrap gap-2">
                    {courses.map((course) => (
                      <Button
                        key={course.id}
                        variant={currentCourse?.id === course.id ? "default" : "outline"}
                        onClick={() => setCurrentCourse(course)}
                        className={`${
                          currentCourse?.id === course.id 
                            ? "bg-orange-600 hover:bg-orange-700 text-white" 
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {course.name}
                      </Button>
                    ))}
                  </div>

                  {/* Conteúdo do Curso Selecionado */}
                  {currentCourse && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {currentCourse.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300">
                            {currentCourse.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>{currentCourse.audio_modules?.length || 0} módulos</span>
                            <span>{currentCourse.total_duration}</span>
                          </div>
                        </div>
                        {canEdit && (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingItem('course')
                                setShowModal(true)
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Implementar exclusão
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Módulos */}
                      {currentCourse.audio_modules && currentCourse.audio_modules.length > 0 ? (
                        <div className="space-y-3">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            Módulos ({currentCourse.audio_modules.length})
                          </h4>
                          {currentCourse.audio_modules.map((module: any) => (
                            <Card key={module.id} className="bg-white/60 dark:bg-black/10">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                                      <span className="text-white font-bold text-sm">
                                        {module.name.charAt(0)}
                                      </span>
                                    </div>
                                    <div>
                                      <h5 className="font-medium text-gray-900 dark:text-white">
                                        {module.name}
                                      </h5>
                                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                        <span>{module.audio_lessons?.length || 0} aulas</span>
                                        <span>{module.total_duration}</span>
                                      </div>
                                    </div>
                                  </div>
                                  {canEdit && (
                                    <div className="flex space-x-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setCurrentModule(module)
                                          setEditingItem('module')
                                          setShowModal(true)
                                        }}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>

                                {/* Aulas do Módulo */}
                                {module.audio_lessons && module.audio_lessons.length > 0 && (
                                  <div className="mt-4 space-y-2">
                                    <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      Aulas:
                                    </h6>
                                    {module.audio_lessons.map((lesson: any) => (
                                      <div
                                        key={lesson.id}
                                        className="flex items-center justify-between p-2 bg-white/40 dark:bg-black/20 rounded-lg"
                                      >
                                        <div className="flex items-center space-x-3">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              setCurrentLesson(lesson)
                                              setIsPlaying(true)
                                            }}
                                            className="p-1"
                                          >
                                            <Play className="w-4 h-4" />
                                          </Button>
                                          <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                              {lesson.title}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                              {lesson.duration || lesson.duration_seconds}
                                            </p>
                                          </div>
                                        </div>
                                        {canEdit && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              setCurrentLesson(lesson)
                                              setEditingItem('lesson')
                                              setShowModal(true)
                                            }}
                                          >
                                            <Edit className="w-4 h-4" />
                                          </Button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-600 dark:text-gray-300">
                            Nenhum módulo encontrado neste curso
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>


      {/* HLS Player Component - Estrutura da versão antiga */}
      {currentLesson?.hls_url && !currentLesson.audio_url && !currentLesson.soundcloud_url && (
        <HLSPlayer
          hlsUrl={currentLesson.hls_url}
          title={currentLesson.title}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleNext}
          onPlayPause={setIsPlaying}
          isLooping={isLooping}
          onToggleLoop={toggleLoop}
          className="fixed bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-50 max-w-6xl mx-auto"
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
          isLooping={isLooping}
          onToggleLoop={toggleLoop}
          className="fixed bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-50 max-w-6xl mx-auto"
        />
      )}

      {/* MP3 Player Component */}
      {currentLesson?.audio_url && !currentLesson.hls_url && !currentLesson.soundcloud_url && (
        <MP3Player
          audioUrl={currentLesson.audio_url}
          title={currentLesson.title}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleNext}
          onPlayPause={setIsPlaying}
          isLooping={isLooping}
          onToggleLoop={toggleLoop}
          className="fixed bottom-4 left-4 right-4 z-10"
        />
      )}

      {/* SoundCloud Player Component */}
      {currentLesson?.soundcloud_url && !currentLesson.audio_url && !currentLesson.hls_url && (
        <SoundCloudPlayer
          soundcloudUrl={currentLesson.soundcloud_url}
          title={currentLesson.title}
          onPlayPause={setIsPlaying}
          className="fixed bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-50 max-w-6xl mx-auto"
        />
      )}

      {/* Fallback Audio Element para URLs não-HLS, não-MP3 e não-SoundCloud */}
      {currentLesson?.embed_url && !currentLesson.hls_url && !currentLesson.audio_url && !currentLesson.soundcloud_url && (
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleNext}
          src={currentLesson.embed_url}
          preload="metadata"
        />
      )}
    </div>
  )
}
