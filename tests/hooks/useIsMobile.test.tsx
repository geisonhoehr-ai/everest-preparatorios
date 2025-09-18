import { renderHook } from '@testing-library/react'
import { useIsMobile } from '@/hooks/use-is-mobile'

// Mock window.matchMedia
const mockMatchMedia = jest.fn()
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
})

describe('useIsMobile Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return true for mobile screen size', () => {
    mockMatchMedia.mockReturnValue({
      matches: true,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })

    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(true)
  })

  it('should return false for desktop screen size', () => {
    mockMatchMedia.mockReturnValue({
      matches: false,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })

    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(false)
  })

  it('should update when screen size changes', () => {
    const mockAddListener = jest.fn()
    const mockRemoveListener = jest.fn()
    
    mockMatchMedia.mockReturnValue({
      matches: false,
      addListener: mockAddListener,
      removeListener: mockRemoveListener,
    })

    renderHook(() => useIsMobile())
    
    expect(mockAddListener).toHaveBeenCalled()
  })
})
