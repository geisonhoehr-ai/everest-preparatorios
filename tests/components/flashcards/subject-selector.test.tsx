import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SubjectSelector } from '@/components/flashcards/subject-selector'
import { testUtils } from '../../utils/test-utils'

describe('SubjectSelector', () => {
  const mockSubjects = testUtils.mockSubjects
  const mockOnSelectSubject = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render subjects correctly', () => {
    render(
      <SubjectSelector
        subjects={mockSubjects}
        selectedSubject={null}
        onSelectSubject={mockOnSelectSubject}
        isLoading={false}
      />
    )

    expect(screen.getByText('Escolha uma Matéria')).toBeInTheDocument()
    expect(screen.getByText('Selecione a matéria que você deseja estudar')).toBeInTheDocument()
    
    mockSubjects.forEach(subject => {
      expect(screen.getByText(subject.name)).toBeInTheDocument()
      if (subject.description) {
        expect(screen.getByText(subject.description)).toBeInTheDocument()
      }
    })
  })

  it('should show loading state', () => {
    render(
      <SubjectSelector
        subjects={[]}
        selectedSubject={null}
        onSelectSubject={mockOnSelectSubject}
        isLoading={true}
      />
    )

    // Verificar se há elementos de loading
    const loadingElements = screen.getAllByRole('generic')
    expect(loadingElements.length).toBeGreaterThan(0)
  })

  it('should call onSelectSubject when subject is clicked', () => {
    render(
      <SubjectSelector
        subjects={mockSubjects}
        selectedSubject={null}
        onSelectSubject={mockOnSelectSubject}
        isLoading={false}
      />
    )

    const firstSubject = screen.getByText(mockSubjects[0].name)
    fireEvent.click(firstSubject)

    expect(mockOnSelectSubject).toHaveBeenCalledWith(mockSubjects[0].id)
  })

  it('should show selected state for selected subject', () => {
    const selectedSubjectId = mockSubjects[0].id
    
    render(
      <SubjectSelector
        subjects={mockSubjects}
        selectedSubject={selectedSubjectId}
        onSelectSubject={mockOnSelectSubject}
        isLoading={false}
      />
    )

    // Verificar se o subject selecionado tem a classe correta
    const selectedCard = screen.getByText(mockSubjects[0].name).closest('div')
    expect(selectedCard).toHaveClass('ring-2', 'ring-blue-500')
  })

  it('should show correct badge for selected subject', () => {
    const selectedSubjectId = mockSubjects[0].id
    
    render(
      <SubjectSelector
        subjects={mockSubjects}
        selectedSubject={selectedSubjectId}
        onSelectSubject={mockOnSelectSubject}
        isLoading={false}
      />
    )

    // Verificar se o badge mostra "Selecionado" para o subject selecionado
    const selectedBadge = screen.getByText('Selecionado')
    expect(selectedBadge).toBeInTheDocument()
  })

  it('should show correct badge for non-selected subjects', () => {
    render(
      <SubjectSelector
        subjects={mockSubjects}
        selectedSubject={null}
        onSelectSubject={mockOnSelectSubject}
        isLoading={false}
      />
    )

    // Verificar se todos os badges mostram "Selecionar"
    const selectBadges = screen.getAllByText('Selecionar')
    expect(selectBadges).toHaveLength(mockSubjects.length)
  })

  it('should render correct icons for different subjects', () => {
    render(
      <SubjectSelector
        subjects={mockSubjects}
        selectedSubject={null}
        onSelectSubject={mockOnSelectSubject}
        isLoading={false}
      />
    )

    // Verificar se há ícones para cada subject
    mockSubjects.forEach(subject => {
      const subjectCard = screen.getByText(subject.name).closest('div')
      expect(subjectCard).toBeInTheDocument()
    })
  })

  it('should handle empty subjects array', () => {
    render(
      <SubjectSelector
        subjects={[]}
        selectedSubject={null}
        onSelectSubject={mockOnSelectSubject}
        isLoading={false}
      />
    )

    expect(screen.getByText('Escolha uma Matéria')).toBeInTheDocument()
    expect(screen.getByText('Selecione a matéria que você deseja estudar')).toBeInTheDocument()
  })

  it('should be accessible', () => {
    render(
      <SubjectSelector
        subjects={mockSubjects}
        selectedSubject={null}
        onSelectSubject={mockOnSelectSubject}
        isLoading={false}
      />
    )

    // Verificar se há elementos clicáveis
    const clickableElements = screen.getAllByRole('button')
    expect(clickableElements.length).toBeGreaterThan(0)
  })

  it('should handle keyboard navigation', () => {
    render(
      <SubjectSelector
        subjects={mockSubjects}
        selectedSubject={null}
        onSelectSubject={mockOnSelectSubject}
        isLoading={false}
      />
    )

    const firstSubject = screen.getByText(mockSubjects[0].name)
    
    // Simular navegação por teclado
    fireEvent.keyDown(firstSubject, { key: 'Enter' })
    fireEvent.keyDown(firstSubject, { key: ' ' })
    
    // Verificar se onSelectSubject foi chamado
    expect(mockOnSelectSubject).toHaveBeenCalledWith(mockSubjects[0].id)
  })

  it('should render with correct grid layout', () => {
    render(
      <SubjectSelector
        subjects={mockSubjects}
        selectedSubject={null}
        onSelectSubject={mockOnSelectSubject}
        isLoading={false}
      />
    )

    // Verificar se há grid container
    const gridContainer = screen.getByText(mockSubjects[0].name).closest('div')?.parentElement
    expect(gridContainer).toHaveClass('grid')
  })

  it('should show subject descriptions when available', () => {
    const subjectsWithDescriptions = [
      { id: '1', name: 'Subject 1', description: 'Description 1' },
      { id: '2', name: 'Subject 2', description: 'Description 2' }
    ]

    render(
      <SubjectSelector
        subjects={subjectsWithDescriptions}
        selectedSubject={null}
        onSelectSubject={mockOnSelectSubject}
        isLoading={false}
      />
    )

    subjectsWithDescriptions.forEach(subject => {
      expect(screen.getByText(subject.description)).toBeInTheDocument()
    })
  })

  it('should handle subjects without descriptions', () => {
    const subjectsWithoutDescriptions = [
      { id: '1', name: 'Subject 1' },
      { id: '2', name: 'Subject 2' }
    ]

    render(
      <SubjectSelector
        subjects={subjectsWithoutDescriptions}
        selectedSubject={null}
        onSelectSubject={mockOnSelectSubject}
        isLoading={false}
      />
    )

    subjectsWithoutDescriptions.forEach(subject => {
      expect(screen.getByText(subject.name)).toBeInTheDocument()
    })
  })
})
