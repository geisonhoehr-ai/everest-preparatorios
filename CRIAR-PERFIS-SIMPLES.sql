-- =====================================================
-- CRIAR PERFIS SIMPLES PARA USUÁRIOS DE TESTE
-- =====================================================
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. VERIFICAR SE A TABELA EXISTE
-- =====================================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles';

-- 2. CRIAR TABELA SE NÃO EXISTIR
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('administrator', 'teacher', 'student')),
    display_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. HABILITAR RLS
-- =====================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS BÁSICAS
-- =====================================================
DROP POLICY IF EXISTS "users_can_read_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "authenticated_users_can_insert_profiles" ON user_profiles;

CREATE POLICY "users_can_read_own_profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "authenticated_users_can_insert_profiles" ON user_profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. CRIAR PERFIS PARA USUÁRIOS EXISTENTES
-- =====================================================
-- Professor
INSERT INTO user_profiles (user_id, role, display_name)
SELECT 
    au.id,
    'teacher',
    'Professor Teste'
FROM auth.users au
WHERE au.email = 'professor@teste.com'
AND NOT EXISTS (
    SELECT 1 FROM user_profiles up 
    WHERE up.user_id = au.id
);

-- Admin
INSERT INTO user_profiles (user_id, role, display_name)
SELECT 
    au.id,
    'administrator',
    'Admin Teste'
FROM auth.users au
WHERE au.email = 'admin@teste.com'
AND NOT EXISTS (
    SELECT 1 FROM user_profiles up 
    WHERE up.user_id = au.id
);

-- Aluno
INSERT INTO user_profiles (user_id, role, display_name)
SELECT 
    au.id,
    'student',
    'Aluno Teste'
FROM auth.users au
WHERE au.email = 'aluno@teste.com'
AND NOT EXISTS (
    SELECT 1 FROM user_profiles up 
    WHERE up.user_id = au.id
);

-- 6. VERIFICAR RESULTADO
-- =====================================================
SELECT 
    up.id,
    up.user_id,
    up.role,
    up.display_name,
    au.email
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE au.email IN ('professor@teste.com', 'admin@teste.com', 'aluno@teste.com')
ORDER BY up.role;

SELECT 'PERFIS CRIADOS COM SUCESSO!' as status;
