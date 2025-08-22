const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 [CHECK] Verificando tabela user_roles diretamente...')
console.log('URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkUserRolesDirect() {
  try {
    console.log('\n🔍 [CHECK] Verificando tabela user_roles...')
    
    // 1. Verificar se a tabela existe
    const { data: tableCheck, error: tableError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ [CHECK] Erro ao acessar user_roles:', tableError)
      return
    }
    
    console.log('✅ [CHECK] Tabela user_roles acessível')
    
    // 2. Contar total de registros
    const { count, error: countError } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('❌ [CHECK] Erro ao contar registros:', countError)
    } else {
      console.log(`📊 [CHECK] Total de registros: ${count}`)
    }
    
    // 3. Buscar todos os registros
    const { data: allRoles, error: allError } = await supabase
      .from('user_roles')
      .select('*')
    
    if (allError) {
      console.error('❌ [CHECK] Erro ao buscar todos os roles:', allError)
    } else {
      console.log(`📋 [CHECK] Registros encontrados: ${allRoles?.length || 0}`)
      
      if (allRoles && allRoles.length > 0) {
        console.log('👥 [CHECK] Roles disponíveis:')
        allRoles.forEach((role, index) => {
          console.log(`  ${index + 1}. ID: ${role.id}, Email: ${role.email}, Role: ${role.role}, UUID: ${role.user_uuid}`)
        })
      } else {
        console.log('⚠️ [CHECK] Tabela user_roles está vazia!')
      }
    }
    
    // 4. Verificar estrutura da tabela
    console.log('\n🔍 [CHECK] Verificando estrutura da tabela...')
    const { data: structure, error: structureError } = await supabase
      .rpc('get_table_structure', { table_name: 'user_roles' })
      .catch(() => ({ data: null, error: 'Função não disponível' }))
    
    if (structureError) {
      console.log('ℹ️ [CHECK] Função get_table_structure não disponível')
    } else {
      console.log('📋 [CHECK] Estrutura da tabela:', structure)
    }
    
  } catch (error) {
    console.error('❌ [CHECK] Erro inesperado:', error)
  }
}

checkUserRolesDirect()
