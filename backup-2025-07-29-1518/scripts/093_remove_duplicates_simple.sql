-- Script simples para remover flashcards duplicados
-- Execute este script no Supabase SQL Editor

-- 1. Verificar quantos flashcards existem antes da limpeza
SELECT 
  'Antes da limpeza' as info,
  COUNT(*) as total_flashcards
FROM public.flashcards;

-- 2. Identificar duplicados
SELECT 
  'Duplicados encontrados' as info,
  COUNT(*) as total_duplicados
FROM (
  SELECT topic_id, question, answer, COUNT(*) as quantidade
  FROM public.flashcards
  GROUP BY topic_id, question, answer
  HAVING COUNT(*) > 1
) as duplicados;

-- 3. REMOVER duplicados (mantendo apenas o primeiro de cada grupo)
DELETE FROM public.flashcards 
WHERE id NOT IN (
  SELECT MIN(id)
  FROM public.flashcards
  GROUP BY topic_id, question, answer
);

-- 4. Verificar quantos flashcards restaram
SELECT 
  'Após a limpeza' as info,
  COUNT(*) as total_flashcards
FROM public.flashcards;

-- 5. Verificar se ainda há duplicados
SELECT 
  'Verificação final' as info,
  COUNT(*) as duplicados_restantes
FROM (
  SELECT topic_id, question, answer, COUNT(*) as quantidade
  FROM public.flashcards
  GROUP BY topic_id, question, answer
  HAVING COUNT(*) > 1
) as duplicados;

-- 6. Contar flashcards por tópico
SELECT 
  'Flashcards por tópico' as info,
  t.name as topic_name,
  COUNT(f.id) as flashcard_count
FROM public.topics t
LEFT JOIN public.flashcards f ON t.id = f.topic_id
GROUP BY t.id, t.name
ORDER BY flashcard_count DESC, t.name; 