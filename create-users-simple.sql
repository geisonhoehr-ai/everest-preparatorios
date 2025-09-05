-- Script simples para criar usuarios
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Verificar usuarios existentes
SELECT id, email FROM auth.users 
WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com');

-- 2. Criar usuarios com estrutura minima
-- (Execute apenas se nao existirem usuarios)

-- Criar aluno
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(), 
    '00000000-0000-0000-0000-000000000000', 
    'authenticated', 
    'authenticated', 
    'aluno@teste.com', 
    crypt('123456', gen_salt('bf')), 
    NOW(), 
    NOW(), 
    NOW()
);

-- Criar admin
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(), 
    '00000000-0000-0000-0000-000000000000', 
    'authenticated', 
    'authenticated', 
    'admin@teste.com', 
    crypt('123456', gen_salt('bf')), 
    NOW(), 
    NOW(), 
    NOW()
);

-- Criar professor
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(), 
    '00000000-0000-0000-0000-000000000000', 
    'authenticated', 
    'authenticated', 
    'professor@teste.com', 
    crypt('123456', gen_salt('bf')), 
    NOW(), 
    NOW(), 
    NOW()
);

-- 3. Verificar se foram criados
SELECT id, email, email_confirmed_at FROM auth.users 
WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com');
