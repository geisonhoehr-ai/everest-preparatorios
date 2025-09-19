'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useToast } from './use-toast'
import { useAuth } from '@/context/auth-context'

export interface Flashcard {
  id: number
  question: string
  answer: string
  topic_id: string
  created_at?: string
  updated_at?: string
}

export interface Subject {
  id: string
  name: string
  description?: string
}

export interface Topic {
  id: string
  name: string
  subject_id: string
  description?: string
}

export interface StudySession {
  currentIndex: number
  score: number
  userAnswers: { [key: number]: boolean }
  isStarted: boolean
  completed: boolean
  showAnswer: boolean
  showFeedback: boolean
  lastAnswerCorrect: boolean
}

export function useFlashcards() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { success, error: showError, info } = useToast()
  const { profile } = useAuth()

  // Memoizar flashcards filtrados
  const filteredFlashcards = useMemo(() => {
    if (!selectedTopic) return []
    return flashcards.filter(card => card.topic_id === selectedTopic)
  }, [flashcards, selectedTopic])

  // Carregar matérias
  const loadSubjects = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Simular carregamento de matérias
      const mockSubjects: Subject[] = [
        { id: 'portugues', name: 'Português', description: 'Gramática e Literatura' },
        { id: 'matematica', name: 'Matemática', description: 'Álgebra e Geometria' },
        { id: 'historia', name: 'História', description: 'História do Brasil e Mundial' }
      ]
      
      setSubjects(mockSubjects)
    } catch (err) {
      setError('Erro ao carregar matérias')
      showError('Erro', 'Não foi possível carregar as matérias')
    } finally {
      setIsLoading(false)
    }
  }, [showError])

  // Carregar tópicos
  const loadTopics = useCallback(async (subjectId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Simular carregamento de tópicos
      const mockTopics: Topic[] = [
        { id: 'regencia', name: 'Regência', subject_id: subjectId },
        { id: 'concordancia', name: 'Concordância', subject_id: subjectId },
        { id: 'sintaxe-termos-acessorios', name: 'Sintaxe - Termos Acessórios', subject_id: subjectId },
        { id: 'semantica-estilistica', name: 'Semântica e Estilística', subject_id: subjectId },
        { id: 'sintaxe-termos-essenciais', name: 'Sintaxe - Termos Essenciais', subject_id: subjectId },
        { id: 'ortografia', name: 'Ortografia', subject_id: subjectId },
        { id: 'acentuacao-grafica', name: 'Acentuação Gráfica', subject_id: subjectId }
      ]
      
      setTopics(mockTopics)
    } catch (err) {
      setError('Erro ao carregar tópicos')
      showError('Erro', 'Não foi possível carregar os tópicos')
    } finally {
      setIsLoading(false)
    }
  }, [showError])

  // Carregar flashcards
  const loadFlashcards = useCallback(async (topicId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Simular carregamento de flashcards
      const mockFlashcards: Flashcard[] = [
        {
          id: 1,
          question: 'O que é regência verbal?',
          answer: 'Regência verbal é a relação de dependência que se estabelece entre um verbo e seus complementos.',
          topic_id: topicId
        },
        {
          id: 2,
          question: 'Qual é a regência do verbo "assistir"?',
          answer: 'O verbo "assistir" pode ser transitivo direto (assistir algo) ou transitivo indireto (assistir a algo).',
          topic_id: topicId
        }
      ]
      
      setFlashcards(mockFlashcards)
    } catch (err) {
      setError('Erro ao carregar flashcards')
      showError('Erro', 'Não foi possível carregar os flashcards')
    } finally {
      setIsLoading(false)
    }
  }, [showError])

  // Selecionar matéria
  const selectSubject = useCallback((subjectId: string) => {
    setSelectedSubject(subjectId)
    setSelectedTopic(null)
    setFlashcards([])
    loadTopics(subjectId)
  }, [loadTopics])

  // Selecionar tópico
  const selectTopic = useCallback((topicId: string) => {
    setSelectedTopic(topicId)
    loadFlashcards(topicId)
  }, [loadFlashcards])

  // Carregar dados iniciais
  useEffect(() => {
    loadSubjects()
  }, [loadSubjects])

  return {
    // Estado
    subjects,
    topics,
    flashcards: filteredFlashcards,
    selectedSubject,
    selectedTopic,
    isLoading,
    error,
    
    // Ações
    selectSubject,
    selectTopic,
    loadSubjects,
    loadTopics,
    loadFlashcards,
    
    // Utilitários
    isTeacherOrAdmin: profile?.role === 'teacher' || profile?.role === 'administrator'
  }
}
