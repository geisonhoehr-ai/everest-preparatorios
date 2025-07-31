-- Script para limpar tentativas antigas que estão "em andamento"

-- 1. Verificar tentativas em andamento
SELECT 
    'Tentativas em andamento:' as info,
    COUNT(*) as total
FROM tentativas_prova 
WHERE status = 'em_andamento';

-- 2. Mostrar tentativas em andamento com mais de 1 hora
SELECT 
    'Tentativas antigas (>1h):' as info,
    id,
    prova_id,
    aluno_id,
    iniciada_em,
    EXTRACT(EPOCH FROM (NOW() - iniciada_em))/3600 as horas_atras
FROM tentativas_prova 
WHERE status = 'em_andamento' 
AND iniciada_em < NOW() - INTERVAL '1 hour'
ORDER BY iniciada_em;

-- 3. Atualizar tentativas antigas para "abandonada"
UPDATE tentativas_prova 
SET status = 'abandonada', 
    finalizada_em = NOW()
WHERE status = 'em_andamento' 
AND iniciada_em < NOW() - INTERVAL '1 hour';

-- 4. Verificar resultado
SELECT 
    'Tentativas atualizadas:' as info,
    COUNT(*) as total_abandonadas
FROM tentativas_prova 
WHERE status = 'abandonada' 
AND finalizada_em > NOW() - INTERVAL '5 minutes';

-- 5. Verificar tentativas restantes em andamento
SELECT 
    'Tentativas restantes em andamento:' as info,
    COUNT(*) as total
FROM tentativas_prova 
WHERE status = 'em_andamento';