-- Script para testar dados nas tabelas topics e flashcards
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela topics existe e tem dados
SELECT 
  'Status da tabela topics' as info,
  COUNT(*) as total_topics
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'topics';

-- 2. Listar todos os tópicos
SELECT 
  'Tópicos disponíveis' as info,
  id,
  name
FROM public.topics
ORDER BY name;

-- 3. Verificar se a tabela flashcards existe e tem dados
SELECT 
  'Status da tabela flashcards' as info,
  COUNT(*) as total_flashcards
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'flashcards';

-- 4. Contar flashcards por tópico
SELECT 
  'Flashcards por tópico' as info,
  t.name as topic_name,
  COUNT(f.id) as flashcard_count
FROM public.topics t
LEFT JOIN public.flashcards f ON t.id = f.topic_id
GROUP BY t.id, t.name
ORDER BY t.name;

-- 5. Verificar se há flashcards sem tópico
SELECT 
  'Flashcards sem tópico' as info,
  COUNT(*) as orphaned_flashcards
FROM public.flashcards f
LEFT JOIN public.topics t ON f.topic_id = t.id
WHERE t.id IS NULL;

-- 6. Listar alguns flashcards de exemplo
SELECT 
  'Exemplos de flashcards' as info,
  f.id,
  f.topic_id,
  t.name as topic_name,
  LEFT(f.question, 50) as question_preview,
  LEFT(f.answer, 50) as answer_preview
FROM public.flashcards f
LEFT JOIN public.topics t ON f.topic_id = t.id
ORDER BY f.id
LIMIT 10;

-- 7. Verificar estrutura da tabela flashcards
SELECT 
  'Estrutura da tabela flashcards' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'flashcards'
ORDER BY ordinal_position;

-- 8. Verificar estrutura da tabela topics
SELECT 
  'Estrutura da tabela topics' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'topics'
ORDER BY ordinal_position; 