import { renderHook, act } from '@testing-library/react'
import { AuthProvider } from '@/context/auth-context'
import { useAuth } from '@/context/auth-context'

// Mock do Supabase
const mockSupabase = {
  auth: {
    getSession: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
}

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}))

describe('useAuth Hook', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )

  it('should provide default context when used outside AuthProvider', () => {
    const { result } = renderHook(() => useAuth())
    
    expect(result.current.user).toBeNull()
    expect(result.current.session).toBeNull()
    expect(result.current.profile).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('should handle signOut correctly', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await result.current.signOut()
    })
    
    expect(mockSupabase.auth.signOut).toHaveBeenCalled()
  })

  it('should handle refreshProfile correctly', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await result.current.refreshProfile()
    })
    
    expect(mockSupabase.auth.getSession).toHaveBeenCalled()
  })
})
