// Script JavaScript para criar usuarios via Supabase API
// Execute com: node create-users-js.js

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://your-project.supabase.co'; // Substitua pela sua URL
const supabaseServiceKey = 'your-service-role-key'; // Substitua pela sua service key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUsers() {
    console.log('🚀 Criando usuários...');
    
    const users = [
        { email: 'aluno@teste.com', password: '123456', role: 'student' },
        { email: 'admin@teste.com', password: '123456', role: 'admin' },
        { email: 'professor@teste.com', password: '123456', role: 'teacher' }
    ];

    for (const user of users) {
        try {
            console.log(`📧 Criando usuário: ${user.email}`);
            
            // Criar usuário no auth
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: user.email,
                password: user.password,
                email_confirm: true // Confirmar email automaticamente
            });

            if (authError) {
                console.error(`❌ Erro ao criar usuário ${user.email}:`, authError.message);
                continue;
            }

            console.log(`✅ Usuário ${user.email} criado com ID: ${authData.user.id}`);

            // Criar perfil na tabela user_profiles
            const { error: profileError } = await supabase
                .from('user_profiles')
                .insert({
                    user_id: authData.user.id,
                    role: user.role,
                    display_name: user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1) + ' Teste',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

            if (profileError) {
                console.error(`❌ Erro ao criar perfil para ${user.email}:`, profileError.message);
            } else {
                console.log(`✅ Perfil criado para ${user.email}`);
            }

        } catch (error) {
            console.error(`❌ Erro geral para ${user.email}:`, error.message);
        }
    }

    console.log('🏁 Processo concluído!');
}

// Executar
createUsers().catch(console.error);
