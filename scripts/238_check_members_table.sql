-- Script para verificar e criar a tabela members se necessário

-- Verificar se a tabela members existe
SELECT 
    'Verificando tabela members...' as info;

-- Verificar se a tabela existe
SELECT 
    table_name,
    'EXISTE' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'members';

-- Se a tabela não existir, criar
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    cpf_cnpj TEXT,
    phone TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    login_count INTEGER DEFAULT 0,
    last_seen_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verificar se a tabela foi criada
SELECT 
    'Tabela members criada/verificada com sucesso!' as info,
    COUNT(*) as total_members
FROM members;

-- Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'members'
ORDER BY ordinal_position;

-- Habilitar RLS se não estiver habilitado
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS básicas
DROP POLICY IF EXISTS "Teachers and admins can manage members" ON members;
CREATE POLICY "Teachers and admins can manage members" ON members
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_roles.user_uuid = auth.uid() 
        AND user_roles.role IN ('teacher', 'admin')
    )
);

DROP POLICY IF EXISTS "Everyone can view members" ON members;
CREATE POLICY "Everyone can view members" ON members
FOR SELECT TO authenticated
USING (true);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_created_at ON members(created_at);

-- Verificar se tudo foi configurado
SELECT 
    'Configuração completa!' as info,
    'Tabela members pronta para uso' as status; 