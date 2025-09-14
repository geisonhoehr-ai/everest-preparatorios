const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMembrosPage() {
  console.log('🧪 Testando página de membros...');

  try {
    // Testar getAllMembers
    console.log('\n1. Testando getAllMembers...');
    const { data: members, error: membersError } = await supabase
      .from('user_profiles')
      .select(`
        *,
        student_subscriptions (
          *,
          classes (*),
          access_plans (*)
        )
      `);

    if (membersError) {
      console.error('❌ Erro ao buscar membros:', membersError);
    } else {
      console.log(`✅ Membros encontrados: ${members?.length || 0}`);
      if (members && members.length > 0) {
        console.log('👤 Primeiro membro:', {
          id: members[0].id,
          display_name: members[0].display_name,
          role: members[0].role,
          email: members[0].email
        });
      }
    }

    // Testar getAllClasses
    console.log('\n2. Testando getAllClasses...');
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('*');

    if (classesError) {
      console.error('❌ Erro ao buscar classes:', classesError);
    } else {
      console.log(`✅ Classes encontradas: ${classes?.length || 0}`);
    }

    // Testar getAllAccessPlans
    console.log('\n3. Testando getAllAccessPlans...');
    const { data: plans, error: plansError } = await supabase
      .from('access_plans')
      .select('*');

    if (plansError) {
      console.error('❌ Erro ao buscar planos:', plansError);
    } else {
      console.log(`✅ Planos encontrados: ${plans?.length || 0}`);
    }

    // Verificar se há dados para mostrar
    console.log('\n📊 Resumo:');
    console.log(`- Membros: ${members?.length || 0}`);
    console.log(`- Classes: ${classes?.length || 0}`);
    console.log(`- Planos: ${plans?.length || 0}`);

    if ((members?.length || 0) === 0) {
      console.log('\n⚠️  ATENÇÃO: Nenhum membro encontrado!');
      console.log('📝 Execute o SQL: fix-membros-urgente.sql');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testMembrosPage().catch(console.error);
