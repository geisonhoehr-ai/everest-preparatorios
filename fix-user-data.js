// Corrigir dados de usuário
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixUserData() {
  console.log('🔧 Corrigindo dados de usuário...')
  
  const testUserUuid = 'c8b5bff0-b5cc-4dab-9cfa-0a0cf4983dc5'
  
  // 1. Verificar estrutura da tabela user_profiles
  console.log('\n=== VERIFICANDO ESTRUTURA USER_PROFILES ===')
  const { data: profiles, error: profilesError } = await supabase
    .from("user_profiles")
    .select("*")
    .limit(1)
  
  console.log('Estrutura user_profiles:', profiles)
  console.log('Erro:', profilesError)
  
  // 2. Tentar inserir o usuário professor
  console.log('\n=== INSERINDO USUÁRIO PROFESSOR ===')
  const { data: insertData, error: insertError } = await supabase
    .from("user_profiles")
    .insert({
      user_id: testUserUuid,
      role: 'teacher',
      display_name: 'Professor Teste',
      created_at: new Date().toISOString()
    })
    .select()
  
  console.log('Dados inseridos:', insertData)
  console.log('Erro na inserção:', insertError)
  
  // 3. Verificar se foi inserido
  console.log('\n=== VERIFICANDO INSERÇÃO ===')
  const { data: verifyData, error: verifyError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", testUserUuid)
  
  console.log('Usuário verificado:', verifyData)
  console.log('Erro na verificação:', verifyError)
  
  // 4. Testar verificação de acesso novamente
  console.log('\n=== TESTANDO VERIFICAÇÃO DE ACESSO ===')
  if (verifyData && verifyData.length > 0) {
    const userProfile = verifyData[0]
    const hasAccess = userProfile.role === "teacher" || userProfile.role === "admin"
    console.log(`✅ Acesso ${hasAccess ? 'permitido' : 'negado'} para role: ${userProfile.role}`)
  } else {
    console.log('❌ Usuário ainda não encontrado')
  }
}

fixUserData().catch(console.error)
