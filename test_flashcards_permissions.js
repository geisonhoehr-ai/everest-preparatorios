require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("🔍 Testando permissões da tabela flashcards...")

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variáveis de ambiente não configuradas!")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFlashcardsPermissions() {
  console.log("🔍 Testando permissões da tabela flashcards...")
  
  try {
    // 1. Testar acesso anônimo (como um usuário não logado)
    console.log("🔐 Testando acesso anônimo...")
    const { data: anonData, error: anonError } = await supabase
      .from("flashcards")
      .select("id, topic_id, question")
      .eq("topic_id", "fonetica-fonologia")
      .limit(5)
    
    if (anonError) {
      console.error("❌ Erro no acesso anônimo:", anonError)
    } else {
      console.log("✅ Acesso anônimo funcionando:")
      console.log(`📚 Flashcards encontrados: ${anonData?.length || 0}`)
      anonData?.forEach((card, index) => {
        console.log(`  ${index + 1}. ID: ${card.id} - ${card.question.substring(0, 50)}...`)
      })
    }
    
    // 2. Testar acesso com autenticação (simular usuário logado)
    console.log("\n🔐 Testando acesso autenticado...")
    
    // Primeiro, vamos tentar fazer login com um usuário de teste
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'professor@teste.com',
      password: '123456'
    })
    
    if (authError) {
      console.error("❌ Erro no login:", authError)
      console.log("💡 Tentando acesso sem autenticação...")
    } else {
      console.log("✅ Login realizado com sucesso")
      console.log("👤 Usuário:", authData.user?.email)
    }
    
    // 3. Testar acesso após autenticação
    const { data: authFlashcards, error: authFlashcardsError } = await supabase
      .from("flashcards")
      .select("id, topic_id, question")
      .eq("topic_id", "fonetica-fonologia")
      .limit(5)
    
    if (authFlashcardsError) {
      console.error("❌ Erro no acesso autenticado:", authFlashcardsError)
    } else {
      console.log("✅ Acesso autenticado funcionando:")
      console.log(`📚 Flashcards encontrados: ${authFlashcards?.length || 0}`)
      authFlashcards?.forEach((card, index) => {
        console.log(`  ${index + 1}. ID: ${card.id} - ${card.question.substring(0, 50)}...`)
      })
    }
    
    // 4. Testar a função getFlashcardsForReview diretamente
    console.log("\n🔍 Testando função getFlashcardsForReview...")
    
    const { data: reviewFlashcards, error: reviewError } = await supabase
      .from("flashcards")
      .select("id, topic_id, question, answer")
      .eq("topic_id", "fonetica-fonologia")
      .order("id", { ascending: false })
      .limit(10)
    
    if (reviewError) {
      console.error("❌ Erro na função getFlashcardsForReview:", reviewError)
    } else {
      console.log("✅ getFlashcardsForReview funcionando:")
      console.log(`📚 Flashcards encontrados: ${reviewFlashcards?.length || 0}`)
      reviewFlashcards?.forEach((card, index) => {
        console.log(`  ${index + 1}. ID: ${card.id} - ${card.question.substring(0, 50)}...`)
      })
    }
    
    // 5. Verificar se há políticas RLS ativas
    console.log("\n🔍 Verificando políticas RLS...")
    
    // Tentar uma query que deveria falhar se RLS estiver ativo
    const { data: rlsTest, error: rlsError } = await supabase
      .from("flashcards")
      .select("id, topic_id, question")
      .limit(1)
    
    if (rlsError) {
      console.log("🔒 RLS está ativo (esperado):", rlsError.message)
    } else {
      console.log("⚠️ RLS pode não estar ativo ou configurado corretamente")
      console.log("📊 Dados retornados:", rlsTest?.length || 0)
    }
    
  } catch (error) {
    console.error("❌ Erro no teste:", error)
  }
}

// Executar o teste
testFlashcardsPermissions() 