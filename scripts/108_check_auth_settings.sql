-- Script para verificar configurações de autenticação
-- Execute no SQL Editor do Supabase

-- ========================================
-- PASSO 1: VERIFICAR CONFIGURAÇÕES AUTH
-- ========================================

-- Verificar configurações de autenticação
SELECT 
    'CONFIGURAÇÕES AUTH' as etapa,
    'Verifique no painel do Supabase:' as instrucao,
    '1. Authentication > Settings' as passo1,
    '2. Procure por "JWT Settings" ou "Token Settings"' as passo2,
    '3. Configure JWT Expiry para 30 dias' as passo3,
    '4. Configure Refresh Token para 30 dias' as passo4;

-- ========================================
-- PASSO 2: VERIFICAR FUNÇÕES DE SESSÃO
-- ========================================

-- Verificar se as funções de sessão estão funcionando
SELECT 
    'FUNÇÕES DE SESSÃO' as etapa,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name LIKE '%session%' OR routine_name LIKE '%token%'
ORDER BY routine_name;

-- ========================================
-- PASSO 3: TESTE DE SESSÃO ATUAL
-- ========================================

-- Verificar sessões ativas
SELECT 
    'SESSÕES ATIVAS' as etapa,
    COUNT(*) as total_sessoes
FROM auth.sessions;

-- ========================================
-- PASSO 4: ALTERNATIVAS DE CONFIGURAÇÃO
-- ========================================

SELECT 
    '🔧 ALTERNATIVAS DE CONFIGURAÇÃO' as status,
    'Se não encontrar "Advanced Settings":' as info1,
    '1. Procure por "JWT Settings"' as info2,
    '2. Procure por "Token Settings"' as info3,
    '3. Procure por "Security Settings"' as info4,
    '4. Procure por "Session Settings"' as info5,
    '5. Ou use a API do Supabase para configurar' as info6; 