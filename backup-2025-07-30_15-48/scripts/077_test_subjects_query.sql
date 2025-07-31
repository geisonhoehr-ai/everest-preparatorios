-- Script para testar consulta de subjects
-- Data: 2025-01-25
-- Descrição: Testa a consulta exata usada pela função getAllSubjects()

-- 1. Verificar se a tabela subjects existe e tem dados
SELECT 
    'Tabela subjects existe' as status,
    COUNT(*) as total_registros
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name = 'subjects';

-- 2. Verificar estrutura da tabela subjects
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'subjects'
ORDER BY ordinal_position;

-- 3. Testar a consulta exata da função getAllSubjects()
SELECT 
    'Consulta getAllSubjects()' as teste,
    id,
    name
FROM subjects 
ORDER BY name;

-- 4. Verificar se há dados na tabela
SELECT 
    'Dados na tabela subjects' as status,
    COUNT(*) as total,
    STRING_AGG(name, ', ') as materias
FROM subjects;

-- 5. Testar a consulta exata da função getTopicsBySubject()
SELECT 
    'Consulta getTopicsBySubject(1) - Português' as teste,
    id,
    name,
    subject_id
FROM topics 
WHERE subject_id = 1
ORDER BY name;

SELECT 
    'Consulta getTopicsBySubject(2) - Regulamentos' as teste,
    id,
    name,
    subject_id
FROM topics 
WHERE subject_id = 2
ORDER BY name;

-- 6. Verificar se há tópicos sem subject_id
SELECT 
    'Tópicos sem subject_id' as status,
    COUNT(*) as total,
    STRING_AGG(name, ', ') as topicos
FROM topics 
WHERE subject_id IS NULL;

-- 7. Resumo final
SELECT 
    'RESUMO FINAL' as secao,
    'subjects' as tabela,
    COUNT(*) as total_registros
FROM subjects
UNION ALL
SELECT 
    'RESUMO FINAL' as secao,
    'topics com subject_id' as tabela,
    COUNT(*) as total_registros
FROM topics 
WHERE subject_id IS NOT NULL
UNION ALL
SELECT 
    'RESUMO FINAL' as secao,
    'topics sem subject_id' as tabela,
    COUNT(*) as total_registros
FROM topics 
WHERE subject_id IS NULL; 