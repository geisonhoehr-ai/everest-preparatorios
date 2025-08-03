require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("🔍 Testando permissões de professor...")

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variáveis de ambiente não configuradas!")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Simular a função checkTeacherOrAdminAccess
async function checkTeacherOrAdminAccess(userUuid) {
  console.log(`🔍 [Server Action] Verificando acesso de professor/admin para: ${userUuid}`)

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_uuid", userUuid)
    .single()

  if (error) {
    console.error("❌ [Server Action] Erro ao verificar role:", error)
    return false
  }

  const hasAccess = data?.role === "teacher" || data?.role === "admin"
  console.log(`✅ [Server Action] Acesso ${hasAccess ? 'permitido' : 'negado'} para role: ${data?.role}`)
  return hasAccess
}

// Simular a função updateFlashcard
async function updateFlashcard(userUuid, flashcardId, question, answer) {
  console.log(`📝 [Server Action] Atualizando flashcard: ${flashcardId}`)

  // Verificar se o usuário tem acesso
  const hasAccess = await checkTeacherOrAdminAccess(userUuid)
  if (!hasAccess) {
    console.error("❌ [Server Action] Acesso negado para atualizar flashcard")
    return { success: false, error: "Acesso negado" }
  }

  const { data: updatedFlashcard, error } = await supabase
    .from("flashcards")
    .update({
      question: question.trim(),
      answer: answer.trim()
    })
    .eq("id", flashcardId)
    .select()
    .single()

  if (error) {
    console.error("❌ [Server Action] Erro ao atualizar flashcard:", error)
    return { success: false, error: error.message }
  }

  console.log(`✅ [Server Action] Flashcard atualizado: ${updatedFlashcard.id}`)
  return { success: true, data: updatedFlashcard }
}

async function testTeacherPermissions() {
  console.log("🔍 Testando permissões de professor...")
  
  try {
    // Primeiro, vamos verificar se há usuários na tabela user_roles
    console.log("📋 Verificando usuários na tabela user_roles...")
    const { data: users, error: usersError } = await supabase
      .from("user_roles")
      .select("user_uuid, role")
      .order("role")
    
    if (usersError) {
      console.error("❌ Erro ao buscar usuários:", usersError)
      return
    }
    
    console.log("📊 Usuários encontrados:")
    users.forEach(user => {
      console.log(`  - UUID: ${user.user_uuid}, Role: ${user.role}`)
    })
    
    // Testar com o primeiro usuário teacher encontrado
    const teacherUser = users.find(u => u.role === "teacher")
    if (!teacherUser) {
      console.log("⚠️ Nenhum usuário teacher encontrado")
      return
    }
    
    console.log(`🔍 Testando com usuário teacher: ${teacherUser.user_uuid}`)
    
    // Testar permissões
    const hasAccess = await checkTeacherOrAdminAccess(teacherUser.user_uuid)
    console.log(`✅ Permissões: ${hasAccess ? 'Acesso permitido' : 'Acesso negado'}`)
    
    // Testar atualização de flashcard
    const { data: flashcards, error: flashcardsError } = await supabase
      .from("flashcards")
      .select("id, question, answer")
      .limit(1)
    
    if (flashcardsError) {
      console.error("❌ Erro ao buscar flashcards:", flashcardsError)
      return
    }
    
    console.log("📊 Flashcards encontrados:", flashcards)
    
    if (flashcards && flashcards.length > 0) {
      const flashcard = flashcards[0]
      console.log(`🔍 Testando atualização do flashcard ID: ${flashcard.id}`)
      
      // Primeiro, verificar se o flashcard existe
      const { data: existingFlashcard, error: checkError } = await supabase
        .from("flashcards")
        .select("id, question, answer")
        .eq("id", flashcard.id)
        .single()
      
      if (checkError) {
        console.error("❌ Erro ao verificar flashcard:", checkError)
        return
      }
      
      console.log("✅ Flashcard encontrado:", existingFlashcard)
      
      const result = await updateFlashcard(teacherUser.user_uuid, flashcard.id, "Pergunta de teste atualizada", "Resposta de teste atualizada")
      
      console.log("📊 Resultado da atualização:", result)
    } else {
      console.log("⚠️ Nenhum flashcard encontrado para teste")
    }
    
  } catch (error) {
    console.error("❌ Erro no teste:", error)
  }
}

// Executar o teste
testTeacherPermissions() 