-- Script para testar o sistema completo de autenticação
-- Execute no SQL Editor do Supabase

-- ========================================
-- PASSO 1: VERIFICAR SISTEMA ATUAL
-- ========================================

SELECT 
    '🔍 SISTEMA DE AUTH' as etapa,
    'Status: Verificando...' as status,
    'Aguardando teste...' as instrucao;

-- ========================================
-- PASSO 2: VERIFICAR USUÁRIOS DE TESTE
-- ========================================

SELECT 
    '👤 USUÁRIOS DE TESTE' as etapa,
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
-- PASSO 3: INSTRUÇÕES DE LIMPEZA
-- ========================================

SELECT 
    '🧹 LIMPEZA COMPLETA' as status,
    '1. Abra o console do navegador (F12)' as passo1,
    '2. Execute: localStorage.clear()' as passo2,
    '3. Execute: sessionStorage.clear()' as passo3,
    '4. Execute: document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });' as passo4,
    '5. Recarregue a página (Ctrl+F5)' as passo5;

-- ========================================
-- PASSO 4: TESTE EM MODO INCOGNITO
-- ========================================

SELECT 
    '🔍 TESTE INCOGNITO' as status,
    '1. Abra uma janela incógnita' as passo1,
    '2. Acesse http://localhost:3002/test-session' as passo2,
    '3. Faça login com professor@teste.com' as passo3,
    '4. Verifique se funciona sem cache' as passo4;

-- ========================================
-- PASSO 5: VERIFICAR CONFIGURAÇÕES
-- ========================================

SELECT 
    '⚙️ CONFIGURAÇÕES SUPABASE' as status,
    '1. Vá no painel do Supabase' as passo1,
    '2. Authentication > Settings' as passo2,
    '3. Procure por "Sessions" ou "JWT Settings"' as passo3,
    '4. Configure JWT Expiry para 30 dias' as passo4,
    '5. Configure Refresh Token para 30 dias' as passo5;

-- ========================================
-- PASSO 6: LOGS PARA VERIFICAR
-- ========================================

SELECT 
    '📊 LOGS PARA VERIFICAR' as status,
    '1. Abra o console (F12)' as passo1,
    '2. Procure por [AUTH] logs' as passo2,
    '3. Procure por [MIDDLEWARE] logs' as passo3,
    '4. Procure por [SUPABASE] logs' as passo4,
    '5. Verifique se não há erros' as passo5; 