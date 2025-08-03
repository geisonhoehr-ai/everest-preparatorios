-- Script para garantir que o usuário aluno@teste.com esteja completamente configurado

-- 1. Verificar se o usuário existe e está confirmado
SELECT 
    id,
    email,
    email_confirmed_at,
    confirmed_at,
    last_sign_in_at
FROM auth.users 
WHERE email = 'aluno@teste.com';

-- 2. Garantir que o usuário está na tabela paid_users
INSERT INTO paid_users (email, status, created_at, updated_at)
VALUES ('aluno@teste.com', 'active', NOW(), NOW())
ON CONFLICT (email) 
DO UPDATE SET 
    status = 'active',
    updated_at = NOW();

-- 3. Obter o UUID do usuário
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Buscar o UUID do usuário
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'aluno@teste.com';
    
    IF user_uuid IS NOT NULL THEN
        -- 4. Garantir que o usuário tem role de student
        INSERT INTO user_roles (user_uuid, role, first_login, profile_completed, created_at, updated_at)
        VALUES (user_uuid, 'student', false, true, NOW(), NOW())
        ON CONFLICT (user_uuid) 
        DO UPDATE SET 
            role = 'student',
            first_login = false,
            profile_completed = true,
            updated_at = NOW();
        
        -- 5. Criar perfil de estudante se não existir
        INSERT INTO student_profiles (user_uuid, name, grade, school, created_at, updated_at)
        VALUES (user_uuid, 'Aluno Teste', '3º Ano', 'Escola Teste', NOW(), NOW())
        ON CONFLICT (user_uuid) 
        DO UPDATE SET 
            updated_at = NOW();
        
        RAISE NOTICE 'Usuário aluno@teste.com configurado com sucesso! UUID: %', user_uuid;
    ELSE
        RAISE NOTICE 'Usuário aluno@teste.com não encontrado!';
    END IF;
END $$;

-- 6. Verificar configuração final
SELECT 
    u.id as user_uuid,
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmed,
    pu.status as paid_status,
    ur.role as user_role,
    sp.name as student_name
FROM auth.users u
LEFT JOIN paid_users pu ON u.email = pu.email
LEFT JOIN user_roles ur ON u.id = ur.user_uuid
LEFT JOIN student_profiles sp ON u.id = sp.user_uuid
WHERE u.email = 'aluno@teste.com';

-- 7. Verificar se há algum problema de política RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('paid_users', 'user_roles', 'student_profiles')
ORDER BY tablename, policyname;
