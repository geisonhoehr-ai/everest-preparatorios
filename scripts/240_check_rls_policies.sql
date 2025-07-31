-- Script para verificar as políticas RLS da tabela members
-- Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'members';

-- Verificar políticas existentes
SELECT 
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

-- Verificar se o usuário atual tem permissões
SELECT 
    'Verificando permissões do usuário atual...' as info;

-- Verificar se o usuário está autenticado
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_user_email;

-- Verificar se o usuário tem role de teacher ou admin
SELECT 
    ur.user_uuid,
    ur.role,
    'Usuário tem role válido' as status
FROM user_roles ur
WHERE ur.user_uuid = auth.uid()
AND ur.role IN ('teacher', 'admin');

-- Testar inserção direta (apenas para debug)
-- INSERT INTO members (full_name, email, status, created_by)
-- VALUES ('Teste Debug', 'debug@teste.com', 'active', auth.uid())
-- ON CONFLICT (email) DO NOTHING;

-- Verificar se há dados na tabela
SELECT 
    'Dados atuais na tabela members:' as info,
    COUNT(*) as total_members
FROM members;

-- Mostrar alguns registros de exemplo
SELECT 
    id,
    full_name,
    email,
    status,
    created_at
FROM members 
LIMIT 5; 