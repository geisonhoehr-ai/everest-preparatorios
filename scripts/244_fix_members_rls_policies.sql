-- Script para verificar e corrigir as políticas RLS da tabela members
-- Verificar se RLS está habilitado
SELECT 
    'Verificando RLS na tabela members:' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'members';

-- Verificar políticas existentes
SELECT 
    'Políticas RLS existentes:' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'members';

-- Desabilitar RLS temporariamente para testes
ALTER TABLE members DISABLE ROW LEVEL SECURITY;

-- Verificar se a tabela permite inserções
SELECT 
    'Testando inserção na tabela members:' as info;

-- Inserir um membro de teste
INSERT INTO members (full_name, email, status)
VALUES ('Teste RLS', 'teste.rls@exemplo.com', 'active')
ON CONFLICT (email) DO NOTHING;

-- Verificar se a inserção funcionou
SELECT 
    'Verificando inserção de teste:' as info,
    COUNT(*) as total_members
FROM members 
WHERE email = 'teste.rls@exemplo.com';

-- Mostrar os membros de teste
SELECT 
    id,
    full_name,
    email,
    status,
    created_at
FROM members 
WHERE email LIKE '%teste%'
ORDER BY created_at DESC;

-- Criar política RLS básica para permitir inserções
-- Primeiro, remover políticas existentes
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON members;
DROP POLICY IF EXISTS "Enable read access for all users" ON members;
DROP POLICY IF EXISTS "Enable update for users based on email" ON members;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON members;

-- Criar políticas mais permissivas para desenvolvimento
CREATE POLICY "Enable insert for all users" ON members
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON members
    FOR SELECT USING (true);

CREATE POLICY "Enable update for all users" ON members
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON members
    FOR DELETE USING (true);

-- Habilitar RLS novamente
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Verificar se as políticas foram criadas
SELECT 
    'Políticas RLS após correção:' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'members';

-- Testar inserção com RLS habilitado
INSERT INTO members (full_name, email, status)
VALUES ('Teste RLS 2', 'teste.rls2@exemplo.com', 'active')
ON CONFLICT (email) DO NOTHING;

-- Verificar se a inserção funcionou com RLS
SELECT 
    'Teste final com RLS:' as info,
    COUNT(*) as total_members
FROM members 
WHERE email LIKE '%teste%';

-- Mostrar resultado final
SELECT 
    'Resultado final:' as info,
    id,
    full_name,
    email,
    status,
    created_at
FROM members 
WHERE email LIKE '%teste%'
ORDER BY created_at DESC; 