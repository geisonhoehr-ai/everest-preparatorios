-- =====================================================
-- TRANSFORMAR EVEREST IGUAL AO POKER 360 - VERSÃO SIMPLES
-- =====================================================
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. LIMPAR ESTRUTURA CONFLITANTE
-- =====================================================
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS student_profiles CASCADE;
DROP TABLE IF EXISTS teacher_profiles CASCADE;
DROP TABLE IF EXISTS members CASCADE;
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

-- 3. CRIAR ÍNDICES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- 4. HABILITAR RLS
-- =====================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. CRIAR POLÍTICAS (IGUAIS AO POKER 360)
-- =====================================================
CREATE POLICY "users_can_read_own_profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "authenticated_users_can_insert_profiles" ON user_profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 6. CRIAR TRIGGER
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

-- 7. VERIFICAR ESTRUTURA
-- =====================================================
SELECT 'ESTRUTURA CRIADA COM SUCESSO!' as status;
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;
