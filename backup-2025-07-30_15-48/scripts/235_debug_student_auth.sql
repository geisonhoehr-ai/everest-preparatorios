-- Script para debugar autenticação de estudantes
-- Data: 2025-01-28

-- 1. VERIFICAR USUÁRIOS NO SISTEMA
SELECT '=== VERIFICAÇÃO DE USUÁRIOS ===' as info;

SELECT 
    id,
    email,
    created_at,
    last_sign_in_at,
    email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. VERIFICAR ROLES DOS USUÁRIOS
SELECT '=== VERIFICAÇÃO DE ROLES ===' as info;

SELECT 
    ur.user_uuid,
    ur.role,
    ur.first_login,
    ur.profile_completed,
    u.email
FROM user_roles ur
LEFT JOIN auth.users u ON ur.user_uuid = u.id
ORDER BY ur.user_uuid;

-- 3. VERIFICAR SE EXISTEM ESTUDANTES SEM ROLE
SELECT '=== ESTUDANTES SEM ROLE ===' as info;

SELECT 
    u.id,
    u.email,
    u.created_at
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_uuid
WHERE ur.user_uuid IS NULL
ORDER BY u.created_at DESC;

-- 4. VERIFICAR POLÍTICAS RLS PARA ESTUDANTES
SELECT '=== VERIFICAÇÃO DE POLÍTICAS RLS ===' as info;

-- Verificar políticas de user_roles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'user_roles';

-- 5. CRIAR ESTUDANTES DE TESTE SE NECESSÁRIO
DO $$
DECLARE
    student_count INTEGER;
    test_student_id UUID;
BEGIN
    -- Verificar quantos estudantes existem
    SELECT COUNT(*) INTO student_count 
    FROM user_roles 
    WHERE role = 'student';
    
    RAISE NOTICE 'Estudantes encontrados: %', student_count;
    
    -- Se não houver estudantes, criar um de teste
    IF student_count = 0 THEN
        RAISE NOTICE 'Criando estudante de teste...';
        
        -- Inserir usuário de teste
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'aluno@teste.com',
            crypt('123456', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW()
        )
        ON CONFLICT (email) DO NOTHING;
        
        -- Obter o ID do usuário criado
        SELECT id INTO test_student_id FROM auth.users WHERE email = 'aluno@teste.com';
        
        -- Criar role para o estudante
        INSERT INTO user_roles (user_uuid, role, first_login, profile_completed)
        VALUES (test_student_id, 'student', true, false)
        ON CONFLICT (user_uuid) DO NOTHING;
        
        RAISE NOTICE 'Estudante de teste criado com sucesso!';
    ELSE
        RAISE NOTICE 'Já existem estudantes no sistema.';
    END IF;
END $$;

-- 6. VERIFICAÇÃO FINAL
SELECT '=== VERIFICAÇÃO FINAL ===' as info;

-- Contar usuários por role
SELECT 
    'Usuários por role:' as tipo,
    role,
    COUNT(*) as total
FROM user_roles
GROUP BY role;

-- Listar todos os estudantes
SELECT 
    'Estudantes no sistema:' as tipo,
    u.email,
    ur.role,
    ur.first_login,
    ur.profile_completed
FROM user_roles ur
JOIN auth.users u ON ur.user_uuid = u.id
WHERE ur.role = 'student'
ORDER BY u.created_at DESC;

SELECT '=== SCRIPT CONCLUÍDO ===' as info; 