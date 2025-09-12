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
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Carregando cursos...
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Aguarde enquanto carregamos seus cursos de áudio
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
