'use client'

import React, { useState } from 'react'
import { PagePermissionGuard } from '@/components/page-permission-guard'
import { RoleGuard } from '@/components/role-guard'
import { useFlashcards } from '@/hooks/use-flashcards'
import { SubjectSelector } from '@/components/flashcards/subject-selector'
import { TopicSelector } from '@/components/flashcards/topic-selector'
import { StudyInterface } from '@/components/flashcards/study-interface'
import { ErrorBoundary } from '@/components/error-boundary'
import { SkipLinks } from '@/components/skip-link'

type ViewState = 'subjects' | 'topics' | 'study'

export default function FlashcardPageRefactored() {
  const [currentView, setCurrentView] = useState<ViewState>('subjects')
  
  const {
    subjects,
    topics,
    flashcards,
    selectedSubject,
    selectedTopic,
    isLoading,
    error,
    selectSubject,
    selectTopic,
    isTeacherOrAdmin
  } = useFlashcards()

  const handleSelectSubject = (subjectId: string) => {
    selectSubject(subjectId)
    setCurrentView('topics')
  }

  const handleSelectTopic = (topicId: string) => {
    selectTopic(topicId)
    setCurrentView('study')
  }

  const handleBackToSubjects = () => {
    setCurrentView('subjects')
  }

  const handleBackToTopics = () => {
    setCurrentView('topics')
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Recarregar Página
          </button>
        </div>
      </div>
    )
  }

  return (
    <PagePermissionGuard pageName="flashcards">
      <div className="min-h-screen bg-gray-50">
        <SkipLinks />
        
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Sistema de Flashcards
            </h1>
            <p className="text-gray-600">
              Estude de forma eficiente com nosso sistema de flashcards interativo
            </p>
          </div>

          <ErrorBoundary>
            <div className="max-w-6xl mx-auto">
              {currentView === 'subjects' && (
                <SubjectSelector
                  subjects={subjects}
                  selectedSubject={selectedSubject}
                  onSelectSubject={handleSelectSubject}
                  isLoading={isLoading}
                />
              )}

              {currentView === 'topics' && (
                <TopicSelector
                  topics={topics}
                  selectedTopic={selectedTopic}
                  onSelectTopic={handleSelectTopic}
                  onBack={handleBackToSubjects}
                  isLoading={isLoading}
                />
              )}

              {currentView === 'study' && selectedTopic && (
                <StudyInterface
                  flashcards={flashcards}
                  topicId={selectedTopic}
                  onBack={handleBackToTopics}
                />
              )}
            </div>
          </ErrorBoundary>

          {/* Seção de Administração */}
          {isTeacherOrAdmin && (
            <RoleGuard allowedRoles={['teacher', 'administrator']}>
              <div className="mt-12 max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Área Administrativa
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Funcionalidades de administração serão implementadas em breve.
                  </p>
                  <div className="flex space-x-4">
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                      disabled
                    >
                      Gerenciar Flashcards
                    </button>
                    <button
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                      disabled
                    >
                      Criar Novo Tópico
                    </button>
                    <button
                      className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
                      disabled
                    >
                      Estatísticas
                    </button>
                  </div>
                </div>
              </div>
            </RoleGuard>
          )}
        </div>
      </div>
    </PagePermissionGuard>
  )
}
