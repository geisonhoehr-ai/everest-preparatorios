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
  Filter, 
  BookOpen, 
  Eye,
  Save,
  X
} from "lucide-react"
import { useAuth } from "@/context/auth-context-custom"
import { RoleGuard } from "@/components/role-guard"
import { 
  getSubjectsWithStats, 
  getTopicsBySubject, 
  getFlashcardsByTopic,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard
} from "../../../server-actions"

interface Subject {
  id: string
  name: string
  totalCount: number
  overallProgress: number
}

interface Topic {
  id: string
  name: string
  description: string
  subject_id: string
  flashcardCount: number
}

interface Flashcard {
  id: string
  question: string
  answer: string
  topic_id: string
  created_at: string
}

export default function AdminFlashcardsPage() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [selectedTopic, setSelectedTopic] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null)
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    topic_id: ""
  })

  useEffect(() => {
    loadSubjects()
  }, [])

  useEffect(() => {
    if (selectedSubject) {
      loadTopics(selectedSubject)
    }
  }, [selectedSubject])

  useEffect(() => {
    if (selectedTopic) {
      loadFlashcards(selectedTopic)
    }
  }, [selectedTopic])

  const loadSubjects = async () => {
    try {
      setIsLoading(true)
      const result = await getSubjectsWithStats()
      if (result.success && result.subjects) {
        setSubjects(result.subjects)
      }
    } catch (error) {
      console.error("Erro ao carregar matérias:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTopics = async (subjectId: string) => {
    try {
      const result = await getTopicsBySubject(subjectId)
      if (result.success && result.topics) {
        setTopics(result.topics)
      }
    } catch (error) {
      console.error("Erro ao carregar tópicos:", error)
    }
  }

  const loadFlashcards = async (topicId: string) => {
    try {
      const result = await getFlashcardsByTopic(topicId)
      if (result.success && result.flashcards) {
        setFlashcards(result.flashcards)
      }
    } catch (error) {
      console.error("Erro ao carregar flashcards:", error)
    }
  }

  const handleCreateFlashcard = async () => {
    if (!formData.question || !formData.answer || !formData.topic_id) {
      alert("Por favor, preencha todos os campos")
      return
    }

    try {
      const result = await createFlashcard(user?.id || "", {
        topic_id: formData.topic_id,
        question: formData.question,
        answer: formData.answer
      })

      if (result.success) {
        setFormData({ question: "", answer: "", topic_id: "" })
        setIsCreating(false)
        if (selectedTopic) {
          loadFlashcards(selectedTopic)
        }
        alert("Flashcard criado com sucesso!")
      } else {
        alert("Erro ao criar flashcard: " + result.error)
      }
    } catch (error) {
      console.error("Erro ao criar flashcard:", error)
      alert("Erro ao criar flashcard")
    }
  }

  const handleUpdateFlashcard = async () => {
    if (!editingFlashcard || !formData.question || !formData.answer) {
      alert("Por favor, preencha todos os campos")
      return
    }

    try {
      const result = await updateFlashcard(
        user?.id || "",
        parseInt(editingFlashcard.id),
        formData.question,
        formData.answer
      )

      if (result.success) {
        setEditingFlashcard(null)
        setFormData({ question: "", answer: "", topic_id: "" })
        if (selectedTopic) {
          loadFlashcards(selectedTopic)
        }
        alert("Flashcard atualizado com sucesso!")
      } else {
        alert("Erro ao atualizar flashcard: " + result.error)
      }
    } catch (error) {
      console.error("Erro ao atualizar flashcard:", error)
      alert("Erro ao atualizar flashcard")
    }
  }

  const handleDeleteFlashcard = async (flashcardId: string) => {
    if (!confirm("Tem certeza que deseja excluir este flashcard?")) {
      return
    }

    try {
      const result = await deleteFlashcard(user?.id || "", parseInt(flashcardId))
      if (result.success) {
        if (selectedTopic) {
          loadFlashcards(selectedTopic)
        }
        alert("Flashcard excluído com sucesso!")
      } else {
        alert("Erro ao excluir flashcard: " + result.error)
      }
    } catch (error) {
      console.error("Erro ao excluir flashcard:", error)
      alert("Erro ao excluir flashcard")
    }
  }

  const startEditing = (flashcard: Flashcard) => {
    setEditingFlashcard(flashcard)
    setFormData({
      question: flashcard.question,
      answer: flashcard.answer,
      topic_id: flashcard.topic_id
    })
  }

  const cancelEditing = () => {
    setEditingFlashcard(null)
    setFormData({ question: "", answer: "", topic_id: "" })
  }

  const filteredFlashcards = flashcards.filter(flashcard =>
    flashcard.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flashcard.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <RoleGuard allowedRoles={["teacher", "administrator"]}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
            <BookOpen className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Administração de Flashcards
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie flashcards por matéria e tópico
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="subject">Matéria</Label>
            <select
              id="subject"
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value)
                setSelectedTopic("")
                setTopics([])
                setFlashcards([])
              }}
              className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Selecione uma matéria</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="topic">Tópico</Label>
            <select
              id="topic"
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value)
                setFlashcards([])
              }}
              className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              disabled={!selectedSubject}
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
                placeholder="Buscar flashcards..."
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
              {filteredFlashcards.length} flashcards
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
                Novo Flashcard
              </Button>
            )}
          </div>
        </div>

        {/* Formulário de Criação/Edição */}
        {(isCreating || editingFlashcard) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {editingFlashcard ? "Editar Flashcard" : "Novo Flashcard"}
                <Button variant="ghost" size="sm" onClick={cancelEditing}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="question">Pergunta</Label>
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
                <Label htmlFor="answer">Resposta</Label>
                <Textarea
                  id="answer"
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Digite a resposta..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={editingFlashcard ? handleUpdateFlashcard : handleCreateFlashcard}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {editingFlashcard ? "Atualizar" : "Criar"}
                </Button>
                <Button variant="outline" onClick={cancelEditing}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Flashcards */}
        <div className="grid gap-4">
          {filteredFlashcards.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedTopic ? "Nenhum flashcard encontrado" : "Selecione um tópico para ver os flashcards"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredFlashcards.map((flashcard) => (
              <Card key={flashcard.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Pergunta:</Label>
                        <p className="text-gray-900 dark:text-white">{flashcard.question}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Resposta:</Label>
                        <p className="text-gray-900 dark:text-white">{flashcard.answer}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditing(flashcard)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFlashcard(flashcard.id)}
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
