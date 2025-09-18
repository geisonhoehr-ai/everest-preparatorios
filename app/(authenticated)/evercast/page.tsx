'use client'

import { useState, useEffect, useRef } from 'react'
import { PagePermissionGuard } from "@/components/page-permission-guard"
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
import { EnhancedAudioPlayer } from '@/components/evercast/enhanced-audio-player'
import { BackgroundAudioManager } from '@/components/evercast/background-audio-manager'
import { BackgroundAudioInfo } from '@/components/evercast/background-audio-info'
import { useBackgroundAudioService } from '@/lib/background-audio-service'
import { useServiceWorker } from '@/hooks/use-service-worker'
import PandaVideoManager from '@/components/evercast/panda-video-manager'
import MobileModuleAccordion from '@/components/evercast/mobile-module-accordion'
import { CrudModal } from '@/components/evercast/crud-modal'
import { SearchFilters } from '@/components/evercast/search-filters'
import { LoadingStates, InlineLoading, SkeletonList } from '@/components/evercast/loading-states'
import { StatsOverview } from '@/components/evercast/stats-overview'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import Hls from 'hls.js'

export default function EverCastPage() {
  const { user, profile } = useAuth()
  const [courses, setCourses] = useState<AudioCourse[]>([])
  const [filteredCourses, setFilteredCourses] = useState<AudioCourse[]>([])
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
  const [editingData, setEditingData] = useState<AudioCourse | AudioModule | AudioLesson | null>(null)
  const [parentItem, setParentItem] = useState<AudioCourse | AudioModule | null>(null)
  const [isLooping, setIsLooping] = useState(false)
  const [showPandaVideoManager, setShowPandaVideoManager] = useState(false)
  const [extractedAudio, setExtractedAudio] = useState<{ title: string; blob: Blob } | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentAudioHLS, setCurrentAudioHLS] = useState<string | null>(null)
  const [playlist, setPlaylist] = useState<AudioLesson[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cachedAudios, setCachedAudios] = useState<Set<string>>(new Set())
  const [useEnhancedPlayer, setUseEnhancedPlayer] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)
  
  // Background Audio Service
  const backgroundAudioService = useBackgroundAudioService()
  
  // Service Worker
  const serviceWorker = useServiceWorker()

  // Inicializar Background Audio Service
  useEffect(() => {
    const initializeBackgroundAudio = async () => {
      try {
        await backgroundAudioService.initialize()
        console.log('✅ Background Audio Service inicializado')
      } catch (error) {
        console.error('❌ Erro ao inicializar Background Audio Service:', error)
      }
    }

    initializeBackgroundAudio()
  }, [])

  // Configurar Background Audio quando a aula mudar
  useEffect(() => {
    if (!currentLesson) return

    // Configurar metadados
    backgroundAudioService.setMetadata({
      title: currentLesson.title,
      artist: 'EverCast - Everest Preparatórios',
      album: currentLesson.module?.name || currentCourse?.name || 'Curso de Áudio',
      artwork: [
        {
          src: '/icons/evercast-icon-96.png',
          sizes: '96x96',
          type: 'image/png'
        },
        {
          src: '/icons/evercast-icon-128.png',
          sizes: '128x128',
          type: 'image/png'
        },
        {
          src: '/icons/evercast-icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/evercast-icon-256.png',
          sizes: '256x256',
          type: 'image/png'
        }
      ]
    })

    // Configurar action handlers
    backgroundAudioService.setActionHandlers({
      play: () => setIsPlaying(true),
      pause: () => setIsPlaying(false),
      stop: () => {
        setIsPlaying(false)
        setCurrentTime(0)
      },
      seekbackward: (details) => {
        const skipTime = details.seekOffset || 10
        setCurrentTime(Math.max(0, currentTime - skipTime))
      },
      seekforward: (details) => {
        const skipTime = details.seekOffset || 10
        setCurrentTime(Math.min(duration, currentTime + skipTime))
      },
      seekto: (details) => {
        if (details.seekTime !== undefined) {
          setCurrentTime(details.seekTime)
        }
      },
      previoustrack: () => {
        if (currentIndex > 0) {
          const prevIndex = currentIndex - 1
          setCurrentIndex(prevIndex)
          setCurrentLesson(playlist[prevIndex])
        }
      },
      nexttrack: handleNext
    })

    // Ativar Wake Lock se estiver tocando
    if (isPlaying) {
      backgroundAudioService.requestWakeLock()
    } else {
      backgroundAudioService.releaseWakeLock()
    }

  }, [currentLesson, isPlaying, currentTime, duration, currentIndex, playlist])

  // Atualizar estado de reprodução no Media Session
  useEffect(() => {
    backgroundAudioService.setPlaybackState(isPlaying ? 'playing' : 'paused')
  }, [isPlaying])

  // Atualizar posição no Media Session
  useEffect(() => {
    if (duration > 0) {
      backgroundAudioService.setPositionState({
        duration,
        playbackRate: 1,
        position: currentTime
      })
    }
  }, [currentTime, duration])

  // Carregar cursos
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true)
        const coursesData = await getAllAudioCourses()
        setCourses(coursesData)
        setFilteredCourses(coursesData)
        
        // Selecionar o primeiro curso se houver
        if (coursesData.length > 0) {
          setCurrentCourse(coursesData[0])
        }
      } catch (error) {
        console.error('Erro ao carregar cursos:', error)
        toast.error('Erro ao carregar cursos. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }

    if (user && profile) {
      loadCourses()
    }
  }, [user, profile])

  // Função para recarregar cursos após operações CRUD
  const handleCrudSuccess = async () => {
    try {
      const coursesData = await getAllAudioCourses()
      setCourses(coursesData)
      setFilteredCourses(coursesData)
      
      // Manter o curso atual selecionado se ainda existir
      if (currentCourse) {
        const updatedCourse = coursesData.find(c => c.id === currentCourse.id)
        if (updatedCourse) {
          setCurrentCourse(updatedCourse)
        } else if (coursesData.length > 0) {
          setCurrentCourse(coursesData[0])
        }
      }
    } catch (error) {
      console.error('Erro ao recarregar cursos:', error)
      toast.error('Erro ao atualizar lista de cursos')
    }
  }

  // Função para abrir modal de criação/edição
  const openModal = (type: 'course' | 'module' | 'lesson', item?: any, parent?: any) => {
    setEditingItem(type)
    setEditingData(item || null)
    setParentItem(parent || null)
    setShowModal(true)
  }

  // Função para fechar modal
  const closeModal = () => {
    setShowModal(false)
    setEditingItem(null)
    setEditingData(null)
    setParentItem(null)
  }

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

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      setCurrentIndex(prevIndex)
      setCurrentLesson(playlist[prevIndex])
      setIsPlaying(false)
    }
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
    <PagePermissionGuard pageName="evercast">
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUseEnhancedPlayer(!useEnhancedPlayer)}
                className="text-orange-600 border-orange-600 hover:bg-orange-50"
                title={useEnhancedPlayer ? "Usar player antigo" : "Usar player com background audio"}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                {useEnhancedPlayer ? "Player Antigo" : "Background Audio"}
              </Button>
              {canEdit && (
                <Button
                  onClick={() => setShowModal(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Curso
                </Button>
              )}
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  {profile.role === 'teacher' ? 'Professor' : profile.role === 'admin' ? 'Admin' : 'Estudante'}
                </Badge>
                {serviceWorker.isSupported && (
                  <Badge 
                    variant="outline" 
                    className={`${
                      serviceWorker.isRegistered 
                        ? 'text-green-600 border-green-600' 
                        : 'text-yellow-600 border-yellow-600'
                    }`}
                    title={serviceWorker.isRegistered ? 'PWA ativo' : 'PWA não ativo'}
                  >
                    {serviceWorker.isRegistered ? 'PWA ✅' : 'PWA ⚠️'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Estatísticas e Visão Geral */}
          {!loading && courses.length > 0 && (
            <StatsOverview 
              courses={courses} 
              currentCourse={currentCourse}
            />
          )}

          {/* Informações sobre Background Audio */}
          {useEnhancedPlayer && (
            <BackgroundAudioInfo className="mb-6" />
          )}

          {/* Sistema de Busca e Filtros */}
          {!loading && courses.length > 0 && (
            <SearchFilters
              courses={courses}
              onFilteredCourses={setFilteredCourses}
              searchPlaceholder="Buscar cursos, módulos ou aulas..."
            />
          )}

          {/* Card Principal - Estilo Spotify */}
          <Card className="bg-white/80 dark:bg-black/20 backdrop-blur-sm border-gray-200 dark:border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    Cursos de Áudio
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-300">
                    {filteredCourses.length} curso{filteredCourses.length !== 1 ? 's' : ''} encontrado{filteredCourses.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {canEdit && (
                  <Button
                    onClick={() => openModal('course')}
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
                <LoadingStates type="courses" />
              ) : filteredCourses.length === 0 ? (
                <div className="text-center py-12">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {courses.length === 0 ? 'Nenhum curso encontrado' : 'Nenhum curso corresponde aos filtros'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {courses.length === 0 
                      ? 'Não há cursos de áudio disponíveis no momento'
                      : 'Tente ajustar os filtros de busca'
                    }
                  </p>
                  {canEdit && courses.length === 0 && (
                    <Button
                      onClick={() => openModal('course')}
                      className="mt-4 bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Curso
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Seletor de Cursos */}
                  <div className="flex flex-wrap gap-2">
                    {filteredCourses.map((course) => (
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
                              onClick={() => openModal('course', currentCourse)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openModal('module', null, currentCourse)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Novo Módulo
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
                                        onClick={() => openModal('module', module, currentCourse)}
                                        title="Editar módulo"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openModal('lesson', null, module)}
                                        title="Nova aula"
                                      >
                                        <Plus className="w-4 h-4" />
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
                                            onClick={() => openModal('lesson', lesson, module)}
                                            title="Editar aula"
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


      {/* Enhanced Audio Player com Background Audio */}
      {currentLesson && useEnhancedPlayer && (
        <EnhancedAudioPlayer
          currentLesson={currentLesson}
          isPlaying={isPlaying}
          onPlayPause={setIsPlaying}
          onNext={handleNext}
          onPrevious={handlePrevious}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          onVolumeChange={handleVolumeChange}
          isMuted={isMuted}
          onMuteToggle={handleMuteToggle}
          isLooping={isLooping}
          onLoopToggle={toggleLoop}
          className="fixed bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-50 max-w-6xl mx-auto"
        />
      )}

      {/* Players Legados (fallback) */}
      {currentLesson && !useEnhancedPlayer && (
        <>
          {/* HLS Player Component */}
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

          {/* Fallback Audio Element */}
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
        </>
      )}

      {/* Modal CRUD */}
      {showModal && editingItem && user && (
        <CrudModal
          isOpen={showModal}
          onClose={closeModal}
          type={editingItem}
          item={editingData}
          parentItem={parentItem}
          onSuccess={handleCrudSuccess}
          userUuid={user.id}
        />
      )}
      </div>
    </PagePermissionGuard>
  )
}
