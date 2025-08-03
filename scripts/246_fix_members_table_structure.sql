-- Script para verificar e corrigir a estrutura da tabela members
-- Verificar estrutura atual da tabela
SELECT 
    'Estrutura atual da tabela members:' as info;

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

-- Verificar se a tabela existe
SELECT 
    'Verificando se a tabela existe:' as info,
    table_name,
    'EXISTE' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'members';

-- Se a tabela não existir ou estiver com estrutura incorreta, recriar
DROP TABLE IF EXISTS members CASCADE;

-- Criar tabela com estrutura correta
CREATE TABLE members (
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

-- Verificar se a tabela foi criada corretamente
SELECT 
    'Tabela members recriada com sucesso!' as info,
    COUNT(*) as total_members
FROM members;

-- Verificar estrutura final
SELECT 
    'Estrutura final da tabela members:' as info;

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

-- Desabilitar RLS temporariamente
ALTER TABLE members DISABLE ROW LEVEL SECURITY;

-- Testar inserção
INSERT INTO members (full_name, email, status)
VALUES ('Usuário Teste', 'teste@exemplo.com', 'active')
ON CONFLICT (email) DO NOTHING;

-- Verificar se a inserção funcionou
SELECT 
    'Teste de inserção:' as info,
    COUNT(*) as total_members
FROM members;

-- Mostrar os dados
SELECT 
    id,
    full_name,
    email,
    status,
    created_at
FROM members 
ORDER BY created_at DESC
LIMIT 5;

-- Criar políticas RLS básicas
DROP POLICY IF EXISTS "Enable insert for all users" ON members;
DROP POLICY IF EXISTS "Enable read access for all users" ON members;
DROP POLICY IF EXISTS "Enable update for all users" ON members;
DROP POLICY IF EXISTS "Enable delete for all users" ON members;

CREATE POLICY "Enable insert for all users" ON members
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON members
    FOR SELECT USING (true);

CREATE POLICY "Enable update for all users" ON members
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON members
    FOR DELETE USING (true);

-- Habilitar RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Verificar políticas
SELECT 
    'Políticas RLS criadas:' as info,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'members'; 