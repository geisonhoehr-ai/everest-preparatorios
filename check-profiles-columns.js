// Verificar colunas da tabela profiles
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProfilesColumns() {
  console.log('🔍 Verificando colunas da tabela profiles...')
  
  try {
    // Tentar buscar apenas o ID primeiro
    console.log('\n📋 Tentando buscar apenas ID...')
    const { data: idData, error: idError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    if (idError) {
      console.log('❌ Erro ao buscar ID:', idError.message)
    } else {
      console.log('✅ ID encontrado:', idData)
    }
    
    // Tentar diferentes combinações de colunas
    const possibleColumns = [
      'id', 'user_id', 'email', 'name', 'role', 'created_at', 'updated_at',
      'username', 'full_name', 'user_role', 'profile_data', 'metadata'
    ]
    
    console.log('\n📋 Testando colunas possíveis...')
    for (const column of possibleColumns) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(column)
          .limit(1)
        
        if (error) {
          console.log(`❌ ${column}: ${error.message}`)
        } else {
          console.log(`✅ ${column}: Disponível`)
        }
      } catch (err) {
        console.log(`❌ ${column}: ${err.message}`)
      }
    }
    
    // Tentar buscar todas as colunas
    console.log('\n📋 Tentando buscar todas as colunas...')
    const { data: allData, error: allError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (allError) {
      console.log('❌ Erro ao buscar todas as colunas:', allError.message)
    } else {
      console.log('✅ Todas as colunas:', allData)
    }
    
  } catch (err) {
    console.log('❌ Erro geral:', err.message)
  }
}

checkProfilesColumns().catch(console.error)
