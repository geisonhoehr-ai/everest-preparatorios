-- Script para testar o sistema de autenticação
-- Execute no SQL Editor do Supabase

-- ========================================
-- PASSO 1: VERIFICAR ESTRUTURA DO SISTEMA
-- ========================================

-- Verificar se as tabelas existem
SELECT 
    'TABELAS DO SISTEMA' as etapa,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name IN ('user_roles', 'members', 'subscriptions')
ORDER BY table_name;

-- ========================================
-- PASSO 2: VERIFICAR FUNÇÕES
-- ========================================

-- Verificar funções de autenticação
SELECT 
    'FUNÇÕES AUTH' as etapa,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN ('is_admin', 'is_teacher', 'get_user_role', 'handle_new_user')
ORDER BY routine_name;

-- ========================================
-- PASSO 3: VERIFICAR USUÁRIOS
-- ========================================

-- Contar usuários por role
SELECT 
    'USUÁRIOS POR ROLE' as etapa,
    role,
    COUNT(*) as total
FROM user_roles 
GROUP BY role
ORDER BY role;

-- ========================================
-- PASSO 4: VERIFICAR POLÍTICAS RLS
-- ========================================

-- Verificar políticas RLS
SELECT 
    'POLÍTICAS RLS' as etapa,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE tablename IN ('user_roles', 'members', 'subscriptions')
ORDER BY tablename, policyname;

-- ========================================
-- PASSO 5: TESTE DE ACESSO
-- ========================================

-- Testar se conseguimos acessar user_roles
SELECT 
    'TESTE DE ACESSO' as etapa,
    'user_roles acessível' as status,
    COUNT(*) as total_registros
FROM user_roles;

-- ========================================
-- PASSO 6: RESUMO
-- ========================================

SELECT 
    '✅ SISTEMA DE AUTH TESTADO' as status,
    'Se todas as consultas acima funcionaram,' as info1,
    'o sistema de autenticação está funcionando.' as info2,
    'Agora configure os timeouts no painel do Supabase.' as info3; 