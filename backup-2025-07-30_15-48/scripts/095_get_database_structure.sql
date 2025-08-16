-- Script para obter estrutura do banco e exemplos para IA
-- Execute este script no Supabase SQL Editor

-- 1. Estrutura da tabela topics
SELECT 
  'ESTRUTURA_TOPICS' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'topics'
ORDER BY ordinal_position;

-- 2. Estrutura da tabela flashcards
SELECT 
  'ESTRUTURA_FLASHCARDS' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'flashcards'
ORDER BY ordinal_position;

-- 3. Listar todos os tópicos disponíveis
SELECT 
  'TOPICOS_DISPONIVEIS' as info,
  id,
  name,
  subject_id
FROM public.topics
ORDER BY name;

-- 4. Exemplos de flashcards por tópico (5 por tópico)
SELECT 
  'EXEMPLOS_FLASHCARDS' as info,
  f.id,
  f.topic_id,
  t.name as topic_name,
  f.question,
  f.answer
FROM public.flashcards f
LEFT JOIN public.topics t ON f.topic_id = t.id
WHERE f.id IN (
  SELECT DISTINCT ON (topic_id) id
  FROM public.flashcards
  ORDER BY topic_id, id
  LIMIT 50
)
ORDER BY t.name, f.id
LIMIT 50;

-- 5. Contar flashcards por tópico
SELECT 
  'CONTAGEM_POR_TOPICO' as info,
  t.id as topic_id,
  t.name as topic_name,
  COUNT(f.id) as flashcard_count
FROM public.topics t
LEFT JOIN public.flashcards f ON t.id = f.topic_id
GROUP BY t.id, t.name
ORDER BY flashcard_count DESC; 