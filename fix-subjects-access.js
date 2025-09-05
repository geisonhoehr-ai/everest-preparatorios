// Corrigir acesso à tabela subjects
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixSubjectsAccess() {
  console.log('🔧 Tentando corrigir acesso à tabela subjects...')
  
  try {
    // 1. Tentar desabilitar RLS na tabela subjects
    console.log('\n1. Desabilitando RLS na tabela subjects...')
    const { data: disableRLS, error: disableError } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;' 
      })
    
    if (disableError) {
      console.log('❌ Erro ao desabilitar RLS:', disableError.message)
    } else {
      console.log('✅ RLS desabilitado:', disableRLS)
    }
    
    // 2. Tentar buscar subjects após desabilitar RLS
    console.log('\n2. Tentando buscar subjects após desabilitar RLS...')
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('id, name')
    
    if (subjectsError) {
      console.log('❌ Erro ao buscar subjects:', subjectsError.message)
    } else {
      console.log('✅ Subjects encontrados!')
      console.log('Dados:', subjects)
    }
    
    // 3. Reabilitar RLS
    console.log('\n3. Reabilitando RLS...')
    const { data: enableRLS, error: enableError } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;' 
      })
    
    if (enableError) {
      console.log('❌ Erro ao reabilitar RLS:', enableError.message)
    } else {
      console.log('✅ RLS reabilitado:', enableRLS)
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

fixSubjectsAccess()
