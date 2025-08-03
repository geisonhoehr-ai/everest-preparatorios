-- Script para garantir que roles e perfis de usuários de teste estejam corretos
-- Este script NÃO recria usuários em auth.users, apenas garante as tabelas relacionadas.

-- 1. Garantir que os emails de teste estejam na tabela paid_users com status 'active'
INSERT INTO paid_users (email, status, created_at, updated_at) VALUES
('aluno@teste.com', 'active', NOW(), NOW()),
('professor@teste.com', 'active', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET 
    status = 'active',
    updated_at = NOW();

-- 2. Garantir que os usuários de teste tenham roles corretas na tabela user_roles
-- Para aluno@teste.com
INSERT INTO user_roles (user_uuid, role, first_login, profile_completed, created_at, updated_at)
SELECT id::uuid, 'student', false, true, NOW(), NOW()
FROM auth.users 
WHERE email = 'aluno@teste.com'
ON CONFLICT (user_uuid) DO UPDATE SET 
    role = 'student',
    first_login = false,
    profile_completed = true,
    updated_at = NOW();

-- Para professor@teste.com
INSERT INTO user_roles (user_uuid, role, first_login, profile_completed, created_at, updated_at)
SELECT id::uuid, 'teacher', false, true, NOW(), NOW()
FROM auth.users 
WHERE email = 'professor@teste.com'
ON CONFLICT (user_uuid) DO UPDATE SET 
    role = 'teacher',
    first_login = false,
    profile_completed = true,
    updated_at = NOW();

-- 3. Garantir que os perfis de estudante e professor existam
-- Para aluno@teste.com (student_profiles)
INSERT INTO student_profiles (user_uuid, name, grade, school, created_at, updated_at)
SELECT id::uuid, 'Aluno Teste', '3º Ano', 'Escola Teste', NOW(), NOW()
FROM auth.users 
WHERE email = 'aluno@teste.com'
ON CONFLICT (user_uuid) DO UPDATE SET 
    name = 'Aluno Teste',
    grade = '3º Ano',
    school = 'Escola Teste',
    updated_at = NOW();

-- Para professor@teste.com (teacher_profiles)
INSERT INTO teacher_profiles (user_uuid, name, subject, school, created_at, updated_at)
SELECT id::uuid, 'Professor Teste', 'Português', 'Escola Teste', NOW(), NOW()
FROM auth.users 
WHERE email = 'professor@teste.com'
ON CONFLICT (user_uuid) DO UPDATE SET 
    name = 'Professor Teste',
    subject = 'Português',
    school = 'Escola Teste',
    updated_at = NOW();

-- 4. Verificação final de todos os dados
SELECT 
    '=== VERIFICAÇÃO FINAL DOS DADOS ===' as status;

SELECT 
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmado_auth,
    pu.status as acesso_pago_status,
    ur.role as funcao_definida,
    sp.name as nome_aluno,
    tp.name as nome_professor,
    'DADOS OK!' as resultado
FROM auth.users u
LEFT JOIN paid_users pu ON u.email = pu.email
LEFT JOIN user_roles ur ON u.id::uuid = ur.user_uuid
LEFT JOIN student_profiles sp ON u.id::uuid = sp.user_uuid
LEFT JOIN teacher_profiles tp ON u.id::uuid = tp.user_uuid
WHERE u.email IN ('aluno@teste.com', 'professor@teste.com')
ORDER BY u.email;

-- 5. Testar a função check_paid_access (se existir)
-- Se a função não existir, ela será criada ou substituída pelo script 024_fix_paid_access_control.sql
-- que já foi fornecido anteriormente.
SELECT 
    '=== TESTE DA FUNÇÃO check_paid_access ===' as status;

SELECT 
    email,
    check_paid_access(email) as tem_acesso_pago_funcao
FROM (
    VALUES 
    ('aluno@teste.com'),
    ('professor@teste.com')
) AS test_emails(email);

SELECT 'TENTAR FAZER LOGIN AGORA!' as instrucao;
