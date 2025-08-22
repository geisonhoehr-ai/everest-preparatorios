require('dotenv').config({path: '.env.local'});

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 [FIX] Iniciando correção direta dos user_roles...');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUserRolesDirect() {
  try {
    console.log('\n🔍 [FIX] 1. Inserindo role para professor@teste.com...');
    
    // UUID do professor obtido do script anterior
    const professorUUID = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';
    
    const { data: insertData, error: insertError } = await supabase
      .from('user_roles')
      .upsert({
        user_uuid: professorUUID,
        role: 'teacher',
        email: 'professor@teste.com'
      }, {
        onConflict: 'user_uuid'
      });
    
    if (insertError) {
      console.error('❌ [FIX] Erro ao inserir role do professor:', insertError);
      return;
    }
    
    console.log('✅ [FIX] Role do professor inserido com sucesso!');
    
    console.log('\n🔍 [FIX] 2. Inserindo role para aluno@teste.com...');
    
    // UUID do aluno (vou usar um UUID genérico por enquanto)
    const alunoUUID = '00000000-0000-0000-0000-000000000001';
    
    const { data: insertAlunoData, error: insertAlunoError } = await supabase
      .from('user_roles')
      .upsert({
        user_uuid: alunoUUID,
        role: 'student',
        email: 'aluno@teste.com'
      }, {
        onConflict: 'user_uuid'
      });
    
    if (insertAlunoError) {
      console.error('❌ [FIX] Erro ao inserir role do aluno:', insertAlunoError);
    } else {
      console.log('✅ [FIX] Role do aluno inserido com sucesso!');
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
    
    console.log('\n✅ [FIX] Correção direta dos user_roles concluída!');
    
  } catch (error) {
    console.error('❌ [FIX] Erro inesperado:', error);
  }
}

fixUserRolesDirect();
