-- Script super simples para configurar usuários de teste
-- Execute APÓS fazer signup manual dos usuários

-- 1. Configurar acesso pago
INSERT INTO public.paid_users (email, status, created_at, updated_at)
VALUES 
    ('aluno@teste.com', 'active', NOW(), NOW()),
    ('professor@teste.com', 'active', NOW(), NOW()),
    ('admin@teste.com', 'active', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
    status = 'active',
    updated_at = NOW();

-- 2. Configurar roles (execute após signup)
-- Para admin@teste.com
UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_uuid = (SELECT id FROM auth.users WHERE email = 'admin@teste.com');

-- Para professor@teste.com  
UPDATE public.user_roles 
SET role = 'teacher'
WHERE user_uuid = (SELECT id FROM auth.users WHERE email = 'professor@teste.com');

-- Para aluno@teste.com (garantir que é student)
UPDATE public.user_roles 
SET role = 'student'
WHERE user_uuid = (SELECT id FROM auth.users WHERE email = 'aluno@teste.com');

-- 3. Verificar resultado
SELECT 
    u.email,
    ur.role,
    pu.status as paid_status
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_uuid  
LEFT JOIN public.paid_users pu ON u.email = pu.email
WHERE u.email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com')
ORDER BY u.email; 