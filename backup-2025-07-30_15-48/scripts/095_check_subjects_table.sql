-- Script para verificar se a tabela subjects existe e tem dados
-- Execute no SQL Editor do Supabase

-- ========================================
-- PASSO 1: VERIFICAR SE A TABELA SUBJECTS EXISTE
-- ========================================

SELECT 
    'VERIFICAÇÃO DA TABELA SUBJECTS' as etapa,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'subjects';

-- ========================================
-- PASSO 2: VERIFICAR ESTRUTURA DA TABELA SUBJECTS
-- ========================================

SELECT 
    'ESTRUTURA DA TABELA SUBJECTS' as etapa,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'subjects'
ORDER BY ordinal_position;

-- ========================================
-- PASSO 3: VERIFICAR DADOS NA TABELA SUBJECTS
-- ========================================

SELECT 
    'DADOS NA TABELA SUBJECTS' as etapa,
    COUNT(*) as total_subjects,
    MIN(id) as menor_id,
    MAX(id) as maior_id
FROM subjects;

-- ========================================
-- PASSO 4: LISTAR TODOS OS SUBJECTS
-- ========================================

SELECT 
    'LISTA DE SUBJECTS' as etapa,
    id,
    name,
    created_at
FROM subjects
ORDER BY name;

-- ========================================
-- PASSO 5: VERIFICAR RELACIONAMENTO COM TOPICS
-- ========================================

SELECT 
    'RELACIONAMENTO SUBJECTS-TOPICS' as etapa,
    s.id as subject_id,
    s.name as subject_name,
    COUNT(t.id) as total_topics
FROM subjects s
LEFT JOIN topics t ON s.id = t.subject_id
GROUP BY s.id, s.name
ORDER BY s.name;

-- ========================================
-- PASSO 6: VERIFICAR TOPICS SEM SUBJECT
-- ========================================

SELECT 
    'TOPICS SEM SUBJECT' as etapa,
    COUNT(*) as topics_orfãos
FROM topics t
LEFT JOIN subjects s ON t.subject_id = s.id
WHERE s.id IS NULL;

-- ========================================
-- PASSO 7: VERIFICAR SE HÁ DADOS DE TESTE
-- ========================================

-- Se não há subjects, vamos criar alguns de teste
DO $$
BEGIN
    -- Verificar se subjects está vazia
    IF (SELECT COUNT(*) FROM subjects) = 0 THEN
        RAISE NOTICE '⚠️ Tabela subjects está vazia!';
        RAISE NOTICE '💡 Você pode inserir dados de teste com:';
        RAISE NOTICE 'INSERT INTO subjects (name) VALUES (''Português''), (''Matemática''), (''História'');';
    ELSE
        RAISE NOTICE '✅ Tabela subjects tem dados!';
    END IF;
END $$;

-- ========================================
-- PASSO 8: VERIFICAR RLS (ROW LEVEL SECURITY)
-- ========================================

SELECT 
    'VERIFICAÇÃO RLS' as etapa,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'subjects';

-- ========================================
-- PASSO 9: RESUMO FINAL
-- ========================================

SELECT 
    'RESUMO FINAL' as etapa,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subjects') 
        THEN '✅ Tabela subjects existe'
        ELSE '❌ Tabela subjects NÃO existe'
    END as tabela_existe,
    
    CASE 
        WHEN (SELECT COUNT(*) FROM subjects) > 0 
        THEN '✅ Tabela subjects tem dados'
        ELSE '❌ Tabela subjects está vazia'
    END as tem_dados,
    
    CASE 
        WHEN (SELECT COUNT(*) FROM topics WHERE subject_id IS NOT NULL) > 0 
        THEN '✅ Topics têm subject_id'
        ELSE '❌ Topics não têm subject_id'
    END as topics_tem_subject_id; 