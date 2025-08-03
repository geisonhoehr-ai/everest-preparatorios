-- Script completo para resetar e configurar usuários de teste funcionais

-- 1. Limpar dados existentes dos usuários de teste (com cast correto para UUID)
DELETE FROM student_profiles WHERE user_uuid IN (
    SELECT id::uuid FROM auth.users WHERE email IN ('aluno@teste.com', 'professor@teste.com')
);

DELETE FROM teacher_profiles WHERE user_uuid IN (
    SELECT id::uuid FROM auth.users WHERE email IN ('aluno@teste.com', 'professor@teste.com')
);

DELETE FROM user_roles WHERE user_uuid IN (
    SELECT id::uuid FROM auth.users WHERE email IN ('aluno@teste.com', 'professor@teste.com')
);

DELETE FROM paid_users WHERE email IN ('aluno@teste.com', 'professor@teste.com');

-- 2. Deletar usuários existentes do auth
DELETE FROM auth.users WHERE email IN ('aluno@teste.com', 'professor@teste.com');

-- 3. Criar usuários novos com email já confirmado
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES 
-- Usuário Aluno
(
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'aluno@teste.com',
    crypt('123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
),
-- Usuário Professor
(
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'professor@teste.com',
    crypt('123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- 4. Garantir acesso pago
INSERT INTO paid_users (email, status, created_at, updated_at) VALUES
('aluno@teste.com', 'active', NOW(), NOW()),
('professor@teste.com', 'active', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET 
    status = 'active',
    updated_at = NOW();

-- 5. Configurar roles
INSERT INTO user_roles (user_uuid, role, first_login, profile_completed, created_at, updated_at)
SELECT id::uuid, 'student', false, true, NOW(), NOW()
FROM auth.users 
WHERE email = 'aluno@teste.com'
ON CONFLICT (user_uuid) DO UPDATE SET 
    role = 'student',
    profile_completed = true,
    updated_at = NOW();

INSERT INTO user_roles (user_uuid, role, first_login, profile_completed, created_at, updated_at)
SELECT id::uuid, 'teacher', false, true, NOW(), NOW()
FROM auth.users 
WHERE email = 'professor@teste.com'
ON CONFLICT (user_uuid) DO UPDATE SET 
    role = 'teacher',
    profile_completed = true,
    updated_at = NOW();

-- 6. Criar perfis
INSERT INTO student_profiles (user_uuid, name, grade, school, created_at, updated_at)
SELECT id::uuid, 'Aluno Teste', '3º Ano', 'Escola Teste', NOW(), NOW()
FROM auth.users 
WHERE email = 'aluno@teste.com'
ON CONFLICT (user_uuid) DO UPDATE SET 
    name = 'Aluno Teste',
    grade = '3º Ano',
    school = 'Escola Teste',
    updated_at = NOW();

INSERT INTO teacher_profiles (user_uuid, name, subject, school, created_at, updated_at)
SELECT id::uuid, 'Professor Teste', 'Português', 'Escola Teste', NOW(), NOW()
FROM auth.users 
WHERE email = 'professor@teste.com'
ON CONFLICT (user_uuid) DO UPDATE SET 
    name = 'Professor Teste',
    subject = 'Português',
    school = 'Escola Teste',
    updated_at = NOW();

-- 7. Verificar se tudo está correto
SELECT 
    '=== VERIFICAÇÃO FINAL ===' as status;

SELECT 
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmado,
    pu.status as acesso_pago,
    ur.role as funcao,
    CASE 
        WHEN ur.role = 'student' THEN sp.name
        WHEN ur.role = 'teacher' THEN tp.name
        ELSE 'SEM PERFIL'
    END as nome_perfil,
    'PRONTO!' as status
FROM auth.users u
LEFT JOIN paid_users pu ON u.email = pu.email
LEFT JOIN user_roles ur ON u.id::uuid = ur.user_uuid
LEFT JOIN student_profiles sp ON u.id::uuid = sp.user_uuid
LEFT JOIN teacher_profiles tp ON u.id::uuid = tp.user_uuid
WHERE u.email IN ('aluno@teste.com', 'professor@teste.com')
ORDER BY u.email;

-- 8. Testar função de verificação de acesso
SELECT 
    'TESTE DE ACESSO PAGO:' as teste;

SELECT 
    email,
    check_paid_access(email) as tem_acesso
FROM (
    VALUES 
    ('aluno@teste.com'),
    ('professor@teste.com')
) AS test_emails(email);

SELECT 'USUÁRIOS CRIADOS COM SUCESSO! Teste agora: aluno@teste.com / 123456 e professor@teste.com / 123456' as resultado;
