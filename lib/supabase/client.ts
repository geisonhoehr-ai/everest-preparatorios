import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          try {
            const value = document.cookie
              .split('; ')
              .find(row => row.startsWith(name + '='))
              ?.split('=')[1];
            
            if (value) {
              // Decodifica o valor do cookie
              return decodeURIComponent(value);
            }
            return undefined;
          } catch (error) {
            console.warn('Error reading cookie:', name, error);
            return undefined;
          }
        },
        set(name: string, value: string, options: any) {
          try {
            document.cookie = `${name}=${encodeURIComponent(value)}; path=/; ${
              options?.maxAge ? `max-age=${options.maxAge};` : ''
            } ${options?.secure ? 'secure;' : ''} ${
              options?.sameSite ? `samesite=${options.sameSite};` : ''
            }`;
          } catch (error) {
            console.warn('Error setting cookie:', name, error);
          }
        },
        remove(name: string) {
          try {
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
          } catch (error) {
            console.warn('Error removing cookie:', name, error);
          }
        },
      },
    }
  )
} 