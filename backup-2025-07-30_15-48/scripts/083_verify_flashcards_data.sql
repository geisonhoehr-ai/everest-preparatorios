-- Script para verificar dados de flashcards

-- Verificar se a tabela flashcards existe
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'flashcards';

-- Verificar a estrutura da tabela flashcards
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'flashcards'
ORDER BY ordinal_position;

-- Verificar se há dados na tabela flashcards
SELECT COUNT(*) as total_flashcards FROM public.flashcards;

-- Verificar alguns flashcards de exemplo
SELECT 
  id,
  topic_id,
  LEFT(question, 50) as question_preview,
  LEFT(answer, 50) as answer_preview
FROM public.flashcards 
LIMIT 10;

-- Verificar tópicos disponíveis
SELECT 
  id,
  name
FROM public.topics 
ORDER BY name;

-- Verificar flashcards por tópico
SELECT 
  t.name as topic_name,
  COUNT(f.id) as flashcard_count
FROM public.topics t
LEFT JOIN public.flashcards f ON t.id = f.topic_id
GROUP BY t.id, t.name
ORDER BY t.name;

-- Verificar se há flashcards para cada tópico
SELECT 
  t.id,
  t.name,
  CASE 
    WHEN COUNT(f.id) > 0 THEN 'Tem flashcards'
    ELSE 'Sem flashcards'
  END as status
FROM public.topics t
LEFT JOIN public.flashcards f ON t.id = f.topic_id
GROUP BY t.id, t.name
ORDER BY t.name; 