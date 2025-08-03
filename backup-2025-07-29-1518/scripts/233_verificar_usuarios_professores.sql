-- 🔍 VERIFICAR E CONFIGURAR USUÁRIOS PROFESSORES
-- Execute este script no SQL Editor do Supabase

-- 1. VERIFICAR USUÁRIOS EXISTENTES
SELECT 
    '=== USUÁRIOS EXISTENTES ===' as info;

SELECT 
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. VERIFICAR ROLES EXISTENTES
SELECT 
    '=== ROLES EXISTENTES ===' as info;

SELECT 
    user_uuid,
    role,
    first_login,
    profile_completed,
    created_at
FROM user_roles
ORDER BY created_at DESC;

-- 3. CRIAR USUÁRIO PROFESSOR DE TESTE
SELECT 
    '=== CRIANDO PROFESSOR DE TESTE ===' as info;

-- Inserir role de professor para o primeiro usuário (se existir)
INSERT INTO user_roles (user_uuid, role, first_login, profile_completed)
SELECT 
    id as user_uuid,
    'teacher' as role,
    false as first_login,
    true as profile_completed
FROM auth.users 
WHERE id NOT IN (SELECT user_uuid FROM user_roles)
LIMIT 1
ON CONFLICT (user_uuid) DO UPDATE SET
    role = 'teacher',
    profile_completed = true;

-- 4. VERIFICAR RESULTADO
SELECT 
    '=== RESULTADO FINAL ===' as info;

SELECT 
    'Usuários com role de professor:' as tipo,
    COUNT(*) as total
FROM user_roles 
WHERE role = 'teacher';

SELECT 
    'Usuários com role de aluno:' as tipo,
    COUNT(*) as total
FROM user_roles 
WHERE role = 'student';

-- 5. LISTAR TODOS OS ROLES
SELECT 
    '=== TODOS OS ROLES ===' as info;

SELECT 
    ur.user_uuid,
    ur.role,
    u.email,
    ur.created_at
FROM user_roles ur
LEFT JOIN auth.users u ON u.id = ur.user_uuid
ORDER BY ur.created_at DESC;