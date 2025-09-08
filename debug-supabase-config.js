// Debug da configuração do Supabase
const { createClient } = require('@supabase/supabase-js')

// Verificar variáveis de ambiente
console.log('🔍 Verificando configuração do Supabase...')
console.log('NODE_ENV:', process.env.NODE_ENV)

// URLs e chaves hardcoded (como no código)
const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key (primeiros 20 chars):', supabaseKey.substring(0, 20) + '...')

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugSupabase() {
  console.log('\n=== TESTANDO CONEXÃO ===')
  
  try {
    // Testar conexão básica
    const { data, error } = await supabase
      .from('_supabase_migrations')
      .select('*')
      .limit(1)
    
    console.log('Conexão básica:', error ? '❌ Falhou' : '✅ OK', error?.message)
  } catch (err) {
    console.log('Erro de conexão:', err.message)
  }
  
  console.log('\n=== TESTANDO TABELAS COM DIFERENTES ABORDAGENS ===')
  
  // Tentar acessar tabelas de diferentes formas
  const tables = ['subjects', 'topics', 'flashcards', 'quizzes', 'user_profiles']
  
  for (const table of tables) {
    try {
      console.log(`\n--- Testando ${table} ---`)
      
      // Tentar 1: Select simples
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`)
        
        // Tentar 2: Apenas verificar se a tabela existe
        const { data: schemaData, error: schemaError } = await supabase
          .rpc('get_table_info', { table_name: table })
        
        console.log(`   Schema check:`, schemaError ? '❌' : '✅', schemaError?.message)
      } else {
        console.log(`✅ ${table}: Acessível (${data?.length || 0} registros)`)
      }
    } catch (err) {
      console.log(`❌ ${table}: Erro inesperado - ${err.message}`)
    }
  }
  
  console.log('\n=== TESTANDO AUTENTICAÇÃO ===')
  
  // Verificar se há sessão ativa
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  console.log('Sessão ativa:', session ? '✅ Sim' : '❌ Não', sessionError?.message)
  
  if (session) {
    console.log('User ID:', session.user.id)
    console.log('Email:', session.user.email)
  }
}

debugSupabase().catch(console.error)
