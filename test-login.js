// Script para testar o login após transformação
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
    console.log('🧪 Testando sistema de login após transformação...\n');

    const testUsers = [
        { email: 'aluno@teste.com', password: '123456', expectedRole: 'student' },
        { email: 'admin@teste.com', password: '123456', expectedRole: 'admin' },
        { email: 'professor@teste.com', password: '123456', expectedRole: 'teacher' }
    ];

    for (const user of testUsers) {
        try {
            console.log(`🔐 Testando login: ${user.email}`);
            
            // Tentar fazer login
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: user.password
            });

            if (authError) {
                console.log(`❌ Erro no login: ${authError.message}`);
                continue;
            }

            console.log(`✅ Login bem-sucedido para ${user.email}`);

            // Buscar perfil do usuário
            const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('role, display_name')
                .eq('user_id', authData.user.id)
                .single();

            if (profileError) {
                console.log(`❌ Erro ao buscar perfil: ${profileError.message}`);
            } else {
                console.log(`✅ Perfil encontrado: ${profile.display_name} (${profile.role})`);
                
                if (profile.role === user.expectedRole) {
                    console.log(`✅ Role correto: ${profile.role}`);
                } else {
                    console.log(`❌ Role incorreto. Esperado: ${user.expectedRole}, Encontrado: ${profile.role}`);
                }
            }

            // Fazer logout
            await supabase.auth.signOut();
            console.log(`🚪 Logout realizado\n`);

        } catch (error) {
            console.log(`❌ Erro inesperado para ${user.email}: ${error.message}\n`);
        }
    }

    console.log('🏁 Teste concluído!');
}

// Executar teste
testLogin().catch(console.error);
