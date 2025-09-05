const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const SUPABASE_URL = 'https://wruvehhfzkvmfyhxzmwo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ';

async function checkSupabaseDirect() {
  try {
    console.log('🔍 Verificação direta do Supabase...\n');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // 1. Verificar se conseguimos conectar
    console.log('🌐 TESTANDO CONEXÃO:');
    console.log('====================');
    console.log(`URL: ${SUPABASE_URL}`);
    console.log(`Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
    
    // 2. Tentar fazer login com professor@teste.com (que sabemos que funciona)
    console.log('\n🔐 TESTANDO LOGIN ESPECÍFICO:');
    console.log('==============================');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'professor@teste.com',
      password: '123456'
    });
    
    if (loginError) {
      console.log(`❌ Erro no login: ${loginError.message}`);
      console.log(`📋 Código: ${loginError.status}`);
    } else {
      console.log(`✅ Login bem-sucedido!`);
      console.log(`🆔 User ID: ${loginData.user.id}`);
      console.log(`📧 Email: ${loginData.user.email}`);
      console.log(`📅 Criado: ${new Date(loginData.user.created_at).toLocaleString('pt-BR')}`);
      console.log(`📧 Email confirmado: ${loginData.user.email_confirmed_at ? 'Sim' : 'Não'}`);
      
      // 3. Agora que estamos logados, tentar acessar user_profiles
      console.log('\n📋 ACESSANDO user_profiles:');
      console.log('============================');
      
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*');
      
      if (profilesError) {
        console.log(`❌ Erro ao buscar perfis: ${profilesError.message}`);
        console.log(`📋 Código: ${profilesError.code}`);
        console.log(`📋 Detalhes: ${profilesError.details}`);
      } else {
        console.log(`✅ Perfis encontrados: ${profiles.length}`);
        profiles.forEach((profile, index) => {
          console.log(`${index + 1}. ${profile.display_name} (${profile.role})`);
          console.log(`   🆔 ID: ${profile.id}`);
          console.log(`   👤 User ID: ${profile.user_id}`);
        });
      }
      
      // 4. Verificar se o usuário atual tem perfil
      console.log('\n🔍 VERIFICANDO PERFIL ATUAL:');
      console.log('=============================');
      
      const { data: currentProfile, error: currentProfileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', loginData.user.id)
        .single();
      
      if (currentProfileError) {
        if (currentProfileError.code === 'PGRST116') {
          console.log('⚠️  Usuário não tem perfil na tabela user_profiles');
          console.log('💡 Tentando criar perfil...');
          
          const { data: newProfile, error: newProfileError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: loginData.user.id,
              role: 'teacher',
              display_name: 'Professor Teste'
            })
            .select();
          
          if (newProfileError) {
            console.log(`❌ Erro ao criar perfil: ${newProfileError.message}`);
            console.log(`📋 Código: ${newProfileError.code}`);
          } else {
            console.log('✅ Perfil criado com sucesso!');
            console.log('📋 Dados:', newProfile);
          }
        } else {
          console.log(`❌ Erro ao verificar perfil: ${currentProfileError.message}`);
        }
      } else {
        console.log('✅ Perfil encontrado:');
        console.log(`   📝 Nome: ${currentProfile.display_name}`);
        console.log(`   🎭 Role: ${currentProfile.role}`);
        console.log(`   🆔 ID: ${currentProfile.id}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkSupabaseDirect();
