const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔧 [FIX] Corrigindo sistema de user_roles...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey ? '✅ Configurada' : '❌ Não configurada')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function fixUserRolesSystem() {
  try {
    console.log('\n🔧 [FIX] Executando correções do sistema de user_roles...')
    
    // 1. Primeiro, vamos verificar se a tabela user_roles existe
    console.log('\n🔍 [FIX] Verificando se tabela user_roles existe...')
    const { data: tableExists, error: tableError } = await supabase
      .from('user_roles')
      .select('count')
      .limit(1)
    
    if (tableError) {
      console.log('⚠️ [FIX] Tabela user_roles não existe ou não acessível')
      console.log('💡 [FIX] Precisamos executar o script SQL no Supabase Dashboard')
    } else {
      console.log('✅ [FIX] Tabela user_roles existe')
      
      // 2. Verificar se há dados na tabela
      const { data: userRoles, error: countError } = await supabase
        .from('user_roles')
        .select('*')
      
      if (countError) {
        console.error('❌ [FIX] Erro ao contar user_roles:', countError)
      } else {
        console.log(`📊 [FIX] Total de roles na tabela: ${userRoles?.length || 0}`)
        
        if (userRoles && userRoles.length > 0) {
          console.log('👥 [FIX] Roles existentes:')
          userRoles.forEach((role, index) => {
            console.log(`  ${index + 1}. Email: ${role.email}, Role: ${role.role}`)
          })
        } else {
          console.log('⚠️ [FIX] Tabela user_roles está vazia!')
        }
      }
    }

    // 3. Tentar inserir usuários de teste diretamente
    console.log('\n🔧 [FIX] Tentando inserir usuários de teste...')
    
    const testUsers = [
      { user_uuid: '00000000-0000-0000-0000-000000000001', email: 'tiago@everest.com', role: 'teacher' },
      { user_uuid: '00000000-0000-0000-0000-000000000002', email: 'admin@everest.com', role: 'admin' },
      { user_uuid: '00000000-0000-0000-0000-000000000003', email: 'aluno@teste.com', role: 'student' }
    ]
    
    for (const user of testUsers) {
      try {
        const { data: inserted, error: insertError } = await supabase
          .from('user_roles')
          .upsert(user, { onConflict: 'email' })
          .select()
        
        if (insertError) {
          console.error(`❌ [FIX] Erro ao inserir ${user.email}:`, insertError.message)
        } else {
          console.log(`✅ [FIX] Usuário ${user.email} inserido/atualizado com sucesso`)
        }
      } catch (error) {
        console.error(`❌ [FIX] Erro inesperado ao inserir ${user.email}:`, error.message)
      }
    }

    // 4. Verificar se conseguimos inserir pelo menos um usuário
    console.log('\n🔍 [FIX] Verificando resultado final...')
    const { data: finalRoles, error: finalError } = await supabase
      .from('user_roles')
      .select('*')
    
    if (finalError) {
      console.error('❌ [FIX] Erro ao verificar resultado final:', finalError)
    } else {
      console.log(`📊 [FIX] Total final de roles: ${finalRoles?.length || 0}`)
      
      if (finalRoles && finalRoles.length > 0) {
        console.log('✅ [FIX] Sistema de user_roles corrigido com sucesso!')
        console.log('👥 [FIX] Roles disponíveis:')
        finalRoles.forEach((role, index) => {
          console.log(`  ${index + 1}. Email: ${role.email}, Role: ${role.role}`)
        })
      } else {
        console.log('❌ [FIX] Não foi possível inserir nenhum role')
        console.log('💡 [FIX] Execute o script SQL no Supabase Dashboard:')
        console.log('📁 scripts/097_create_user_roles_system.sql')
      }
    }

  } catch (error) {
    console.error('❌ [FIX] Erro inesperado:', error)
  }
}

fixUserRolesSystem()
