// Configuração temporária das variáveis de ambiente
// Este arquivo deve ser removido após configurar o .env.local

const envConfig = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://hnhzindsfuqnaxosujay.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'your-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'your-service-role-key'
}

// Configurar as variáveis de ambiente
Object.keys(envConfig).forEach(key => {
  process.env[key] = envConfig[key]
})

console.log('Variáveis de ambiente configuradas:', Object.keys(envConfig))

