-- Script para identificar e remover flashcards duplicados
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos identificar flashcards duplicados
SELECT 
  'Flashcards duplicados identificados' as info,
  topic_id,
  question,
  answer,
  COUNT(*) as quantidade
FROM public.flashcards
GROUP BY topic_id, question, answer
HAVING COUNT(*) > 1
ORDER BY quantidade DESC, topic_id, question;

-- 2. Verificar quantos flashcards duplicados existem
SELECT 
  'Resumo de duplicados' as info,
  COUNT(*) as total_duplicados,
  SUM(quantidade) as total_registros_duplicados
FROM (
  SELECT topic_id, question, answer, COUNT(*) as quantidade
  FROM public.flashcards
  GROUP BY topic_id, question, answer
  HAVING COUNT(*) > 1
) as duplicados;

-- 3. Criar uma tabela temporária com os IDs dos flashcards duplicados
-- (mantendo apenas um de cada grupo)
WITH ranked_flashcards AS (
  SELECT 
    id,
    topic_id,
    question,
    answer,
    ROW_NUMBER() OVER (
      PARTITION BY topic_id, question, answer 
      ORDER BY id
    ) as rn
  FROM public.flashcards
),
duplicates_to_remove AS (
  SELECT id
  FROM ranked_flashcards
  WHERE rn > 1
)
SELECT 
  'Flashcards que serão removidos' as info,
  COUNT(*) as quantidade_a_remover
FROM duplicates_to_remove;

-- 4. REMOVER os flashcards duplicados (descomente a linha abaixo para executar)
-- DELETE FROM public.flashcards 
-- WHERE id IN (
--   WITH ranked_flashcards AS (
--     SELECT 
--       id,
--       topic_id,
--       question,
--       answer,
--       ROW_NUMBER() OVER (
--         PARTITION BY topic_id, question, answer 
--         ORDER BY id
--       ) as rn
--     FROM public.flashcards
--   )
--   SELECT id
--   FROM ranked_flashcards
--   WHERE rn > 1
-- );

-- 5. Verificar se ainda há duplicados após a remoção
SELECT 
  'Verificação pós-remoção' as info,
  topic_id,
  question,
  answer,
  COUNT(*) as quantidade
FROM public.flashcards
GROUP BY topic_id, question, answer
HAVING COUNT(*) > 1
ORDER BY quantidade DESC, topic_id, question;

-- 6. Contar flashcards por tópico após a limpeza
SELECT 
  'Flashcards por tópico após limpeza' as info,
  t.name as topic_name,
  COUNT(f.id) as flashcard_count
FROM public.topics t
LEFT JOIN public.flashcards f ON t.id = f.topic_id
GROUP BY t.id, t.name
ORDER BY flashcard_count DESC, t.name;

-- 7. Verificar se há flashcards com perguntas muito similares (opcional)
-- Este comando identifica perguntas que são muito similares
SELECT 
  'Perguntas similares' as info,
  f1.id as id1,
  f1.topic_id,
  f1.question as question1,
  f2.id as id2,
  f2.question as question2
FROM public.flashcards f1
JOIN public.flashcards f2 ON 
  f1.topic_id = f2.topic_id 
  AND f1.id < f2.id
  AND (
    f1.question ILIKE f2.question 
    OR f1.question ILIKE '%' || f2.question || '%'
    OR f2.question ILIKE '%' || f1.question || '%'
  )
LIMIT 20; 