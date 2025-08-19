-- Script para corrigir recursão infinita nas políticas RLS da tabela user_roles
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- PASSO 1: DESABILITAR RLS TEMPORARIAMENTE
-- ========================================

-- Desabilitar RLS para evitar recursão
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- ========================================
-- PASSO 2: REMOVER TODAS AS POLÍTICAS EXISTENTES
-- ========================================

-- Remover todas as políticas que podem estar causando recursão
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow authenticated users to read user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow users to insert their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Allow users to update their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Allow users to delete their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.user_roles;
DROP POLICY IF EXISTS "Enable select for all users" ON public.user_roles;
DROP POLICY IF EXISTS "Enable update for all users" ON public.user_roles;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.user_roles;

-- ========================================
-- PASSO 3: VERIFICAR ESTRUTURA DA TABELA
-- ========================================

-- Verificar se a tabela existe e sua estrutura
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_roles'
ORDER BY ordinal_position;

-- ========================================
-- PASSO 4: CRIAR POLÍTICAS SIMPLES E SEGURAS
-- ========================================

-- Reabilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Política 1: Usuários autenticados podem ler qualquer role (temporariamente permissiva)
CREATE POLICY "Allow read for authenticated users" ON public.user_roles
FOR SELECT USING (auth.role() = 'authenticated');

-- Política 2: Usuários podem inserir seu próprio role
CREATE POLICY "Allow insert own role" ON public.user_roles
FOR INSERT WITH CHECK (auth.uid()::text = user_uuid);

-- Política 3: Usuários podem atualizar seu próprio role
CREATE POLICY "Allow update own role" ON public.user_roles
FOR UPDATE USING (auth.uid()::text = user_uuid);

-- Política 4: Usuários podem deletar seu próprio role
CREATE POLICY "Allow delete own role" ON public.user_roles
FOR DELETE USING (auth.uid()::text = user_uuid);

-- ========================================
-- PASSO 5: VERIFICAR POLÍTICAS CRIADAS
-- ========================================

-- Listar todas as políticas da tabela user_roles
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_roles'
ORDER BY policyname;

-- ========================================
-- PASSO 6: TESTAR ACESSO
-- ========================================

-- Teste 1: Verificar se conseguimos ler a tabela
SELECT COUNT(*) as total_roles FROM public.user_roles;

-- Teste 2: Verificar roles existentes
SELECT user_uuid, role, created_at 
FROM public.user_roles 
ORDER BY created_at DESC 
LIMIT 5;

-- ========================================
-- PASSO 7: VERIFICAR USUÁRIOS SEM ROLE
-- ========================================

-- Verificar se há usuários sem role
SELECT 
    u.id,
    u.email,
    ur.role
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id::text = ur.user_uuid
WHERE ur.user_uuid IS NULL;

-- ========================================
-- PASSO 8: INSERIR ROLES FALTANTES
-- ========================================

-- Inserir roles padrão para usuários que não têm
INSERT INTO public.user_roles (user_uuid, role)
SELECT 
    u.id::text,
    'student'
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id::text = ur.user_uuid
WHERE ur.user_uuid IS NULL
ON CONFLICT (user_uuid) DO NOTHING;

-- ========================================
-- PASSO 9: VERIFICAÇÃO FINAL
-- ========================================

-- Verificar resultado final
SELECT 
    'VERIFICAÇÃO FINAL' as status,
    COUNT(*) as total_users,
    COUNT(ur.user_uuid) as users_with_roles,
    COUNT(*) - COUNT(ur.user_uuid) as users_without_roles
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id::text = ur.user_uuid;

-- Mostrar todas as roles
SELECT 
    ur.user_uuid,
    ur.role,
    ur.created_at,
    u.email
FROM public.user_roles ur
LEFT JOIN auth.users u ON u.id::text = ur.user_uuid
ORDER BY ur.created_at DESC;
