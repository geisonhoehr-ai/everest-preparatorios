'use client'

import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft,
  Eye, 
  EyeOff, 
  Brain, 
  Target, 
  Trophy,
  Clock,
  Award
} from 'lucide-react'
import { Flashcard } from '@/hooks/use-flashcards'
import { useStudySession } from '@/hooks/use-study-session'

interface StudyInterfaceProps {
  flashcards: Flashcard[]
  topicId: string
  onBack: () => void
}

export const StudyInterface = memo(function StudyInterface({
  flashcards,
  topicId,
  onBack
}: StudyInterfaceProps) {
  const {
    session,
    progress,
    currentCard,
    scorePercentage,
    timeSpent,
    startStudy,
    resetStudy,
    toggleAnswer,
    answerQuestion,
    goToNext,
    goToPrevious,
    isFirstCard,
    isLastCard,
    hasAnswered
  } = useStudySession(flashcards, topicId)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!session.isStarted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Brain className="h-16 w-16 text-blue-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Iniciar Estudo</CardTitle>
          <p className="text-gray-600">
            Você tem {flashcards.length} flashcards para estudar
          </p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex justify-center space-x-4">
            <Button
              onClick={startStudy}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              size="lg"
            >
              <Play className="h-5 w-5 mr-2" />
              Começar Estudo
            </Button>
            <Button
              onClick={onBack}
              variant="outline"
              size="lg"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (session.completed) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Trophy className="h-16 w-16 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Parabéns!</CardTitle>
          <p className="text-gray-600">Você completou todos os flashcards!</p>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-4">
            <div className="text-4xl font-bold text-green-600">
              {session.score}/{flashcards.length}
            </div>
            <div className="text-lg text-gray-600">
              {scorePercentage.toFixed(1)}% de acerto
            </div>
            <Progress value={scorePercentage} className="w-full" />
            
            <div className="flex justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Tempo: {formatTime(timeSpent)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Award className="h-4 w-4" />
                <span>Pontuação: {session.score}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Button
              onClick={resetStudy}
              variant="outline"
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reiniciar
            </Button>
            <Button
              onClick={onBack}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-500" />
            <span className="font-semibold">Estudando</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetStudy}
              aria-label="Reiniciar flashcards"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              aria-label="Voltar"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-600">
            {session.currentIndex + 1} de {flashcards.length}
          </span>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Pontuação: {session.score}
            </span>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{formatTime(timeSpent)}</span>
            </div>
          </div>
        </div>
        
        <Progress value={progress} className="mb-4" />
      </CardHeader>

      <CardContent>
        {currentCard && (
          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                Pergunta
              </h3>
              <p className="text-lg">{currentCard.question}</p>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={toggleAnswer}
                variant="outline"
                className="w-full"
                aria-expanded={session.showAnswer}
                aria-controls="answer-content"
              >
                {session.showAnswer ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Ocultar Resposta
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Mostrar Resposta
                  </>
                )}
              </Button>
            </div>

            {session.showAnswer && (
              <div 
                id="answer-content"
                className="p-6 rounded-lg bg-blue-50"
                role="region"
                aria-label="Resposta"
              >
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Resposta
                </h4>
                <p className="text-lg">{currentCard.answer}</p>
              </div>
            )}

            {session.showAnswer && !hasAnswered && (
              <div className="flex space-x-4">
                <Button
                  onClick={() => answerQuestion(false)}
                  variant="destructive"
                  className="flex-1"
                  aria-label="Marcar como incorreto"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Incorreto
                </Button>
                <Button
                  onClick={() => answerQuestion(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  aria-label="Marcar como correto"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Correto
                </Button>
              </div>
            )}

            {session.showFeedback && (
              <div className={`p-4 rounded-lg text-center ${
                session.lastAnswerCorrect 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                <div className="flex items-center justify-center">
                  {session.lastAnswerCorrect ? (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 mr-2" />
                  )}
                  {session.lastAnswerCorrect ? 'Correto!' : 'Incorreto!'}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                onClick={goToPrevious}
                variant="outline"
                disabled={isFirstCard}
                aria-label="Flashcard anterior"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              <Button
                onClick={goToNext}
                variant="outline"
                disabled={isLastCard}
                aria-label="Próximo flashcard"
              >
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
