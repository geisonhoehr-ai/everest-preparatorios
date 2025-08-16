-- Script FINAL para corrigir a tabela topics
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- CORREÇÃO FINAL DA TABELA TOPICS
-- ========================================

-- 1. Verificar estrutura atual da tabela topics
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'topics' 
ORDER BY ordinal_position;

-- 2. Adicionar coluna subject_id se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'topics' 
        AND column_name = 'subject_id'
    ) THEN
        ALTER TABLE topics ADD COLUMN subject_id INTEGER REFERENCES subjects(id);
        RAISE NOTICE 'Coluna subject_id adicionada à tabela topics';
    ELSE
        RAISE NOTICE 'Coluna subject_id já existe na tabela topics';
    END IF;
END $$;

-- 3. Atualizar subject_id baseado no nome do tópico
UPDATE topics 
SET subject_id = CASE 
    WHEN name LIKE '%Gramática%' OR name LIKE '%Ortografia%' OR name LIKE '%Pontuação%' 
         OR name LIKE '%Morfologia%' OR name LIKE '%Sintaxe%' OR name LIKE '%Semântica%'
         OR name LIKE '%Estilística%' OR name LIKE '%Interpretação%' OR name LIKE '%Redação%'
         OR name LIKE '%Literatura%' OR name LIKE '%Acentuação%' OR name LIKE '%Colocação%'
         OR name LIKE '%Concordância%' OR name LIKE '%Crase%' OR name LIKE '%Fonetica%'
         OR name LIKE '%Regência%' OR name LIKE '%Vozes%' OR name LIKE '%Figuras%'
         OR name LIKE '%Coesão%' OR name LIKE '%Coerência%'
    THEN 1  -- Português
    ELSE 2  -- Regulamentos
END
WHERE subject_id IS NULL;

-- 4. Se a coluna id for text, vamos corrigir de forma mais simples
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'topics' 
        AND column_name = 'id' 
        AND data_type = 'text'
    ) THEN
        -- Criar nova tabela com estrutura correta
        CREATE TABLE topics_new (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            subject_id INTEGER REFERENCES subjects(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Copiar dados existentes
        INSERT INTO topics_new (name, subject_id)
        SELECT 
            name,
            CASE 
                WHEN name LIKE '%Gramática%' OR name LIKE '%Ortografia%' OR name LIKE '%Pontuação%' 
                     OR name LIKE '%Morfologia%' OR name LIKE '%Sintaxe%' OR name LIKE '%Semântica%'
                     OR name LIKE '%Estilística%' OR name LIKE '%Interpretação%' OR name LIKE '%Redação%'
                     OR name LIKE '%Literatura%' OR name LIKE '%Acentuação%' OR name LIKE '%Colocação%'
                     OR name LIKE '%Concordância%' OR name LIKE '%Crase%' OR name LIKE '%Fonetica%'
                     OR name LIKE '%Regência%' OR name LIKE '%Vozes%' OR name LIKE '%Figuras%'
                     OR name LIKE '%Coesão%' OR name LIKE '%Coerência%'
                THEN 1  -- Português
                ELSE 2  -- Regulamentos
            END
        FROM topics;
        
        -- Remover foreign keys existentes
        ALTER TABLE flashcards DROP CONSTRAINT IF EXISTS flashcards_topic_id_fkey;
        ALTER TABLE quizzes DROP CONSTRAINT IF EXISTS quizzes_topic_id_fkey;
        ALTER TABLE user_topic_progress DROP CONSTRAINT IF EXISTS user_topic_progress_topic_id_fkey;
        ALTER TABLE wrong_cards DROP CONSTRAINT IF EXISTS wrong_cards_topic_id_fkey;
        
        -- Dropar tabela antiga e renomear nova
        DROP TABLE topics;
        ALTER TABLE topics_new RENAME TO topics;
        
        -- Recriar foreign keys com a nova tabela
        ALTER TABLE flashcards ADD CONSTRAINT flashcards_topic_id_fkey 
        FOREIGN KEY (topic_id) REFERENCES topics(id);
        
        ALTER TABLE quizzes ADD CONSTRAINT quizzes_topic_id_fkey 
        FOREIGN KEY (topic_id) REFERENCES topics(id);
        
        ALTER TABLE user_topic_progress ADD CONSTRAINT user_topic_progress_topic_id_fkey 
        FOREIGN KEY (topic_id) REFERENCES topics(id);
        
        ALTER TABLE wrong_cards ADD CONSTRAINT wrong_cards_topic_id_fkey 
        FOREIGN KEY (topic_id) REFERENCES topics(id);
        
        RAISE NOTICE 'Tabela topics recriada com estrutura correta e foreign keys';
    ELSE
        RAISE NOTICE 'Tabela topics já tem id INTEGER';
    END IF;
END $$;

-- 5. Habilitar RLS na tabela topics
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- 6. Criar política RLS para topics
DROP POLICY IF EXISTS "Anyone can view topics" ON topics;
CREATE POLICY "Anyone can view topics" ON topics
  FOR SELECT USING (true);

-- 7. Verificar se os dados estão corretos
SELECT 
    'Verificação dos dados' as info,
    COUNT(*) as total_topics,
    COUNT(*) FILTER (WHERE subject_id = 1) as portugues_topics,
    COUNT(*) FILTER (WHERE subject_id = 2) as regulamentos_topics
FROM topics;

-- 8. Mostrar alguns exemplos
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

-- 9. Verificar se as foreign keys estão funcionando
SELECT 
    'Verificação de foreign keys' as info,
    COUNT(*) as total_flashcards,
    COUNT(*) FILTER (WHERE topic_id IS NOT NULL) as flashcards_com_topic
FROM flashcards;

-- 10. Verificar estrutura final
SELECT 
    'Estrutura final da tabela topics' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'topics' 
ORDER BY ordinal_position; 