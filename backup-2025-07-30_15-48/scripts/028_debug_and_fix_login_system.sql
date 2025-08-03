-- Script para diagnosticar e corrigir o sistema de login
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar usuários existentes no auth.users
SELECT 'AUTH_USERS' as tabela, email, id, email_confirmed_at, created_at 
FROM auth.users 
WHERE email IN ('professor@teste.com', 'aluno@teste.com', 'teste@professor.com', 'teste@aluno.com')
ORDER BY email;

-- 2. Verificar usuários na tabela paid_users
SELECT 'PAID_USERS' as tabela, email, status, created_at 
FROM paid_users 
WHERE email IN ('professor@teste.com', 'aluno@teste.com', 'teste@professor.com', 'teste@aluno.com')
ORDER BY email;

-- 3. Verificar roles na tabela user_roles
SELECT 'USER_ROLES' as tabela, ur.user_uuid, ur.role, au.email
FROM user_roles ur
JOIN auth.users au ON ur.user_uuid = au.id::text
WHERE au.email IN ('professor@teste.com', 'aluno@teste.com', 'teste@professor.com', 'teste@aluno.com')
ORDER BY au.email;

-- 4. Verificar perfis de estudante
SELECT 'STUDENT_PROFILES' as tabela, sp.user_uuid, sp.nome_completo, au.email
FROM student_profiles sp
JOIN auth.users au ON sp.user_uuid = au.id::text
WHERE au.email IN ('professor@teste.com', 'aluno@teste.com', 'teste@professor.com', 'teste@aluno.com')
ORDER BY au.email;

-- 5. Verificar perfis de professor
SELECT 'TEACHER_PROFILES' as tabela, tp.user_uuid, tp.nome_completo, au.email
FROM teacher_profiles tp
JOIN auth.users au ON tp.user_uuid = au.id::text
WHERE au.email IN ('professor@teste.com', 'aluno@teste.com', 'teste@professor.com', 'teste@aluno.com')
ORDER BY au.email;

-- 6. CORREÇÃO: Garantir que usuários de teste existam em paid_users
INSERT INTO paid_users (email, status) VALUES 
('professor@teste.com', 'active'),
('aluno@teste.com', 'active'),
('teste@professor.com', 'active'),
('teste@aluno.com', 'active')
ON CONFLICT (email) DO UPDATE SET 
    status = 'active',
    updated_at = NOW();

-- 7. CORREÇÃO: Configurar roles para usuários existentes
DO $$
DECLARE
    professor_id uuid;
    aluno_id uuid;
BEGIN
    -- Buscar IDs dos usuários
    SELECT id INTO professor_id FROM auth.users WHERE email = 'professor@teste.com';
    SELECT id INTO aluno_id FROM auth.users WHERE email = 'aluno@teste.com';
    
    -- Configurar role de professor
    IF professor_id IS NOT NULL THEN
        INSERT INTO user_roles (user_uuid, role, first_login, profile_completed)
        VALUES (professor_id::text, 'teacher', false, true)
        ON CONFLICT (user_uuid) DO UPDATE SET 
            role = 'teacher',
            profile_completed = true,
            updated_at = NOW();
        
        -- Criar perfil de professor
        INSERT INTO teacher_profiles (user_uuid, nome_completo, especialidade, formacao)
        VALUES (professor_id::text, 'Professor Teste', 'Língua Portuguesa', 'Licenciatura em Letras')
        ON CONFLICT (user_uuid) DO UPDATE SET
            nome_completo = 'Professor Teste',
            especialidade = 'Língua Portuguesa',
            formacao = 'Licenciatura em Letras';
            
        RAISE NOTICE 'Professor configurado: professor@teste.com (ID: %)', professor_id;
    ELSE
        RAISE NOTICE 'Usuário professor@teste.com não encontrado no auth.users';
    END IF;
    
    -- Configurar role de aluno
    IF aluno_id IS NOT NULL THEN
        INSERT INTO user_roles (user_uuid, role, first_login, profile_completed)
        VALUES (aluno_id::text, 'student', false, true)
        ON CONFLICT (user_uuid) DO UPDATE SET 
            role = 'student',
            profile_completed = true,
            updated_at = NOW();
        
        -- Criar perfil de aluno
        INSERT INTO student_profiles (user_uuid, nome_completo, escola, ano_escolar)
        VALUES (aluno_id::text, 'Aluno Teste', 'Escola Teste', '3ano')
        ON CONFLICT (user_uuid) DO UPDATE SET
            nome_completo = 'Aluno Teste',
            escola = 'Escola Teste',
            ano_escolar = '3ano';
            
        RAISE NOTICE 'Aluno configurado: aluno@teste.com (ID: %)', aluno_id;
    ELSE
        RAISE NOTICE 'Usuário aluno@teste.com não encontrado no auth.users';
    END IF;
    
    RAISE NOTICE '✅ Script de diagnóstico e correção executado!';
    RAISE NOTICE '📋 Verifique os resultados acima para confirmar se tudo está correto.';
    RAISE NOTICE '🔑 Credenciais de teste:';
    RAISE NOTICE '   Professor: professor@teste.com / 123456';
    RAISE NOTICE '   Aluno: aluno@teste.com / 123456';
END $$;

-- 8. Verificar configuração final
SELECT 
    'FINAL_CHECK' as status,
    au.email,
    au.email_confirmed_at IS NOT NULL as email_confirmed,
    pu.status as paid_status,
    ur.role,
    CASE 
        WHEN ur.role = 'student' AND sp.user_uuid IS NOT NULL THEN 'student_profile_ok'
        WHEN ur.role = 'teacher' AND tp.user_uuid IS NOT NULL THEN 'teacher_profile_ok'
        ELSE 'profile_missing'
    END as profile_status
FROM auth.users au
LEFT JOIN paid_users pu ON au.email = pu.email
LEFT JOIN user_roles ur ON au.id::text = ur.user_uuid
LEFT JOIN student_profiles sp ON au.id::text = sp.user_uuid
LEFT JOIN teacher_profiles tp ON au.id::text = tp.user_uuid
WHERE au.email IN ('professor@teste.com', 'aluno@teste.com')
ORDER BY au.email;
