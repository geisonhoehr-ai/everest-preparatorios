require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não configuradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testRoleFix() {
  try {
    console.log('🔍 [TEST] Testando busca de role...')
    
    // UUID do professor (obtido do script anterior)
    const professorUUID = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6'
    
    console.log('🔍 [TEST] UUID do professor:', professorUUID)
    
    // Teste 1: Buscar role usando UUID
    console.log('\n🔍 [TEST] Teste 1: Buscando role por UUID...')
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_uuid', professorUUID)
      .single()
    
    console.log('📊 [TEST] Resultado:', { roleData, roleError })
    
    if (roleError) {
      console.error('❌ [TEST] Erro na busca por UUID:', roleError)
      
      // Teste 2: Buscar role usando email
      console.log('\n🔍 [TEST] Teste 2: Buscando role por email...')
      const { data: roleDataByEmail, error: roleErrorByEmail } = await supabase
        .from('user_roles')
        .select('role')
        .eq('email', 'professor@teste.com')
        .single()
      
      console.log('📊 [TEST] Resultado por email:', { roleDataByEmail, roleErrorByEmail })
      
      if (roleErrorByEmail) {
        console.error('❌ [TEST] Erro na busca por email também:', roleErrorByEmail)
        
        // Teste 3: Verificar se a tabela existe
        console.log('\n🔍 [TEST] Teste 3: Verificando estrutura da tabela...')
        const { data: tableData, error: tableError } = await supabase
          .from('user_roles')
          .select('*')
          .limit(1)
        
        console.log('📊 [TEST] Estrutura da tabela:', { tableData, tableError })
        
        if (tableError) {
          console.error('❌ [TEST] Erro ao acessar tabela user_roles:', tableError)
        }
      } else {
        console.log('✅ [TEST] Role encontrado por email:', roleDataByEmail?.role)
      }
    } else {
      console.log('✅ [TEST] Role encontrado por UUID:', roleData?.role)
    }
    
    // Teste 4: Verificar todas as roles
    console.log('\n🔍 [TEST] Teste 4: Listando todas as roles...')
    const { data: allRoles, error: allRolesError } = await supabase
      .from('user_roles')
      .select('user_uuid, role, email')
    
    if (allRolesError) {
      console.error('❌ [TEST] Erro ao listar roles:', allRolesError)
    } else {
      console.log('📊 [TEST] Todas as roles:', allRoles)
    }
    
  } catch (error) {
    console.error('❌ [TEST] Erro inesperado:', error)
  }
}

// Executar o teste
testRoleFix()
