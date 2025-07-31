-- Script para configurar o novo Supabase do zero
-- Execute no SQL Editor do Supabase

-- ========================================
-- PASSO 1: CRIAR TABELA USER_ROLES
-- ========================================

-- Criar tabela user_roles
CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    user_uuid UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    first_login BOOLEAN DEFAULT true,
    profile_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_uuid)
);

-- ========================================
-- PASSO 2: CRIAR FUNÇÕES HELPER
-- ========================================

-- Função para obter role do usuário
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (SELECT role FROM user_roles WHERE user_uuid = $1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se é admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT role = 'admin' FROM user_roles WHERE user_uuid = $1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se é teacher
CREATE OR REPLACE FUNCTION is_teacher(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT role IN ('teacher', 'admin') FROM user_roles WHERE user_uuid = $1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- PASSO 3: CRIAR TRIGGER PARA NOVOS USUÁRIOS
-- ========================================

-- Trigger para criar role automaticamente
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_roles (user_uuid, role)
    VALUES (NEW.id, 'student')
    ON CONFLICT (user_uuid) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ========================================
-- PASSO 4: CONFIGURAR RLS
-- ========================================

-- Habilitar RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Política para user_roles (todos podem ver, apenas admins podem modificar)
CREATE POLICY "user_roles_select_policy" ON user_roles
    FOR SELECT USING (true);

CREATE POLICY "user_roles_insert_policy" ON user_roles
    FOR INSERT WITH CHECK (auth.uid() = user_uuid OR is_admin(auth.uid()));

CREATE POLICY "user_roles_update_policy" ON user_roles
    FOR UPDATE USING (auth.uid() = user_uuid OR is_admin(auth.uid()));

-- ========================================
-- PASSO 5: CRIAR USUÁRIOS DE TESTE
-- ========================================

-- Inserir usuários de teste (execute manualmente no painel do Supabase)
-- 1. Vá em Authentication > Users
-- 2. Clique em "Add User"
-- 3. Crie os usuários:
--    - Email: aluno@teste.com, Password: 123456
--    - Email: professor@teste.com, Password: 123456
--    - Email: admin@test.com, Password: 123456

-- ========================================
-- PASSO 6: ATRIBUIR ROLES AOS USUÁRIOS
-- ========================================

-- Execute após criar os usuários no painel
-- Substitua os UUIDs pelos IDs reais dos usuários

-- Para aluno@teste.com (role: student)
-- INSERT INTO user_roles (user_uuid, role) VALUES ('UUID_DO_ALUNO', 'student');

-- Para professor@teste.com (role: teacher)
-- INSERT INTO user_roles (user_uuid, role) VALUES ('UUID_DO_PROFESSOR', 'teacher');

-- Para admin@test.com (role: admin)
-- INSERT INTO user_roles (user_uuid, role) VALUES ('UUID_DO_ADMIN', 'admin');

-- ========================================
-- PASSO 7: VERIFICAR CONFIGURAÇÃO
-- ========================================

SELECT 
    '🎉 CONFIGURAÇÃO COMPLETA!' as status,
    '1. Crie os usuários no painel do Supabase' as passo1,
    '2. Execute os INSERTs com os UUIDs corretos' as passo2,
    '3. Teste o login em http://localhost:3001/login-simple' as passo3; 