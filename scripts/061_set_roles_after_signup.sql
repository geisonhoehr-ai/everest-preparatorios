-- 061_set_roles_after_signup.sql
-- CONFIGURAR ROLES APÓS SIGNUP MANUAL

-- Configurar role de professor
UPDATE public.user_roles 
SET role = 'teacher' 
WHERE user_uuid IN (
    SELECT id::text FROM auth.users WHERE email = 'professor@teste.com'
);

-- Inserir role de admin (se ainda não existir)
INSERT INTO public.user_roles (user_uuid, role, created_at, updated_at)
SELECT 
    id::text, 
    'admin',
    NOW(),
    NOW()
FROM auth.users 
WHERE email = 'admin@teste.com'
  AND id::text NOT IN (SELECT user_uuid FROM public.user_roles);

-- Atualizar para admin se já existir
UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_uuid IN (
    SELECT id::text FROM auth.users WHERE email = 'admin@teste.com'
);

-- Verificar resultado
SELECT 
    u.email,
    r.role,
    p.status as paid_status
FROM auth.users u
LEFT JOIN public.user_roles r ON u.id::text = r.user_uuid  
LEFT JOIN public.paid_users p ON u.email = p.email
ORDER BY u.email; 