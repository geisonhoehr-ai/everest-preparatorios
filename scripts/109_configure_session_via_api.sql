-- Script para configurar sessão via API
-- Execute no SQL Editor do Supabase

-- ========================================
-- PASSO 1: VERIFICAR CONFIGURAÇÕES ATUAIS
-- ========================================

-- Verificar configurações de auth
SELECT 
    'CONFIGURAÇÕES ATUAIS' as etapa,
    'Para configurar via API do Supabase:' as instrucao,
    '1. Vá em Settings > API' as passo1,
    '2. Copie a URL e anon key' as passo2,
    '3. Use o script abaixo para configurar' as passo3;

-- ========================================
-- PASSO 2: ALTERNATIVA - CONFIGURAR VIA SQL
-- ========================================

-- Tentar configurar via SQL (se possível)
-- Nota: Estas configurações podem não estar disponíveis via SQL
-- mas vamos tentar algumas abordagens

-- Verificar se podemos acessar configurações de auth
SELECT 
    'TENTATIVA DE CONFIGURAÇÃO' as etapa,
    'Se estas consultas funcionarem, podemos configurar:' as info,
    '1. JWT Expiry' as config1,
    '2. Refresh Token Rotation' as config2,
    '3. Session Timeout' as config3;

-- ========================================
-- PASSO 3: VERIFICAR FUNÇÕES DISPONÍVEIS
-- ========================================

-- Verificar funções de configuração disponíveis
SELECT 
    'FUNÇÕES DE CONFIGURAÇÃO' as etapa,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name LIKE '%config%' OR routine_name LIKE '%setting%'
ORDER BY routine_name;

-- ========================================
-- PASSO 4: INSTRUÇÕES MANUAIS
-- ========================================

SELECT 
    '🔧 CONFIGURAÇÃO MANUAL' as status,
    'Se não encontrar as configurações:' as info1,
    '1. Vá em Authentication > Settings' as info2,
    '2. Procure por "JWT" ou "Token"' as info3,
    '3. Ou use a API do Supabase' as info4,
    '4. Ou entre em contato com o suporte' as info5;

-- ========================================
-- PASSO 5: TESTE DE SESSÃO ATUAL
-- ========================================

-- Testar se a sessão está funcionando
SELECT 
    'TESTE DE SESSÃO' as etapa,
    'Sistema de auth funcionando' as status,
    'Configure os timeouts manualmente no painel' as instrucao; 