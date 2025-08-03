-- Script para verificar se as tabelas subjects e topics existem no Supabase

-- 1. Verificar se a tabela subjects existe
SELECT 
    'Verificando tabela subjects:' as info,
    COUNT(*) as total_subjects
FROM subjects;

-- 2. Verificar se a tabela topics existe
SELECT 
    'Verificando tabela topics:' as info,
    COUNT(*) as total_topics
FROM topics;

-- 3. Mostrar alguns exemplos de subjects
SELECT 
    'Exemplos de subjects:' as info,
    id,
    name
FROM subjects 
LIMIT 5;

-- 4. Mostrar alguns exemplos de topics
SELECT 
    'Exemplos de topics:' as info,
    id,
    name,
    subject_id
FROM topics 
LIMIT 5;

-- 5. Verificar se há quizzes com topic_id válidos
SELECT 
    'Quizzes com topic_id válidos:' as info,
    q.id as quiz_id,
    q.title as quiz_title,
    q.topic_id,
    t.name as topic_name
FROM quizzes q
LEFT JOIN topics t ON q.topic_id = t.id
WHERE q.topic_id IS NOT NULL
LIMIT 5;