"use client"

import { useState, useEffect } from "react"
import { PagePermissionGuard } from "@/components/page-permission-guard"
import { CourseCard, CourseGrid } from "@/components/ui/course-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BookOpen, 
  Play, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Trophy, 
  Star, 
  Flame, 
  Clock,
  Brain,
  Target,
  Award,
  TrendingUp,
  Zap,
  Crown,
  Medal,
  Timer,
  RefreshCw,
  Settings,
  Plus,
  Eye,
  EyeOff,
  FileText,
  BookMarked,
  GraduationCap,
  Library,
  Sparkles,
  Rocket,
  Gamepad2,
  ChevronRight
} from "lucide-react"

export default function FlashcardsNewPage() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [flashcards, setFlashcards] = useState<any[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [studyStats, setStudyStats] = useState({
    totalCards: 0,
    studiedCards: 0,
    correctAnswers: 0,
    streak: 0
  })

  // Dados de exemplo das matérias
  const subjects = [
    {
      id: 'portugues',
      title: 'Português',
      description: 'Acentuação gráfica, ortografia e gramática',
      totalCards: 50,
      studiedCards: 25,
      difficulty: 'Médio',
      color: '#f97316',
      status: 'in-progress' as const,
      progress: 50
    },
    {
      id: 'regulamentos',
      title: 'Regulamentos',
      description: 'Normas técnicas e regulamentações',
      totalCards: 30,
      studiedCards: 30,
      difficulty: 'Fácil',
      color: '#10b981',
      status: 'completed' as const,
      progress: 100
    },
    {
      id: 'matematica',
      title: 'Matemática',
      description: 'Álgebra, geometria e estatística',
      totalCards: 40,
      studiedCards: 0,
      difficulty: 'Difícil',
      color: '#3b82f6',
      status: 'not-started' as const,
      progress: 0
    },
    {
      id: 'historia',
      title: 'História',
      description: 'História do Brasil e mundial',
      totalCards: 35,
      studiedCards: 15,
      difficulty: 'Médio',
      color: '#8b5cf6',
      status: 'in-progress' as const,
      progress: 43
    }
  ]

  const difficultyColors = {
    'Fácil': 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    'Médio': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    'Difícil': 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
  }

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return <CheckCircle className="h-4 w-4" />
      case 'Médio': return <Target className="h-4 w-4" />
      case 'Difícil': return <Trophy className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  const handleSubjectClick = (subjectId: string) => {
    setSelectedSubject(subjectId)
    // Aqui você carregaria os flashcards da matéria selecionada
    setFlashcards([]) // Placeholder
    setCurrentCardIndex(0)
    setShowAnswer(false)
  }

  const handleStartStudy = () => {
    // Implementar lógica de início do estudo
    console.log('Iniciando estudo de:', selectedSubject)
  }

  if (selectedSubject) {
    return (
      <PagePermissionGuard pageName="flashcards">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Button 
                variant="outline" 
                onClick={() => setSelectedSubject(null)}
                className="gap-2 mb-4"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Voltar às Matérias
              </Button>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {subjects.find(s => s.id === selectedSubject)?.title} - Flashcards
              </h1>
              <p className="text-muted-foreground">
                {subjects.find(s => s.id === selectedSubject)?.description}
              </p>
            </div>
          </div>

          {/* Study Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Cards</p>
                    <p className="text-2xl font-bold">{studyStats.totalCards}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Estudados</p>
                    <p className="text-2xl font-bold">{studyStats.studiedCards}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Sequência</p>
                    <p className="text-2xl font-bold">{studyStats.streak}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Precisão</p>
                    <p className="text-2xl font-bold">
                      {studyStats.totalCards > 0 ? Math.round((studyStats.correctAnswers / studyStats.totalCards) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Study Actions */}
          <div className="flex justify-center">
            <Button size="lg" className="gap-2" onClick={handleStartStudy}>
              <Play className="h-5 w-5" />
              Iniciar Estudo
            </Button>
          </div>
        </div>
      </PagePermissionGuard>
    )
  }

  return (
    <PagePermissionGuard pageName="flashcards">
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Flashcards
          </h1>
          <p className="text-muted-foreground">
            Pratique e memorize o conteúdo com nossos flashcards interativos
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total de Cards</p>
                  <p className="text-2xl font-bold">
                    {subjects.reduce((sum, s) => sum + s.totalCards, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Estudados</p>
                  <p className="text-2xl font-bold">
                    {subjects.reduce((sum, s) => sum + s.studiedCards, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Sequência Atual</p>
                  <p className="text-2xl font-bold">{studyStats.streak}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subjects Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Escolha uma Matéria
            </h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </Button>
          </div>

          <CourseGrid>
            {subjects.map((subject, index) => (
              <Card 
                key={subject.id}
                className="relative h-[320px] w-full max-w-[380px] mx-auto cursor-pointer transition-all duration-200 hover:shadow-xl flex flex-col overflow-hidden"
                onClick={() => handleSubjectClick(subject.id)}
              >
                <CardContent className="p-6 flex flex-col h-full space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <Badge 
                      className="text-xs px-2 py-1 rounded-full font-medium text-white"
                      style={{ backgroundColor: subject.color }}
                    >
                      {subject.title}
                    </Badge>
                    <Badge className={`text-xs px-3 py-1.5 rounded-full font-medium ${difficultyColors[subject.difficulty as keyof typeof difficultyColors]}`}>
                      {getDifficultyIcon(subject.difficulty)}
                      <span className="ml-1">{subject.difficulty}</span>
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-bold text-foreground text-lg mb-2 leading-tight">
                        {subject.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {subject.description}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-muted rounded-lg">
                        <div className="text-sm font-bold text-foreground">{subject.totalCards}</div>
                        <div className="text-xs text-muted-foreground">Total</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded-lg">
                        <div className="text-sm font-bold text-foreground">{subject.studiedCards}</div>
                        <div className="text-xs text-muted-foreground">Estudados</div>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2 pt-4 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Progresso</span>
                      <span className="text-foreground font-bold">{subject.progress}%</span>
                    </div>
                    
                    <Progress 
                      value={subject.progress} 
                      variant={subject.status === 'completed' ? 'success' : subject.status === 'in-progress' ? 'warning' : 'gradient'}
                      className="h-2"
                    />
                    
                    <div className="text-center pt-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        Estudar
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CourseGrid>
        </div>
      </div>
    </PagePermissionGuard>
  )
}
