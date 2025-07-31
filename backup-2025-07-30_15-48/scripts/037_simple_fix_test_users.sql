-- Script mais simples para garantir que os usuários de teste funcionem

-- 1. Garantir acesso pago
INSERT INTO paid_users (email, status, created_at, updated_at) VALUES
('aluno@teste.com', 'active', NOW(), NOW()),
('professor@teste.com', 'active', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET status = 'active', updated_at = NOW();

-- 2. Configurar aluno
INSERT INTO user_roles (user_uuid, role, first_login, profile_completed, created_at, updated_at)
SELECT id, 'student', false, true, NOW(), NOW()
FROM auth.users 
WHERE email = 'aluno@teste.com'
ON CONFLICT (user_uuid) DO UPDATE SET 
    role = 'student', 
    first_login = false, 
    profile_completed = true, 
    updated_at = NOW();

INSERT INTO student_profiles (user_uuid, name, grade, school, created_at, updated_at)
SELECT id, 'Aluno Teste', '3º Ano', 'Escola Teste', NOW(), NOW()
FROM auth.users 
WHERE email = 'aluno@teste.com'
ON CONFLICT (user_uuid) DO UPDATE SET updated_at = NOW();

-- 3. Configurar professor
INSERT INTO user_roles (user_uuid, role, first_login, profile_completed, created_at, updated_at)
SELECT id, 'teacher', false, true, NOW(), NOW()
FROM auth.users 
WHERE email = 'professor@teste.com'
ON CONFLICT (user_uuid) DO UPDATE SET 
    role = 'teacher', 
    first_login = false, 
    profile_completed = true, 
    updated_at = NOW();

INSERT INTO teacher_profiles (user_uuid, name, subject, school, created_at, updated_at)
SELECT id, 'Professor Teste', 'Português', 'Escola Teste', NOW(), NOW()
FROM auth.users 
WHERE email = 'professor@teste.com'
ON CONFLICT (user_uuid) DO UPDATE SET updated_at = NOW();

-- 4. Verificar resultado
SELECT 
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmado,
    pu.status as status_pago,
    ur.role as funcao,
    'PRONTO PARA USAR!' as status
FROM auth.users u
LEFT JOIN paid_users pu ON u.email = pu.email
LEFT JOIN user_roles ur ON u.id = ur.user_uuid
WHERE u.email IN ('aluno@teste.com', 'professor@teste.com')
ORDER BY u.email;

-- 5. Testar função de acesso
SELECT 
    'aluno@teste.com' as email,
    check_paid_access('aluno@teste.com') as tem_acesso_pago
UNION ALL
SELECT 
    'professor@teste.com' as email,
    check_paid_access('professor@teste.com') as tem_acesso_pago;
