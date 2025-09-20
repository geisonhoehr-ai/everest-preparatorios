/**
 * Script para testar o sistema de autenticação
 * Este script testa o fluxo completo de login, verificação de sessão e logout
 */

const API_BASE = 'http://localhost:3000/api/auth'

// Usuários de teste
const testUsers = [
  {
    email: 'aluno@teste.com',
    password: '123456',
    role: 'student',
    expectedPages: ['dashboard', 'flashcards', 'quiz', 'ranking', 'calendario', 'community', 'settings']
  },
  {
    email: 'professor@teste.com',
    password: '123456',
    role: 'teacher',
    expectedPages: ['dashboard', 'flashcards', 'quiz', 'ranking', 'turmas', 'calendario', 'community', 'settings', 'membros', 'suporte', 'redacao', 'provas', 'livros']
  },
  {
    email: 'admin@teste.com',
    password: '123456',
    role: 'administrator',
    expectedPages: ['dashboard', 'flashcards', 'quiz', 'ranking', 'turmas', 'calendario', 'community', 'settings', 'membros', 'suporte', 'redacao', 'provas', 'livros', 'admin']
  }
]

async function testLogin(email, password) {
  console.log(`\n🔐 Testando login para: ${email}`)
  
  try {
    const response = await fetch(`${API_BASE}/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    
    const result = await response.json()
    
    if (result.success) {
      console.log(`✅ Login bem-sucedido!`)
      console.log(`   - Usuário: ${result.user.first_name} ${result.user.last_name}`)
      console.log(`   - Role: ${result.user.role}`)
      console.log(`   - Email: ${result.user.email}`)
      console.log(`   - Token: ${result.sessionToken?.substring(0, 20)}...`)
      return result.sessionToken
    } else {
      console.log(`❌ Login falhou: ${result.error}`)
      return null
    }
  } catch (error) {
    console.log(`❌ Erro na requisição: ${error.message}`)
    return null
  }
}

async function testLogout(sessionToken) {
  console.log(`\n🚪 Testando logout`)
  
  try {
    const response = await fetch(`${API_BASE}/signout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionToken }),
    })
    
    const result = await response.json()
    
    if (result.success) {
      console.log(`✅ Logout bem-sucedido!`)
    } else {
      console.log(`❌ Logout falhou: ${result.error}`)
    }
  } catch (error) {
    console.log(`❌ Erro na requisição: ${error.message}`)
  }
}

async function testPasswordReset(email) {
  console.log(`\n🔐 Testando solicitação de redefinição de senha para: ${email}`)
  
  try {
    const response = await fetch(`${API_BASE}/request-password-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
    
    const result = await response.json()
    
    if (result.success) {
      console.log(`✅ Solicitação de redefinição processada!`)
      console.log(`   - Mensagem: ${result.message}`)
    } else {
      console.log(`❌ Solicitação falhou: ${result.error}`)
    }
  } catch (error) {
    console.log(`❌ Erro na requisição: ${error.message}`)
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes do sistema de autenticação')
  console.log('=' * 50)
  
  for (const user of testUsers) {
    console.log(`\n👤 Testando usuário: ${user.email} (${user.role})`)
    console.log('-' * 40)
    
    // Teste de login
    const sessionToken = await testLogin(user.email, user.password)
    
    if (sessionToken) {
      // Aguardar um pouco antes do logout
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Teste de logout
      await testLogout(sessionToken)
    }
    
    // Teste de redefinição de senha
    await testPasswordReset(user.email)
    
    console.log('\n' + '=' * 50)
  }
  
  console.log('\n🎉 Testes concluídos!')
}

// Executar testes se o script for chamado diretamente
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = {
  testLogin,
  testLogout,
  testPasswordReset,
  runTests
}
