const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = 'https://hnhzindsfuqnaxosujay.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaHppbmRzZnVxbmF4b3N1amF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MzU5NTIsImV4cCI6MjA2ODUxMTk1Mn0.cT7fe1wjee9HfZw_IVD7K_exMqu-LtUxiClCD-sDLyU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkClassesStructure() {
  console.log('🔍 Verificando estrutura da tabela classes...')
  
  try {
    // 1. Verificar se a tabela classes existe
    console.log('\n📋 1. Verificando se a tabela classes existe...')
    
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('*')
      .limit(1)
    
    if (classesError && classesError.code === '42P01') {
      console.log('❌ Tabela classes não existe')
      console.log('💡 Vamos criar a tabela classes com a estrutura correta')
      return
    } else if (classesError) {
      console.log('❌ Erro ao buscar classes:', classesError.message)
      return
    }
    
    console.log('✅ Tabela classes existe')
    
    if (classes && classes.length > 0) {
      console.log('📋 Estrutura da tabela classes:')
      const firstClass = classes[0]
      Object.keys(firstClass).forEach(key => {
        console.log(`   - ${key}: ${typeof firstClass[key]} (${firstClass[key]})`)
      })
      
      // Verificar o tipo do ID
      if (firstClass.id) {
        console.log(`\n🔍 Tipo do ID: ${typeof firstClass.id}`)
        if (typeof firstClass.id === 'number') {
          console.log('⚠️ ID é INTEGER, não UUID!')
        } else {
          console.log('✅ ID é UUID')
        }
      }
    } else {
      console.log('⚠️ Tabela classes está vazia')
    }

    // 2. Verificar se há dados em classes
    const { data: allClasses, error: allClassesError } = await supabase
      .from('classes')
      .select('*')
    
    if (allClassesError) {
      console.log('❌ Erro ao buscar todas as classes:', allClassesError.message)
    } else {
      console.log(`\n📊 Total de classes: ${allClasses?.length || 0}`)
      
      if (allClasses && allClasses.length > 0) {
        console.log('📋 Classes encontradas:')
        allClasses.forEach((cls, index) => {
          console.log(`   ${index + 1}. ${cls.name} (ID: ${cls.id} - tipo: ${typeof cls.id})`)
        })
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

checkClassesStructure()
