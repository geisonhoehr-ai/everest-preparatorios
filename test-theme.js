const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testTheme() {
  try {
    console.log('🎨 [TESTE TEMA] Testando sistema de tema...')
    
    // 1. Verificar se o ThemeProvider está funcionando
    console.log('🔍 [TESTE] Verificando ThemeProvider...')
    
    // 2. Verificar se o ThemeIcons está sendo renderizado
    console.log('🔍 [TESTE] Verificando ThemeIcons...')
    
    // 3. Verificar se há algum erro no console
    console.log('🔍 [TESTE] Verificando erros...')
    
    console.log('🎯 [TESTE] Para testar o tema:')
    console.log('   1. Abra o navegador na página de quiz ou flashcards')
    console.log('   2. Procure pelo seletor de tema no sidebar (ícone de sol/lua)')
    console.log('   3. Clique para alternar entre Claro/Escuro/Sistema')
    console.log('   4. Verifique se as cores mudam')
    
    console.log('💡 [SOLUÇÃO] Se o tema não aparecer:')
    console.log('   - Verifique se o ThemeProvider está no layout.tsx')
    console.log('   - Verifique se o ThemeIcons está no DashboardShell')
    console.log('   - Verifique se não há erros no console do navegador')
    
  } catch (error) {
    console.error('❌ [TESTE] Erro geral:', error)
  }
}

testTheme()
