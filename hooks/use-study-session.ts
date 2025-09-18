'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useToast } from './use-toast'
import { Flashcard } from './use-flashcards'

export interface StudySession {
  currentIndex: number
  score: number
  userAnswers: { [key: number]: boolean }
  isStarted: boolean
  completed: boolean
  showAnswer: boolean
  showFeedback: boolean
  lastAnswerCorrect: boolean
  startTime: number | null
  endTime: number | null
}

export function useStudySession(flashcards: Flashcard[], topicId: string) {
  const [session, setSession] = useState<StudySession>({
    currentIndex: 0,
    score: 0,
    userAnswers: {},
    isStarted: false,
    completed: false,
    showAnswer: false,
    showFeedback: false,
    lastAnswerCorrect: false,
    startTime: null,
    endTime: null
  })

  const { success, error: showError } = useToast()

  // Memoizar valores calculados
  const progress = useMemo(() => {
    return flashcards.length > 0 ? ((session.currentIndex + 1) / flashcards.length) * 100 : 0
  }, [session.currentIndex, flashcards.length])

  const currentCard = useMemo(() => {
    return flashcards[session.currentIndex] || null
  }, [flashcards, session.currentIndex])

  const scorePercentage = useMemo(() => {
    return flashcards.length > 0 ? (session.score / flashcards.length) * 100 : 0
  }, [session.score, flashcards.length])

  const timeSpent = useMemo(() => {
    if (!session.startTime) return 0
    const endTime = session.endTime || Date.now()
    return Math.floor((endTime - session.startTime) / 1000)
  }, [session.startTime, session.endTime])

  // Carregar sessão salva
  useEffect(() => {
    const saved = localStorage.getItem(`study-session-${topicId}`)
    if (saved) {
      try {
        const savedSession = JSON.parse(saved)
        setSession(savedSession)
      } catch (err) {
        console.error('Erro ao carregar sessão salva:', err)
      }
    }
  }, [topicId])

  // Salvar sessão
  useEffect(() => {
    if (session.isStarted) {
      localStorage.setItem(`study-session-${topicId}`, JSON.stringify(session))
    }
  }, [session, topicId])

  // Iniciar estudo
  const startStudy = useCallback(() => {
    setSession(prev => ({
      ...prev,
      isStarted: true,
      currentIndex: 0,
      score: 0,
      userAnswers: {},
      completed: false,
      showAnswer: false,
      showFeedback: false,
      startTime: Date.now(),
      endTime: null
    }))
  }, [])

  // Reiniciar estudo
  const resetStudy = useCallback(() => {
    setSession({
      currentIndex: 0,
      score: 0,
      userAnswers: {},
      isStarted: false,
      completed: false,
      showAnswer: false,
      showFeedback: false,
      lastAnswerCorrect: false,
      startTime: null,
      endTime: null
    })
    localStorage.removeItem(`study-session-${topicId}`)
  }, [topicId])

  // Alternar resposta
  const toggleAnswer = useCallback(() => {
    setSession(prev => ({
      ...prev,
      showAnswer: !prev.showAnswer
    }))
  }, [])

  // Responder pergunta
  const answerQuestion = useCallback((isCorrect: boolean) => {
    const newScore = isCorrect ? session.score + 1 : session.score
    
    setSession(prev => ({
      ...prev,
      score: newScore,
      userAnswers: { ...prev.userAnswers, [session.currentIndex]: isCorrect },
      lastAnswerCorrect: isCorrect,
      showFeedback: true
    }))

    if (isCorrect) {
      success('Correto!', 'Parabéns pela resposta correta!')
    } else {
      showError('Incorreto', 'Tente novamente na próxima vez!')
    }

    // Avançar após feedback
    setTimeout(() => {
      setSession(prev => {
        if (prev.currentIndex < flashcards.length - 1) {
          return {
            ...prev,
            currentIndex: prev.currentIndex + 1,
            showAnswer: false,
            showFeedback: false
          }
        } else {
          return {
            ...prev,
            completed: true,
            endTime: Date.now(),
            showFeedback: false
          }
        }
      })
    }, 1500)
  }, [session.score, session.currentIndex, flashcards.length, success, showError])

  // Navegar entre flashcards
  const goToNext = useCallback(() => {
    if (session.currentIndex < flashcards.length - 1) {
      setSession(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        showAnswer: false,
        showFeedback: false
      }))
    }
  }, [session.currentIndex, flashcards.length])

  const goToPrevious = useCallback(() => {
    if (session.currentIndex > 0) {
      setSession(prev => ({
        ...prev,
        currentIndex: prev.currentIndex - 1,
        showAnswer: false,
        showFeedback: false
      }))
    }
  }, [session.currentIndex])

  const goToCard = useCallback((index: number) => {
    if (index >= 0 && index < flashcards.length) {
      setSession(prev => ({
        ...prev,
        currentIndex: index,
        showAnswer: false,
        showFeedback: false
      }))
    }
  }, [flashcards.length])

  return {
    // Estado da sessão
    session,
    
    // Valores calculados
    progress,
    currentCard,
    scorePercentage,
    timeSpent,
    
    // Ações
    startStudy,
    resetStudy,
    toggleAnswer,
    answerQuestion,
    goToNext,
    goToPrevious,
    goToCard,
    
    // Estado derivado
    isFirstCard: session.currentIndex === 0,
    isLastCard: session.currentIndex === flashcards.length - 1,
    hasAnswered: session.userAnswers[session.currentIndex] !== undefined
  }
}
