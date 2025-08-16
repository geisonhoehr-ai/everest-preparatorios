-- Script SEGURO para criar sistema de membros baseado no MemberKit
-- Execute no SQL Editor do Supabase

-- ========================================
-- PASSO 1: CRIAR TABELA MEMBERS
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
-- PASSO 2: CRIAR TABELA SUBSCRIPTIONS (CONTROLE DE ACESSO)
-- ========================================

CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    course_name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiration_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
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
-- PASSO 4: CRIAR TRIGGERS PARA TIMESTAMP
-- ========================================

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

-- ========================================
-- PASSO 5: CRIAR FUNÇÃO PARA ATUALIZAR LAST_SEEN
-- ========================================

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

-- ========================================
-- PASSO 6: CRIAR TRIGGER PARA LAST_SEEN
-- ========================================

DROP TRIGGER IF EXISTS update_member_activity ON subscriptions;
CREATE TRIGGER update_member_activity
    AFTER INSERT ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_member_last_seen();

-- ========================================
-- PASSO 7: CRIAR FUNÇÕES HELPER PARA MEMBERS
-- ========================================

-- Função para obter total de membros (REMOVER E RECRIAR)
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

-- Função para verificar se membro tem acesso ativo
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
-- PASSO 8: CRIAR POLÍTICAS RLS
-- ========================================

-- Habilitar RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Teachers and admins can manage members" ON members;
DROP POLICY IF EXISTS "Teachers and admins can manage subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Everyone can view members" ON members;
DROP POLICY IF EXISTS "Everyone can view subscriptions" ON subscriptions;

-- Política para members (apenas teachers/admins podem gerenciar)
CREATE POLICY "Teachers and admins can manage members" ON members
    FOR ALL USING (
        is_teacher(auth.uid()) OR is_admin(auth.uid())
    );

-- Política para subscriptions (apenas teachers/admins podem gerenciar)
CREATE POLICY "Teachers and admins can manage subscriptions" ON subscriptions
    FOR ALL USING (
        is_teacher(auth.uid()) OR is_admin(auth.uid())
    );

-- Política para visualização (todos podem ver)
CREATE POLICY "Everyone can view members" ON members
    FOR SELECT USING (true);

CREATE POLICY "Everyone can view subscriptions" ON subscriptions
    FOR SELECT USING (true);

-- ========================================
-- PASSO 9: CRIAR ÍNDICES PARA PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_member_id ON subscriptions(member_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expiration ON subscriptions(expiration_date);

-- ========================================
-- PASSO 10: VERIFICAÇÃO FINAL
-- ========================================

-- Verificar se tudo foi criado corretamente
SELECT 
    'VERIFICAÇÃO FINAL' as etapa,
    (SELECT COUNT(*) FROM members) as total_members,
    (SELECT COUNT(*) FROM subscriptions) as total_subscriptions;

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
WHERE tablename IN ('members', 'subscriptions')
ORDER BY tablename, policyname;

-- Verificar triggers
SELECT 
    'TRIGGERS' as etapa,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name IN ('update_members_updated_at', 'update_subscriptions_updated_at', 'update_member_activity');

-- ========================================
-- PASSO 11: RESUMO FINAL
-- ========================================

SELECT 
    '🎉 SISTEMA DE MEMBROS CRIADO!' as status,
    'Tabela members criada com controle de acesso' as members_status,
    'Tabela subscriptions criada com controle de data' as subscriptions_status,
    'RLS habilitado - apenas teachers/admins podem gerenciar' as rls_status,
    'Funções helper criadas' as functions_status,
    'Triggers configurados' as triggers_status,
    'Índices criados para performance' as indexes_status; 