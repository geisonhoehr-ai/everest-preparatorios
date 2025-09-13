const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = 'https://hnhzindsfuqnaxosujay.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaHppbmRzZnVxbmF4b3N1amF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MzU5NTIsImV4cCI6MjA2ODUxMTk1Mn0.cT7fe1wjee9HfZw_IVD7K_exMqu-LtUxiClCD-sDLyU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestData() {
  console.log('🔧 Criando dados de teste para a página de membros...')
  
  try {
    // 1. Verificar se as tabelas existem
    console.log('\n📋 1. Verificando tabelas necessárias...')
    
    const requiredTables = ['access_plans', 'student_subscriptions', 'temporary_passwords']
    const missingTables = []
    
    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error && error.code === '42P01') {
          console.log(`❌ Tabela ${table} não existe`)
          missingTables.push(table)
        } else if (error) {
          console.log(`⚠️ Tabela ${table} existe mas há erro:`, error.message)
        } else {
          console.log(`✅ Tabela ${table} existe`)
        }
      } catch (err) {
        console.log(`❌ Erro ao verificar ${table}:`, err.message)
        missingTables.push(table)
      }
    }
    
    if (missingTables.length > 0) {
      console.log('\n❌ Tabelas faltando! Execute primeiro o SQL:')
      console.log('📝 Execute o arquivo create-tables-corrected.sql no Supabase Dashboard')
      return
    }

    // 2. Verificar se já há dados
    console.log('\n📊 2. Verificando dados existentes...')
    
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
    
    if (profilesError) {
      console.log('❌ Erro ao verificar user_profiles:', profilesError.message)
    } else {
      console.log(`✅ Total de user_profiles: ${existingProfiles?.length || 0}`)
      
      if (existingProfiles && existingProfiles.length > 0) {
        console.log('⚠️ Já existem usuários no sistema!')
        console.log('📋 Usuários existentes:')
        existingProfiles.forEach((profile, index) => {
          console.log(`   ${index + 1}. ${profile.display_name || profile.name || 'Sem nome'} (${profile.role}) - ${profile.user_id}`)
        })
        
        const shouldContinue = existingProfiles.length < 5
        if (!shouldContinue) {
          console.log('💡 Sistema já tem usuários suficientes para teste')
          return
        }
      }
    }

    // 3. Criar usuários de teste
    console.log('\n👤 3. Criando usuários de teste...')
    
    const testUsers = [
      {
        email: 'admin@everest.com',
        password: 'admin123',
        display_name: 'Administrador',
        role: 'admin'
      },
      {
        email: 'professor@everest.com', 
        password: 'prof123',
        display_name: 'Professor Silva',
        role: 'teacher'
      },
      {
        email: 'aluno1@everest.com',
        password: 'aluno123',
        display_name: 'João Silva',
        role: 'student'
      },
      {
        email: 'aluno2@everest.com',
        password: 'aluno123',
        display_name: 'Maria Santos',
        role: 'student'
      },
      {
        email: 'aluno3@everest.com',
        password: 'aluno123',
        display_name: 'Pedro Costa',
        role: 'student'
      }
    ]
    
    const createdUsers = []
    
    for (const user of testUsers) {
      try {
        // Verificar se o usuário já existe
        const { data: existingUser } = await supabase.auth.admin.getUserByEmail(user.email)
        
        if (existingUser.user) {
          console.log(`⚠️ Usuário ${user.email} já existe, pulando...`)
          continue
        }
        
        // Criar usuário no auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true
        })
        
        if (authError) {
          console.log(`⚠️ Erro ao criar usuário auth ${user.email}:`, authError.message)
          continue
        }
        
        console.log(`✅ Usuário auth criado: ${user.email} (ID: ${authData.user.id})`)
        
        // Criar perfil
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: authData.user.id,
            role: user.role,
            display_name: user.display_name
          })
          .select()
          .single()
        
        if (profileError) {
          console.log(`⚠️ Erro ao criar perfil ${user.email}:`, profileError.message)
        } else {
          console.log(`✅ Perfil criado: ${profileData.display_name} (${profileData.role})`)
          createdUsers.push({ ...user, id: authData.user.id, profile: profileData })
        }
        
      } catch (err) {
        console.log(`❌ Erro geral ao criar usuário ${user.email}:`, err.message)
      }
    }

    // 4. Verificar resultado final
    console.log('\n📊 4. Verificando resultado final...')
    
    const { data: finalProfiles, error: finalError } = await supabase
      .from('user_profiles')
      .select('*')
    
    if (finalError) {
      console.log('❌ Erro ao verificar perfis finais:', finalError.message)
    } else {
      console.log(`✅ Total de perfis: ${finalProfiles?.length || 0}`)
      
      if (finalProfiles && finalProfiles.length > 0) {
        console.log('📋 Perfis no sistema:')
        finalProfiles.forEach((profile, index) => {
          console.log(`   ${index + 1}. ${profile.display_name || profile.name || 'Sem nome'} (${profile.role}) - ${profile.user_id}`)
        })
        
        // Verificar distribuição de roles
        const roleCount = {}
        finalProfiles.forEach(profile => {
          roleCount[profile.role] = (roleCount[profile.role] || 0) + 1
        })
        
        console.log('\n📊 Distribuição de roles:')
        Object.entries(roleCount).forEach(([role, count]) => {
          console.log(`   - ${role}: ${count} usuários`)
        })
      }
    }

    console.log('\n🎉 PROCESSO CONCLUÍDO!')
    console.log('📝 Usuários de teste criados:')
    console.log('   - admin@everest.com (senha: admin123) - Admin')
    console.log('   - professor@everest.com (senha: prof123) - Teacher')
    console.log('   - aluno1@everest.com (senha: aluno123) - Student')
    console.log('   - aluno2@everest.com (senha: aluno123) - Student')
    console.log('   - aluno3@everest.com (senha: aluno123) - Student')
    console.log('')
    console.log('🔧 Próximos passos:')
    console.log('   1. Faça login como admin ou teacher')
    console.log('   2. Acesse /membros')
    console.log('   3. Verifique se os usuários aparecem na lista')
    console.log('   4. Teste as funcionalidades CRUD')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

createTestData()
