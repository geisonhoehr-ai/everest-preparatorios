-- Script para verificar tabelas de flashcards
-- Data: 2025-01-25
-- Descrição: Verifica se as tabelas subjects e topics existem e têm dados

-- Verificar se as tabelas existem
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('subjects', 'topics', 'flashcards')
ORDER BY table_name;

-- Verificar estrutura da tabela subjects
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'subjects'
ORDER BY ordinal_position;

-- Verificar estrutura da tabela topics
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'topics'
ORDER BY ordinal_position;

-- Verificar estrutura da tabela flashcards
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'flashcards'
ORDER BY ordinal_position;

-- Verificar dados na tabela subjects
SELECT 
    'subjects' as tabela,
    COUNT(*) as total_registros
FROM subjects
UNION ALL
SELECT 
    'topics' as tabela,
    COUNT(*) as total_registros
FROM topics
UNION ALL
SELECT 
    'flashcards' as tabela,
    COUNT(*) as total_registros
FROM flashcards;

-- Verificar algumas matérias
SELECT 
    id,
    name,
    created_at
FROM subjects 
ORDER BY name 
LIMIT 10;

-- Verificar alguns tópicos
SELECT 
    t.id,
    t.name,
    s.name as subject_name,
    t.subject_id
FROM topics t
LEFT JOIN subjects s ON t.subject_id = s.id
ORDER BY s.name, t.name
LIMIT 10;

-- Verificar alguns flashcards
SELECT 
    f.id,
    f.question,
    f.answer,
    t.name as topic_name,
    s.name as subject_name
FROM flashcards f
LEFT JOIN topics t ON f.topic_id = t.id
LEFT JOIN subjects s ON t.subject_id = s.id
ORDER BY s.name, t.name
LIMIT 5;

-- Verificar se há dados de exemplo
SELECT 
    'subjects' as tabela,
    COUNT(*) as total
FROM subjects
WHERE name ILIKE '%matemática%' OR name ILIKE '%português%' OR name ILIKE '%história%'
UNION ALL
SELECT 
    'topics' as tabela,
    COUNT(*) as total
FROM topics
WHERE name ILIKE '%álgebra%' OR name ILIKE '%gramática%' OR name ILIKE '%brasil%'
UNION ALL
SELECT 
    'flashcards' as tabela,
    COUNT(*) as total
FROM flashcards
WHERE question ILIKE '%equação%' OR question ILIKE '%verbo%' OR question ILIKE '%independência%'; 