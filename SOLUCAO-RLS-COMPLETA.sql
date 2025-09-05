-- Solução completa para problemas de RLS
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Verificar políticas atuais
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'courses', 'temas_redacao')
AND schemaname = 'public';

-- 2. Desabilitar RLS temporariamente
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE temas_redacao DISABLE ROW LEVEL SECURITY;

-- 3. Criar usuarios se nao existirem
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
) 
SELECT 
    gen_random_uuid(), 
    '00000000-0000-0000-0000-000000000000', 
    'authenticated', 
    'authenticated', 
    'aluno@teste.com', 
    crypt('123456', gen_salt('bf')), 
    NOW(), 
    NOW(), 
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'aluno@teste.com'
);

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
) 
SELECT 
    gen_random_uuid(), 
    '00000000-0000-0000-0000-000000000000', 
    'authenticated', 
    'authenticated', 
    'admin@teste.com', 
    crypt('123456', gen_salt('bf')), 
    NOW(), 
    NOW(), 
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@teste.com'
);

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
) 
SELECT 
    gen_random_uuid(), 
    '00000000-0000-0000-0000-000000000000', 
    'authenticated', 
    'authenticated', 
    'professor@teste.com', 
    crypt('123456', gen_salt('bf')), 
    NOW(), 
    NOW(), 
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'professor@teste.com'
);

-- 4. Criar perfis automaticamente
INSERT INTO user_profiles (user_id, role, display_name, created_at, updated_at)
SELECT 
    au.id,
    CASE 
        WHEN au.email = 'aluno@teste.com' THEN 'student'
        WHEN au.email = 'admin@teste.com' THEN 'admin'
        WHEN au.email = 'professor@teste.com' THEN 'teacher'
    END as role,
    CASE 
        WHEN au.email = 'aluno@teste.com' THEN 'Aluno Teste'
        WHEN au.email = 'admin@teste.com' THEN 'Admin Teste'
        WHEN au.email = 'professor@teste.com' THEN 'Professor Teste'
    END as display_name,
    NOW() as created_at,
    NOW() as updated_at
FROM auth.users au
WHERE au.email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com')
AND NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.user_id = au.id
);

-- 5. Reabilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE temas_redacao ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas básicas
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Verificar resultado final
SELECT 
    up.id,
    up.user_id,
    up.role,
    up.display_name,
    au.email,
    au.email_confirmed_at
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
WHERE au.email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com')
ORDER BY up.created_at;
