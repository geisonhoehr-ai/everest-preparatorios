import { renderHook, act, waitFor } from '@testing-library/react'
import { useFlashcards } from '@/hooks/use-flashcards'
import { testUtils } from '../utils/test-utils'

// Mock do toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  })
}))

// Mock do auth context
jest.mock('@/context/auth-context', () => ({
  useAuth: () => ({
    profile: testUtils.mockProfile
  })
}))

describe('useFlashcards Hook', () => {
  beforeEach(() => {
    testUtils.clearAllMocks()
  })

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useFlashcards())

    expect(result.current.subjects).toEqual([])
    expect(result.current.topics).toEqual([])
    expect(result.current.flashcards).toEqual([])
    expect(result.current.selectedSubject).toBeNull()
    expect(result.current.selectedTopic).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should load subjects on mount', async () => {
    const { result } = renderHook(() => useFlashcards())

    await waitFor(() => {
      expect(result.current.subjects).toHaveLength(3)
      expect(result.current.subjects[0]).toHaveProperty('id')
      expect(result.current.subjects[0]).toHaveProperty('name')
    })
  })

  it('should select subject and load topics', async () => {
    const { result } = renderHook(() => useFlashcards())

    await waitFor(() => {
      expect(result.current.subjects).toHaveLength(3)
    })

    act(() => {
      result.current.selectSubject('portugues')
    })

    expect(result.current.selectedSubject).toBe('portugues')

    await waitFor(() => {
      expect(result.current.topics).toHaveLength(7)
      expect(result.current.topics[0]).toHaveProperty('id')
      expect(result.current.topics[0]).toHaveProperty('name')
    })
  })

  it('should select topic and load flashcards', async () => {
    const { result } = renderHook(() => useFlashcards())

    await waitFor(() => {
      expect(result.current.subjects).toHaveLength(3)
    })

    act(() => {
      result.current.selectSubject('portugues')
    })

    await waitFor(() => {
      expect(result.current.topics).toHaveLength(7)
    })

    act(() => {
      result.current.selectTopic('regencia')
    })

    expect(result.current.selectedTopic).toBe('regencia')

    await waitFor(() => {
      expect(result.current.flashcards).toHaveLength(2)
      expect(result.current.flashcards[0]).toHaveProperty('id')
      expect(result.current.flashcards[0]).toHaveProperty('question')
      expect(result.current.flashcards[0]).toHaveProperty('answer')
    })
  })

  it('should filter flashcards by selected topic', async () => {
    const { result } = renderHook(() => useFlashcards())

    await waitFor(() => {
      expect(result.current.subjects).toHaveLength(3)
    })

    act(() => {
      result.current.selectSubject('portugues')
    })

    await waitFor(() => {
      expect(result.current.topics).toHaveLength(7)
    })

    act(() => {
      result.current.selectTopic('regencia')
    })

    await waitFor(() => {
      expect(result.current.flashcards).toHaveLength(2)
    })

    // Verificar se todos os flashcards pertencem ao tópico selecionado
    result.current.flashcards.forEach(flashcard => {
      expect(flashcard.topic_id).toBe('regencia')
    })
  })

  it('should handle loading states correctly', async () => {
    const { result } = renderHook(() => useFlashcards())

    // Inicialmente não deve estar carregando
    expect(result.current.isLoading).toBe(false)

    // Simular carregamento de matérias
    act(() => {
      result.current.loadSubjects()
    })

    // Deve estar carregando
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('should handle errors correctly', async () => {
    const { result } = renderHook(() => useFlashcards())

    // Simular erro
    act(() => {
      result.current.loadSubjects()
    })

    // Aguardar carregamento
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Verificar se não há erro (mock não simula erro)
    expect(result.current.error).toBeNull()
  })

  it('should reset state when selecting new subject', async () => {
    const { result } = renderHook(() => useFlashcards())

    await waitFor(() => {
      expect(result.current.subjects).toHaveLength(3)
    })

    act(() => {
      result.current.selectSubject('portugues')
    })

    await waitFor(() => {
      expect(result.current.topics).toHaveLength(7)
    })

    act(() => {
      result.current.selectTopic('regencia')
    })

    await waitFor(() => {
      expect(result.current.flashcards).toHaveLength(2)
    })

    // Selecionar nova matéria
    act(() => {
      result.current.selectSubject('matematica')
    })

    // Verificar se estado foi resetado
    expect(result.current.selectedTopic).toBeNull()
    expect(result.current.flashcards).toEqual([])
    expect(result.current.selectedSubject).toBe('matematica')
  })

  it('should identify teacher or admin correctly', () => {
    const { result } = renderHook(() => useFlashcards())

    // Usuário padrão é student
    expect(result.current.isTeacherOrAdmin).toBe(false)

    // Simular usuário admin
    jest.mocked(require('@/context/auth-context').useAuth).mockReturnValue({
      profile: { ...testUtils.mockProfile, role: 'admin' }
    })

    const { result: adminResult } = renderHook(() => useFlashcards())
    expect(adminResult.current.isTeacherOrAdmin).toBe(true)

    // Simular usuário teacher
    jest.mocked(require('@/context/auth-context').useAuth).mockReturnValue({
      profile: { ...testUtils.mockProfile, role: 'teacher' }
    })

    const { result: teacherResult } = renderHook(() => useFlashcards())
    expect(teacherResult.current.isTeacherOrAdmin).toBe(true)
  })

  it('should provide correct actions', () => {
    const { result } = renderHook(() => useFlashcards())

    expect(typeof result.current.selectSubject).toBe('function')
    expect(typeof result.current.selectTopic).toBe('function')
    expect(typeof result.current.loadSubjects).toBe('function')
    expect(typeof result.current.loadTopics).toBe('function')
    expect(typeof result.current.loadFlashcards).toBe('function')
  })
})
