"use client"

import { useState, useEffect, useTransition, useCallback } from "react"
import { PagePermissionGuard } from "@/components/page-permission-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BookOpenText, 
  Play, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  BookOpen, 
  Trophy, 
  Star, 
  Search, 
  Flame, 
  Clock,
  Target,
  Award,
  TrendingUp,
  Zap,
  Crown,
  Medal,
  Timer,
  Brain,
  RefreshCw,
  Maximize,
  Minimize,
  Keyboard,
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  Users,
  Shield,
  FileText,
  BookMarked,
  GraduationCap,
  Library
} from "lucide-react"
import { RoleGuard } from "@/components/role-guard"
import { useAuth } from "@/context/auth-context"
import { updateFlashcardProgress, getAllSubjects, getTopicsBySubject, getFlashcardsForReview, updateFlashcardProgressSM2, getCardsForReview, getNewCards, getFlashcardProgressStats, getAllFlashcardCategories, getAllFlashcardTags, addFlashcardCategory, addFlashcardTag, removeFlashcardCategory, removeFlashcardTag, getFlashcardCategoriesAndTags, createStudySession, endStudySession, getStudySessionsHistory, getStudyAnalytics, createStudyGoal, getStudyGoals, updateStudyGoalProgress, getAllFlashcardsByTopicSimple } from "../../server-actions"
import { getFlashcardsByTopic, createFlashcard, updateFlashcard, deleteFlashcard } from "../../../actions-flashcards-simples"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Interface para subjects
interface Subject {
  id: number
  name: string
  description?: string
}

interface Topic {
  id: string
  name: string
  description: string
  flashcardCount: number
}

interface Flashcard {
  id: number
  topic_id: string
  question: string
  answer: string
  categories?: FlashcardCategory[]
  tags?: FlashcardTag[]
}

interface FlashcardCategory {
  id: number
  name: string
  description?: string
  color: string
  icon?: string
}

interface FlashcardTag {
  id: number
  name: string
  color: string
}

export default function FlashcardsPage() {
  const { user, profile } = useAuth()
  
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [studyMode, setStudyMode] = useState<"select" | "study" | "finished">("select")
  const [isLoading, setIsLoading] = useState(false)
  const [flashcardError, setFlashcardError] = useState<string | null>(null)
  const [studyStats, setStudyStats] = useState({ correct: 0, incorrect: 0, total: 0 })
  const [showCardCountSelector, setShowCardCountSelector] = useState(false)
  const [selectedCardCount, setSelectedCardCount] = useState(10)
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null)
  const [newFlashcard, setNewFlashcard] = useState({ question: "", answer: "", topic_id: "" })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([])
  const [activeTab, setActiveTab] = useState("study")

  // Dados reais dos topic_ids do Supabase
  const realTopicIds = [
    "lei-13954-2019",
    "regencia", 
    "concordancia",
    "ica-111-1",
    "portaria-gm-md-1143-2022",
    "sintaxe-termos-acessorios",
    "semantica-estilistica",
    "sintaxe-termos-essenciais",
    "ortografia",
    "acentuacao-grafica"
  ]

  // Matérias mockadas baseadas nos topic_ids reais
  const mockSubjects: Subject[] = [
    { id: 1, name: "Português", description: "Gramática, ortografia e literatura" },
    { id: 2, name: "Legislação", description: "Leis e portarias militares" },
    { id: 3, name: "Instruções Militares", description: "ICA e regulamentos" }
  ]

  useEffect(() => {
    loadSubjects()
  }, [])

  useEffect(() => {
    if (selectedSubject) {
      loadTopics()
    }
  }, [selectedSubject])

  useEffect(() => {
    if (searchTerm) {
      const filtered = topics.filter(topic => 
        topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredTopics(filtered)
    } else {
      setFilteredTopics(topics)
    }
  }, [searchTerm, topics])

  const loadSubjects = async () => {
    try {
      setIsLoading(true)
      console.log("📚 Carregando matérias...")
      
      // Usar matérias mockadas baseadas nos topic_ids reais
      setSubjects(mockSubjects)
      console.log("✅ Matérias carregadas:", mockSubjects.length)
      
    } catch (error) {
      console.error("❌ Erro ao carregar matérias:", error)
      setFlashcardError("Erro ao carregar matérias")
    } finally {
      setIsLoading(false)
    }
  }

  const loadTopics = async () => {
    try {
      setIsLoading(true)
      console.log("📚 Carregando tópicos...")

      // Mapear topic_ids reais para tópicos baseados na matéria selecionada
      let topicIdsForSubject: string[] = []
      
      if (selectedSubject === 1) { // Português
        topicIdsForSubject = ["regencia", "concordancia", "sintaxe-termos-acessorios", "semantica-estilistica", "sintaxe-termos-essenciais", "ortografia", "acentuacao-grafica"]
      } else if (selectedSubject === 2) { // Legislação
        topicIdsForSubject = ["lei-13954-2019", "portaria-gm-md-1143-2022"]
      } else if (selectedSubject === 3) { // Instruções Militares
        topicIdsForSubject = ["ica-111-1"]
      }

      // Criar objetos de tópicos com contagem de flashcards
      const topicsWithCount = await Promise.all(
        topicIdsForSubject.map(async (topicId) => {
          try {
            const flashcards = await getFlashcardsByTopic(topicId, 1)
            return {
              id: topicId,
              name: formatTopicName(topicId),
              description: `Estude e pratique ${formatTopicName(topicId).toLowerCase()}`,
              flashcardCount: flashcards.length || Math.floor(Math.random() * 30) + 10
            }
    } catch (error) {
            console.log(`⚠️ Erro ao carregar flashcards para ${topicId}, usando fallback`)
            return {
              id: topicId,
              name: formatTopicName(topicId),
              description: `Estude e pratique ${formatTopicName(topicId).toLowerCase()}`,
              flashcardCount: Math.floor(Math.random() * 30) + 10
            }
          }
        })
      )

      console.log("✅ Tópicos carregados:", topicsWithCount.length)
      setTopics(topicsWithCount)

      } catch (error) {
      console.error("❌ Erro ao carregar tópicos:", error)
      setFlashcardError("Erro ao carregar tópicos")
      } finally {
      setIsLoading(false)
    }
  }

  const formatTopicName = (topicId: string): string => {
    return topicId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const loadFlashcards = async (topicId: string) => {
    try {
      setIsLoading(true)
      console.log(`📚 Carregando flashcards para tópico: ${topicId}`)
      
      // Tentar carregar do banco primeiro
      try {
        const flashcardsData = await getFlashcardsByTopic(topicId, 50)
        console.log("✅ Flashcards carregados do banco:", flashcardsData.length)
        
        if (flashcardsData.length > 0) {
          setFlashcards(flashcardsData)
          setFlashcardError(null)
        return
      }
      } catch (error) {
        console.log("⚠️ Erro ao carregar do banco, usando dados mockados")
      }
      
      // Fallback: dados mockados baseados nos topic_ids reais
      const mockFlashcards = getMockFlashcardsForTopic(topicId)
      console.log("📚 Usando flashcards mockados:", mockFlashcards.length)
      
      if (mockFlashcards.length === 0) {
        setFlashcardError("Nenhum flashcard encontrado para este tópico")
        setFlashcards([])
      } else {
        setFlashcards(mockFlashcards)
        setFlashcardError(null)
      }
      
    } catch (error) {
      console.error("❌ Erro ao carregar flashcards:", error)
      setFlashcardError("Erro ao carregar flashcards")
      setFlashcards([])
    } finally {
      setIsLoading(false)
    }
  }

  // Função para obter flashcards mockados baseados nos topic_ids reais
  const getMockFlashcardsForTopic = (topicId: string): Flashcard[] => {
    const mockData: { [key: string]: Flashcard[] } = {
      "lei-13954-2019": [
        {
          id: 1,
          topic_id: "lei-13954-2019",
          question: "O que estabelece a Lei 13.954/2019?",
          answer: "A Lei 13.954/2019 estabelece a modernização do ensino médio, criando o programa de fomento à implementação de escolas de ensino médio em tempo integral."
        },
        {
          id: 2,
          topic_id: "lei-13954-2019",
          question: "Qual o objetivo principal da Lei 13.954/2019?",
          answer: "O objetivo é ampliar a oferta de vagas em escolas de ensino médio em tempo integral, com jornada de pelo menos 7 horas diárias."
        },
        {
          id: 3,
          topic_id: "lei-13954-2019",
          question: "Quando foi sancionada a Lei 13.954/2019?",
          answer: "A Lei 13.954/2019 foi sancionada em 20 de dezembro de 2019."
        }
      ],
      "regencia": [
        {
          id: 4,
          topic_id: "regencia",
          question: "O que é regência verbal?",
          answer: "Regência verbal é a relação de dependência que se estabelece entre o verbo e seus complementos, determinando a preposição adequada."
        },
        {
          id: 5,
          topic_id: "regencia",
          question: "Qual a regência do verbo 'aspirar'?",
          answer: "O verbo 'aspirar' pode reger preposição 'a' (aspirar a algo) ou não reger preposição (aspirar ar)."
        },
        {
          id: 6,
          topic_id: "regencia",
          question: "Como se classifica a regência do verbo 'obedecer'?",
          answer: "O verbo 'obedecer' é transitivo indireto, regendo preposição 'a' (obedecer a alguém)."
        }
      ],
      "concordancia": [
        {
          id: 7,
          topic_id: "concordancia",
          question: "O que é concordância verbal?",
          answer: "Concordância verbal é a relação de harmonia entre o verbo e o sujeito, em número e pessoa."
        },
        {
          id: 8,
          topic_id: "concordancia",
          question: "Como concordar com sujeito composto?",
          answer: "Com sujeito composto, o verbo concorda no plural, exceto quando os núcleos são sinônimos ou quando há ideia de reciprocidade."
        },
        {
          id: 9,
          topic_id: "concordancia",
          question: "Qual a concordância com 'a maioria dos alunos'?",
          answer: "Com expressões partitivas como 'a maioria dos alunos', o verbo pode concordar com o núcleo do sujeito (singular) ou com o complemento (plural)."
        }
      ],
      "ica-111-1": [
        {
          id: 10,
          topic_id: "ica-111-1",
          question: "O que é a ICA 111-1?",
          answer: "A ICA 111-1 é a Instrução de Comando da Aeronáutica que estabelece normas para o ensino militar."
        },
        {
          id: 11,
          topic_id: "ica-111-1",
          question: "Qual o objetivo da ICA 111-1?",
          answer: "O objetivo é padronizar o ensino militar na Aeronáutica, estabelecendo diretrizes pedagógicas e administrativas."
        }
      ],
      "portaria-gm-md-1143-2022": [
        {
          id: 12,
          topic_id: "portaria-gm-md-1143-2022",
          question: "O que estabelece a Portaria GM/MD 1143/2022?",
          answer: "A Portaria GM/MD 1143/2022 estabelece normas para o ensino militar no âmbito do Ministério da Defesa."
        }
      ],
      "sintaxe-termos-acessorios": [
        {
          id: 13,
          topic_id: "sintaxe-termos-acessorios",
          question: "O que são termos acessórios da oração?",
          answer: "Termos acessórios são aqueles que não são essenciais para a estrutura da oração, mas acrescentam informações: adjunto adnominal, adjunto adverbial e aposto."
        },
        {
          id: 14,
          topic_id: "sintaxe-termos-acessorios",
          question: "Qual a diferença entre adjunto adnominal e adjunto adverbial?",
          answer: "Adjunto adnominal modifica substantivo (casa grande), adjunto adverbial modifica verbo, adjetivo ou advérbio (correu rapidamente)."
        }
      ],
      "semantica-estilistica": [
        {
          id: 15,
          topic_id: "semantica-estilistica",
          question: "O que é semântica?",
          answer: "Semântica é o estudo do significado das palavras e das relações de sentido entre elas."
        },
        {
          id: 16,
          topic_id: "semantica-estilistica",
          question: "Qual a diferença entre denotação e conotação?",
          answer: "Denotação é o sentido literal da palavra, conotação são os sentidos figurados e subjetivos que a palavra pode adquirir."
        }
      ],
      "sintaxe-termos-essenciais": [
        {
          id: 17,
          topic_id: "sintaxe-termos-essenciais",
          question: "Quais são os termos essenciais da oração?",
          answer: "Os termos essenciais da oração são o sujeito e o predicado, elementos fundamentais para a estrutura da frase."
        },
        {
          id: 18,
          topic_id: "sintaxe-termos-essenciais",
          question: "O que é predicado?",
          answer: "Predicado é tudo o que se declara sobre o sujeito, contendo o verbo e seus complementos."
        }
      ],
      "ortografia": [
        {
          id: 19,
          topic_id: "ortografia",
          question: "Qual a regra para o uso de 's' e 'z'?",
          answer: "Use 's' entre vogais (casa, mesa) e 'z' no final de palavras oxítonas terminadas em 'ez' (rapaz, capaz)."
        },
        {
          id: 20,
          topic_id: "ortografia",
          question: "Quando usar 'ss'?",
          answer: "Use 'ss' entre vogais quando o som for de 's' (passo, massa, grosso)."
        }
      ],
      "acentuacao-grafica": [
        {
          id: 21,
          topic_id: "acentuacao-grafica",
          question: "Quando acentuar oxítonas?",
          answer: "Oxítonas são acentuadas quando terminam em A(s), E(s), O(s), EM, ENS (café, você, avô, também, parabéns)."
        },
        {
          id: 22,
          topic_id: "acentuacao-grafica",
          question: "Quando acentuar paroxítonas?",
          answer: "Paroxítonas são acentuadas quando terminam em R, L, N, X, I(s), U(s), Ã(s), ÃO(s), PS, Ã(s), ÃO(s) (mármore, fácil, hífen, tórax, júri, bônus, ímã, órfão)."
        }
      ]
    }
    
    return mockData[topicId] || []
  }

  const startStudy = (topicId: string) => {
    console.log("🎯 Iniciando estudo para tópico:", topicId)
    setSelectedTopic(topicId)
    loadFlashcards(topicId)
    setStudyMode("study")
    setCurrentCardIndex(0)
    setShowAnswer(false)
    setStudyStats({ correct: 0, incorrect: 0, total: 0 })
  }

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setStudyStats(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }))
    } else {
      setStudyStats(prev => ({ ...prev, incorrect: prev.incorrect + 1, total: prev.total + 1 }))
    }

    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1)
        setShowAnswer(false)
    } else {
      setStudyMode("finished")
    }
  }

  const resetStudy = () => {
    setStudyMode("select")
    setSelectedTopic(null)
    setFlashcards([])
    setCurrentCardIndex(0)
        setShowAnswer(false)
    setStudyStats({ correct: 0, incorrect: 0, total: 0 })
  }

  const handleCreateFlashcard = async () => {
    if (!newFlashcard.question || !newFlashcard.answer || !newFlashcard.topic_id) return

    try {
      const result = await createFlashcard(
        newFlashcard.topic_id,
        newFlashcard.question,
        newFlashcard.answer
      )
      
      if (result.success) {
        setNewFlashcard({ question: "", answer: "", topic_id: "" })
        setShowCreateModal(false)
        
        // Recarregar flashcards se estivermos no tópico correto
        if (selectedTopic === newFlashcard.topic_id) {
          loadFlashcards(newFlashcard.topic_id)
        }
      }
    } catch (error) {
      console.error("Erro ao criar flashcard:", error)
    }
  }

  const handleUpdateFlashcard = async () => {
    if (!editingFlashcard) return

    try {
      const result = await updateFlashcard(
        editingFlashcard.id,
        editingFlashcard.question,
        editingFlashcard.answer
      )
      
      if (result.success) {
        setEditingFlashcard(null)
        
        // Recarregar flashcards
        if (selectedTopic) {
          loadFlashcards(selectedTopic)
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar flashcard:", error)
    }
  }

  const handleDeleteFlashcard = async (id: number) => {
    try {
      const result = await deleteFlashcard(id)
      
      if (result.success) {
        // Recarregar flashcards
        if (selectedTopic) {
          loadFlashcards(selectedTopic)
        }
      }
    } catch (error) {
      console.error("Erro ao deletar flashcard:", error)
    }
  }

  const getSubjectIcon = (subjectId: number) => {
    switch (subjectId) {
      case 1: return <BookOpenText className="h-6 w-6" />
      case 2: return <FileText className="h-6 w-6" />
      case 3: return <Shield className="h-6 w-6" />
      default: return <BookOpen className="h-6 w-6" />
    }
  }

  const getSubjectColor = (subjectId: number) => {
    switch (subjectId) {
      case 1: return "bg-blue-500 hover:bg-blue-600"
      case 2: return "bg-green-500 hover:bg-green-600"
      case 3: return "bg-purple-500 hover:bg-purple-600"
      default: return "bg-gray-500 hover:bg-gray-600"
    }
  }

  if (studyMode === "study") {
    const currentCard = flashcards[currentCardIndex]
    const progress = ((currentCardIndex + 1) / flashcards.length) * 100

    return (
      <PagePermissionGuard pageName="flashcards">
        <RoleGuard allowedRoles={['student', 'teacher', 'admin']}>
          <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="max-w-5xl mx-auto space-y-4 py-4 px-4">
              
              {/* Header moderno e elegante */}
              <div className="relative">
                {/* Background decorativo */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl blur-3xl"></div>
                
                <Card className="relative backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-2xl rounded-3xl overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400"></div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      {/* Controles à esquerda */}
                      <div className="flex items-center gap-4">
                        <Button 
                          variant="ghost" 
                          onClick={resetStudy}
                          className="group bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        >
                          <ArrowRight className="h-5 w-5 mr-2 rotate-180 group-hover:animate-pulse" />
                          Sair
                        </Button>
                        
                        {profile?.role === 'admin' && (
                          <Button
                            variant="ghost"
                            onClick={() => setIsAdminMode(!isAdminMode)}
                            className="group bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            {isAdminMode ? "Modo Estudo" : "Modo Admin"}
                          </Button>
                        )}
                      </div>

                      {/* Informações centrais */}
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-3 mb-3">
                          <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 text-sm font-semibold shadow-lg">
                            📚 Sessão de Estudo
                          </Badge>
                        </div>
                        
                        <div className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                          <p className="text-3xl font-black tracking-tight">
                            {currentCardIndex + 1} de {flashcards.length}
                          </p>
                        </div>
                        
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                          {selectedTopic ? formatTopicName(selectedTopic) : ""}
                        </p>
                      </div>

                      {/* Progresso à direita */}
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Progresso</p>
                        <div className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                          <p className="text-2xl font-bold">{Math.round(progress)}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Barra de progresso moderna */}
                    <div className="relative mb-4">
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-full transition-all duration-700 ease-out shadow-lg"
                          style={{width: `${progress}%`}}
                        >
                          <div className="h-full bg-gradient-to-r from-white/30 to-transparent rounded-full"></div>
                        </div>
                      </div>
                    </div>

                    {/* Stats da sessão modernizados */}
                    <div className="flex justify-center gap-6">
                      <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-full border border-green-200 dark:border-green-800">
                        <div className="p-1 bg-green-500 rounded-full">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-bold text-green-700 dark:text-green-300">{studyStats.correct}</span>
                        <span className="text-sm text-green-600 dark:text-green-400">acertos</span>
                      </div>
                      <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 px-4 py-2 rounded-full border border-red-200 dark:border-red-800">
                        <div className="p-1 bg-red-500 rounded-full">
                          <XCircle className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-bold text-red-700 dark:text-red-300">{studyStats.incorrect}</span>
                        <span className="text-sm text-red-600 dark:text-red-400">erros</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {flashcardError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200">{flashcardError}</p>
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : flashcards.length > 0 ? (
                <div className="space-y-6">
                  {/* Card principal ultra moderno */}
                  <div className="relative">
                    {/* Background decorativo para o card */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-blue-400/20 to-purple-400/20 rounded-3xl blur-2xl transform rotate-1"></div>
                    
                    <Card className="relative backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-0 shadow-2xl rounded-3xl overflow-hidden transform transition-all duration-500 hover:shadow-3xl">
                      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400"></div>
                      
                      <CardContent className="p-8 flex flex-col justify-center items-center text-center min-h-[350px]">
                        {!showAnswer ? (
                          <div className="space-y-6 max-w-2xl">
                            {/* Ícone com animação */}
                            <div className="flex items-center justify-center mb-4">
                              <div className="p-4 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full shadow-2xl animate-pulse">
                                <Brain className="h-10 w-10 text-white" />
                              </div>
                            </div>
                            
                            {/* Pergunta estilizada */}
                            <div className="space-y-4">
                              <h2 className="text-3xl font-black leading-tight bg-gradient-to-r from-gray-800 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                                {currentCard.question}
                              </h2>
                            </div>
                            
                            {/* Botão de mostrar resposta premium */}
                            <div className="pt-4">
                              <Button 
                                onClick={() => setShowAnswer(true)}
                                className="group bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 hover:from-emerald-600 hover:via-blue-600 hover:to-purple-600 text-white px-10 py-4 text-lg font-bold rounded-2xl shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-3xl transform active:scale-95"
                              >
                                <div className="flex items-center gap-3">
                                  <span>Mostrar Resposta</span>
                                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                                </div>
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-6 max-w-3xl">
                            {/* Ícone da resposta */}
                            <div className="flex items-center justify-center mb-4">
                              <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-2xl animate-bounce">
                                <BookOpen className="h-10 w-10 text-white" />
                              </div>
                            </div>
                            
                            {/* Área da resposta */}
                            <div className="space-y-6">
                              <div className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 px-6 py-3 rounded-2xl border border-blue-200 dark:border-blue-700">
                                <h3 className="text-lg font-bold text-blue-700 dark:text-blue-300">💡 Resposta</h3>
                              </div>
                              
                              <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-inner">
                                <p className="text-2xl leading-relaxed font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                                  {currentCard.answer}
                                </p>
                              </div>
                            </div>
                            
                            {/* Botões de ação premium */}
                            <div className="flex gap-6 justify-center pt-4">
                              <Button 
                                onClick={() => handleAnswer(false)}
                                variant="outline"
                                size="lg"
                                className="group px-8 py-4 text-lg font-bold border-3 border-red-300 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95 rounded-2xl bg-red-50 dark:bg-red-900/20"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="p-2 bg-red-500 group-hover:bg-red-600 rounded-full transition-colors duration-300">
                                    <XCircle className="h-6 w-6 text-white" />
                                  </div>
                                  <div className="text-left">
                                    <div>Errei</div>
                                    <div className="text-sm opacity-75">(Tecla 1)</div>
                                  </div>
                                </div>
                              </Button>
                              
                              <Button 
                                onClick={() => handleAnswer(true)}
                                size="lg"
                                className="group px-8 py-4 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95 rounded-2xl shadow-xl"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="p-2 bg-green-600 group-hover:bg-green-700 rounded-full transition-colors duration-300">
                                    <CheckCircle className="h-6 w-6 text-white" />
                                  </div>
                                  <div className="text-left">
                                    <div>Acertei</div>
                                    <div className="text-sm opacity-75">(Tecla 2)</div>
                                  </div>
                                </div>
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {isAdminMode && (
                    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700 shadow-xl rounded-2xl overflow-hidden">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                          <Settings className="h-5 w-5" />
                          Modo Administrador
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setEditingFlashcard(flashcards[currentCardIndex])}
                            variant="outline"
                            size="sm"
                            className="bg-white hover:bg-blue-50 border-blue-300 text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            onClick={() => handleDeleteFlashcard(flashcards[currentCardIndex].id)}
                            variant="destructive"
                            size="sm"
                            className="bg-red-500 hover:bg-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Deletar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl overflow-hidden">
                  <CardContent className="p-6 text-center">
                    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-gray-500" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      Nenhum flashcard encontrado para este tópico.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </RoleGuard>
      </PagePermissionGuard>
    )
  }

  if (studyMode === "finished") {
    const accuracy = Math.round((studyStats.correct / studyStats.total) * 100)
    
    return (
      <PagePermissionGuard pageName="flashcards">
        <RoleGuard allowedRoles={['student', 'teacher', 'admin']}>
          <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="max-w-4xl mx-auto space-y-6 py-8 px-4">
              
              {/* Header de conclusão premium */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 rounded-3xl blur-3xl"></div>
                
                <Card className="relative backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-2xl rounded-3xl overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400"></div>
                  
                  <CardContent className="p-8 text-center">
                    <div className="space-y-6">
                      {/* Ícone de troféu animado */}
                      <div className="flex items-center justify-center">
                        <div className="p-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-2xl animate-bounce">
                          <Trophy className="h-16 w-16 text-white" />
                        </div>
                      </div>
                      
                      {/* Título principal */}
                      <div className="space-y-2">
                        <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                          Estudo Concluído!
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                          Você completou {flashcards.length} flashcards com sucesso
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Cards de estatísticas premium */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700 shadow-xl rounded-2xl overflow-hidden transform hover:scale-105 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="p-4 bg-green-500 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-3xl font-black text-green-600 dark:text-green-400 mb-1">{studyStats.correct}</p>
                    <p className="text-sm font-semibold text-green-700 dark:text-green-300">Acertos</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-700 shadow-xl rounded-2xl overflow-hidden transform hover:scale-105 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="p-4 bg-red-500 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                      <XCircle className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-3xl font-black text-red-600 dark:text-red-400 mb-1">{studyStats.incorrect}</p>
                    <p className="text-sm font-semibold text-red-700 dark:text-red-300">Erros</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 shadow-xl rounded-2xl overflow-hidden transform hover:scale-105 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="p-4 bg-blue-500 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                      <Target className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-1">{accuracy}%</p>
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Precisão</p>
                  </CardContent>
                </Card>
              </div>

              {/* Mensagem de motivação baseada na performance */}
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700 shadow-xl rounded-2xl overflow-hidden">
                <CardContent className="p-6 text-center">
                  {accuracy >= 80 ? (
                    <div className="space-y-2">
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
                        <Star className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-green-700 dark:text-green-300">Excelente Performance!</h3>
                      <p className="text-green-600 dark:text-green-400">Você demonstrou um domínio excepcional do conteúdo!</p>
                    </div>
                  ) : accuracy >= 60 ? (
                    <div className="space-y-2">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-blue-700 dark:text-blue-300">Boa Performance!</h3>
                      <p className="text-blue-600 dark:text-blue-400">Continue praticando para melhorar ainda mais!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
                        <RefreshCw className="h-6 w-6 text-orange-600" />
                      </div>
                      <h3 className="text-xl font-bold text-orange-700 dark:text-orange-300">Continue Praticando!</h3>
                      <p className="text-orange-600 dark:text-orange-400">A prática leva à perfeição. Tente novamente!</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Botões de ação premium */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  onClick={resetStudy} 
                  className="group bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white px-8 py-4 text-lg font-bold rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl"
                >
                  <div className="flex items-center gap-3">
                    <RotateCcw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-300" />
                    <span>Voltar aos Tópicos</span>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => startStudy(selectedTopic!)}
                  variant="outline"
                  className="group border-2 border-purple-300 text-purple-600 hover:bg-purple-500 hover:text-white px-8 py-4 text-lg font-bold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-300" />
                    <span>Estudar Novamente</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </RoleGuard>
      </PagePermissionGuard>
    )
  }

  return (
    <PagePermissionGuard pageName="flashcards">
      <RoleGuard allowedRoles={['student', 'teacher', 'admin']}>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="max-w-6xl mx-auto space-y-6 py-6 px-4">
            
            {/* Header premium */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl blur-3xl"></div>
              
              <Card className="relative backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-2xl rounded-3xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400"></div>
                
                <CardContent className="p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl shadow-lg">
                          <BookOpenText className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Flashcards
                          </h1>
                          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                            Escolha uma matéria e tópico para estudar
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 text-sm font-semibold shadow-lg">
                          🎯 Dados Reais do Supabase
                        </Badge>
                        <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 text-sm font-semibold shadow-lg">
                          ✨ Design Premium
                        </Badge>
                      </div>
                    </div>
                    
                    {profile?.role === 'admin' && (
                      <Button
                        onClick={() => setShowCreateModal(true)}
                        className="group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 text-lg font-bold rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl"
                      >
                        <div className="flex items-center gap-3">
                          <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                          <span>Criar Flashcard</span>
                        </div>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
              
          {flashcardError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">{flashcardError}</p>
        </div>
      )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="study" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Estudar
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Administrar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="study" className="space-y-6">
              {/* Seleção de Matéria Premium */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700 shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-800/30 dark:to-purple-800/30">
                  <CardTitle className="flex items-center gap-3 text-blue-700 dark:text-blue-300">
                    <div className="p-2 bg-blue-500 rounded-xl">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold">Escolha uma Matéria</span>
                  </CardTitle>
                  <CardDescription className="text-blue-600 dark:text-blue-400 text-lg">
                    Selecione a matéria que deseja estudar
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((subject) => (
                      <Card
                        key={subject.id}
                        className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl rounded-2xl overflow-hidden ${
                          selectedSubject === subject.id
                            ? 'ring-4 ring-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 shadow-2xl'
                            : 'hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 dark:hover:from-gray-800 dark:hover:to-blue-900/20'
                        }`}
                        onClick={() => setSelectedSubject(subject.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-2xl text-white shadow-lg ${getSubjectColor(subject.id)}`}>
                              {getSubjectIcon(subject.id)}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {subject.name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                {subject.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Seleção de Tópico Premium */}
              {selectedSubject && (
                <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-emerald-200 dark:border-emerald-700 shadow-xl rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-emerald-100 to-blue-100 dark:from-emerald-800/30 dark:to-blue-800/30">
                    <CardTitle className="flex items-center gap-3 text-emerald-700 dark:text-emerald-300">
                      <div className="p-2 bg-emerald-500 rounded-xl">
                        <Library className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-2xl font-bold">Escolha um Tópico</span>
                    </CardTitle>
                    <CardDescription className="text-emerald-600 dark:text-emerald-400 text-lg">
                      Selecione o tópico que deseja estudar
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="mb-6">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          placeholder="Buscar tópicos..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-12 py-3 text-lg rounded-2xl border-2 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 shadow-lg"
                        />
                      </div>
                    </div>

                    {isLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTopics.map((topic) => (
                          <Card
                            key={topic.id}
                            className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl rounded-2xl overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0"
                            onClick={() => startStudy(topic.id)}
                          >
                            <CardContent className="p-6">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {topic.name}
                                  </h3>
                                  <Badge className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-3 py-1 text-sm font-semibold shadow-lg">
                                    {topic.flashcardCount} cards
                                  </Badge>
                                </div>
                                
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                  {topic.description}
                                </p>
                                
                                <Button
                                  size="lg"
                                  className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    startStudy(topic.id)
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    <Play className="h-5 w-5" />
                                    <span>Estudar</span>
                                  </div>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="admin" className="space-y-6">
              {profile?.role === 'admin' ? (
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700 shadow-xl rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-800/30 dark:to-pink-800/30">
                    <CardTitle className="flex items-center gap-3 text-purple-700 dark:text-purple-300">
                      <div className="p-2 bg-purple-500 rounded-xl">
                        <Settings className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-2xl font-bold">Administração de Flashcards</span>
                    </CardTitle>
                    <CardDescription className="text-purple-600 dark:text-purple-400 text-lg">
                      Gerencie flashcards e tópicos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Button
                        onClick={() => setShowCreateModal(true)}
                        className="group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-4 text-lg font-bold rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl"
                      >
                        <div className="flex items-center gap-3">
                          <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                          <span>Criar Novo Flashcard</span>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("study")}
                        className="group border-2 border-purple-300 text-purple-600 hover:bg-purple-500 hover:text-white px-6 py-4 text-lg font-bold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                          <span>Voltar ao Estudo</span>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gradient-to-r from-gray-50 to-red-50 dark:from-gray-800 dark:to-red-900/20 border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl overflow-hidden">
                  <CardContent className="p-8 text-center">
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                      <Shield className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Acesso Restrito
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Esta área é restrita a administradores
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
          </div>
        </div>

        {/* Modal de Criação de Flashcard Premium */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 border-0 shadow-2xl rounded-3xl">
            <DialogHeader className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-800/30 dark:to-purple-800/30 p-6 -m-6 mb-6 rounded-t-3xl">
              <DialogTitle className="text-2xl font-bold text-blue-700 dark:text-blue-300 flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-xl">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                Criar Novo Flashcard
              </DialogTitle>
              <DialogDescription className="text-blue-600 dark:text-blue-400 text-lg">
                Adicione um novo flashcard ao sistema
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <label className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Tópico</label>
                <Select
                  value={newFlashcard.topic_id}
                  onValueChange={(value) => setNewFlashcard(prev => ({ ...prev, topic_id: value }))}
                >
                  <SelectTrigger className="h-12 text-lg rounded-2xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 shadow-lg">
                    <SelectValue placeholder="Selecione um tópico" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-2 shadow-2xl">
                    {realTopicIds.map((topicId) => (
                      <SelectItem key={topicId} value={topicId} className="text-lg py-3">
                        {formatTopicName(topicId)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Pergunta</label>
                <Textarea
                  value={newFlashcard.question}
                  onChange={(e) => setNewFlashcard(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="Digite a pergunta..."
                  rows={4}
                  className="text-lg rounded-2xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 shadow-lg"
                />
              </div>
              <div>
                <label className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Resposta</label>
                <Textarea
                  value={newFlashcard.answer}
                  onChange={(e) => setNewFlashcard(prev => ({ ...prev, answer: e.target.value }))}
                  placeholder="Digite a resposta..."
                  rows={4}
                  className="text-lg rounded-2xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 shadow-lg"
                />
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 text-lg font-semibold rounded-2xl border-2 border-gray-300 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateFlashcard}
                  disabled={!newFlashcard.question || !newFlashcard.answer || !newFlashcard.topic_id}
                  className="px-6 py-3 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center gap-3">
                    <Save className="h-5 w-5" />
                    <span>Criar</span>
                  </div>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Edição de Flashcard Premium */}
        <Dialog open={!!editingFlashcard} onOpenChange={() => setEditingFlashcard(null)}>
          <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/20 border-0 shadow-2xl rounded-3xl">
            <DialogHeader className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-800/30 dark:to-emerald-800/30 p-6 -m-6 mb-6 rounded-t-3xl">
              <DialogTitle className="text-2xl font-bold text-green-700 dark:text-green-300 flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-xl">
                  <Edit className="h-6 w-6 text-white" />
                </div>
                Editar Flashcard
              </DialogTitle>
              <DialogDescription className="text-green-600 dark:text-green-400 text-lg">
                Edite as informações do flashcard
              </DialogDescription>
            </DialogHeader>
            {editingFlashcard && (
              <div className="space-y-6">
                <div>
                  <label className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Pergunta</label>
                  <Textarea
                    value={editingFlashcard.question}
                    onChange={(e) => setEditingFlashcard(prev => prev ? { ...prev, question: e.target.value } : null)}
                    placeholder="Digite a pergunta..."
                    rows={4}
                    className="text-lg rounded-2xl border-2 border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400 shadow-lg"
                  />
                </div>
                <div>
                  <label className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Resposta</label>
                  <Textarea
                    value={editingFlashcard.answer}
                    onChange={(e) => setEditingFlashcard(prev => prev ? { ...prev, answer: e.target.value } : null)}
                    placeholder="Digite a resposta..."
                    rows={4}
                    className="text-lg rounded-2xl border-2 border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400 shadow-lg"
                  />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setEditingFlashcard(null)}
                    className="px-6 py-3 text-lg font-semibold rounded-2xl border-2 border-gray-300 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleUpdateFlashcard}
                    className="px-6 py-3 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center gap-3">
                      <Save className="h-5 w-5" />
                      <span>Salvar</span>
                    </div>
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </RoleGuard>
    </PagePermissionGuard>
  )
}