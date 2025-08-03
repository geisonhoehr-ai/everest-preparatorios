-- Script para recriar todo o sistema de autenticação do zero
-- Execute no SQL Editor do Supabase

-- ========================================
-- PASSO 1: LIMPAR SISTEMA ATUAL
-- ========================================

-- Desabilitar RLS temporariamente
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE topics DISABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards DISABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Remover políticas RLS existentes
DROP POLICY IF EXISTS "Enable read access for all users" ON subjects;
DROP POLICY IF EXISTS "Enable read access for all users" ON topics;
DROP POLICY IF EXISTS "Enable read access for all users" ON flashcards;
DROP POLICY IF EXISTS "Enable read access for all users" ON quizzes;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_roles;

-- ========================================
-- PASSO 2: CRIAR NOVO SISTEMA DE ROLES
-- ========================================

-- Recriar tabela user_roles com estrutura limpa
DROP TABLE IF EXISTS user_roles CASCADE;

CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_uuid UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_uuid)
);

-- ========================================
-- PASSO 3: CRIAR FUNÇÃO PARA ATUALIZAR TIMESTAMP
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ========================================
-- PASSO 4: CRIAR TRIGGER PARA USER_ROLES
-- ========================================

CREATE TRIGGER update_user_roles_updated_at 
    BEFORE UPDATE ON user_roles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- PASSO 5: CRIAR FUNÇÃO PARA CRIAR ROLE AUTOMATICAMENTE
-- ========================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_roles (user_uuid, role)
    VALUES (NEW.id, 'student');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- PASSO 6: CRIAR TRIGGER PARA NOVOS USUÁRIOS
-- ========================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ========================================
-- PASSO 7: CRIAR POLÍTICAS RLS SIMPLES
-- ========================================

-- Habilitar RLS
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Política para subjects (todos podem ler)
CREATE POLICY "Enable read access for all users" ON subjects
    FOR SELECT USING (true);

-- Política para topics (todos podem ler)
CREATE POLICY "Enable read access for all users" ON topics
    FOR SELECT USING (true);

-- Política para flashcards (todos podem ler)
CREATE POLICY "Enable read access for all users" ON flashcards
    FOR SELECT USING (true);

-- Política para quizzes (todos podem ler)
CREATE POLICY "Enable read access for all users" ON quizzes
    FOR SELECT USING (true);

-- Política para user_roles (usuário só pode ver seu próprio role)
CREATE POLICY "Users can view own role" ON user_roles
    FOR SELECT USING (auth.uid() = user_uuid);

-- ========================================
-- PASSO 8: CRIAR FUNÇÕES HELPER
-- ========================================

-- Função para obter role do usuário
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM user_roles
    WHERE user_roles.user_uuid = get_user_role.user_uuid;
    
    RETURN COALESCE(user_role, 'student');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role(user_uuid) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário é teacher
CREATE OR REPLACE FUNCTION is_teacher(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role(user_uuid) IN ('teacher', 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- PASSO 9: INSERIR DADOS DE TESTE
-- ========================================

-- Inserir roles de teste (se necessário)
INSERT INTO user_roles (user_uuid, role) 
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'admin'),
    ('00000000-0000-0000-0000-000000000002', 'teacher'),
    ('00000000-0000-0000-0000-000000000003', 'student')
ON CONFLICT (user_uuid) DO NOTHING;

-- ========================================
-- PASSO 10: VERIFICAÇÃO FINAL
-- ========================================

-- Verificar se tudo foi criado corretamente
SELECT 
    'VERIFICAÇÃO FINAL' as etapa,
    (SELECT COUNT(*) FROM user_roles) as total_roles,
    (SELECT COUNT(*) FROM subjects) as total_subjects,
    (SELECT COUNT(*) FROM topics) as total_topics,
    (SELECT COUNT(*) FROM flashcards) as total_flashcards;

-- Verificar políticas RLS
SELECT 
    'POLÍTICAS RLS' as etapa,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('subjects', 'topics', 'flashcards', 'quizzes', 'user_roles')
ORDER BY tablename, policyname;

-- Verificar triggers
SELECT 
    'TRIGGERS' as etapa,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name IN ('on_auth_user_created', 'update_user_roles_updated_at');

-- ========================================
-- PASSO 11: TESTAR FUNÇÕES
-- ========================================

-- Testar função get_user_role
SELECT 
    'TESTE FUNÇÕES' as etapa,
    get_user_role('00000000-0000-0000-0000-000000000001') as admin_role,
    get_user_role('00000000-0000-0000-0000-000000000002') as teacher_role,
    get_user_role('00000000-0000-0000-0000-000000000003') as student_role,
    is_admin('00000000-0000-0000-0000-000000000001') as is_admin_test,
    is_teacher('00000000-0000-0000-0000-000000000002') as is_teacher_test;

-- ========================================
-- PASSO 12: RESUMO FINAL
-- ========================================

SELECT 
    '🎉 SISTEMA DE AUTENTICAÇÃO RECRIADO!' as status,
    'Todas as tabelas têm RLS habilitado' as rls_status,
    'Políticas simples de leitura criadas' as policies_status,
    'Funções helper criadas' as functions_status,
    'Triggers configurados' as triggers_status; 