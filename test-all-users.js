const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wruvehhfzkvmfyhxzmwo.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAllUsers() {
  console.log('🧪 Testando login de todos os usuários...\n');
  
  const users = [
    { email: 'aluno@teste.com', password: '123456', role: 'student' },
    { email: 'admin@teste.com', password: '123456', role: 'admin' },
    { email: 'professor@teste.com', password: '123456', role: 'teacher' }
  ];

  for (const user of users) {
    try {
      console.log(`🔐 Testando login: ${user.email} (${user.role})`);
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: user.email, 
        password: user.password 
      });
      
      if (error) {
        console.log(`❌ Erro: ${error.message}`);
      } else if (data.user) {
        console.log(`✅ Login bem-sucedido!`);
        console.log(`   - ID: ${data.user.id}`);
        console.log(`   - Email: ${data.user.email}`);
        console.log(`   - Confirmado: ${data.user.email_confirmed_at ? 'Sim' : 'Não'}`);
        
        // Buscar perfil
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role, display_name')
          .eq('user_id', data.user.id)
          .single();
          
        if (profile) {
          console.log(`   - Perfil: ${profile.role} (${profile.display_name})`);
        }
      }
      
      // Fazer logout para testar próximo usuário
      await supabase.auth.signOut();
      console.log('');
      
    } catch (err) {
      console.log(`❌ Erro inesperado: ${err.message}`);
      console.log('');
    }
  }
  
  console.log('🎯 Teste concluído!');
}

testAllUsers();
