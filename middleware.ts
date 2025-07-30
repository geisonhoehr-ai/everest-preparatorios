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
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.warn('Error refreshing auth token in middleware:', error)
    }
    
    // Se o usuário está autenticado, verificar se tem role definido
    if (user) {
      console.log('🔍 [MIDDLEWARE] Usuário autenticado:', user.email)
      
      // Verificar se tem role definido
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_uuid', user.id)
        .single()
      
      if (roleError && roleError.code === 'PGRST116') {
        // Usuário não tem role definido, criar um padrão
        console.log('ℹ️ [MIDDLEWARE] Usuário sem role, criando padrão...')
        
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_uuid: user.id,
            role: 'student',
            first_login: true,
            profile_completed: false
          })
        
        if (insertError) {
          console.error('❌ [MIDDLEWARE] Erro ao criar role padrão:', insertError)
        } else {
          console.log('✅ [MIDDLEWARE] Role padrão criado com sucesso')
        }
      } else if (roleData) {
        console.log('✅ [MIDDLEWARE] Role encontrado:', roleData.role)
      }
    }
  } catch (error) {
    console.warn('Error in middleware auth check:', error)
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