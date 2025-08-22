require('dotenv').config({path: '.env.local'});

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 [DEBUG] Testando getAllSubjects e roles...');
console.log('URL:', supabaseUrl ? '✅' : '❌');
console.log('KEY:', supabaseKey ? '✅' : '❌');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSubjectsAndRoles() {
  try {
    console.log('\n🔍 [DEBUG] 1. Testando tabela subjects...');
    
    const { data: subjects, error: subjectsError } = await supabase
      .from("subjects")
      .select("id, name")
      .order("name");
    
    if (subjectsError) {
      console.error('❌ [DEBUG] Erro na tabela subjects:', subjectsError);
      return;
    }
    
    console.log('✅ [DEBUG] Subjects encontrados:', subjects?.length || 0);
    if (subjects && subjects.length > 0) {
      subjects.forEach(subject => {
        console.log(`  - ID: ${subject.id}, Nome: ${subject.name}`);
      });
    }
    
    console.log('\n🔍 [DEBUG] 2. Testando tabela user_roles...');
    
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_uuid, role, email")
      .limit(5);
    
    if (rolesError) {
      console.error('❌ [DEBUG] Erro na tabela user_roles:', rolesError);
    } else {
      console.log('✅ [DEBUG] Roles encontrados:', roles?.length || 0);
      if (roles && roles.length > 0) {
        roles.forEach(role => {
          console.log(`  - UUID: ${role.user_uuid}, Role: ${role.role}, Email: ${role.email || 'N/A'}`);
        });
      }
    }
    
    console.log('\n🔍 [DEBUG] 3. Testando tabela auth.users...');
    
    // Tentar buscar usuários autenticados (pode não funcionar com anon key)
    try {
      const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) {
        console.log('ℹ️ [DEBUG] Não é possível listar usuários com anon key (normal)');
      } else {
        console.log('✅ [DEBUG] Usuários auth encontrados:', users?.length || 0);
      }
    } catch (e) {
      console.log('ℹ️ [DEBUG] Erro ao acessar auth.users (esperado com anon key)');
    }
    
    console.log('\n🔍 [DEBUG] 4. Testando permissões...');
    
    // Testar se conseguimos inserir na tabela user_roles (deve falhar com anon key)
    try {
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({ user_uuid: 'test', role: 'student' });
      
      if (insertError) {
        console.log('✅ [DEBUG] Inserção bloqueada (RLS funcionando):', insertError.message);
      } else {
        console.log('⚠️ [DEBUG] Inserção permitida (RLS pode não estar funcionando)');
      }
    } catch (e) {
      console.log('ℹ️ [DEBUG] Erro ao testar inserção:', e.message);
    }
    
  } catch (error) {
    console.error('❌ [DEBUG] Erro inesperado:', error);
  }
}

testSubjectsAndRoles();
