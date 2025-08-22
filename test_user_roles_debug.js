require('dotenv').config({path: '.env.local'});

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 [DEBUG] Testando tabela user_roles especificamente...');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserRolesTable() {
  try {
    console.log('\n🔍 [DEBUG] 1. Verificando estrutura da tabela user_roles...');
    
    // Tentar buscar todos os registros
    const { data: allRoles, error: allError } = await supabase
      .from("user_roles")
      .select("*");
    
    if (allError) {
      console.error('❌ [DEBUG] Erro ao buscar todos os roles:', allError);
    } else {
      console.log('✅ [DEBUG] Total de roles na tabela:', allRoles?.length || 0);
      if (allRoles && allRoles.length > 0) {
        allRoles.forEach((role, index) => {
          console.log(`  ${index + 1}. UUID: ${role.user_uuid}, Role: ${role.role}, Email: ${role.email || 'N/A'}`);
        });
      }
    }
    
    console.log('\n🔍 [DEBUG] 2. Verificando se há roles com email específico...');
    
    // Buscar por email específico
    const { data: emailRoles, error: emailError } = await supabase
      .from("user_roles")
      .select("*")
      .eq("email", "professor@teste.com");
    
    if (emailError) {
      console.error('❌ [DEBUG] Erro ao buscar por email:', emailError);
    } else {
      console.log('✅ [DEBUG] Roles encontrados para professor@teste.com:', emailRoles?.length || 0);
      if (emailRoles && emailRoles.length > 0) {
        emailRoles.forEach(role => {
          console.log(`  - UUID: ${role.user_uuid}, Role: ${role.role}, Email: ${role.email}`);
        });
      }
    }
    
    console.log('\n🔍 [DEBUG] 3. Verificando se há roles com UUID específico...');
    
    // Buscar por UUID específico (do script anterior)
    const { data: uuidRoles, error: uuidError } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_uuid", "7a6999a9-db96-4b08-87f1-cdc48bd4a8d6");
    
    if (uuidError) {
      console.error('❌ [DEBUG] Erro ao buscar por UUID:', uuidError);
    } else {
      console.log('✅ [DEBUG] Roles encontrados para UUID específico:', uuidRoles?.length || 0);
      if (uuidRoles && uuidRoles.length > 0) {
        uuidRoles.forEach(role => {
          console.log(`  - UUID: ${role.user_uuid}, Role: ${role.role}, Email: ${role.email}`);
        });
      }
    }
    
    console.log('\n🔍 [DEBUG] 4. Verificando permissões de leitura...');
    
    // Testar se conseguimos ler a tabela
    try {
      const { count, error: countError } = await supabase
        .from("user_roles")
        .select("*", { count: 'exact', head: true });
      
      if (countError) {
        console.error('❌ [DEBUG] Erro ao contar registros:', countError);
      } else {
        console.log('✅ [DEBUG] Total de registros na tabela (count):', count);
      }
    } catch (e) {
      console.log('ℹ️ [DEBUG] Erro ao contar registros:', e.message);
    }
    
  } catch (error) {
    console.error('❌ [DEBUG] Erro inesperado:', error);
  }
}

testUserRolesTable();
