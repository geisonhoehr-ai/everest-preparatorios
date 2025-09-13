const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = 'https://hnhzindsfuqnaxosujay.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaHppbmRzZnVxbmF4b3N1amF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MzU5NTIsImV4cCI6MjA2ODUxMTk1Mn0.cT7fe1wjee9HfZw_IVD7K_exMqu-LtUxiClCD-sDLyU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function grantStudentAccess() {
  console.log('🔐 Concedendo acesso aos alunos para Evercast e Calendário...')
  
  try {
    // 1. Verificar se a tabela page_permissions existe
    console.log('\n📋 1. Verificando tabela page_permissions...')
    const { data: tableCheck, error: tableError } = await supabase
      .from('page_permissions')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Tabela page_permissions não existe ou há erro:', tableError)
      console.log('💡 Execute primeiro o script create-members-management-tables.sql')
      return
    }
    
    console.log('✅ Tabela page_permissions existe')

    // 2. Buscar todos os alunos
    console.log('\n👥 2. Buscando todos os alunos...')
    const { data: students, error: studentsError } = await supabase
      .from('user_profiles')
      .select('user_id, display_name')
      .eq('role', 'student')
    
    if (studentsError) {
      console.error('❌ Erro ao buscar alunos:', studentsError)
      return
    }
    
    console.log(`✅ Encontrados ${students?.length || 0} alunos`)
    
    if (!students || students.length === 0) {
      console.log('⚠️ Nenhum aluno encontrado')
      return
    }

    // 3. Conceder acesso para Evercast
    console.log('\n🎵 3. Concedendo acesso ao Evercast...')
    const evercastPermissions = students.map(student => ({
      user_id: student.user_id,
      page_name: 'evercast',
      has_access: true,
      granted_at: new Date().toISOString(),
      expires_at: null // Acesso permanente
    }))

    const { data: evercastResult, error: evercastError } = await supabase
      .from('page_permissions')
      .upsert(evercastPermissions, { 
        onConflict: 'user_id,page_name',
        ignoreDuplicates: false 
      })

    if (evercastError) {
      console.error('❌ Erro ao conceder acesso ao Evercast:', evercastError)
    } else {
      console.log(`✅ Acesso ao Evercast concedido para ${students.length} alunos`)
    }

    // 4. Conceder acesso para Calendário
    console.log('\n📅 4. Concedendo acesso ao Calendário...')
    const calendarioPermissions = students.map(student => ({
      user_id: student.user_id,
      page_name: 'calendario',
      has_access: true,
      granted_at: new Date().toISOString(),
      expires_at: null // Acesso permanente
    }))

    const { data: calendarioResult, error: calendarioError } = await supabase
      .from('page_permissions')
      .upsert(calendarioPermissions, { 
        onConflict: 'user_id,page_name',
        ignoreDuplicates: false 
      })

    if (calendarioError) {
      console.error('❌ Erro ao conceder acesso ao Calendário:', calendarioError)
    } else {
      console.log(`✅ Acesso ao Calendário concedido para ${students.length} alunos`)
    }

    // 5. Verificar permissões concedidas
    console.log('\n🔍 5. Verificando permissões concedidas...')
    const { data: permissions, error: permissionsError } = await supabase
      .from('page_permissions')
      .select('user_id, page_name, has_access, granted_at')
      .in('page_name', ['evercast', 'calendario'])
      .eq('has_access', true)
    
    if (permissionsError) {
      console.error('❌ Erro ao verificar permissões:', permissionsError)
    } else {
      console.log(`✅ Total de permissões ativas: ${permissions?.length || 0}`)
      
      const evercastCount = permissions?.filter(p => p.page_name === 'evercast').length || 0
      const calendarioCount = permissions?.filter(p => p.page_name === 'calendario').length || 0
      
      console.log(`   - Evercast: ${evercastCount} alunos`)
      console.log(`   - Calendário: ${calendarioCount} alunos`)
    }

    console.log('\n🎉 Processo concluído!')
    console.log('📝 Os alunos agora podem acessar:')
    console.log('   - /evercast (página de áudios e vídeos)')
    console.log('   - /calendario (página de eventos)')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

grantStudentAccess()
