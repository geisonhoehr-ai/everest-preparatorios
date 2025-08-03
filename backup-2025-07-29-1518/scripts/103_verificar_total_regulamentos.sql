-- Script para verificar o total de flashcards de regulamentos militares
-- Execute este script no Supabase SQL Editor

-- 1. Total geral de flashcards de regulamentos
SELECT 
  'TOTAL GERAL REGULAMENTOS' as info,
  COUNT(*) as total_flashcards,
  COUNT(DISTINCT topic_id) as total_topicos
FROM public.flashcards f
WHERE f.topic_id IN (
  'estatuto-militares',
  'lei-13954-2019',
  'portaria-gm-md-1143-2022',
  'rca-34-1',
  'rdaer',
  'ica-111-1',
  'ica-111-2',
  'ica-111-3',
  'ica-111-6',
  'regulamentos-comuns'
);

-- 2. Distribuição por tipo de regulamento
SELECT 
  'DISTRIBUIÇÃO POR TIPO' as info,
  CASE 
    WHEN topic_id IN ('estatuto-militares', 'lei-13954-2019', 'portaria-gm-md-1143-2022', 'rca-34-1', 'regulamentos-comuns') 
    THEN 'REGULAMENTOS GERAIS'
    ELSE 'REGULAMENTOS FAB'
  END as tipo_regulamento,
  COUNT(*) as total_flashcards,
  COUNT(DISTINCT topic_id) as total_topicos
FROM public.flashcards f
WHERE f.topic_id IN (
  'estatuto-militares',
  'lei-13954-2019',
  'portaria-gm-md-1143-2022',
  'rca-34-1',
  'rdaer',
  'ica-111-1',
  'ica-111-2',
  'ica-111-3',
  'ica-111-6',
  'regulamentos-comuns'
)
GROUP BY 
  CASE 
    WHEN topic_id IN ('estatuto-militares', 'lei-13954-2019', 'portaria-gm-md-1143-2022', 'rca-34-1', 'regulamentos-comuns') 
    THEN 'REGULAMENTOS GERAIS'
    ELSE 'REGULAMENTOS FAB'
  END
ORDER BY tipo_regulamento;

-- 3. Detalhamento por tópico
SELECT 
  'DETALHAMENTO POR TÓPICO' as info,
  t.name as topic_name,
  COUNT(f.id) as flashcard_count,
  CASE 
    WHEN t.id IN ('estatuto-militares', 'lei-13954-2019', 'portaria-gm-md-1143-2022', 'rca-34-1', 'regulamentos-comuns') 
    THEN 'GERAL'
    ELSE 'FAB'
  END as tipo_regulamento
FROM public.topics t
LEFT JOIN public.flashcards f ON t.id = f.topic_id
WHERE t.id IN (
  'estatuto-militares',
  'lei-13954-2019',
  'portaria-gm-md-1143-2022',
  'rca-34-1',
  'rdaer',
  'ica-111-1',
  'ica-111-2',
  'ica-111-3',
  'ica-111-6',
  'regulamentos-comuns'
)
GROUP BY t.id, t.name
ORDER BY flashcard_count DESC, t.name;

-- 4. Progresso em relação à meta
WITH total_regulamentos AS (
  SELECT COUNT(*) as total_atual
  FROM public.flashcards f
  WHERE f.topic_id IN (
    'estatuto-militares',
    'lei-13954-2019',
    'portaria-gm-md-1143-2022',
    'rca-34-1',
    'rdaer',
    'ica-111-1',
    'ica-111-2',
    'ica-111-3',
    'ica-111-6',
    'regulamentos-comuns'
  )
)
SELECT 
  'PROGRESSO EM RELAÇÃO À META' as info,
  total_atual as flashcards_atuais,
  175 as meta_total,
  (175 - total_atual) as flashcards_restantes,
  ROUND((total_atual::decimal / 175) * 100, 2) as percentual_concluido
FROM total_regulamentos;

-- 5. Verificar se há flashcards duplicados
SELECT 
  'VERIFICAÇÃO DE DUPLICATAS' as info,
  COUNT(*) as total_duplicatas
FROM (
  SELECT question, answer, topic_id, COUNT(*)
  FROM public.flashcards f
  WHERE f.topic_id IN (
    'estatuto-militares',
    'lei-13954-2019',
    'portaria-gm-md-1143-2022',
    'rca-34-1',
    'rdaer',
    'ica-111-1',
    'ica-111-2',
    'ica-111-3',
    'ica-111-6',
    'regulamentos-comuns'
  )
  GROUP BY question, answer, topic_id
  HAVING COUNT(*) > 1
) duplicatas; 