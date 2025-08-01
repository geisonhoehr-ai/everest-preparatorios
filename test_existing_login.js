require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

async function testExistingLogin() {
  console.log('🔍 [EXISTING LOGIN] Testando login com usuários existentes...');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // Listar usuários existentes
    console.log('🔧 [EXISTING LOGIN] Verificando usuários existentes...');
    
    const { data: existingUsers, error: existingError } = await supabase
      .from('user_roles')
      .select('*');

    if (existingError) {
      console.error('❌ [EXISTING LOGIN] Erro ao buscar usuários:', existingError.message);
      return;
    }

    console.log('✅ [EXISTING LOGIN] Usuários encontrados:', existingUsers?.length || 0);
    
    if (existingUsers && existingUsers.length > 0) {
      console.log('📋 [EXISTING LOGIN] Usuários disponíveis:');
      existingUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.user_uuid} (${user.role})`);
      });

      // Tentar login com o primeiro usuário (admin)
      const testUser = existingUsers[0];
      console.log(`🔧 [EXISTING LOGIN] Tentando login com: ${testUser.user_uuid}`);
      
      // Vou tentar com uma senha comum
      const testPassword = '123456';
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testUser.user_uuid,
        password: testPassword
      });

      if (error) {
        console.error('❌ [EXISTING LOGIN] Erro no login:', error.message);
        console.error('❌ [EXISTING LOGIN] Código do erro:', error.status);
        
        // Tentar com outra senha comum
        console.log('🔧 [EXISTING LOGIN] Tentando com senha alternativa...');
        const { data: data2, error: error2 } = await supabase.auth.signInWithPassword({
          email: testUser.user_uuid,
          password: 'password'
        });

        if (error2) {
          console.error('❌ [EXISTING LOGIN] Erro com senha alternativa:', error2.message);
        } else {
          console.log('✅ [EXISTING LOGIN] Login bem-sucedido com senha alternativa!');
          console.log('👤 [EXISTING LOGIN] Usuário logado:', data2.user?.email);
        }
      } else {
        console.log('✅ [EXISTING LOGIN] Login bem-sucedido!');
        console.log('👤 [EXISTING LOGIN] Usuário logado:', data.user?.email);
        console.log('🆔 [EXISTING LOGIN] ID:', data.user?.id);
      }
    }

  } catch (error) {
    console.error('❌ [EXISTING LOGIN] Erro inesperado:', error);
  }
}

testExistingLogin(); 