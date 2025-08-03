-- Script para verificar o total de flashcards no banco de dados
-- Execute este script no Supabase SQL Editor

-- 1. Total geral de flashcards
SELECT 
  'TOTAL GERAL DE FLASHCARDS' as info,
  COUNT(*) as total_flashcards
FROM public.flashcards;

-- 2. Total por tipo (regulamentos vs português)
SELECT 
  'TOTAL POR TIPO' as info,
  CASE 
    WHEN topic_id LIKE '%regulamento%' THEN 'Regulamentos Militares'
    WHEN topic_id IN (
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
    ) THEN 'Português'
    ELSE 'Outros'
  END as tipo_flashcard,
  COUNT(*) as quantidade
FROM public.flashcards
GROUP BY 
  CASE 
    WHEN topic_id LIKE '%regulamento%' THEN 'Regulamentos Militares'
    WHEN topic_id IN (
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
    ) THEN 'Português'
    ELSE 'Outros'
  END
ORDER BY quantidade DESC;

-- 3. Detalhamento por tópico
SELECT 
  'DETALHAMENTO POR TÓPICO' as info,
  t.id as topic_id,
  t.name as topic_name,
  COUNT(f.id) as flashcard_count
FROM public.topics t
LEFT JOIN public.flashcards f ON t.id = f.topic_id
GROUP BY t.id, t.name
ORDER BY flashcard_count DESC, t.name;

-- 4. Apenas tópicos de Português
SELECT 
  'TÓPICOS DE PORTUGUÊS' as info,
  t.id as topic_id,
  t.name as topic_name,
  COUNT(f.id) as flashcard_count
FROM public.topics t
LEFT JOIN public.flashcards f ON t.id = f.topic_id
WHERE t.id IN (
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
GROUP BY t.id, t.name
ORDER BY flashcard_count DESC, t.name;

-- 5. Apenas tópicos de Regulamentos
SELECT 
  'TÓPICOS DE REGULAMENTOS' as info,
  t.id as topic_id,
  t.name as topic_name,
  COUNT(f.id) as flashcard_count
FROM public.topics t
LEFT JOIN public.flashcards f ON t.id = f.topic_id
WHERE t.id LIKE '%regulamento%'
GROUP BY t.id, t.name
ORDER BY flashcard_count DESC, t.name; 