const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testAuthRole() {
  console.log('🧪 [TESTE] Testando autenticação e role...')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    // 1. Simular busca de role como o código faz
    console.log('🔍 [TESTE] Simulando busca de role para professor@teste.com...')
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_uuid', 'professor@teste.com')
      .single()

    if (roleError) {
      console.error('❌ [TESTE] Erro ao buscar role:', roleError)
      return
    }

    console.log('✅ [TESTE] Role encontrado:', roleData)

    // 2. Verificar se o role é 'teacher' ou 'admin'
    const isTeacher = roleData.role === 'teacher' || roleData.role === 'admin'
    console.log(`👨‍🏫 [TESTE] É professor? ${isTeacher}`)

    // 3. Simular os itens do menu que seriam exibidos
    if (isTeacher) {
      console.log('📋 [TESTE] Itens do menu para professor:')
      const teacherMenuItems = [
        'Dashboard (/teacher)',
        'Cursos (/cursos)',
        'Aulas (externo)',
        'Flashcards (/flashcards)',
        'Quiz (/quiz)',
        'Provas (/provas)',
        'Acervo Digital (/livros)',
        'Redação (/redacao)',
        'Membros (/membros)',
        'Turmas (/turmas)',
        'Comunidade (/community)',
        'Calendário (/calendario)',
        'Suporte (/suporte)'
      ]
      
      teacherMenuItems.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item}`)
      })
    } else {
      console.log('📋 [TESTE] Itens do menu para estudante:')
      const studentMenuItems = [
        'Dashboard (/dashboard)',
        'Aulas (externo)',
        'Flashcards (/flashcards)',
        'Quiz (/quiz)',
        'Provas (/provas)',
        'Acervo Digital (/livros)',
        'Redação (/redacao)',
        'Comunidade (/community)',
        'Calendário (/calendario)',
        'Suporte (/suporte)'
      ]
      
      studentMenuItems.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item}`)
      })
    }

    // 4. Verificar se há outros usuários na tabela
    console.log('👥 [TESTE] Verificando todos os usuários...')
    const { data: allUsers, error: usersError } = await supabase
      .from('user_roles')
      .select('*')

    if (usersError) {
      console.error('❌ [TESTE] Erro ao buscar usuários:', usersError)
    } else {
      console.log('📊 [TESTE] Todos os usuários:')
      allUsers.forEach(user => {
        console.log(`   - ${user.user_uuid} (${user.role})`)
      })
    }

    console.log('🎉 [TESTE] Teste concluído!')

  } catch (error) {
    console.error('❌ [TESTE] Erro geral:', error)
  }
}

testAuthRole() 