const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🧹 [CLEAR] Limpando cache de autenticação...')
console.log('URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function clearAuthCache() {
  try {
    console.log('\n🧹 [CLEAR] Limpando cache de roles...')
    
    // 1. Verificar se conseguimos acessar a tabela user_roles
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(5)
    
    if (userRolesError) {
      console.error('❌ [CLEAR] Erro ao acessar user_roles:', userRolesError)
      return
    }
    
    console.log('✅ [CLEAR] Tabela user_roles acessível')
    console.log(`📊 [CLEAR] Total de roles: ${userRoles?.length || 0}`)
    
    if (userRoles && userRoles.length > 0) {
      console.log('👥 [CLEAR] Roles disponíveis:')
      userRoles.forEach((role, index) => {
        console.log(`  ${index + 1}. Email: ${role.email}, Role: ${role.role}`)
      })
    }
    
    // 2. Verificar se conseguimos acessar a sessão atual
    console.log('\n🔍 [CLEAR] Verificando sessão atual...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ [CLEAR] Erro ao obter sessão:', sessionError)
    } else if (session) {
      console.log('✅ [CLEAR] Sessão encontrada:', session.user.email)
      console.log('🆔 [CLEAR] User ID:', session.user.id)
      
      // 3. Verificar se o usuário tem role na tabela user_roles
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_uuid', session.user.id)
        .single()
      
      if (roleError) {
        console.error('❌ [CLEAR] Erro ao buscar role do usuário:', roleError)
      } else {
        console.log('✅ [CLEAR] Role do usuário atual:', userRole.role)
      }
    } else {
      console.log('ℹ️ [CLEAR] Nenhuma sessão encontrada')
    }
    
    console.log('\n✅ [CLEAR] Cache de autenticação verificado!')
    console.log('💡 [CLEAR] Se a página de flashcards ainda não funcionar,')
    console.log('💡 [CLEAR] pode ser necessário reiniciar o servidor')
    
  } catch (error) {
    console.error('❌ [CLEAR] Erro inesperado:', error)
  }
}

clearAuthCache()
