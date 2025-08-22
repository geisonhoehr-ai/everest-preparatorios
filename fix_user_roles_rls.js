require('dotenv').config({path: '.env.local'});

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 [FIX] Iniciando correção dos user_roles com RLS...');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUserRolesWithRLS() {
  try {
    console.log('\n🔍 [FIX] 1. Tentando inserir role para professor@teste.com...');
    
    // UUID do professor obtido do script anterior
    const professorUUID = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';
    
    // Primeiro, vamos tentar inserir diretamente
    const { data: insertData, error: insertError } = await supabase
      .from('user_roles')
      .insert({
        user_uuid: professorUUID,
        role: 'teacher',
        email: 'professor@teste.com'
      });
    
    if (insertError) {
      console.log('ℹ️ [FIX] Erro na inserção direta (esperado):', insertError.message);
      
      // Tentar usar upsert com onConflict
      console.log('\n🔍 [FIX] 2. Tentando upsert com onConflict...');
      
      const { data: upsertData, error: upsertError } = await supabase
        .from('user_roles')
        .upsert({
          user_uuid: professorUUID,
          role: 'teacher',
          email: 'professor@teste.com'
        }, {
          onConflict: 'user_uuid'
        });
      
      if (upsertError) {
        console.error('❌ [FIX] Erro no upsert:', upsertError);
        
        // Tentar usar uma função RPC se existir
        console.log('\n🔍 [FIX] 3. Tentando usar função RPC...');
        
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('create_user_role', {
            user_uuid: professorUUID,
            user_role: 'teacher',
            user_email: 'professor@teste.com'
          });
        
        if (rpcError) {
          console.log('ℹ️ [FIX] Função RPC não existe:', rpcError.message);
          
          // Última tentativa: verificar se já existe
          console.log('\n🔍 [FIX] 4. Verificando se o role já existe...');
          
          const { data: existingData, error: existingError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_uuid', professorUUID);
          
          if (existingError) {
            console.error('❌ [FIX] Erro ao verificar role existente:', existingError);
          } else {
            console.log('✅ [FIX] Role já existe:', existingData);
          }
        } else {
          console.log('✅ [FIX] Role criado via RPC:', rpcData);
        }
      } else {
        console.log('✅ [FIX] Role criado via upsert:', upsertData);
      }
    } else {
      console.log('✅ [FIX] Role criado diretamente:', insertData);
    }
    
    console.log('\n🔍 [FIX] 5. Verificando resultado final...');
    
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
    
    console.log('\n✅ [FIX] Tentativa de correção dos user_roles concluída!');
    
  } catch (error) {
    console.error('❌ [FIX] Erro inesperado:', error);
  }
}

fixUserRolesWithRLS();
