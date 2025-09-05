// Script simples para testar login
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
    console.log('Testando login simples...\n');

    try {
        console.log('Tentando login com aluno@teste.com...');
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'aluno@teste.com',
            password: '123456'
        });

        if (error) {
            console.log('Erro:', error.message);
            console.log('Código:', error.status);
            console.log('Detalhes:', error);
        } else {
            console.log('Sucesso! Usuário logado:', data.user.email);
            console.log('ID:', data.user.id);
            console.log('Email confirmado:', data.user.email_confirmed_at);
        }

    } catch (error) {
        console.log('Erro inesperado:', error.message);
    }
}

// Executar teste
testLogin().catch(console.error);
