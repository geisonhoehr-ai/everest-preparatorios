require('dotenv').config({path: '.env.local'});

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 [FIX] Iniciando correção dos user_roles...');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUserRoles() {
  try {
    console.log('\n🔍 [FIX] 1. Verificando usuários existentes...');
    
    // Primeiro, vamos verificar se os usuários existem
    const { data: users, error: usersError } = await supabase
      .from('auth.users')
      .select('id, email, created_at')
      .in('email', ['aluno@teste.com', 'professor@teste.com', 'admin@test.com']);
    
    if (usersError) {
      console.error('❌ [FIX] Erro ao buscar usuários:', usersError);
      return;
    }
    
    console.log('✅ [FIX] Usuários encontrados:', users?.length || 0);
    if (users && users.length > 0) {
      users.forEach(user => {
        console.log(`  - ID: ${user.id}, Email: ${user.email}, Criado: ${user.created_at}`);
      });
    }
    
    console.log('\n🔍 [FIX] 2. Inserindo roles para usuários...');
    
    // Inserir roles para cada usuário encontrado
    for (const user of users || []) {
      let role = 'student'; // padrão
      
      if (user.email === 'professor@teste.com') {
        role = 'teacher';
      } else if (user.email === 'admin@test.com') {
        role = 'admin';
      }
      
      console.log(`🔍 [FIX] Inserindo role ${role} para ${user.email}...`);
      
      const { data: insertData, error: insertError } = await supabase
        .from('user_roles')
        .upsert({
          user_uuid: user.id,
          role: role,
          email: user.email
        }, {
          onConflict: 'user_uuid'
        });
      
      if (insertError) {
        console.error(`❌ [FIX] Erro ao inserir role para ${user.email}:`, insertError);
      } else {
        console.log(`✅ [FIX] Role ${role} inserido para ${user.email}`);
      }
    }
    
    console.log('\n🔍 [FIX] 3. Verificando resultado...');
    
    // Verificar usuários e roles criados
    const { data: finalRoles, error: finalError } = await supabase
      .from('user_roles')
      .select('user_uuid, role, email');
    
    if (finalError) {
      console.error('❌ [FIX] Erro ao verificar roles finais:', finalError);
    } else {
      console.log('✅ [FIX] Total de roles na tabela:', finalRoles?.length || 0);
      if (finalRoles && finalRoles.length > 0) {
        finalRoles.forEach(role => {
          console.log(`  - UUID: ${role.user_uuid}, Role: ${role.role}, Email: ${role.email}`);
        });
      }
    }
    
    console.log('\n✅ [FIX] Correção dos user_roles concluída!');
    
  } catch (error) {
    console.error('❌ [FIX] Erro inesperado:', error);
  }
}

fixUserRoles();
