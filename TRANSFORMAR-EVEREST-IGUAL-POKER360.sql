-- =====================================================
-- TRANSFORMAR EVEREST PREPARATÓRIOS IGUAL AO POKER 360
-- =====================================================
-- Este script limpa a estrutura conflitante e cria uma arquitetura limpa
-- igual ao sistema do Poker 360, mas com 3 roles (admin, teacher, student)

-- 1. LIMPAR ESTRUTURA CONFLITANTE
-- =====================================================
-- Remover tabelas conflitantes
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS student_profiles CASCADE;
DROP TABLE IF EXISTS teacher_profiles CASCADE;
DROP TABLE IF EXISTS members CASCADE;

-- Remover tabela user_profiles atual (se existir)
DROP TABLE IF EXISTS user_profiles CASCADE;

-- 2. CRIAR ESTRUTURA UNIFICADA (IGUAL AO POKER 360)
-- =====================================================
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student')),
    display_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- 4. HABILITAR RLS (ROW LEVEL SECURITY)
-- =====================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. CRIAR POLÍTICAS DE SEGURANÇA (IGUAIS AO POKER 360)
-- =====================================================
-- Usuários podem ler seu próprio perfil
CREATE POLICY "users_can_read_own_profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "users_can_update_own_profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Usuários autenticados podem inserir perfis
CREATE POLICY "authenticated_users_can_insert_profiles" ON user_profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 6. CRIAR TRIGGER PARA ATUALIZAR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profiles_updated_at();

-- 7. CRIAR USUÁRIOS DE TESTE
-- =====================================================
-- Criar usuários no auth.users (apenas se não existirem)
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

-- 8. CRIAR PERFIS AUTOMATICAMENTE
-- =====================================================
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

-- 9. VERIFICAR ESTRUTURA CRIADA
-- =====================================================
-- Verificar se a tabela foi criada corretamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'user_profiles'
AND schemaname = 'public'
ORDER BY policyname;

-- Verificar usuários criados
SELECT 
    au.id,
    au.email,
    au.email_confirmed_at,
    up.role,
    up.display_name,
    up.created_at
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE au.email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com')
ORDER BY up.role, up.created_at;

-- 10. MENSAGEM DE SUCESSO
-- =====================================================
SELECT '🎉 EVEREST PREPARATÓRIOS TRANSFORMADO COM SUCESSO!' as status;
SELECT '✅ Estrutura igual ao Poker 360 criada' as estrutura;
SELECT '✅ Usuários de teste criados' as usuarios;
SELECT '✅ Políticas RLS configuradas' as rls;
SELECT '✅ Sistema pronto para uso!' as final;
