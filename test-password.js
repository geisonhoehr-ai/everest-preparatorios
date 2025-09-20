const bcrypt = require('bcryptjs');

async function testPassword() {
  const password = '123456';
  const storedHash = '$2b$10$1ftaXu4xi2VvPKOwVxsJOeeWov0BpyEpNzdWJkuw0icSf/Dg5dvs6';
  
  console.log('Testando senha:', password);
  console.log('Hash armazenado:', storedHash);
  
  const isValid = await bcrypt.compare(password, storedHash);
  console.log('Senha válida:', isValid);
  
  // Gerar novo hash para comparar
  const newHash = await bcrypt.hash(password, 10);
  console.log('Novo hash:', newHash);
}

testPassword().catch(console.error);

