// Teste da função getAllSubjects diretamente
const { createClient } = require('@supabase/supabase-js')

// Simular a função getAllSubjects do actions.ts
async function getAllSubjects() {
  console.log("🔍 [Server Action] getAllSubjects() iniciada")
  
  const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  console.log("🔍 [Server Action] Supabase client obtido")
  
  try {
    const { data, error } = await supabase.from("subjects").select("id, name").order("name")
    console.log("🔍 [Server Action] Query executada, data:", data, "error:", error)
      
    if (error) {
      console.error("❌ [Server Action] Erro ao buscar matérias:", error)
      return []
    }
    
    console.log("✅ [Server Action] Matérias encontradas:", data)
    return data || []
  } catch (error) {
    console.error("❌ [Server Action] Erro inesperado em getAllSubjects:", error)
    return []
  }
}

// Executar teste
async function test() {
  console.log('🧪 Testando getAllSubjects...')
  const result = await getAllSubjects()
  console.log('📊 Resultado final:', result)
  console.log('📊 Tipo:', typeof result)
  console.log('📊 É array:', Array.isArray(result))
  console.log('📊 Tamanho:', result?.length || 0)
}

test()
