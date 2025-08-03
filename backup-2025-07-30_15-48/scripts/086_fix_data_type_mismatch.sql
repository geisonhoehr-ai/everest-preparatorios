-- Script para corrigir mismatch de tipos de dados
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- CORREÇÃO DE TIPOS DE DADOS
-- ========================================

-- 1. Verificar tipos atuais
SELECT 
    'topics' AS table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'topics'
UNION ALL
SELECT 
    'flashcards' AS table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'flashcards'
AND column_name = 'topic_id';

-- 2. Verificar se flashcards.topic_id é text
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

-- 3. Verificar se quizzes.topic_id é text
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

-- 4. Verificar se user_topic_progress.topic_id é text
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

-- 5. Verificar se wrong_cards.topic_id é text
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

-- 6. Remover foreign keys existentes
ALTER TABLE flashcards DROP CONSTRAINT IF EXISTS flashcards_topic_id_fkey;
ALTER TABLE quizzes DROP CONSTRAINT IF EXISTS quizzes_topic_id_fkey;
ALTER TABLE user_topic_progress DROP CONSTRAINT IF EXISTS user_topic_progress_topic_id_fkey;
ALTER TABLE wrong_cards DROP CONSTRAINT IF EXISTS wrong_cards_topic_id_fkey;

-- 7. Recriar foreign keys com tipos corretos
ALTER TABLE flashcards ADD CONSTRAINT flashcards_topic_id_fkey 
FOREIGN KEY (topic_id) REFERENCES topics(id);

ALTER TABLE quizzes ADD CONSTRAINT quizzes_topic_id_fkey 
FOREIGN KEY (topic_id) REFERENCES topics(id);

ALTER TABLE user_topic_progress ADD CONSTRAINT user_topic_progress_topic_id_fkey 
FOREIGN KEY (topic_id) REFERENCES topics(id);

ALTER TABLE wrong_cards ADD CONSTRAINT wrong_cards_topic_id_fkey 
FOREIGN KEY (topic_id) REFERENCES topics(id);

-- 8. Verificar tipos finais
SELECT 
    'Verificação final de tipos' as info,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('topics', 'flashcards', 'quizzes', 'user_topic_progress', 'wrong_cards')
AND column_name IN ('id', 'topic_id')
ORDER BY table_name, column_name;

-- 9. Verificar se foreign keys estão funcionando
SELECT 
    'Verificação de foreign keys' as info,
    COUNT(*) as total_flashcards,
    COUNT(*) FILTER (WHERE topic_id IS NOT NULL) as flashcards_com_topic
FROM flashcards; 