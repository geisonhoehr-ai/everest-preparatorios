import { renderHook, act } from '@testing-library/react'
import { useOptimizedData } from '@/hooks/use-optimized-data'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useOptimizedData Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch data on mount', async () => {
    const mockFetcher = jest.fn().mockResolvedValue({ data: 'test' })
    
    const { result } = renderHook(() =>
      useOptimizedData({
        key: 'test-key',
        fetcher: mockFetcher,
      })
    )

    expect(result.current.isLoading).toBe(true)
    expect(mockFetcher).toHaveBeenCalled()

    await act(async () => {
      // Wait for async operations
    })

    expect(result.current.data).toEqual({ data: 'test' })
    expect(result.current.isLoading).toBe(false)
  })

  it('should handle errors correctly', async () => {
    const mockFetcher = jest.fn().mockRejectedValue(new Error('Fetch error'))
    
    const { result } = renderHook(() =>
      useOptimizedData({
        key: 'test-key',
        fetcher: mockFetcher,
      })
    )

    await act(async () => {
      // Wait for async operations
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.isLoading).toBe(false)
  })

  it('should use cache when available', () => {
    const cachedData = { data: 'cached', timestamp: Date.now() }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedData))
    
    const mockFetcher = jest.fn()
    
    renderHook(() =>
      useOptimizedData({
        key: 'test-key',
        fetcher: mockFetcher,
      })
    )

    expect(mockFetcher).not.toHaveBeenCalled()
  })

  it('should refetch when dependencies change', async () => {
    const mockFetcher = jest.fn().mockResolvedValue({ data: 'test' })
    
    const { result, rerender } = renderHook(
      ({ deps }) =>
        useOptimizedData({
          key: 'test-key',
          fetcher: mockFetcher,
          dependencies: deps,
        }),
      { initialProps: { deps: ['dep1'] } }
    )

    await act(async () => {
      // Wait for initial fetch
    })

    expect(mockFetcher).toHaveBeenCalledTimes(1)

    rerender({ deps: ['dep2'] })

    await act(async () => {
      // Wait for refetch
    })

    expect(mockFetcher).toHaveBeenCalledTimes(2)
  })
})
