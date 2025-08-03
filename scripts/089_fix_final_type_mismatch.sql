-- Script FINAL para corrigir mismatch de tipos
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- CORREÇÃO FINAL DE TIPOS
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

-- 2. Remover foreign keys existentes primeiro
ALTER TABLE flashcards DROP CONSTRAINT IF EXISTS flashcards_topic_id_fkey;
ALTER TABLE quizzes DROP CONSTRAINT IF EXISTS quizzes_topic_id_fkey;
ALTER TABLE user_topic_progress DROP CONSTRAINT IF EXISTS user_topic_progress_topic_id_fkey;
ALTER TABLE wrong_cards DROP CONSTRAINT IF EXISTS wrong_cards_topic_id_fkey;

-- 3. Converter flashcards.topic_id de text para integer
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

-- 4. Converter quizzes.topic_id de text para integer
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'quizzes' 
        AND column_name = 'topic_id'
        AND data_type = 'text'
    ) THEN
        -- Adicionar coluna temporária
        ALTER TABLE quizzes ADD COLUMN topic_id_new INTEGER;
        
        -- Converter dados de text para integer
        UPDATE quizzes 
        SET topic_id_new = CASE 
            WHEN topic_id ~ '^[0-9]+$' THEN topic_id::integer
            ELSE NULL
        END;
        
        -- Remover coluna antiga e renomear nova
        ALTER TABLE quizzes DROP COLUMN topic_id;
        ALTER TABLE quizzes RENAME COLUMN topic_id_new TO topic_id;
        
        RAISE NOTICE 'Coluna quizzes.topic_id convertida de text para integer';
    ELSE
        RAISE NOTICE 'Coluna quizzes.topic_id já é integer';
    END IF;
END $$;

-- 5. Converter user_topic_progress.topic_id de text para integer
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'user_topic_progress' 
        AND column_name = 'topic_id'
        AND data_type = 'text'
    ) THEN
        -- Adicionar coluna temporária
        ALTER TABLE user_topic_progress ADD COLUMN topic_id_new INTEGER;
        
        -- Converter dados de text para integer
        UPDATE user_topic_progress 
        SET topic_id_new = CASE 
            WHEN topic_id ~ '^[0-9]+$' THEN topic_id::integer
            ELSE NULL
        END;
        
        -- Remover coluna antiga e renomear nova
        ALTER TABLE user_topic_progress DROP COLUMN topic_id;
        ALTER TABLE user_topic_progress RENAME COLUMN topic_id_new TO topic_id;
        
        RAISE NOTICE 'Coluna user_topic_progress.topic_id convertida de text para integer';
    ELSE
        RAISE NOTICE 'Coluna user_topic_progress.topic_id já é integer';
    END IF;
END $$;

-- 6. Converter wrong_cards.topic_id de text para integer
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'wrong_cards' 
        AND column_name = 'topic_id'
        AND data_type = 'text'
    ) THEN
        -- Adicionar coluna temporária
        ALTER TABLE wrong_cards ADD COLUMN topic_id_new INTEGER;
        
        -- Converter dados de text para integer
        UPDATE wrong_cards 
        SET topic_id_new = CASE 
            WHEN topic_id ~ '^[0-9]+$' THEN topic_id::integer
            ELSE NULL
        END;
        
        -- Remover coluna antiga e renomear nova
        ALTER TABLE wrong_cards DROP COLUMN topic_id;
        ALTER TABLE wrong_cards RENAME COLUMN topic_id_new TO topic_id;
        
        RAISE NOTICE 'Coluna wrong_cards.topic_id convertida de text para integer';
    ELSE
        RAISE NOTICE 'Coluna wrong_cards.topic_id já é integer';
    END IF;
END $$;

-- 7. Verificar tipos após conversão
SELECT 
    'Verificação após conversão' as info,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('topics', 'flashcards', 'quizzes', 'user_topic_progress', 'wrong_cards')
AND column_name IN ('id', 'topic_id')
ORDER BY table_name, column_name;

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