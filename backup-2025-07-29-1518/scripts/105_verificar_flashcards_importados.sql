-- Verificar se os flashcards específicos já foram importados
-- Execute este script no Supabase SQL Editor

-- Verificar flashcards da ICA 111-3
SELECT 
  'ICA 111-3 - TIPOS DE ATAS' as info,
  COUNT(*) as encontrados
FROM public.flashcards f
WHERE f.question LIKE '%tipos de atas%' 
  AND f.topic_id = 'ica-111-3';

-- Verificar flashcards da ICA 111-6
SELECT 
  'ICA 111-6 - OBJETIVO' as info,
  COUNT(*) as encontrados
FROM public.flashcards f
WHERE f.question LIKE '%objetivo da ICA 111-6%' 
  AND f.topic_id = 'ica-111-6';

-- Verificar flashcards do Estatuto dos Militares
SELECT 
  'ESTATUTO - GARANTIAS FUNDAMENTAIS' as info,
  COUNT(*) as encontrados
FROM public.flashcards f
WHERE f.question LIKE '%garantias fundamentais%' 
  AND f.topic_id = 'estatuto-militares';

-- Verificar total de flashcards por tópico específico
SELECT 
  'TOTAL POR TÓPICO' as info,
  topic_id,
  COUNT(*) as total_flashcards
FROM public.flashcards f
WHERE f.topic_id IN ('ica-111-3', 'ica-111-6', 'estatuto-militares')
GROUP BY topic_id
ORDER BY topic_id;

-- Verificar se há flashcards com perguntas similares
SELECT 
  'VERIFICAÇÃO DE SIMILARES' as info,
  f.question,
  f.topic_id
FROM public.flashcards f
WHERE f.topic_id IN ('ica-111-3', 'ica-111-6', 'estatuto-militares')
  AND (
    f.question LIKE '%atas%' OR
    f.question LIKE '%ICA 111-6%' OR
    f.question LIKE '%garantias%'
  )
ORDER BY f.topic_id, f.question; 