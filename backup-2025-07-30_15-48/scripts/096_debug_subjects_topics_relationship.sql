-- Script para diagnosticar o relacionamento subjects-topics
-- Execute no SQL Editor do Supabase

-- ========================================
-- PASSO 1: VERIFICAR DADOS ATUAIS
-- ========================================

-- Verificar subjects
SELECT 
    'SUBJECTS ATUAIS' as etapa,
    id,
    name
FROM subjects
ORDER BY name;

-- Verificar topics
SELECT 
    'TOPICS ATUAIS' as etapa,
    id,
    name,
    subject_id,
    CASE 
        WHEN subject_id IS NULL THEN '❌ SEM SUBJECT'
        WHEN subject_id = 1 THEN '✅ PORTUGUÊS'
        WHEN subject_id = 2 THEN '✅ REGULAMENTOS'
        ELSE '❓ SUBJECT DESCONHECIDO'
    END as status_subject
FROM topics
ORDER BY name;

-- ========================================
-- PASSO 2: VERIFICAR RELACIONAMENTO
-- ========================================

-- Verificar quantos topics têm subject_id
SELECT 
    'ANÁLISE DE RELACIONAMENTO' as etapa,
    COUNT(*) as total_topics,
    COUNT(*) FILTER (WHERE subject_id IS NOT NULL) as com_subject_id,
    COUNT(*) FILTER (WHERE subject_id IS NULL) as sem_subject_id,
    COUNT(*) FILTER (WHERE subject_id = 1) as portugues,
    COUNT(*) FILTER (WHERE subject_id = 2) as regulamentos
FROM topics;

-- ========================================
-- PASSO 3: VERIFICAR TOPICS ÓRFÃOS
-- ========================================

-- Topics sem subject_id
SELECT 
    'TOPICS SEM SUBJECT_ID' as etapa,
    id,
    name
FROM topics
WHERE subject_id IS NULL
ORDER BY name;

-- ========================================
-- PASSO 4: VERIFICAR RLS
-- ========================================

-- Verificar políticas RLS para subjects
SELECT 
    'RLS SUBJECTS' as etapa,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'subjects';

-- Verificar políticas RLS para topics
SELECT 
    'RLS TOPICS' as etapa,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'topics';

-- ========================================
-- PASSO 5: TESTAR QUERY DA FUNÇÃO
-- ========================================

-- Testar a query exata da função getAllSubjects()
SELECT 
    'TESTE GETALLSUBJECTS' as etapa,
    id,
    name
FROM subjects
ORDER BY name;

-- ========================================
-- PASSO 6: TESTAR QUERY DA FUNÇÃO GETTOPICSBYSUBJECT
-- ========================================

-- Testar para Português (id: 1)
SELECT 
    'TOPICS PORTUGUÊS (ID: 1)' as etapa,
    id,
    name,
    subject_id
FROM topics
WHERE subject_id = 1
ORDER BY name;

-- Testar para Regulamentos (id: 2)
SELECT 
    'TOPICS REGULAMENTOS (ID: 2)' as etapa,
    id,
    name,
    subject_id
FROM topics
WHERE subject_id = 2
ORDER BY name;

-- ========================================
-- PASSO 7: VERIFICAR SE HÁ DADOS DE TESTE
-- ========================================

-- Se não há topics com subject_id, vamos criar alguns
DO $$
DECLARE
    topic_count integer;
    portugues_topics integer;
    regulamentos_topics integer;
BEGIN
    -- Contar topics por subject
    SELECT COUNT(*) INTO topic_count FROM topics;
    SELECT COUNT(*) INTO portugues_topics FROM topics WHERE subject_id = 1;
    SELECT COUNT(*) INTO regulamentos_topics FROM topics WHERE subject_id = 2;
    
    RAISE NOTICE '📊 ESTATÍSTICAS:';
    RAISE NOTICE '   Total de topics: %', topic_count;
    RAISE NOTICE '   Topics de Português: %', portugues_topics;
    RAISE NOTICE '   Topics de Regulamentos: %', regulamentos_topics;
    
    -- Se não há topics para Português, sugerir inserção
    IF portugues_topics = 0 THEN
        RAISE NOTICE '⚠️ Nenhum topic para Português encontrado!';
        RAISE NOTICE '💡 Você pode inserir topics de teste com:';
        RAISE NOTICE 'INSERT INTO topics (name, subject_id) VALUES (''Gramática'', 1), (''Redação'', 1), (''Interpretação'', 1);';
    END IF;
    
    -- Se não há topics para Regulamentos, sugerir inserção
    IF regulamentos_topics = 0 THEN
        RAISE NOTICE '⚠️ Nenhum topic para Regulamentos encontrado!';
        RAISE NOTICE '💡 Você pode inserir topics de teste com:';
        RAISE NOTICE 'INSERT INTO topics (name, subject_id) VALUES (''Leis de Trânsito'', 2), (''Sinalização'', 2), (''Primeiros Socorros'', 2);';
    END IF;
END $$;

-- ========================================
-- PASSO 8: RESUMO FINAL
-- ========================================

SELECT 
    'RESUMO FINAL' as etapa,
    (SELECT COUNT(*) FROM subjects) as total_subjects,
    (SELECT COUNT(*) FROM topics) as total_topics,
    (SELECT COUNT(*) FROM topics WHERE subject_id IS NOT NULL) as topics_com_subject,
    (SELECT COUNT(*) FROM topics WHERE subject_id IS NULL) as topics_sem_subject,
    CASE 
        WHEN (SELECT COUNT(*) FROM topics WHERE subject_id = 1) > 0 
        THEN '✅ Português tem topics'
        ELSE '❌ Português sem topics'
    END as portugues_status,
    CASE 
        WHEN (SELECT COUNT(*) FROM topics WHERE subject_id = 2) > 0 
        THEN '✅ Regulamentos tem topics'
        ELSE '❌ Regulamentos sem topics'
    END as regulamentos_status; 