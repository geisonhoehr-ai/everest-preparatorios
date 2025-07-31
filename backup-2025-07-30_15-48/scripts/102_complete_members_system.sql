-- Script COMPLETO para criar sistema de membros baseado no MemberKit
-- Execute no SQL Editor do Supabase

-- ========================================
-- PASSO 1: CORRIGIR TABELA SUBSCRIPTIONS
-- ========================================

-- Adicionar colunas faltantes na tabela subscriptions
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS expiration_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS course_name TEXT;

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS class_name TEXT;

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Migrar dados existentes
UPDATE subscriptions 
SET expiration_date = data_expiracao 
WHERE data_expiracao IS NOT NULL AND expiration_date IS NULL;

UPDATE subscriptions 
SET course_name = nome_assinatura 
WHERE nome_assinatura IS NOT NULL AND course_name IS NULL;

UPDATE subscriptions 
SET enrollment_date = data_inicio 
WHERE data_inicio IS NOT NULL AND enrollment_date IS NULL;

-- Atualizar constraint de status
ALTER TABLE subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE subscriptions 
ADD CONSTRAINT subscriptions_status_check 
CHECK (status IN ('active', 'inactive', 'expired'));

-- ========================================
-- PASSO 2: CRIAR TABELA MEMBERS (se não existir)
-- ========================================

CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    cpf_cnpj TEXT,
    phone TEXT,
    login_count INTEGER DEFAULT 0,
    current_login_at TIMESTAMP WITH TIME ZONE,
    last_seen_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'))
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

-- Função para atualizar last_seen
CREATE OR REPLACE FUNCTION update_member_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE members 
    SET last_seen_at = NOW(),
        login_count = login_count + 1
    WHERE id = NEW.member_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para obter total de membros
DROP FUNCTION IF EXISTS get_member_counts();
CREATE OR REPLACE FUNCTION get_member_counts()
RETURNS TABLE (
    total_members BIGINT,
    active_members BIGINT,
    inactive_members BIGINT,
    suspended_members BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_members,
        COUNT(*) FILTER (WHERE status = 'active') as active_members,
        COUNT(*) FILTER (WHERE status = 'inactive') as inactive_members,
        COUNT(*) FILTER (WHERE status = 'suspended') as suspended_members
    FROM members;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar acesso ativo
DROP FUNCTION IF EXISTS has_active_access(TEXT);
CREATE OR REPLACE FUNCTION has_active_access(member_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    has_access BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM subscriptions s
        JOIN members m ON s.member_id = m.id
        WHERE m.email = member_email 
        AND s.status = 'active'
        AND (s.expiration_date IS NULL OR s.expiration_date > NOW())
    ) INTO has_access;
    
    RETURN COALESCE(has_access, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- PASSO 4: CRIAR TRIGGERS
-- ========================================

-- Triggers para timestamp
DROP TRIGGER IF EXISTS update_members_updated_at ON members;
CREATE TRIGGER update_members_updated_at 
    BEFORE UPDATE ON members 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para last_seen
DROP TRIGGER IF EXISTS update_member_activity ON subscriptions;
CREATE TRIGGER update_member_activity
    AFTER INSERT ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_member_last_seen();

-- ========================================
-- PASSO 5: CONFIGURAR RLS
-- ========================================

-- Habilitar RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Teachers and admins can manage members" ON members;
DROP POLICY IF EXISTS "Teachers and admins can manage subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Everyone can view members" ON members;
DROP POLICY IF EXISTS "Everyone can view subscriptions" ON subscriptions;

-- Criar novas políticas
CREATE POLICY "Teachers and admins can manage members" ON members
    FOR ALL USING (
        is_teacher(auth.uid()) OR is_admin(auth.uid())
    );

CREATE POLICY "Teachers and admins can manage subscriptions" ON subscriptions
    FOR ALL USING (
        is_teacher(auth.uid()) OR is_admin(auth.uid())
    );

CREATE POLICY "Everyone can view members" ON members
    FOR SELECT USING (true);

CREATE POLICY "Everyone can view subscriptions" ON subscriptions
    FOR SELECT USING (true);

-- ========================================
-- PASSO 6: CRIAR ÍNDICES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_member_id ON subscriptions(member_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expiration ON subscriptions(expiration_date);

-- ========================================
-- PASSO 7: VERIFICAÇÃO FINAL
-- ========================================

-- Verificar estrutura das tabelas
SELECT 
    'ESTRUTURA MEMBERS' as tabela,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'members'
ORDER BY ordinal_position;

SELECT 
    'ESTRUTURA SUBSCRIPTIONS' as tabela,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;

-- Verificar dados
SELECT 
    'DADOS' as etapa,
    (SELECT COUNT(*) FROM members) as total_members,
    (SELECT COUNT(*) FROM subscriptions) as total_subscriptions;

-- Verificar políticas RLS
SELECT 
    'POLÍTICAS RLS' as etapa,
    schemaname,
    tablename,
    policyname
FROM pg_policies 
WHERE tablename IN ('members', 'subscriptions')
ORDER BY tablename, policyname;

-- ========================================
-- PASSO 8: RESUMO FINAL
-- ========================================

SELECT 
    '🎉 SISTEMA DE MEMBROS COMPLETO!' as status,
    'Tabela members criada/corrigida' as members_status,
    'Tabela subscriptions corrigida com expiration_date' as subscriptions_status,
    'RLS habilitado - apenas teachers/admins podem gerenciar' as rls_status,
    'Funções helper criadas' as functions_status,
    'Triggers configurados' as triggers_status,
    'Índices criados para performance' as indexes_status; 