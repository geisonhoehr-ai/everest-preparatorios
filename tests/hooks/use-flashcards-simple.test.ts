import { renderHook, act } from '@testing-library/react'
import { useFlashcards } from '@/hooks/use-flashcards'

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
    profile: {
      id: 'test-profile-id',
      user_id: 'test-user-id',
      role: 'student'
    }
  })
}))

describe('useFlashcards Hook - Simple Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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

  it('should provide correct actions', () => {
    const { result } = renderHook(() => useFlashcards())

    expect(typeof result.current.selectSubject).toBe('function')
    expect(typeof result.current.selectTopic).toBe('function')
    expect(typeof result.current.loadSubjects).toBe('function')
    expect(typeof result.current.loadTopics).toBe('function')
    expect(typeof result.current.loadFlashcards).toBe('function')
  })

  it('should identify teacher or admin correctly', () => {
    const { result } = renderHook(() => useFlashcards())

    // Usuário padrão é student
    expect(result.current.isTeacherOrAdmin).toBe(false)
  })

  it('should select subject', () => {
    const { result } = renderHook(() => useFlashcards())

    act(() => {
      result.current.selectSubject('portugues')
    })

    expect(result.current.selectedSubject).toBe('portugues')
  })

  it('should select topic', () => {
    const { result } = renderHook(() => useFlashcards())

    act(() => {
      result.current.selectTopic('regencia')
    })

    expect(result.current.selectedTopic).toBe('regencia')
  })

  it('should reset state when selecting new subject', () => {
    const { result } = renderHook(() => useFlashcards())

    act(() => {
      result.current.selectSubject('portugues')
    })

    act(() => {
      result.current.selectTopic('regencia')
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
})
