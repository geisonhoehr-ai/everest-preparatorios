-- Script para verificar e corrigir o status das provas
-- Data: 2025-01-28

-- 1. VERIFICAR STATUS ATUAL DAS PROVAS
SELECT '=== STATUS ATUAL DAS PROVAS ===' as info;

SELECT 
    id,
    titulo,
    status,
    criado_por,
    criado_em
FROM provas
ORDER BY criado_em DESC;

-- 2. VERIFICAR SE AS PROVAS ESTÃO PUBLICADAS
SELECT 
    'Provas por status:' as tipo,
    status,
    COUNT(*) as total
FROM provas
GROUP BY status;

-- 3. CORRIGIR STATUS DAS PROVAS (se necessário)
-- Atualizar todas as provas para status 'publicada' se estiverem como 'rascunho'
UPDATE provas 
SET status = 'publicada' 
WHERE status = 'rascunho' OR status IS NULL;

-- 4. VERIFICAÇÃO FINAL
SELECT '=== VERIFICAÇÃO FINAL ===' as info;

SELECT 
    id,
    titulo,
    status,
    criado_por
FROM provas
ORDER BY criado_em DESC;

SELECT 
    'Provas publicadas:' as tipo,
    COUNT(*) as total
FROM provas 
WHERE status = 'publicada';

SELECT '=== SCRIPT CONCLUÍDO ===' as info; 