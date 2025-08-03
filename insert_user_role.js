const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function insertUserRole() {
  // Verificar variáveis de ambiente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Variáveis de ambiente do Supabase não encontradas")
    console.log("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅" : "❌")
    console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseKey ? "✅" : "❌")
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // UUID do usuário que aparece nos logs
  const userUuid = "7a6999a9-db96-4b08-87f1-cdc48bd4a8d6"

  console.log("🔍 [DEBUG] Inserindo role para usuário:", userUuid)

  try {
    // Inserir role de professor
    const { data, error } = await supabase
      .from("user_roles")
      .upsert({
        user_uuid: userUuid,
        role: "teacher"
      })
      .select()

    if (error) {
      console.error("❌ [DEBUG] Erro ao inserir role:", error)
      return
    }

    console.log("✅ [DEBUG] Role inserida com sucesso:", data)
    
    // Verificar se foi inserido
    const { data: checkData, error: checkError } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_uuid", userUuid)
      .single()

    if (checkError) {
      console.error("❌ [DEBUG] Erro ao verificar role:", checkError)
      return
    }

    console.log("✅ [DEBUG] Role verificada:", checkData)

  } catch (error) {
    console.error("❌ [DEBUG] Erro inesperado:", error)
  }
}

insertUserRole() 