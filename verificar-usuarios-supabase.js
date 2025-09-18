// Script para verificar e corrigir usuários no Supabase
const { createClient } = require('@supabase/supabase-js')

// Configurações do Supabase
const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'

async function verificarUsuarios() {
  console.log('🔍 Verificando usuários no Supabase...')
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  // Verificar se os usuários existem
  const { data: users, error: usersError } = await supabase
    .from('auth.users')
    .select('id, email, email_confirmed_at, created_at')
    .in('email', ['admin@teste.com', 'professor@teste.com', 'aluno@teste.com'])
  
  if (usersError) {
    console.error('❌ Erro ao buscar usuários:', usersError)
    return
  }
  
  console.log('👥 Usuários encontrados:', users?.length || 0)
  
  if (users && users.length > 0) {
    users.forEach(user => {
      console.log(`📧 ${user.email}:`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Email confirmado: ${user.email_confirmed_at ? 'Sim' : 'Não'}`)
      console.log(`   Criado em: ${user.created_at}`)
    })
  } else {
    console.log('❌ Nenhum usuário encontrado!')
    console.log('💡 Você precisa criar os usuários primeiro no Supabase Dashboard')
  }
  
  // Verificar perfis
  console.log('\n🔍 Verificando perfis de usuário...')
  const { data: profiles, error: profilesError } = await supabase
    .from('user_profiles')
    .select('user_id, role, display_name')
  
  if (profilesError) {
    console.error('❌ Erro ao buscar perfis:', profilesError)
  } else {
    console.log('👤 Perfis encontrados:', profiles?.length || 0)
    if (profiles && profiles.length > 0) {
      profiles.forEach(profile => {
        console.log(`   ${profile.display_name} (${profile.role})`)
      })
    }
  }
}

verificarUsuarios().catch(console.error)
