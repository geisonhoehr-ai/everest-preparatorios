-- Script para verificar tópicos existentes na tabela
-- Execute este script no Supabase SQL Editor

-- 1. Verificar todos os tópicos existentes
SELECT 
  'TÓPICOS EXISTENTES' as info,
  id as topic_id,
  name as topic_name
FROM public.topics
ORDER BY id;

-- 2. Verificar tópicos de português/gramática existentes
SELECT 
  'TÓPICOS DE PORTUGUÊS EXISTENTES' as info,
  id as topic_id,
  name as topic_name
FROM public.topics
WHERE id LIKE '%gramatica%' 
   OR id LIKE '%portugues%' 
   OR id LIKE '%literatura%'
   OR id LIKE '%morfologia%'
   OR id LIKE '%sintaxe%'
   OR id LIKE '%semantica%'
   OR id LIKE '%redacao%'
   OR id LIKE '%interpretacao%'
   OR id LIKE '%figuras%'
   OR id LIKE '%generos%'
ORDER BY id;

-- 3. Contar total de tópicos
SELECT 
  'TOTAL DE TÓPICOS' as info,
  COUNT(*) as total_topicos
FROM public.topics;

-- 4. Verificar flashcards por tópico existente
SELECT 
  'FLASHCARDS POR TÓPICO EXISTENTE' as info,
  t.id as topic_id,
  t.name as topic_name,
  COUNT(f.id) as flashcard_count
FROM public.topics t
LEFT JOIN public.flashcards f ON t.id = f.topic_id
GROUP BY t.id, t.name
ORDER BY flashcard_count DESC, t.name; 