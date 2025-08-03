require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("🔍 Testando simulação da página de flashcards...")

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variáveis de ambiente não configuradas!")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Simular a função getAllSubjects do arquivo actions.ts
async function getAllSubjects() {
  console.log("🔍 [Server Action] getAllSubjects() iniciada")
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

// Simular a função loadSubjects da página de flashcards
async function loadSubjects() {
  try {
    console.log("🔍 [DEBUG] Iniciando loadSubjects...")
    console.log("🔍 [DEBUG] Chamando getAllSubjects()...")
    const subjectsData = await getAllSubjects()
    console.log("📚 [DEBUG] Resposta de getAllSubjects():", subjectsData)
    console.log("📚 [DEBUG] Tipo de subjectsData:", typeof subjectsData)
    console.log("📚 [DEBUG] É array?", Array.isArray(subjectsData))
    console.log("📚 [DEBUG] Length:", subjectsData?.length)
    
    if (subjectsData && Array.isArray(subjectsData)) {
      console.log("✅ [DEBUG] Dados válidos, setando subjects...")
      console.log("✅ [DEBUG] Subjects setados:", subjectsData)
      
      // Se não há subjects, carregar tópicos diretamente
      if (subjectsData.length === 0) {
        console.log("📚 [DEBUG] Nenhum subject encontrado, carregando tópicos diretamente...")
        return []
      }
      
      return subjectsData
    } else {
      console.error("❌ [DEBUG] Dados inválidos:", subjectsData)
      // Carregar tópicos diretamente se não há subjects
      console.log("📚 [DEBUG] Carregando tópicos diretamente devido a dados inválidos...")
      return []
    }
  } catch (error) {
    console.error("❌ [DEBUG] Erro ao carregar matérias:", error)
    console.error("❌ [DEBUG] Stack trace:", error instanceof Error ? error.stack : 'N/A')
    // Carregar tópicos diretamente em caso de erro
    console.log("📚 [DEBUG] Carregando tópicos diretamente devido a erro...")
    return []
  }
}

async function testFlashcardsPage() {
  console.log("🔍 Testando simulação da página de flashcards...")
  
  try {
    const subjects = await loadSubjects()
    
    console.log("📊 Resultado final:")
    console.log("Subjects:", subjects)
    console.log("Length:", subjects.length)
    
    if (subjects && subjects.length > 0) {
      console.log("✅ Subjects carregados com sucesso!")
      subjects.forEach(subject => {
        console.log(`  - ID: ${subject.id}, Nome: ${subject.name}`)
      })
    } else {
      console.log("⚠️ Nenhum subject foi carregado")
    }
    
  } catch (error) {
    console.error("❌ Erro no teste:", error)
  }
}

// Executar o teste
testFlashcardsPage() 