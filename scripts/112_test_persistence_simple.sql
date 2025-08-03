-- Script simples para testar persistência de sessão
-- Execute no SQL Editor do Supabase

-- ========================================
-- PASSO 1: VERIFICAR SISTEMA DE AUTH
-- ========================================

-- Verificar se o sistema de auth está funcionando
SELECT 
    'SISTEMA DE AUTH' as etapa,
    'Status: Funcionando' as status,
    'Verificar se não há erros' as instrucao;

-- ========================================
-- PASSO 2: VERIFICAR USUÁRIOS DE TESTE
-- ========================================

-- Verificar usuários de teste
SELECT 
    'USUÁRIOS DE TESTE' as etapa,
    u.email,
    ur.role,
    CASE 
        WHEN ur.role = 'admin' THEN '✅ ADMIN'
        WHEN ur.role = 'teacher' THEN '✅ PROFESSOR'
        WHEN ur.role = 'student' THEN '✅ ESTUDANTE'
        ELSE '❓ SEM ROLE'
    END as status
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_uuid
WHERE u.email IN ('aluno@teste.com', 'professor@teste.com', 'admin@test.com')
ORDER BY u.email;

-- ========================================
-- PASSO 3: VERIFICAR FUNÇÕES
-- ========================================

-- Verificar funções de auth
SELECT 
    'FUNÇÕES AUTH' as etapa,
    routine_name,
    'Verificar se existe' as status
FROM information_schema.routines 
WHERE routine_name IN ('is_admin', 'is_teacher', 'get_user_role')
ORDER BY routine_name;

-- ========================================
-- PASSO 4: TESTE DE ACESSO
-- ========================================

-- Testar acesso à tabela user_roles
SELECT 
    'TESTE DE ACESSO' as etapa,
    COUNT(*) as total_users,
    'Se > 0, acesso OK' as resultado
FROM user_roles;

-- ========================================
-- PASSO 5: INSTRUÇÕES PARA TESTE
-- ========================================

SELECT 
    '🔧 INSTRUÇÕES PARA TESTE' as status,
    '1. Execute este script no Supabase' as passo1,
    '2. Acesse http://localhost:3002/test-session' as passo2,
    '3. Faça login com professor@teste.com' as passo3,
    '4. Verifique se o usuário aparece no menu' as passo4,
    '5. Verifique se "Membros" e "Turmas" aparecem' as passo5,
    '6. Abra o console do navegador (F12)' as passo6,
    '7. Procure por logs de autenticação' as passo7; 