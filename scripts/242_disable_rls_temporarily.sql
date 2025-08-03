-- Script para desabilitar temporariamente o RLS da tabela members
-- Verificar se RLS está habilitado
SELECT 
    'Verificando RLS atual:' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'members';

-- Desabilitar RLS temporariamente
ALTER TABLE members DISABLE ROW LEVEL SECURITY;

-- Verificar se RLS foi desabilitado
SELECT 
    'RLS desabilitado!' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'members';

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Teachers and admins can manage members" ON members;
DROP POLICY IF EXISTS "Everyone can view members" ON members;
DROP POLICY IF EXISTS "Enable read access for all users" ON members;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON members;
DROP POLICY IF EXISTS "Enable update for users based on email" ON members;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON members;

-- Verificar se não há mais políticas
SELECT 
    'Políticas removidas!' as info,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'members';

-- Testar inserção direta
INSERT INTO members (full_name, email, status)
VALUES ('Teste RLS', 'teste@rls.com', 'active')
ON CONFLICT (email) DO NOTHING;

-- Verificar se a inserção funcionou
SELECT 
    'Teste de inserção:' as info,
    COUNT(*) as total_members
FROM members;

-- Mostrar os membros atuais
SELECT 
    id,
    full_name,
    email,
    status,
    created_at
FROM members 
ORDER BY created_at DESC
LIMIT 5; 