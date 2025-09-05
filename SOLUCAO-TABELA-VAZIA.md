# Solução para Tabela user_profiles Vazia

## Problema
A tabela `user_profiles` está vazia e não há usuários no sistema.

## Solução Passo a Passo

### 1. Verificar Status Atual
Execute no SQL Editor do Supabase Dashboard:

```sql
-- Verificar usuarios no auth
SELECT id, email, email_confirmed_at FROM auth.users 
WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com');

-- Verificar perfis existentes
SELECT COUNT(*) as total_profiles FROM user_profiles;
```

### 2. Se NÃO existirem usuários no auth.users:

**Opção A: Criar via Supabase Dashboard**
1. Vá para Authentication > Users
2. Clique em "Add user"
3. Crie os 3 usuários:
   - `aluno@teste.com` (senha: 123456)
   - `admin@teste.com` (senha: 123456)  
   - `professor@teste.com` (senha: 123456)
4. Confirme os emails manualmente

**Opção B: Criar via SQL (mais complexo)**
Execute o script `create-users-complete.sql` (descomente a seção de criação de usuários)

### 3. Após ter os usuários no auth.users:

Execute este SQL para criar os perfis:

```sql
-- Pegar IDs dos usuários
SELECT id, email FROM auth.users 
WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com');

-- Criar perfis (substitua os IDs pelos reais)
INSERT INTO user_profiles (user_id, role, display_name, created_at, updated_at) 
VALUES 
    ('ID_DO_ALUNO_AQUI', 'student', 'Aluno Teste', NOW(), NOW()),
    ('ID_DO_ADMIN_AQUI', 'admin', 'Admin Teste', NOW(), NOW()),
    ('ID_DO_PROFESSOR_AQUI', 'teacher', 'Professor Teste', NOW(), NOW());
```

### 4. Verificar Resultado
```sql
SELECT 
    up.id,
    up.user_id,
    up.role,
    up.display_name,
    au.email
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
WHERE au.email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com');
```

## Recomendação
Use a **Opção A** (criar via Dashboard) pois é mais simples e confiável.
