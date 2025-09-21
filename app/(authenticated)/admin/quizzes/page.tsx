"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Brain, 
  Eye,
  Save,
  X,
  CheckCircle,
  Circle
} from "lucide-react"
import { useAuth } from "@/context/auth-context-custom"
import { RoleGuard } from "@/components/role-guard"

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: string
  explanation: string
  difficulty: string
  topic_id: string
}

interface Topic {
  id: string
  name: string
  description: string
  subject_id: string
}

export default function AdminQuizzesPage() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null)
  const [formData, setFormData] = useState({
    question: "",
    options: ["", "", "", ""],
    correct_answer: "",
    explanation: "",
    difficulty: "medium",
    topic_id: ""
  })

  useEffect(() => {
    loadTopics()
  }, [])

  useEffect(() => {
    if (selectedTopic) {
      loadQuestions(selectedTopic)
    }
  }, [selectedTopic])

  const loadTopics = async () => {
    try {
      setIsLoading(true)
      // Aqui você carregaria os tópicos disponíveis
      // Por enquanto, vamos usar dados mockados
      setTopics([
        { id: "1", name: "Gramática", description: "Regras gramaticais", subject_id: "1" },
        { id: "2", name: "Interpretação", description: "Interpretação de textos", subject_id: "1" },
        { id: "3", name: "Redação", description: "Técnicas de redação", subject_id: "1" }
      ])
    } catch (error) {
      console.error("Erro ao carregar tópicos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadQuestions = async (topicId: string) => {
    try {
      // Aqui você carregaria as questões do tópico
      // Por enquanto, vamos usar dados mockados
      setQuestions([
        {
          id: "1",
          question: "Qual é a função do substantivo na frase?",
          options: ["Sujeito", "Predicado", "Complemento", "Adjunto"],
          correct_answer: "Sujeito",
          explanation: "O substantivo pode exercer várias funções sintáticas, incluindo sujeito.",
          difficulty: "medium",
          topic_id: topicId
        }
      ])
    } catch (error) {
      console.error("Erro ao carregar questões:", error)
    }
  }

  const handleCreateQuestion = async () => {
    if (!formData.question || !formData.topic_id || !formData.correct_answer) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    try {
      // Aqui você criaria a questão no banco de dados
      console.log("Criando questão:", formData)
      
      setFormData({
        question: "",
        options: ["", "", "", ""],
        correct_answer: "",
        explanation: "",
        difficulty: "medium",
        topic_id: ""
      })
      setIsCreating(false)
      
      if (selectedTopic) {
        loadQuestions(selectedTopic)
      }
      alert("Questão criada com sucesso!")
    } catch (error) {
      console.error("Erro ao criar questão:", error)
      alert("Erro ao criar questão")
    }
  }

  const handleUpdateQuestion = async () => {
    if (!editingQuestion || !formData.question || !formData.correct_answer) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    try {
      // Aqui você atualizaria a questão no banco de dados
      console.log("Atualizando questão:", formData)
      
      setEditingQuestion(null)
      setFormData({
        question: "",
        options: ["", "", "", ""],
        correct_answer: "",
        explanation: "",
        difficulty: "medium",
        topic_id: ""
      })
      
      if (selectedTopic) {
        loadQuestions(selectedTopic)
      }
      alert("Questão atualizada com sucesso!")
    } catch (error) {
      console.error("Erro ao atualizar questão:", error)
      alert("Erro ao atualizar questão")
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta questão?")) {
      return
    }

    try {
      // Aqui você excluiria a questão do banco de dados
      console.log("Excluindo questão:", questionId)
      
      if (selectedTopic) {
        loadQuestions(selectedTopic)
      }
      alert("Questão excluída com sucesso!")
    } catch (error) {
      console.error("Erro ao excluir questão:", error)
      alert("Erro ao excluir questão")
    }
  }

  const startEditing = (question: QuizQuestion) => {
    setEditingQuestion(question)
    setFormData({
      question: question.question,
      options: question.options,
      correct_answer: question.correct_answer,
      explanation: question.explanation,
      difficulty: question.difficulty,
      topic_id: question.topic_id
    })
  }

  const cancelEditing = () => {
    setEditingQuestion(null)
    setFormData({
      question: "",
      options: ["", "", "", ""],
      correct_answer: "",
      explanation: "",
      difficulty: "medium",
      topic_id: ""
    })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "hard": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const filteredQuestions = questions.filter(question =>
    question.question.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <RoleGuard allowedRoles={["teacher", "administrator"]}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Administração de Quizzes
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie questões de quiz por tópico
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="topic">Tópico</Label>
            <select
              id="topic"
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value)
                setQuestions([])
              }}
              className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Selecione um tópico</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="search">Buscar</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Buscar questões..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {filteredQuestions.length} questões
            </Badge>
            {selectedTopic && (
              <Button
                onClick={() => {
                  setIsCreating(true)
                  setFormData({ ...formData, topic_id: selectedTopic })
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nova Questão
              </Button>
            )}
          </div>
        </div>

        {/* Formulário de Criação/Edição */}
        {(isCreating || editingQuestion) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {editingQuestion ? "Editar Questão" : "Nova Questão"}
                <Button variant="ghost" size="sm" onClick={cancelEditing}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="question">Pergunta *</Label>
                <Textarea
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Digite a pergunta..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label>Alternativas *</Label>
                <div className="grid gap-2 mt-1">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Alternativa ${index + 1}`}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData({ ...formData, correct_answer: option })}
                        className={formData.correct_answer === option ? "bg-green-100 text-green-800" : ""}
                      >
                        {formData.correct_answer === option ? <CheckCircle className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="explanation">Explicação</Label>
                <Textarea
                  id="explanation"
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Explicação da resposta correta..."
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="difficulty">Dificuldade</Label>
                <select
                  id="difficulty"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="easy">Fácil</option>
                  <option value="medium">Médio</option>
                  <option value="hard">Difícil</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={editingQuestion ? handleUpdateQuestion : handleCreateQuestion}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {editingQuestion ? "Atualizar" : "Criar"}
                </Button>
                <Button variant="outline" onClick={cancelEditing}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Questões */}
        <div className="grid gap-4">
          {filteredQuestions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedTopic ? "Nenhuma questão encontrada" : "Selecione um tópico para ver as questões"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredQuestions.map((question) => (
              <Card key={question.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Pergunta:</Label>
                        <p className="text-gray-900 dark:text-white">{question.question}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Alternativas:</Label>
                        <div className="grid gap-1 mt-1">
                          {question.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">{String.fromCharCode(65 + index)}.</span>
                              <span className={`text-sm ${option === question.correct_answer ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                                {option}
                              </span>
                              {option === question.correct_answer && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      {question.explanation && (
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Explicação:</Label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditing(question)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </RoleGuard>
  )
}
