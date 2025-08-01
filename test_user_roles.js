require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("🔍 Verificando tabela user_roles...")

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variáveis de ambiente não configuradas!")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUserRoles() {
  try {
    // 1. Verificar se a tabela user_roles existe e tem dados
    console.log("📋 Verificando tabela user_roles...")
    const { data: userRoles, error: userRolesError } = await supabase
      .from("user_roles")
      .select("*")
    
    if (userRolesError) {
      console.error("❌ Erro ao verificar user_roles:", userRolesError)
      return
    }
    
    console.log("✅ Tabela user_roles encontrada:")
    console.log(`📊 Total de registros: ${userRoles?.length || 0}`)
    
    if (userRoles && userRoles.length > 0) {
      userRoles.forEach((role, index) => {
        console.log(`  ${index + 1}. UUID: ${role.user_uuid}, Role: ${role.role}`)
      })
    } else {
      console.log("⚠️ Nenhum usuário encontrado na tabela user_roles")
    }
    
    // 2. Verificar usuários autenticados
    console.log("\n🔐 Verificando usuários autenticados...")
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error("❌ Erro ao verificar usuário autenticado:", authError)
    } else if (user) {
      console.log("✅ Usuário autenticado encontrado:")
      console.log(`  👤 ID: ${user.id}`)
      console.log(`  📧 Email: ${user.email}`)
      
      // 3. Verificar se este usuário tem role na tabela
      const { data: userRole, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_uuid", user.id)
        .single()
      
      if (roleError) {
        console.error("❌ Erro ao verificar role do usuário:", roleError)
        console.log("💡 O usuário não tem role na tabela user_roles")
      } else {
        console.log(`✅ Role do usuário: ${userRole.role}`)
      }
    } else {
      console.log("⚠️ Nenhum usuário autenticado")
    }
    
  } catch (error) {
    console.error("❌ Erro no teste:", error)
  }
}

checkUserRoles() 