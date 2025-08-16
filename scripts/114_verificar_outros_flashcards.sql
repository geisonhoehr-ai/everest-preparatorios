-- Investigar quais flashcards estão sendo classificados como "Outros"
-- Execute este script no Supabase SQL Editor

-- 1. Verificar todos os topic_id que não são regulamentos nem português
SELECT 
  'FLASHCARDS CLASSIFICADOS COMO "OUTROS"' as info,
  f.topic_id,
  t.name as topic_name,
  COUNT(f.id) as quantidade
FROM public.flashcards f
LEFT JOIN public.topics t ON f.topic_id = t.id
WHERE f.topic_id NOT LIKE '%regulamento%'
  AND f.topic_id NOT IN (
    'sintaxe-termos-integrantes',
    'regencia',
    'crase',
    'morfologia-flexao',
    'fonetica-fonologia',
    'acentuacao-grafica',
    'ortografia',
    'colocacao-pronominal',
    'morfologia-classes',
    'semantica-estilistica',
    'sintaxe-periodo-composto',
    'sintaxe-termos-acessorios',
    'sintaxe-termos-essenciais',
    'concordancia'
  )
GROUP BY f.topic_id, t.name
ORDER BY quantidade DESC;

-- 2. Verificar se há flashcards sem tópico associado
SELECT 
  'FLASHCARDS SEM TÓPICO ASSOCIADO' as info,
  f.topic_id,
  COUNT(f.id) as quantidade
FROM public.flashcards f
LEFT JOIN public.topics t ON f.topic_id = t.id
WHERE t.id IS NULL
GROUP BY f.topic_id
ORDER BY quantidade DESC;

-- 3. Listar todos os tópicos existentes para comparação
SELECT 
  'TODOS OS TÓPICOS EXISTENTES' as info,
  t.id as topic_id,
  t.name as topic_name,
  COUNT(f.id) as flashcard_count
FROM public.topics t
LEFT JOIN public.flashcards f ON t.id = f.topic_id
GROUP BY t.id, t.name
ORDER BY flashcard_count DESC, t.name; 