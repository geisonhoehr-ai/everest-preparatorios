-- Script simplificado para criar usuários de teste
-- IMPORTANTE: Execute este script no Supabase SQL Editor

-- 1. Limpar dados antigos (se existirem)
DELETE FROM public.wrong_cards WHERE user_uuid::text IN (
    SELECT id::text FROM auth.users WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com')
);

DELETE FROM public.user_roles WHERE user_uuid::text IN (
    SELECT id::text FROM auth.users WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com')  
);

DELETE FROM public.student_profiles WHERE user_uuid::text IN (
    SELECT id::text FROM auth.users WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com')
);

DELETE FROM public.teacher_profiles WHERE user_uuid::text IN (
    SELECT id::text FROM auth.users WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com')
);

DELETE FROM public.paid_users WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com');

-- 2. Configurar acesso pago primeiro
INSERT INTO public.paid_users (email, status, created_at, updated_at)
VALUES 
    ('aluno@teste.com', 'active', NOW(), NOW()),
    ('professor@teste.com', 'active', NOW(), NOW()),
    ('admin@teste.com', 'active', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
    status = 'active',
    updated_at = NOW();

-- 3. IMPORTANTE: Os usuários precisam ser criados via signup normal
-- Este script apenas configura os dados auxiliares
-- Você precisa fazer signup manual dos usuários primeiro:
-- 1. Vá para /signup
-- 2. Registre: aluno@teste.com / 123456 como "Estudante"  
-- 3. Registre: professor@teste.com / 123456 como "Professor"
-- 4. Registre: admin@teste.com / 123456 como "Professor"

-- 4. Depois do signup manual, este script configurará os roles corretos:

-- Configurar role de admin para admin@teste.com (após signup)
INSERT INTO public.user_roles (user_uuid, role, first_login, profile_completed)
SELECT 
    id,
    'admin',
    false,
    true
FROM auth.users 
WHERE email = 'admin@teste.com'
ON CONFLICT (user_uuid) DO UPDATE SET
    role = 'admin',
    profile_completed = true;

-- Configurar role de teacher para professor@teste.com (após signup)  
INSERT INTO public.user_roles (user_uuid, role, first_login, profile_completed)
SELECT 
    id,
    'teacher', 
    false,
    true
FROM auth.users
WHERE email = 'professor@teste.com'
ON CONFLICT (user_uuid) DO UPDATE SET
    role = 'teacher',
    profile_completed = true;

-- Garantir que aluno tem role student
INSERT INTO public.user_roles (user_uuid, role, first_login, profile_completed)
SELECT 
    id,
    'student',
    false, 
    true
FROM auth.users
WHERE email = 'aluno@teste.com'
ON CONFLICT (user_uuid) DO UPDATE SET
    role = 'student',
    profile_completed = true;

-- 5. Atualizar perfis com nomes mais descritivos
UPDATE public.student_profiles 
SET nome_completo = 'Aluno de Teste'
WHERE user_uuid::text IN (SELECT id::text FROM auth.users WHERE email = 'aluno@teste.com');

UPDATE public.teacher_profiles 
SET nome_completo = 'Professor de Teste'
WHERE user_uuid::text IN (SELECT id::text FROM auth.users WHERE email = 'professor@teste.com');

UPDATE public.teacher_profiles 
SET nome_completo = 'Administrador do Sistema'
WHERE user_uuid::text IN (SELECT id::text FROM auth.users WHERE email = 'admin@teste.com');

-- 6. Verificar configuração
SELECT 
    u.email,
    ur.role,
    pu.status as paid_status,
    CASE 
        WHEN ur.role = 'student' THEN sp.nome_completo
        WHEN ur.role IN ('teacher', 'admin') THEN tp.nome_completo
    END as nome_completo
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id::text = ur.user_uuid::text  
LEFT JOIN public.paid_users pu ON u.email = pu.email
LEFT JOIN public.student_profiles sp ON u.id::text = sp.user_uuid::text
LEFT JOIN public.teacher_profiles tp ON u.id::text = tp.user_uuid::text
WHERE u.email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com')
ORDER BY u.email; 