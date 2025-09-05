const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wruvehhfzkvmfyhxzmwo.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE0NDcxOCwiZXhwIjoyMDY4NzIwNzE4fQ.8QZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function confirmUsers() {
  console.log('Confirmando usuários com service role key...');
  
  const users = [
    { email: 'aluno@teste.com', password: '123456' },
    { email: 'admin@teste.com', password: '123456' },
    { email: 'professor@teste.com', password: '123456' }
  ];

  for (const user of users) {
    try {
      console.log(`Confirmando ${user.email}...`);
      
      // Buscar o usuário
      const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(user.email);
      
      if (userError) {
        console.error(`Erro ao buscar ${user.email}:`, userError.message);
        continue;
      }

      if (userData.user) {
        // Atualizar o usuário para confirmado
        const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
          userData.user.id,
          {
            email_confirm: true,
            email_confirmed_at: new Date().toISOString()
          }
        );

        if (updateError) {
          console.error(`Erro ao confirmar ${user.email}:`, updateError.message);
        } else {
          console.log(`✅ ${user.email} confirmado com sucesso!`);
        }
      }
    } catch (err) {
      console.error(`Erro inesperado para ${user.email}:`, err);
    }
  }
}

confirmUsers();