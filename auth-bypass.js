// Sistema de autenticação temporário para desenvolvimento
// Este arquivo simula a autenticação sem depender do Supabase

const users = [
  {
    id: 'aluno-123',
    email: 'aluno@teste.com',
    password: '123456',
    name: 'Aluno Teste',
    role: 'student'
  },
  {
    id: 'admin-123',
    email: 'admin@teste.com',
    password: '123456',
    name: 'Admin Teste',
    role: 'admin'
  },
  {
    id: 'professor-123',
    email: 'professor@teste.com',
    password: '123456',
    name: 'Professor Teste',
    role: 'teacher'
  }
];

// Função para simular login
export function simulateLogin(email, password) {
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Simular sessão no localStorage
    localStorage.setItem('auth_user', JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      logged_in: true
    }));
    
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }
  
  return {
    success: false,
    error: 'Credenciais inválidas'
  };
}

// Função para verificar se está logado
export function isLoggedIn() {
  const authData = localStorage.getItem('auth_user');
  if (authData) {
    const user = JSON.parse(authData);
    return user.logged_in === true;
  }
  return false;
}

// Função para obter usuário atual
export function getCurrentUser() {
  const authData = localStorage.getItem('auth_user');
  if (authData) {
    return JSON.parse(authData);
  }
  return null;
}

// Função para logout
export function logout() {
  localStorage.removeItem('auth_user');
}

// Função para verificar role
export function hasRole(requiredRole) {
  const user = getCurrentUser();
  if (user) {
    return user.role === requiredRole;
  }
  return false;
}

console.log('Sistema de autenticação temporário carregado');
console.log('Usuários disponíveis:');
users.forEach(user => {
  console.log(`- ${user.email} (${user.role}) - Senha: ${user.password}`);
});
