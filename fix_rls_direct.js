require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase com chave de serviço
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixRLSRecursion() {
  try {
    console.log('🔧 [FIX] Iniciando correção das políticas RLS...')
    
    // Passo 1: Desabilitar RLS
    console.log('🔧 [FIX] Desabilitando RLS...')
    const { error: disableError } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;' 
      })
    
    if (disableError) {
      console.error('❌ [FIX] Erro ao desabilitar RLS:', disableError)
    } else {
      console.log('✅ [FIX] RLS desabilitado')
    }
    
    // Passo 2: Remover políticas existentes
    console.log('🔧 [FIX] Removendo políticas existentes...')
    const policies = [
      'Users can view own role',
      'Admins can manage all roles',
      'Allow authenticated users to read user_roles',
      'Allow users to insert their own role',
      'Allow users to update their own role',
      'Allow users to delete their own role',
      'Enable insert for all users',
      'Enable select for all users',
      'Enable update for all users',
      'Enable delete for all users'
    ]
    
    for (const policy of policies) {
      const { error: dropError } = await supabase
        .rpc('exec_sql', { 
          sql: `DROP POLICY IF EXISTS "${policy}" ON public.user_roles;` 
        })
      
      if (dropError) {
        console.error(`❌ [FIX] Erro ao remover política "${policy}":`, dropError)
      } else {
        console.log(`✅ [FIX] Política "${policy}" removida`)
      }
    }
    
    // Passo 3: Reabilitar RLS
    console.log('🔧 [FIX] Reabilitando RLS...')
    const { error: enableError } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;' 
      })
    
    if (enableError) {
      console.error('❌ [FIX] Erro ao reabilitar RLS:', enableError)
    } else {
      console.log('✅ [FIX] RLS reabilitado')
    }
    
    // Passo 4: Criar políticas simples
    console.log('🔧 [FIX] Criando políticas simples...')
    
    const createPolicySQL = `
      CREATE POLICY "Allow read for authenticated users" ON public.user_roles
      FOR SELECT USING (auth.role() = 'authenticated');
    `
    
    const { error: createError } = await supabase
      .rpc('exec_sql', { sql: createPolicySQL })
    
    if (createError) {
      console.error('❌ [FIX] Erro ao criar política:', createError)
    } else {
      console.log('✅ [FIX] Política criada')
    }
    
    // Passo 5: Testar acesso
    console.log('🔧 [FIX] Testando acesso...')
    const { data: testData, error: testError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('❌ [FIX] Erro no teste de acesso:', testError)
    } else {
      console.log('✅ [FIX] Acesso funcionando!')
      console.log('📊 [FIX] Dados de teste:', testData)
    }
    
    console.log('🎉 [FIX] Correção concluída!')
    
  } catch (error) {
    console.error('❌ [FIX] Erro inesperado:', error)
  }
}

// Executar a correção
fixRLSRecursion()
