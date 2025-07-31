-- Script para testar a tabela subjects e debug
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela subjects existe
SELECT 
    'TABELA_EXISTE' as teste,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'subjects'
    ) as tabela_existe;

-- 2. Verificar estrutura da tabela subjects
SELECT 
    'ESTRUTURA_TABELA' as teste,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'subjects'
ORDER BY ordinal_position;

-- 3. Verificar dados na tabela subjects
SELECT 
    'DADOS_SUBJECTS' as teste,
    id,
    name,
    created_at
FROM subjects
ORDER BY name;

-- 4. Verificar se há dados na tabela topics
SELECT 
    'DADOS_TOPICS' as teste,
    id,
    name,
    subject_id,
    created_at
FROM topics
ORDER BY subject_id, name;

-- 5. Verificar relacionamento entre subjects e topics
SELECT 
    'RELACIONAMENTO' as teste,
    s.id as subject_id,
    s.name as subject_name,
    COUNT(t.id) as total_topics
FROM subjects s
LEFT JOIN topics t ON s.id = t.subject_id
GROUP BY s.id, s.name
ORDER BY s.name;

-- 6. Verificar políticas RLS na tabela subjects
SELECT 
    'POLITICAS_RLS' as teste,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'subjects';

-- 7. Testar query exata da função getAllSubjects
SELECT 
    'QUERY_EXATA' as teste,
    id,
    name
FROM subjects 
ORDER BY name; 