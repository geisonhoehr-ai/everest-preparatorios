-- Script para verificar o status completo dos quizzes criados
-- Execute este script no Supabase SQL Editor

-- 1. Verificar total de quizzes criados
SELECT 
  'TOTAL DE QUIZZES' as info,
  COUNT(*) as total_quizzes
FROM quizzes;

-- 2. Verificar quizzes por tópico
SELECT 
  'QUIZZES POR TÓPICO' as info,
  q.topic_id,
  t.name as topic_name,
  q.title as quiz_title,
  q.description
FROM quizzes q
LEFT JOIN topics t ON q.topic_id = t.id
ORDER BY q.topic_id;

-- 3. Verificar total de questões criadas
SELECT 
  'TOTAL DE QUESTÕES' as info,
  COUNT(*) as total_questions
FROM quiz_questions;

-- 4. Verificar questões por quiz
SELECT 
  'QUESTÕES POR QUIZ' as info,
  q.title as quiz_title,
  q.topic_id,
  COUNT(qq.id) as question_count
FROM quizzes q
LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
GROUP BY q.id, q.title, q.topic_id
ORDER BY q.topic_id;

-- 5. Verificar distribuição por categoria
SELECT 
  'DISTRIBUIÇÃO POR CATEGORIA' as info,
  CASE 
    WHEN q.topic_id IN (
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
    WHEN q.topic_id IN (
      'ica-111-6',
      'estatuto-militares',
      'ica-111-3',
      'rdaer',
      'ica-111-2',
      'portaria-gm-md-1143-2022',
      'rca-34-1',
      'lei-13954-2019',
      'ica-111-1',
      'regulamentos-comuns'
    ) THEN 'Regulamentos Militares'
    ELSE 'Outros'
  END as categoria,
  COUNT(q.id) as quiz_count,
  SUM(COALESCE(question_counts.question_count, 0)) as total_questions
FROM quizzes q
LEFT JOIN (
  SELECT quiz_id, COUNT(*) as question_count
  FROM quiz_questions
  GROUP BY quiz_id
) question_counts ON q.id = question_counts.quiz_id
GROUP BY 
  CASE 
    WHEN q.topic_id IN (
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
    WHEN q.topic_id IN (
      'ica-111-6',
      'estatuto-militares',
      'ica-111-3',
      'rdaer',
      'ica-111-2',
      'portaria-gm-md-1143-2022',
      'rca-34-1',
      'lei-13954-2019',
      'ica-111-1',
      'regulamentos-comuns'
    ) THEN 'Regulamentos Militares'
    ELSE 'Outros'
  END
ORDER BY total_questions DESC;

-- 6. Verificar questões de exemplo (primeiras 5 questões)
SELECT 
  'EXEMPLO DE QUESTÕES' as info,
  q.title as quiz_title,
  qq.question_text,
  qq.correct_answer,
  qq.explanation
FROM quiz_questions qq
JOIN quizzes q ON qq.quiz_id = q.id
ORDER BY q.topic_id, qq.id
LIMIT 5; 