-- Script para limpar dados de autenticação e testar novamente
-- Execute no SQL Editor do Supabase

-- ========================================
-- PASSO 1: VERIFICAR SISTEMA ATUAL
-- ========================================

-- Verificar se o sistema está funcionando
SELECT 
    'SISTEMA DE AUTH' as etapa,
    'Status: Verificando...' as status,
    'Aguardando teste...' as instrucao;

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
-- PASSO 3: INSTRUÇÕES PARA LIMPEZA
-- ========================================

SELECT 
    '🧹 LIMPEZA DE DADOS' as status,
    '1. Abra o console do navegador (F12)' as passo1,
    '2. Execute: localStorage.clear()' as passo2,
    '3. Execute: document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });' as passo3,
    '4. Recarregue a página' as passo4,
    '5. Faça login novamente' as passo5;

-- ========================================
-- PASSO 4: TESTE APÓS LIMPEZA
-- ========================================

SELECT 
    '🔧 TESTE APÓS LIMPEZA' as status,
    '1. Acesse http://localhost:3002/test-session' as passo1,
    '2. Faça login com professor@teste.com' as passo2,
    '3. Verifique se o usuário aparece no menu' as passo3,
    '4. Verifique se "Membros" e "Turmas" aparecem' as passo4,
    '5. Verifique o console para logs limpos' as passo5;

-- ========================================
-- PASSO 5: CONFIGURAÇÕES SUPABASE
-- ========================================

SELECT 
    '⚙️ CONFIGURAÇÕES SUPABASE' as status,
    '1. Vá no painel do Supabase' as passo1,
    '2. Authentication > Settings' as passo2,
    '3. Procure por "Sessions" ou "JWT Settings"' as passo3,
    '4. Configure JWT Expiry para 30 dias' as passo4,
    '5. Configure Refresh Token para 30 dias' as passo5; 