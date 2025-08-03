-- Verificar se os usuários de teste existem e estão configurados corretamente

-- 1. Verificar usuários no auth.users
SELECT 
    'AUTH_USERS' as tabela,
    email,
    id,
    email_confirmed_at IS NOT NULL as email_confirmed,
    created_at
FROM auth.users 
WHERE email IN ('professor@teste.com', 'aluno@teste.com')
ORDER BY email;

-- 2. Verificar se estão em paid_users
SELECT 
    'PAID_USERS' as tabela,
    email,
    status,
    created_at
FROM paid_users 
WHERE email IN ('professor@teste.com', 'aluno@teste.com')
ORDER BY email;

-- 3. Verificar roles configuradas
SELECT 
    'USER_ROLES' as tabela,
    ur.user_uuid,
    ur.role,
    ur.profile_completed,
    au.email
FROM user_roles ur
JOIN auth.users au ON au.id::text = ur.user_uuid
WHERE au.email IN ('professor@teste.com', 'aluno@teste.com')
ORDER BY au.email;

-- 4. Verificar perfis criados
SELECT 
    'STUDENT_PROFILES' as tabela,
    sp.user_uuid,
    sp.nome_completo,
    sp.escola,
    sp.ano_escolar,
    au.email
FROM student_profiles sp
JOIN auth.users au ON au.id::text = sp.user_uuid
WHERE au.email = 'aluno@teste.com';

SELECT 
    'TEACHER_PROFILES' as tabela,
    tp.user_uuid,
    tp.nome_completo,
    tp.especialidade,
    tp.formacao,
    au.email
FROM teacher_profiles tp
JOIN auth.users au ON au.id::text = tp.user_uuid
WHERE au.email = 'professor@teste.com';

-- 5. Status final consolidado
SELECT 
    'STATUS_FINAL' as check_type,
    au.email,
    au.email_confirmed_at IS NOT NULL as email_confirmed,
    pu.status as paid_status,
    ur.role,
    ur.profile_completed,
    CASE 
        WHEN ur.role = 'student' AND sp.user_uuid IS NOT NULL THEN 'profile_ok'
        WHEN ur.role = 'teacher' AND tp.user_uuid IS NOT NULL THEN 'profile_ok'
        ELSE 'profile_missing'
    END as profile_status
FROM auth.users au
LEFT JOIN paid_users pu ON au.email = pu.email
LEFT JOIN user_roles ur ON au.id::text = ur.user_uuid
LEFT JOIN student_profiles sp ON au.id::text = sp.user_uuid
LEFT JOIN teacher_profiles tp ON au.id::text = tp.user_uuid
WHERE au.email IN ('professor@teste.com', 'aluno@teste.com')
ORDER BY au.email;
