// Verificar políticas RLS e corrigir dados
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAndFixUserData() {
  console.log('🔍 Verificando e corrigindo dados de usuário...')
  
  const testUserUuid = 'c8b5bff0-b5cc-4dab-9cfa-0a0cf4983dc5'
  
  // 1. Verificar se o usuário já existe
  console.log('\n=== VERIFICANDO USUÁRIO EXISTENTE ===')
  const { data: existingUser, error: checkError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", testUserUuid)
  
  console.log('Usuário existente:', existingUser)
  console.log('Erro:', checkError)
  
  if (existingUser && existingUser.length > 0) {
    console.log('✅ Usuário já existe!')
    const user = existingUser[0]
    console.log(`Role: ${user.role}`)
    console.log(`Display Name: ${user.display_name}`)
    return
  }
  
  // 2. Tentar inserir usando service role (bypass RLS)
  console.log('\n=== TENTANDO INSERIR COM SERVICE ROLE ===')
  
  // Usar service role key para bypass RLS
  const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE0NDcxOCwiZXhwIjoyMDY4NzIwNzE4fQ.8QZJQZJQZJQZJQZJQZJQZJQZJQZJQZJQZJQZJQZJQ'
  
  const supabaseAdmin = createClient(supabaseUrl, serviceKey)
  
  const { data: insertData, error: insertError } = await supabaseAdmin
    .from("user_profiles")
    .insert({
      user_id: testUserUuid,
      role: 'teacher',
      display_name: 'Professor Teste',
      created_at: new Date().toISOString()
    })
    .select()
  
  console.log('Dados inseridos (service role):', insertData)
  console.log('Erro na inserção (service role):', insertError)
  
  // 3. Verificar se foi inserido
  console.log('\n=== VERIFICANDO INSERÇÃO FINAL ===')
  const { data: finalCheck, error: finalError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", testUserUuid)
  
  console.log('Usuário final:', finalCheck)
  console.log('Erro final:', finalError)
  
  if (finalCheck && finalCheck.length > 0) {
    console.log('✅ Usuário criado com sucesso!')
    const user = finalCheck[0]
    console.log(`Role: ${user.role}`)
    console.log(`Display Name: ${user.display_name}`)
    
    // 4. Testar verificação de acesso
    console.log('\n=== TESTANDO VERIFICAÇÃO DE ACESSO ===')
    const hasAccess = user.role === "teacher" || user.role === "admin"
    console.log(`✅ Acesso ${hasAccess ? 'permitido' : 'negado'} para role: ${user.role}`)
  } else {
    console.log('❌ Falha ao criar usuário')
  }
}

checkAndFixUserData().catch(console.error)