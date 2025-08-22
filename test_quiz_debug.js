const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 [QUIZ DEBUG] Verificando problema da página de quiz...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey ? '✅ Configurada' : '❌ Não configurada')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugQuizPage() {
  try {
    console.log('\n🔍 [QUIZ DEBUG] Testando acesso à tabela subjects...')
    
    // 1. Testar se conseguimos acessar a tabela subjects
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')
      .limit(10)
    
    if (subjectsError) {
      console.error('❌ [QUIZ DEBUG] Erro ao acessar subjects:', subjectsError)
      return
    }
    
    console.log('✅ [QUIZ DEBUG] Tabela subjects acessível')
    console.log('📊 [QUIZ DEBUG] Dados encontrados:', subjects?.length || 0)
    
    if (subjects && subjects.length > 0) {
      console.log('📚 [QUIZ DEBUG] Primeiras matérias:')
      subjects.forEach((subject, index) => {
        console.log(`  ${index + 1}. ID: ${subject.id}, Nome: ${subject.name}`)
      })
    } else {
      console.log('⚠️ [QUIZ DEBUG] Tabela subjects está vazia!')
    }

    // 2. Testar se conseguimos acessar a tabela user_roles
    console.log('\n🔍 [QUIZ DEBUG] Testando acesso à tabela user_roles...')
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(5)
    
    if (userRolesError) {
      console.error('❌ [QUIZ DEBUG] Erro ao acessar user_roles:', userRolesError)
    } else {
      console.log('✅ [QUIZ DEBUG] Tabela user_roles acessível')
      console.log('📊 [QUIZ DEBUG] Roles encontrados:', userRoles?.length || 0)
      
      if (userRoles && userRoles.length > 0) {
        console.log('👥 [QUIZ DEBUG] Primeiros roles:')
        userRoles.forEach((role, index) => {
          console.log(`  ${index + 1}. UUID: ${role.user_uuid}, Role: ${role.role}`)
        })
      } else {
        console.log('⚠️ [QUIZ DEBUG] Tabela user_roles está vazia!')
      }
    }

    // 3. Testar se conseguimos acessar a tabela topics
    console.log('\n🔍 [QUIZ DEBUG] Testando acesso à tabela topics...')
    const { data: topics, error: topicsError } = await supabase
      .from('topics')
      .select('*')
      .limit(5)
    
    if (topicsError) {
      console.error('❌ [QUIZ DEBUG] Erro ao acessar topics:', topicsError)
    } else {
      console.log('✅ [QUIZ DEBUG] Tabela topics acessível')
      console.log('📊 [QUIZ DEBUG] Topics encontrados:', topics?.length || 0)
      
      if (topics && topics.length > 0) {
        console.log('📖 [QUIZ DEBUG] Primeiros topics:')
        topics.forEach((topic, index) => {
          console.log(`  ${index + 1}. ID: ${topic.id}, Nome: ${topic.name}, Subject ID: ${topic.subject_id}`)
        })
      } else {
        console.log('⚠️ [QUIZ DEBUG] Tabela topics está vazia!')
      }
    }

    // 4. Verificar se há dados de teste ou se precisamos inserir
    if (!subjects || subjects.length === 0) {
      console.log('\n🔍 [QUIZ DEBUG] Tentando inserir dados de teste...')
      
      const testSubjects = [
        { name: 'Português' },
        { name: 'Regulamentos' },
        { name: 'Matemática' }
      ]
      
      const { data: inserted, error: insertError } = await supabase
        .from('subjects')
        .insert(testSubjects)
        .select()
      
      if (insertError) {
        console.error('❌ [QUIZ DEBUG] Erro ao inserir dados de teste:', insertError)
        console.log('💡 [QUIZ DEBUG] Possível problema de RLS (Row Level Security)')
      } else {
        console.log('✅ [QUIZ DEBUG] Dados de teste inseridos com sucesso!')
        console.log('📊 [QUIZ DEBUG] Dados inseridos:', inserted)
      }
    }

  } catch (error) {
    console.error('❌ [QUIZ DEBUG] Erro inesperado:', error)
  }
}

debugQuizPage()
