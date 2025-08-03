-- Script para verificar e corrigir a estrutura da tabela members
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

-- Se a tabela não existir, criar com a estrutura correta
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
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'members'
ORDER BY ordinal_position;

-- Habilitar RLS se não estiver habilitado
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Teachers and admins can manage members" ON members;
DROP POLICY IF EXISTS "Everyone can view members" ON members;
DROP POLICY IF EXISTS "Enable read access for all users" ON members;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON members;
DROP POLICY IF EXISTS "Enable update for users based on email" ON members;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON members;

-- Criar políticas RLS corretas
CREATE POLICY "Teachers and admins can manage members" ON members
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_roles.user_uuid = auth.uid() 
        AND user_roles.role IN ('teacher', 'admin')
    )
);

CREATE POLICY "Everyone can view members" ON members
FOR SELECT TO authenticated
USING (true);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_created_at ON members(created_at);
CREATE INDEX IF NOT EXISTS idx_members_created_by ON members(created_by);

-- Inserir um membro de teste se a tabela estiver vazia
INSERT INTO members (full_name, email, status, created_by)
SELECT 
    'Usuário Teste',
    'teste@exemplo.com',
    'active',
    auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM members LIMIT 1)
AND auth.uid() IS NOT NULL;

-- Verificar se tudo foi configurado
SELECT 
    'Configuração completa!' as info,
    'Tabela members pronta para uso' as status,
    COUNT(*) as total_members
FROM members; 