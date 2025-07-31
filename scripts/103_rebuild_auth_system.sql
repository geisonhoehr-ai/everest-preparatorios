-- Script para reconstruir o sistema de autenticação do zero
-- Execute no SQL Editor do Supabase

-- ========================================
-- PASSO 1: LIMPAR SISTEMA ATUAL
-- ========================================

-- Remover triggers existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;

-- Remover funções existentes
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- ========================================
-- PASSO 2: RECRIAR TABELA USER_ROLES
-- ========================================

-- Dropar e recriar tabela user_roles
DROP TABLE IF EXISTS user_roles CASCADE;

CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_uuid UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
    first_login BOOLEAN DEFAULT true,
    profile_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- PASSO 3: CRIAR FUNÇÕES
-- ========================================

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Função para criar role automaticamente
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_roles (user_uuid, role)
    VALUES (NEW.id, 'student');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se é admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_uuid = $1 AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se é teacher
CREATE OR REPLACE FUNCTION is_teacher(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_uuid = $1 AND (role = 'teacher' OR role = 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter role do usuário
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM user_roles
    WHERE user_uuid = $1;
    
    RETURN COALESCE(user_role, 'student');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- PASSO 4: CRIAR TRIGGERS
-- ========================================

-- Trigger para criar role automaticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Trigger para atualizar timestamp
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- PASSO 5: CONFIGURAR RLS
-- ========================================

-- Habilitar RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;

-- Política para usuários verem apenas seu próprio role
CREATE POLICY "Users can view own role" ON user_roles
    FOR SELECT USING (auth.uid() = user_uuid);

-- Política para admins gerenciarem todos os roles
CREATE POLICY "Admins can manage all roles" ON user_roles
    FOR ALL USING (is_admin(auth.uid()));

-- ========================================
-- PASSO 6: CRIAR ÍNDICES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_user_roles_user_uuid ON user_roles(user_uuid);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- ========================================
-- PASSO 7: CRIAR USUÁRIOS DE TESTE
-- ========================================

-- Inserir alguns usuários de teste (se necessário)
-- Estes serão criados automaticamente quando os usuários se registrarem

-- ========================================
-- PASSO 8: VERIFICAÇÃO FINAL
-- ========================================

-- Verificar estrutura da tabela
SELECT 
    'ESTRUTURA USER_ROLES' as tabela,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_roles'
ORDER BY ordinal_position;

-- Verificar funções
SELECT 
    'FUNÇÕES' as etapa,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN ('handle_new_user', 'is_admin', 'is_teacher', 'get_user_role', 'update_updated_at_column')
ORDER BY routine_name;

-- Verificar triggers
SELECT 
    'TRIGGERS' as etapa,
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE trigger_name IN ('on_auth_user_created', 'update_user_roles_updated_at');

-- Verificar políticas RLS
SELECT 
    'POLÍTICAS RLS' as etapa,
    schemaname,
    tablename,
    policyname
FROM pg_policies 
WHERE tablename = 'user_roles'
ORDER BY policyname;

-- ========================================
-- PASSO 9: RESUMO FINAL
-- ========================================

SELECT 
    '🎉 SISTEMA DE AUTENTICAÇÃO RECONSTRUÍDO!' as status,
    'Tabela user_roles recriada' as user_roles_status,
    'Funções helper criadas' as functions_status,
    'Triggers configurados' as triggers_status,
    'RLS habilitado' as rls_status,
    'Índices criados' as indexes_status; 