-- Script para verificar o role do usuário atual
-- Execute no SQL Editor do Supabase

-- ========================================
-- PASSO 1: VERIFICAR USUÁRIOS EXISTENTES
-- ========================================

-- Verificar todos os usuários e seus roles
SELECT 
    'USUÁRIOS E ROLES' as etapa,
    u.email,
    ur.role,
    u.created_at
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_uuid
ORDER BY u.email;

-- ========================================
-- PASSO 2: VERIFICAR USUÁRIOS DE TESTE
-- ========================================

-- Verificar especificamente os usuários de teste
SELECT 
    'USUÁRIOS DE TESTE' as etapa,
    u.email,
    ur.role,
    CASE 
        WHEN ur.role = 'admin' THEN '✅ ADMIN - Vê Membros e Turmas'
        WHEN ur.role = 'teacher' THEN '✅ PROFESSOR - Vê Membros e Turmas'
        WHEN ur.role = 'student' THEN '❌ ESTUDANTE - Não vê Membros e Turmas'
        ELSE '❓ SEM ROLE - Não vê Membros e Turmas'
    END as status
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_uuid
WHERE u.email IN ('aluno@teste.com', 'professor@teste.com', 'admin@test.com')
ORDER BY u.email;

-- ========================================
-- PASSO 3: VERIFICAR POLÍTICAS RLS
-- ========================================

-- Verificar se as políticas RLS estão funcionando
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
-- PASSO 4: INSTRUÇÕES PARA TESTE
-- ========================================

SELECT 
    '🔧 INSTRUÇÕES PARA TESTE' as status,
    '1. Faça login com professor@teste.com' as passo1,
    '2. Verifique se aparece "Membros" e "Turmas" no menu' as passo2,
    '3. Se não aparecer, verifique o console do navegador' as passo3,
    '4. Teste também com admin@test.com' as passo4,
    '5. Teste com aluno@teste.com (não deve aparecer)' as passo5; 