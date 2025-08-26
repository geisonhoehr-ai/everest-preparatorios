-- Script completo para configurar sistema de autenticação
-- Data: 2025-01-28
-- Este script cria todas as tabelas necessárias para o sistema de autenticação

-- 1. CRIAR TABELA user_roles
CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    user_uuid TEXT UNIQUE NOT NULL, -- ID do usuário do auth.users
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    first_login BOOLEAN DEFAULT true,
    profile_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CRIAR TABELA user_profiles (tabela unificada para todos os usuários)
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_uuid TEXT UNIQUE NOT NULL, -- ID do usuário do auth.users
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    progress INTEGER DEFAULT 0,
    ranking INTEGER DEFAULT 0,
    total_flashcards INTEGER DEFAULT 0,
    completed_flashcards INTEGER DEFAULT 0,
    total_quizzes INTEGER DEFAULT 0,
    completed_quizzes INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_study_time INTEGER DEFAULT 0, -- em minutos
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    first_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CRIAR TABELA student_profiles (específica para alunos)
CREATE TABLE IF NOT EXISTS student_profiles (
    id SERIAL PRIMARY KEY,
    user_uuid TEXT UNIQUE NOT NULL, -- ID do usuário do auth.users
    nome_completo TEXT,
    escola TEXT,
    ano_escolar TEXT,
    objetivo TEXT,
    data_nascimento DATE,
    total_flashcards INTEGER DEFAULT 0,
    completed_flashcards INTEGER DEFAULT 0,
    total_quizzes INTEGER DEFAULT 0,
    completed_quizzes INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_study_time INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    first_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CRIAR TABELA teacher_profiles (específica para professores)
CREATE TABLE IF NOT EXISTS teacher_profiles (
    id SERIAL PRIMARY KEY,
    user_uuid TEXT UNIQUE NOT NULL, -- ID do usuário do auth.users
    nome_completo TEXT NOT NULL,
    especialidade TEXT,
    formacao TEXT,
    experiencia_anos INTEGER,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CRIAR TABELA members (para gerenciamento de membros)
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- 7. CRIAR POLÍTICAS RLS PARA user_roles
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
CREATE POLICY "Users can view their own role" ON user_roles
    FOR SELECT USING (user_uuid = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own role" ON user_roles;
CREATE POLICY "Users can update their own role" ON user_roles
    FOR UPDATE USING (user_uuid = auth.uid()::text);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_roles;
CREATE POLICY "Enable insert for authenticated users" ON user_roles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 8. CRIAR POLÍTICAS RLS PARA user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (user_uuid = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (user_uuid = auth.uid()::text);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_profiles;
CREATE POLICY "Enable insert for authenticated users" ON user_profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 9. CRIAR POLÍTICAS RLS PARA student_profiles
DROP POLICY IF EXISTS "Students can view their own profile" ON student_profiles;
CREATE POLICY "Students can view their own profile" ON student_profiles
    FOR SELECT USING (user_uuid = auth.uid()::text);

DROP POLICY IF EXISTS "Students can update their own profile" ON student_profiles;
CREATE POLICY "Students can update their own profile" ON student_profiles
    FOR UPDATE USING (user_uuid = auth.uid()::text);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON student_profiles;
CREATE POLICY "Enable insert for authenticated users" ON student_profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 10. CRIAR POLÍTICAS RLS PARA teacher_profiles
DROP POLICY IF EXISTS "Teachers can view their own profile" ON teacher_profiles;
CREATE POLICY "Teachers can view their own profile" ON teacher_profiles
    FOR SELECT USING (user_uuid = auth.uid()::text);

DROP POLICY IF EXISTS "Teachers can update their own profile" ON teacher_profiles;
CREATE POLICY "Teachers can update their own profile" ON teacher_profiles
    FOR UPDATE USING (user_uuid = auth.uid()::text);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON teacher_profiles;
CREATE POLICY "Enable insert for authenticated users" ON teacher_profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 11. CRIAR POLÍTICAS RLS PARA members
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON members;
CREATE POLICY "Enable read access for authenticated users" ON members
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON members;
CREATE POLICY "Enable insert for authenticated users" ON members
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users" ON members;
CREATE POLICY "Enable update for authenticated users" ON members
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON members;
CREATE POLICY "Enable delete for authenticated users" ON members
    FOR DELETE USING (auth.role() = 'authenticated');

-- 12. CRIAR ÍNDICES PARA MELHOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_user_roles_user_uuid ON user_roles(user_uuid);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_uuid ON user_profiles(user_uuid);
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_uuid ON student_profiles(user_uuid);
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_user_uuid ON teacher_profiles(user_uuid);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);

-- 13. CRIAR FUNÇÃO PARA ATUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 14. CRIAR TRIGGERS PARA ATUALIZAR updated_at
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_student_profiles_updated_at ON student_profiles;
CREATE TRIGGER update_student_profiles_updated_at
    BEFORE UPDATE ON student_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teacher_profiles_updated_at ON teacher_profiles;
CREATE TRIGGER update_teacher_profiles_updated_at
    BEFORE UPDATE ON teacher_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_members_updated_at ON members;
CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 15. VERIFICAR ESTRUTURA FINAL
SELECT '=== ESTRUTURA FINAL ===' as info;

SELECT 
    table_name,
    CASE WHEN table_name IS NOT NULL THEN '✅ CRIADA' ELSE '❌ NÃO CRIADA' END as status
FROM information_schema.tables 
WHERE table_name IN ('user_roles', 'user_profiles', 'student_profiles', 'teacher_profiles', 'members')
AND table_schema = 'public'
ORDER BY table_name;

-- 16. MOSTRAR POLÍTICAS RLS CRIADAS
SELECT '=== POLÍTICAS RLS ===' as info;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('user_roles', 'user_profiles', 'student_profiles', 'teacher_profiles', 'members')
ORDER BY tablename, policyname;

SELECT '=== SCRIPT CONCLUÍDO ===' as info;
