// Verificar tabela subjects usando SQL direto
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSubjectsSQL() {
  console.log('🔍 Verificando tabela subjects usando SQL direto...')
  
  try {
    // 1. Verificar se a tabela existe
    console.log('\n1. Verificando se a tabela subjects existe...')
    const { data: tableExists, error: tableError } = await supabase
      .rpc('sql', { 
        query: `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'subjects'
        );` 
      })
    
    if (tableError) {
      console.log('❌ Erro ao verificar tabela:', tableError.message)
    } else {
      console.log('✅ Tabela existe:', tableExists)
    }
    
    // 2. Listar todas as tabelas do schema public
    console.log('\n2. Listando todas as tabelas do schema public...')
    const { data: allTables, error: tablesError } = await supabase
      .rpc('sql', { 
        query: `SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          ORDER BY table_name;` 
      })
    
    if (tablesError) {
      console.log('❌ Erro ao listar tabelas:', tablesError.message)
    } else {
      console.log('✅ Tabelas encontradas:', allTables)
    }
    
    // 3. Tentar buscar dados da tabela subjects diretamente
    console.log('\n3. Tentando buscar dados da tabela subjects diretamente...')
    const { data: subjectsData, error: subjectsError } = await supabase
      .rpc('sql', { 
        query: `SELECT id, name FROM subjects ORDER BY name;` 
      })
    
    if (subjectsError) {
      console.log('❌ Erro ao buscar subjects:', subjectsError.message)
    } else {
      console.log('✅ Subjects encontrados:', subjectsData)
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

checkSubjectsSQL()
