import { analytics, useAnalytics } from '@/lib/analytics'

// Mock do fetch
global.fetch = jest.fn()

// Mock do localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock do performance
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    getEntriesByType: jest.fn(() => [])
  }
})

// Mock do document
Object.defineProperty(document, 'title', {
  value: 'Test Page',
  writable: true
})

Object.defineProperty(document, 'referrer', {
  value: 'https://example.com',
  writable: true
})

Object.defineProperty(document, 'hidden', {
  value: false,
  writable: true
})

// Mock do window
Object.defineProperty(window, 'location', {
  value: {
    href: 'https://test.com/page',
    pathname: '/page',
    search: '',
    hash: ''
  },
  writable: true
})

Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'Test User Agent'
  },
  writable: true
})

Object.defineProperty(window, 'screen', {
  value: {
    width: 1920,
    height: 1080
  },
  writable: true
})

Object.defineProperty(window, 'innerWidth', {
  value: 1024,
  writable: true
})

Object.defineProperty(window, 'innerHeight', {
  value: 768,
  writable: true
})

describe('Analytics', () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockClear()
  })

  describe('Basic Tracking', () => {
    it('should track events', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      analytics.track('test_event', { key: 'value' })
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics] Event tracked:'),
        expect.objectContaining({
          name: 'test_event',
          properties: { key: 'value' }
        })
      )
      
      consoleSpy.mockRestore()
    })

    it('should track events with string name', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      analytics.track('simple_event')
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics] Event tracked:'),
        expect.objectContaining({
          name: 'simple_event'
        })
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('User Identification', () => {
    it('should identify users', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      analytics.identify('user123', { name: 'Test User' })
      
      expect(localStorageMock.getItem('analytics-user-id')).toBe('user123')
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics] Event tracked:'),
        expect.objectContaining({
          name: 'user_identified',
          properties: {
            userId: 'user123',
            traits: { name: 'Test User' }
          }
        })
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('Page Tracking', () => {
    it('should track page views', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      analytics.page('Test Page', { section: 'home' })
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics] Event tracked:'),
        expect.objectContaining({
          name: 'page_view',
          properties: {
            name: 'Test Page',
            url: 'https://test.com/page',
            path: '/page',
            section: 'home'
          }
        })
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('App-specific Events', () => {
    it('should track flashcard studied events', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      analytics.flashcardStudied('topic123', 8, 120)
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics] Event tracked:'),
        expect.objectContaining({
          name: 'flashcard_studied',
          properties: {
            topicId: 'topic123',
            score: 8,
            timeSpent: 120,
            accuracy: 8
          }
        })
      )
      
      consoleSpy.mockRestore()
    })

    it('should track quiz completed events', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      analytics.quizCompleted('quiz456', 85, 300)
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics] Event tracked:'),
        expect.objectContaining({
          name: 'quiz_completed',
          properties: {
            quizId: 'quiz456',
            score: 85,
            timeSpent: 300
          }
        })
      )
      
      consoleSpy.mockRestore()
    })

    it('should track user login events', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      analytics.userLoggedIn('email')
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics] Event tracked:'),
        expect.objectContaining({
          name: 'user_logged_in',
          properties: {
            method: 'email'
          }
        })
      )
      
      consoleSpy.mockRestore()
    })

    it('should track user logout events', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      analytics.userLoggedOut()
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics] Event tracked:'),
        expect.objectContaining({
          name: 'user_logged_out'
        })
      )
      
      consoleSpy.mockRestore()
    })

    it('should track feature usage', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      analytics.featureUsed('flashcards', { mode: 'study' })
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics] Event tracked:'),
        expect.objectContaining({
          name: 'feature_used',
          properties: {
            feature: 'flashcards',
            mode: 'study'
          }
        })
      )
      
      consoleSpy.mockRestore()
    })

    it('should track errors', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      analytics.errorOccurred('Test error', { component: 'Flashcard' })
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics] Event tracked:'),
        expect.objectContaining({
          name: 'error_occurred',
          properties: {
            error: 'Test error',
            context: { component: 'Flashcard' },
            url: 'https://test.com/page'
          }
        })
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('Flush and Batch Processing', () => {
    it('should flush events when batch size is reached', async () => {
      // Mock fetch para simular sucesso
      ;(fetch as jest.Mock).mockResolvedValueOnce({ ok: true })
      
      // Configurar analytics para produção (habilitado)
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      
      // Limpar analytics e recriar
      analytics.clear()
      
      // Adicionar eventos até atingir batch size
      for (let i = 0; i < 10; i++) {
        analytics.track(`event_${i}`, { index: i })
      }
      
      // Aguardar flush
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Verificar se fetch foi chamado
      expect(fetch).toHaveBeenCalledWith(
        '/api/analytics',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: expect.stringContaining('"events"')
        })
      )
      
      // Restaurar ambiente
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('Cleanup', () => {
    it('should clear events and timers', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval')
      
      analytics.clear()
      
      expect(clearIntervalSpy).toHaveBeenCalled()
      
      clearIntervalSpy.mockRestore()
    })

    it('should destroy analytics instance', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval')
      
      analytics.destroy()
      
      expect(clearIntervalSpy).toHaveBeenCalled()
      
      clearIntervalSpy.mockRestore()
    })
  })
})

describe('useAnalytics Hook', () => {
  it('should return analytics methods', () => {
    const analyticsMethods = useAnalytics()
    
    expect(typeof analyticsMethods.track).toBe('function')
    expect(typeof analyticsMethods.identify).toBe('function')
    expect(typeof analyticsMethods.page).toBe('function')
    expect(typeof analyticsMethods.flashcardStudied).toBe('function')
    expect(typeof analyticsMethods.quizCompleted).toBe('function')
    expect(typeof analyticsMethods.userLoggedIn).toBe('function')
    expect(typeof analyticsMethods.userLoggedOut).toBe('function')
    expect(typeof analyticsMethods.featureUsed).toBe('function')
    expect(typeof analyticsMethods.errorOccurred).toBe('function')
  })

  it('should call analytics methods when used', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
    const analyticsMethods = useAnalytics()
    
    analyticsMethods.track('test_event', { key: 'value' })
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Analytics] Event tracked:'),
      expect.objectContaining({
        name: 'test_event',
        properties: { key: 'value' }
      })
    )
    
    consoleSpy.mockRestore()
  })
})
