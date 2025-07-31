-- Script para verificar dados necessários para o quiz funcionar

-- 1. Verificar se a tabela subjects existe e tem dados
SELECT 
    'Verificando tabela subjects:' as info,
    COUNT(*) as total_subjects
FROM subjects;

-- 2. Verificar se a tabela topics existe e tem dados
SELECT 
    'Verificando tabela topics:' as info,
    COUNT(*) as total_topics
FROM topics;

-- 3. Verificar se a tabela quizzes existe e tem dados
SELECT 
    'Verificando tabela quizzes:' as info,
    COUNT(*) as total_quizzes
FROM quizzes;

-- 4. Verificar se a tabela quiz_questions existe e tem dados
SELECT 
    'Verificando tabela quiz_questions:' as info,
    COUNT(*) as total_questions
FROM quiz_questions;

-- 5. Mostrar alguns exemplos de subjects
SELECT 
    'Exemplos de subjects:' as info,
    id,
    name
FROM subjects 
LIMIT 5;

-- 6. Mostrar alguns exemplos de topics
SELECT 
    'Exemplos de topics:' as info,
    id,
    name,
    subject_id
FROM topics 
LIMIT 5;

-- 7. Mostrar alguns exemplos de quizzes
SELECT 
    'Exemplos de quizzes:' as info,
    id,
    title,
    topic_id
FROM quizzes 
LIMIT 5;

-- 8. Verificar se há quizzes com questões
SELECT 
    'Quizzes com questões:' as info,
    q.id as quiz_id,
    q.title as quiz_title,
    COUNT(qq.id) as total_questions
FROM quizzes q
LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
GROUP BY q.id, q.title
HAVING COUNT(qq.id) > 0
LIMIT 5;