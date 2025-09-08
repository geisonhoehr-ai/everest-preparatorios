// Debug das tabelas de usuário
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugUserTables() {
  console.log('🔍 Debugando tabelas de usuário...')
  
  const testUserUuid = 'c8b5bff0-b5cc-4dab-9cfa-0a0cf4983dc5'
  
  // 1. Verificar user_profiles
  console.log('\n=== USER_PROFILES ===')
  const { data: profiles, error: profilesError } = await supabase
    .from("user_profiles")
    .select("*")
  
  console.log('Todos os profiles:', profiles)
  console.log('Erro:', profilesError)
  
  if (profiles) {
    const userProfile = profiles.find(p => p.user_id === testUserUuid)
    console.log('Profile do usuário teste:', userProfile)
  }
  
  // 2. Verificar user_roles
  console.log('\n=== USER_ROLES ===')
  const { data: roles, error: rolesError } = await supabase
    .from("user_roles")
    .select("*")
  
  console.log('Todos os roles:', roles)
  console.log('Erro:', rolesError)
  
  if (roles) {
    const userRole = roles.find(r => r.user_uuid === testUserUuid)
    console.log('Role do usuário teste:', userRole)
  }
  
  // 3. Verificar auth.users (se possível)
  console.log('\n=== AUTH.USERS ===')
  try {
    const { data: authUsers, error: authError } = await supabase
      .from("auth.users")
      .select("id, email")
      .eq("email", "professor@teste.com")
    
    console.log('Usuário auth:', authUsers)
    console.log('Erro auth:', authError)
  } catch (error) {
    console.log('Erro ao acessar auth.users:', error.message)
  }
  
  // 4. Verificar se existe algum usuário com role teacher
  console.log('\n=== USUÁRIOS TEACHER ===')
  if (profiles) {
    const teachers = profiles.filter(p => p.role === 'teacher')
    console.log('Usuários teacher encontrados:', teachers)
  }
  
  if (roles) {
    const teachers = roles.filter(r => r.role === 'teacher')
    console.log('Roles teacher encontrados:', teachers)
  }
}

debugUserTables().catch(console.error)
