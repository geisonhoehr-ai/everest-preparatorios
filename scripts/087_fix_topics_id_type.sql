-- Script para corrigir o tipo da coluna topics.id
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- CORREÇÃO DO TIPO DA COLUNA TOPICS.ID
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

-- 2. Verificar se topics.id é text
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'topics' 
        AND column_name = 'id'
        AND data_type = 'text'
    ) THEN
        -- Converter topics.id de text para integer
        ALTER TABLE topics 
        ALTER COLUMN id TYPE integer USING id::integer;
        
        RAISE NOTICE 'Coluna topics.id convertida de text para integer';
    ELSE
        RAISE NOTICE 'Coluna topics.id já é integer';
    END IF;
END $$;

-- 3. Verificar se flashcards.topic_id é integer
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'flashcards' 
        AND column_name = 'topic_id'
        AND data_type = 'text'
    ) THEN
        -- Converter flashcards.topic_id de text para integer
        ALTER TABLE flashcards 
        ALTER COLUMN topic_id TYPE integer USING topic_id::integer;
        
        RAISE NOTICE 'Coluna flashcards.topic_id convertida de text para integer';
    ELSE
        RAISE NOTICE 'Coluna flashcards.topic_id já é integer';
    END IF;
END $$;

-- 4. Verificar se quizzes.topic_id é integer
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'quizzes' 
        AND column_name = 'topic_id'
        AND data_type = 'text'
    ) THEN
        -- Converter quizzes.topic_id de text para integer
        ALTER TABLE quizzes 
        ALTER COLUMN topic_id TYPE integer USING topic_id::integer;
        
        RAISE NOTICE 'Coluna quizzes.topic_id convertida de text para integer';
    ELSE
        RAISE NOTICE 'Coluna quizzes.topic_id já é integer';
    END IF;
END $$;

-- 5. Verificar se user_topic_progress.topic_id é integer
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'user_topic_progress' 
        AND column_name = 'topic_id'
        AND data_type = 'text'
    ) THEN
        -- Converter user_topic_progress.topic_id de text para integer
        ALTER TABLE user_topic_progress 
        ALTER COLUMN topic_id TYPE integer USING topic_id::integer;
        
        RAISE NOTICE 'Coluna user_topic_progress.topic_id convertida de text para integer';
    ELSE
        RAISE NOTICE 'Coluna user_topic_progress.topic_id já é integer';
    END IF;
END $$;

-- 6. Verificar se wrong_cards.topic_id é integer
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'wrong_cards' 
        AND column_name = 'topic_id'
        AND data_type = 'text'
    ) THEN
        -- Converter wrong_cards.topic_id de text para integer
        ALTER TABLE wrong_cards 
        ALTER COLUMN topic_id TYPE integer USING topic_id::integer;
        
        RAISE NOTICE 'Coluna wrong_cards.topic_id convertida de text para integer';
    ELSE
        RAISE NOTICE 'Coluna wrong_cards.topic_id já é integer';
    END IF;
END $$;

-- 7. Remover foreign keys existentes
ALTER TABLE flashcards DROP CONSTRAINT IF EXISTS flashcards_topic_id_fkey;
ALTER TABLE quizzes DROP CONSTRAINT IF EXISTS quizzes_topic_id_fkey;
ALTER TABLE user_topic_progress DROP CONSTRAINT IF EXISTS user_topic_progress_topic_id_fkey;
ALTER TABLE wrong_cards DROP CONSTRAINT IF EXISTS wrong_cards_topic_id_fkey;

-- 8. Recriar foreign keys com tipos corretos
ALTER TABLE flashcards ADD CONSTRAINT flashcards_topic_id_fkey 
FOREIGN KEY (topic_id) REFERENCES topics(id);

ALTER TABLE quizzes ADD CONSTRAINT quizzes_topic_id_fkey 
FOREIGN KEY (topic_id) REFERENCES topics(id);

ALTER TABLE user_topic_progress ADD CONSTRAINT user_topic_progress_topic_id_fkey 
FOREIGN KEY (topic_id) REFERENCES topics(id);

ALTER TABLE wrong_cards ADD CONSTRAINT wrong_cards_topic_id_fkey 
FOREIGN KEY (topic_id) REFERENCES topics(id);

-- 9. Verificar tipos finais
SELECT 
    'Verificação final de tipos' as info,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('topics', 'flashcards', 'quizzes', 'user_topic_progress', 'wrong_cards')
AND column_name IN ('id', 'topic_id')
ORDER BY table_name, column_name;

-- 10. Verificar se foreign keys estão funcionando
SELECT 
    'Verificação de foreign keys' as info,
    COUNT(*) as total_flashcards,
    COUNT(*) FILTER (WHERE topic_id IS NOT NULL) as flashcards_com_topic
FROM flashcards;

-- 11. Verificar dados da tabela topics
SELECT 
    'Dados da tabela topics' as info,
    COUNT(*) as total_topics,
    COUNT(*) FILTER (WHERE subject_id = 1) as portugues_topics,
    COUNT(*) FILTER (WHERE subject_id = 2) as regulamentos_topics
FROM topics; 