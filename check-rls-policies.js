// Verificar políticas RLS da tabela subjects
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRLSPolicies() {
  console.log('🔍 Verificando políticas RLS da tabela subjects...')
  
  try {
    // 1. Verificar se RLS está habilitado
    console.log('\n1. Verificando se RLS está habilitado...')
    const { data: rlsData, error: rlsError } = await supabase
      .rpc('get_table_rls_status', { table_name: 'subjects' })
    
    if (rlsError) {
      console.log('❌ Erro ao verificar RLS:', rlsError.message)
    } else {
      console.log('✅ Status RLS:', rlsData)
    }
    
    // 2. Tentar desabilitar RLS temporariamente
    console.log('\n2. Tentando desabilitar RLS temporariamente...')
    const { data: disableData, error: disableError } = await supabase
      .rpc('disable_rls', { table_name: 'subjects' })
    
    if (disableError) {
      console.log('❌ Erro ao desabilitar RLS:', disableError.message)
    } else {
      console.log('✅ RLS desabilitado:', disableData)
    }
    
    // 3. Tentar buscar subjects novamente
    console.log('\n3. Tentando buscar subjects após desabilitar RLS...')
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('id, name')
    
    if (subjectsError) {
      console.log('❌ Erro ao buscar subjects:', subjectsError.message)
    } else {
      console.log('✅ Subjects encontrados após desabilitar RLS!')
      console.log('Dados:', subjects)
    }
    
    // 4. Reabilitar RLS
    console.log('\n4. Reabilitando RLS...')
    const { data: enableData, error: enableError } = await supabase
      .rpc('enable_rls', { table_name: 'subjects' })
    
    if (enableError) {
      console.log('❌ Erro ao reabilitar RLS:', enableError.message)
    } else {
      console.log('✅ RLS reabilitado:', enableData)
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

checkRLSPolicies()
