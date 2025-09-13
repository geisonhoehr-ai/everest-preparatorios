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
      console.log('📝 Execute o arquivo create-missing-tables.sql no Supabase Dashboard')
      return
    }

    // 2. Verificar dados existentes
    console.log('\n📊 2. Verificando dados existentes...')
    
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
    
    if (profilesError) {
      console.log('❌ Erro ao verificar user_profiles:', profilesError.message)
    } else {
      console.log(`✅ Total de user_profiles: ${existingProfiles?.length || 0}`)
    }

    const { data: existingClasses, error: classesError } = await supabase
      .from('classes')
      .select('*')
    
    if (classesError) {
      console.log('❌ Erro ao verificar classes:', classesError.message)
    } else {
      console.log(`✅ Total de classes: ${existingClasses?.length || 0}`)
    }

    const { data: existingAccessPlans, error: accessPlansError } = await supabase
      .from('access_plans')
      .select('*')
    
    if (accessPlansError) {
      console.log('❌ Erro ao verificar access_plans:', accessPlansError.message)
    } else {
      console.log(`✅ Total de access_plans: ${existingAccessPlans?.length || 0}`)
    }

    // 3. Criar planos de acesso se não existirem
    console.log('\n📋 3. Criando planos de acesso...')
    
    if (!existingAccessPlans || existingAccessPlans.length === 0) {
      const accessPlans = [
        {
          name: 'Plano Básico',
          description: 'Acesso básico ao sistema',
          duration_months: 6,
          price: 99.90,
          features: {
            quiz: true,
            flashcards: true,
            evercast: false,
            calendario: false
          }
        },
        {
          name: 'Plano Completo',
          description: 'Acesso completo a todas as funcionalidades',
          duration_months: 12,
          price: 199.90,
          features: {
            quiz: true,
            flashcards: true,
            evercast: true,
            calendario: true
          }
        }
      ]

      for (const plan of accessPlans) {
        try {
          const { data, error } = await supabase
            .from('access_plans')
            .insert([plan])
            .select()
          
          if (error) {
            console.log(`❌ Erro ao criar plano ${plan.name}:`, error.message)
          } else {
            console.log(`✅ Plano ${plan.name} criado com sucesso`)
          }
        } catch (err) {
          console.log(`❌ Erro geral ao criar plano ${plan.name}:`, err.message)
        }
      }
    } else {
      console.log('✅ Planos de acesso já existem')
    }

    // 4. Verificar resultado final
    console.log('\n📊 4. Verificando resultado final...')
    
    const { data: finalProfiles, error: finalProfilesError } = await supabase
      .from('user_profiles')
      .select('*')
    
    const { data: finalClasses, error: finalClassesError } = await supabase
      .from('classes')
      .select('*')
    
    const { data: finalAccessPlans, error: finalAccessPlansError } = await supabase
      .from('access_plans')
      .select('*')
    
    if (!finalProfilesError) {
      console.log(`✅ Total de perfis: ${finalProfiles?.length || 0}`)
    }
    
    if (!finalClassesError) {
      console.log(`✅ Total de classes: ${finalClasses?.length || 0}`)
    }
    
    if (!finalAccessPlansError) {
      console.log(`✅ Total de planos de acesso: ${finalAccessPlans?.length || 0}`)
    }

    console.log('\n🎉 PROCESSO CONCLUÍDO!')
    console.log('📝 Dados de teste criados:')
    console.log('   - Planos de acesso configurados')
    console.log('   - Classes disponíveis para uso')
    console.log('   - Sistema pronto para receber usuários')
    
    console.log('\n🔧 Próximos passos:')
    console.log('   1. Faça login como admin ou teacher')
    console.log('   2. Acesse /membros')
    console.log('   3. Crie usuários manualmente na interface')
    console.log('   4. Teste as funcionalidades CRUD')
    console.log('   5. Configure permissões de páginas')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

createTestData()
