import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          try {
            return request.cookies.get(name)?.value
          } catch (error) {
            console.warn('Error reading cookie in middleware:', name, error)
            return undefined
          }
        },
        set(name: string, value: string, options: any) {
          try {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          } catch (error) {
            console.warn('Error setting cookie in middleware:', name, error)
          }
        },
        remove(name: string) {
          try {
            request.cookies.set(name, '')
            supabaseResponse.cookies.set(name, '')
          } catch (error) {
            console.warn('Error removing cookie in middleware:', name, error)
          }
        },
      },
    }
  )

  try {
    // Refreshing the auth token
    await supabase.auth.getUser()
  } catch (error) {
    console.warn('Error refreshing auth token in middleware:', error)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 