const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = 'https://hnhzindsfuqnaxosujay.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaHppbmRzZnVxbmF4b3N1amF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MzU5NTIsImV4cCI6MjA2ODUxMTk1Mn0.cT7fe1wjee9HfZw_IVD7K_exMqu-LtUxiClCD-sDLyU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestUsers() {
  console.log('👥 Criando usuários de teste para a página de membros...')
  
  try {
    // 1. Primeiro, criar classes de exemplo
    console.log('\n🏫 1. Criando classes de exemplo...')
    
    const classes = [
      { name: 'Turma A - Manhã', description: 'Turma da manhã para iniciantes', max_students: 30 },
      { name: 'Turma B - Tarde', description: 'Turma da tarde para intermediários', max_students: 25 },
      { name: 'Turma C - Noite', description: 'Turma da noite para avançados', max_students: 20 }
    ]
    
    const createdClasses = []
    
    for (const cls of classes) {
      try {
        const { data, error } = await supabase
          .from('classes')
          .insert(cls)
          .select()
          .single()
        
        if (error) {
          console.log(`⚠️ Erro ao criar classe ${cls.name}:`, error.message)
        } else {
          console.log(`✅ Classe criada: ${data.name} (ID: ${data.id})`)
          createdClasses.push(data)
        }
      } catch (err) {
        console.log(`❌ Erro ao criar classe ${cls.name}:`, err.message)
      }
    }

    // 2. Criar planos de acesso
    console.log('\n📋 2. Criando planos de acesso...')
    
    const accessPlans = [
      { 
        name: 'Plano Básico', 
        description: 'Acesso básico ao sistema', 
        duration_months: 6, 
        price: 99.90,
        features: { quiz: true, flashcards: true, evercast: false, calendario: false }
      },
      { 
        name: 'Plano Completo', 
        description: 'Acesso completo ao sistema', 
        duration_months: 12, 
        price: 199.90,
        features: { quiz: true, flashcards: true, evercast: true, calendario: true }
      },
      { 
        name: 'Plano Premium', 
        description: 'Acesso premium com suporte', 
        duration_months: 24, 
        price: 349.90,
        features: { quiz: true, flashcards: true, evercast: true, calendario: true }
      }
    ]
    
    const createdPlans = []
    
    for (const plan of accessPlans) {
      try {
        const { data, error } = await supabase
          .from('access_plans')
          .insert(plan)
          .select()
          .single()
        
        if (error) {
          console.log(`⚠️ Erro ao criar plano ${plan.name}:`, error.message)
        } else {
          console.log(`✅ Plano criado: ${data.name} (ID: ${data.id})`)
          createdPlans.push(data)
        }
      } catch (err) {
        console.log(`❌ Erro ao criar plano ${plan.name}:`, err.message)
      }
    }

    // 3. Criar usuários de exemplo
    console.log('\n👤 3. Criando usuários de exemplo...')
    
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
        role: 'student',
        class_id: createdClasses[0]?.id,
        access_plan_id: createdPlans[1]?.id
      },
      {
        email: 'aluno2@everest.com',
        password: 'aluno123',
        display_name: 'Maria Santos',
        role: 'student',
        class_id: createdClasses[1]?.id,
        access_plan_id: createdPlans[0]?.id
      },
      {
        email: 'aluno3@everest.com',
        password: 'aluno123',
        display_name: 'Pedro Costa',
        role: 'student',
        class_id: createdClasses[2]?.id,
        access_plan_id: createdPlans[2]?.id
      }
    ]
    
    const createdUsers = []
    
    for (const user of testUsers) {
      try {
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
            display_name: user.display_name,
            class_id: user.class_id || null
          })
          .select()
          .single()
        
        if (profileError) {
          console.log(`⚠️ Erro ao criar perfil ${user.email}:`, profileError.message)
        } else {
          console.log(`✅ Perfil criado: ${profileData.display_name} (${profileData.role})`)
          createdUsers.push({ ...user, id: authData.user.id, profile: profileData })
        }
        
        // Criar subscription se for aluno
        if (user.role === 'student' && user.access_plan_id) {
          try {
            const { data: subscriptionData, error: subscriptionError } = await supabase
              .from('student_subscriptions')
              .insert({
                user_id: authData.user.id,
                access_plan_id: user.access_plan_id,
                class_id: user.class_id,
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 ano
                is_active: true
              })
              .select()
              .single()
            
            if (subscriptionError) {
              console.log(`⚠️ Erro ao criar subscription ${user.email}:`, subscriptionError.message)
            } else {
              console.log(`✅ Subscription criada para ${user.display_name}`)
            }
          } catch (err) {
            console.log(`❌ Erro ao criar subscription ${user.email}:`, err.message)
          }
        }
        
        // Criar permissões de página se for aluno
        if (user.role === 'student') {
          const plan = createdPlans.find(p => p.id === user.access_plan_id)
          if (plan && plan.features) {
            for (const [page, hasAccess] of Object.entries(plan.features)) {
              if (hasAccess) {
                try {
                  const { error: permissionError } = await supabase
                    .from('page_permissions')
                    .insert({
                      user_id: authData.user.id,
                      page_name: page,
                      has_access: true,
                      granted_at: new Date().toISOString()
                    })
                  
                  if (permissionError) {
                    console.log(`⚠️ Erro ao criar permissão ${page} para ${user.email}:`, permissionError.message)
                  } else {
                    console.log(`✅ Permissão ${page} criada para ${user.display_name}`)
                  }
                } catch (err) {
                  console.log(`❌ Erro ao criar permissão ${page} para ${user.email}:`, err.message)
                }
              }
            }
          }
        }
        
      } catch (err) {
        console.log(`❌ Erro geral ao criar usuário ${user.email}:`, err.message)
      }
    }

    // 4. Verificar resultado
    console.log('\n📊 4. Verificando resultado...')
    
    const { data: finalProfiles, error: finalError } = await supabase
      .from('user_profiles')
      .select('*')
    
    if (finalError) {
      console.log('❌ Erro ao verificar perfis finais:', finalError.message)
    } else {
      console.log(`✅ Total de perfis criados: ${finalProfiles?.length || 0}`)
      
      if (finalProfiles?.length > 0) {
        console.log('📋 Perfis criados:')
        finalProfiles.forEach((profile, index) => {
          console.log(`   ${index + 1}. ${profile.display_name} (${profile.role}) - ${profile.user_id}`)
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

createTestUsers()
