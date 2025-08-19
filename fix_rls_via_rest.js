require('dotenv').config({ path: '.env.local' })

const https = require('https')

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas!')
  process.exit(1)
}

// Extrair o host do Supabase
const host = supabaseUrl.replace('https://', '').replace('http://', '')

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      query: sql
    })

    const options = {
      hostname: host,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      }
    }

    const req = https.request(options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data)
          resolve(result)
        } catch (error) {
          resolve({ data, error })
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.write(postData)
    req.end()
  })
}

async function fixRLSViaREST() {
  try {
    console.log('🔧 [FIX] Iniciando correção via REST API...')
    
    // Teste 1: Verificar se conseguimos executar SQL
    console.log('🔧 [FIX] Testando execução de SQL...')
    const testResult = await executeSQL('SELECT 1 as test')
    console.log('📊 [FIX] Teste SQL:', testResult)
    
    // Teste 2: Desabilitar RLS
    console.log('🔧 [FIX] Desabilitando RLS...')
    const disableResult = await executeSQL('ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;')
    console.log('📊 [FIX] Desabilitar RLS:', disableResult)
    
    // Teste 3: Remover políticas
    console.log('🔧 [FIX] Removendo políticas...')
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
      const dropResult = await executeSQL(`DROP POLICY IF EXISTS "${policy}" ON public.user_roles;`)
      console.log(`📊 [FIX] Remover política "${policy}":`, dropResult)
    }
    
    // Teste 4: Reabilitar RLS
    console.log('🔧 [FIX] Reabilitando RLS...')
    const enableResult = await executeSQL('ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;')
    console.log('📊 [FIX] Reabilitar RLS:', enableResult)
    
    // Teste 5: Criar política simples
    console.log('🔧 [FIX] Criando política simples...')
    const createPolicySQL = `
      CREATE POLICY "Allow read for authenticated users" ON public.user_roles
      FOR SELECT USING (auth.role() = 'authenticated');
    `
    const createResult = await executeSQL(createPolicySQL)
    console.log('📊 [FIX] Criar política:', createResult)
    
    console.log('🎉 [FIX] Correção via REST concluída!')
    
  } catch (error) {
    console.error('❌ [FIX] Erro inesperado:', error)
  }
}

// Executar a correção
fixRLSViaREST()
