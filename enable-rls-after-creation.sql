-- Reabilitar RLS após criar usuarios
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Reabilitar RLS na tabela user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Reabilitar RLS na tabela courses (se existir)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- 3. Reabilitar RLS na tabela temas_redacao (se existir)
ALTER TABLE temas_redacao ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas básicas para user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Verificar se RLS foi reabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'courses', 'temas_redacao')
AND schemaname = 'public';
