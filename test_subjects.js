require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("🔍 Configuração do Supabase:")
console.log("URL:", supabaseUrl ? "✅ Configurada" : "❌ Não configurada")
console.log("Key:", supabaseKey ? "✅ Configurada" : "❌ Não configurada")

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variáveis de ambiente não configuradas!")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testGetAllSubjects() {
  console.log("🔍 Testando getAllSubjects...")
  
  try {
    // Teste direto: Tentar buscar dados da tabela subjects
    console.log("📋 Tentando buscar dados da tabela subjects...")
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('id, name')
      .order('name')
    
    if (subjectsError) {
      console.error("❌ Erro ao buscar subjects:", subjectsError)
      console.error("❌ Código do erro:", subjectsError.code)
      console.error("❌ Mensagem:", subjectsError.message)
      console.error("❌ Detalhes:", subjectsError.details)
      
      // Se for erro de RLS, tentar com autenticação
      if (subjectsError.code === '42501') {
        console.log("🔍 Tentando com autenticação...")
        // Aqui poderíamos tentar autenticar o usuário
      }
      return
    }
    
    console.log("✅ Subjects encontrados:", subjects)
    console.log("📊 Total de subjects:", subjects.length)
    
    if (subjects && subjects.length > 0) {
      console.log("📋 Lista de subjects:")
      subjects.forEach(subject => {
        console.log(`  - ID: ${subject.id}, Nome: ${subject.name}`)
      })
    } else {
      console.log("⚠️ Nenhum subject encontrado na tabela")
    }
    
  } catch (error) {
    console.error("❌ Erro inesperado:", error)
  }
}

// Executar o teste
testGetAllSubjects() 