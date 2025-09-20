const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function corrigirTabelaUsers() {
  console.log('🔧 Corrigindo tabela users...');
  
  try {
    // Remover a coluna password_hash se existir
    console.log('🗑️ Removendo coluna password_hash...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE users DROP COLUMN IF EXISTS password_hash;'
    });
    
    if (dropError) {
      console.log('⚠️ Erro ao remover password_hash (pode não existir):', dropError.message);
    } else {
      console.log('✅ Coluna password_hash removida');
    }

    // Agora criar os usuários corretamente
    console.log('👥 Criando usuários na tabela users...');
    
    const usuarios = [
      {
        id: '5e5948c3-0180-4a29-808d-b32cb4726a0d', // ID do admin@teste.com
        email: 'admin@teste.com',
        first_name: 'Admin',
        last_name: 'Teste',
        role: 'administrator',
        is_active: true
      },
      {
        id: '2b079605-0b51-4b87-8463-63a190254c39', // ID do professor@teste.com
        email: 'professor@teste.com',
        first_name: 'Professor',
        last_name: 'Teste',
        role: 'teacher',
        is_active: true
      },
      {
        id: '8cc9005c-e201-43d7-a474-d683b823b7ee', // ID do aluno@teste.com
        email: 'aluno@teste.com',
        first_name: 'Aluno',
        last_name: 'Teste',
        role: 'student',
        is_active: true
      }
    ];

    for (const usuario of usuarios) {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          ...usuario,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.log(`❌ Erro ao criar ${usuario.email}:`, error.message);
      } else {
        console.log(`✅ Usuário criado: ${usuario.email} (${usuario.role})`);
      }
    }

    // Verificar resultado final
    console.log('\n👥 Usuários finais na tabela users:');
    const { data: users, error } = await supabase
      .from('users')
      .select('*');

    if (error) {
      console.log('❌ Erro ao verificar usuários:', error.message);
    } else {
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.role}) - ${user.first_name} ${user.last_name} - Ativo: ${user.is_active}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

corrigirTabelaUsers().catch(console.error);
