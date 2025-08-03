-- Script para verificar e corrigir flashcards.topic_id
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- CORREÇÃO DE FLASHCARDS.TOPIC_ID
-- ========================================

-- 1. Verificar tipos atuais
SELECT 
    'Verificação de tipos atuais' as info,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('topics', 'flashcards', 'quizzes', 'user_topic_progress', 'wrong_cards')
AND column_name IN ('id', 'topic_id')
ORDER BY table_name, column_name;

-- 2. Verificar dados atuais de flashcards
SELECT 
    'Dados atuais de flashcards' as info,
    id,
    topic_id,
    question
FROM flashcards 
LIMIT 10;

-- 3. Verificar se flashcards.topic_id é text
SELECT 
    'Verificação de flashcards.topic_id' as info,
    COUNT(*) as total_flashcards,
    COUNT(*) FILTER (WHERE topic_id ~ '^[0-9]+$') as topic_id_numericos,
    COUNT(*) FILTER (WHERE topic_id !~ '^[0-9]+$' AND topic_id IS NOT NULL) as topic_id_nao_numericos,
    COUNT(*) FILTER (WHERE topic_id IS NULL) as topic_id_nulos
FROM flashcards;

-- 4. Remover foreign keys existentes
ALTER TABLE flashcards DROP CONSTRAINT IF EXISTS flashcards_topic_id_fkey;
ALTER TABLE quizzes DROP CONSTRAINT IF EXISTS quizzes_topic_id_fkey;
ALTER TABLE user_topic_progress DROP CONSTRAINT IF EXISTS user_topic_progress_topic_id_fkey;
ALTER TABLE wrong_cards DROP CONSTRAINT IF EXISTS wrong_cards_topic_id_fkey;

-- 5. Converter flashcards.topic_id de text para integer
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'flashcards' 
        AND column_name = 'topic_id'
        AND data_type = 'text'
    ) THEN
        -- Adicionar coluna temporária
        ALTER TABLE flashcards ADD COLUMN topic_id_new INTEGER;
        
        -- Converter dados de text para integer
        UPDATE flashcards 
        SET topic_id_new = CASE 
            WHEN topic_id ~ '^[0-9]+$' THEN topic_id::integer
            ELSE NULL
        END;
        
        -- Remover coluna antiga e renomear nova
        ALTER TABLE flashcards DROP COLUMN topic_id;
        ALTER TABLE flashcards RENAME COLUMN topic_id_new TO topic_id;
        
        RAISE NOTICE 'Coluna flashcards.topic_id convertida de text para integer';
    ELSE
        RAISE NOTICE 'Coluna flashcards.topic_id já é integer';
    END IF;
END $$;

-- 6. Verificar tipos após conversão
SELECT 
    'Verificação após conversão' as info,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('topics', 'flashcards', 'quizzes', 'user_topic_progress', 'wrong_cards')
AND column_name IN ('id', 'topic_id')
ORDER BY table_name, column_name;

-- 7. Verificar dados após conversão
SELECT 
    'Dados após conversão' as info,
    COUNT(*) as total_flashcards,
    COUNT(*) FILTER (WHERE topic_id IS NOT NULL) as flashcards_com_topic,
    COUNT(*) FILTER (WHERE topic_id IS NULL) as flashcards_sem_topic
FROM flashcards;

-- 8. Recriar foreign keys com tipos corretos
ALTER TABLE flashcards ADD CONSTRAINT flashcards_topic_id_fkey 
FOREIGN KEY (topic_id) REFERENCES topics(id);

ALTER TABLE quizzes ADD CONSTRAINT quizzes_topic_id_fkey 
FOREIGN KEY (topic_id) REFERENCES topics(id);

ALTER TABLE user_topic_progress ADD CONSTRAINT user_topic_progress_topic_id_fkey 
FOREIGN KEY (topic_id) REFERENCES topics(id);

ALTER TABLE wrong_cards ADD CONSTRAINT wrong_cards_topic_id_fkey 
FOREIGN KEY (topic_id) REFERENCES topics(id);

-- 9. Verificar se foreign keys estão funcionando
SELECT 
    'Verificação de foreign keys' as info,
    COUNT(*) as total_flashcards,
    COUNT(*) FILTER (WHERE topic_id IS NOT NULL) as flashcards_com_topic
FROM flashcards;

-- 10. Verificar dados da tabela topics
SELECT 
    'Dados da tabela topics' as info,
    COUNT(*) as total_topics,
    COUNT(*) FILTER (WHERE subject_id = 1) as portugues_topics,
    COUNT(*) FILTER (WHERE subject_id = 2) as regulamentos_topics
FROM topics;

-- 11. Mostrar alguns exemplos de topics
SELECT 
    id,
    name,
    subject_id,
    CASE subject_id 
        WHEN 1 THEN 'Português'
        WHEN 2 THEN 'Regulamentos'
        ELSE 'Desconhecido'
    END as materia
FROM topics 
ORDER BY subject_id, name 
LIMIT 10; 