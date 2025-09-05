# Solução para Erro ao Criar Usuários no Supabase

## Problemas Comuns e Soluções

### 1. **Erro: "Email already exists"**
**Solução:** O usuário já existe. Execute:
```sql
-- Verificar usuarios existentes
SELECT id, email FROM auth.users 
WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com');
```

### 2. **Erro: "Email not confirmed"**
**Solução:** Desabilitar confirmação de email no Supabase:
1. Vá para Authentication > Settings
2. Desabilite "Enable email confirmations"
3. Ou confirme manualmente os emails

### 3. **Erro: "Invalid password"**
**Solução:** Use senha mais forte:
- Mínimo 6 caracteres
- Pelo menos 1 número
- Pelo menos 1 letra

### 4. **Erro: "Database error"**
**Solução:** Verificar permissões:
1. Vá para Settings > API
2. Verifique se a Service Role Key está correta
3. Verifique se RLS está configurado corretamente

## Scripts Disponíveis

### **Opção 1: SQL Simples (Recomendado)**
Execute `create-users-simple.sql` no SQL Editor

### **Opção 2: SQL Completo**
Execute `create-users-alternative.sql` no SQL Editor

### **Opção 3: JavaScript (API)**
1. Configure as credenciais em `create-users-js.js`
2. Execute: `node create-users-js.js`

## Verificação Final

Após criar os usuários, execute:
```sql
-- Verificar usuarios criados
SELECT 
    au.id,
    au.email,
    au.email_confirmed_at,
    up.role,
    up.display_name
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE au.email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com');
```

## Qual erro específico você está recebendo?
Me informe o erro exato para uma solução mais direcionada.
