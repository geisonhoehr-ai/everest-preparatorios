-- Script SEGURO para corrigir a tabela topics
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- CORREÇÃO SEGURA DA TABELA TOPICS
-- ========================================

-- 1. Primeiro, vamos verificar as dependências
SELECT 
    'Dependências da tabela topics' as info,
    COUNT(*) as total_constraints
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
AND table_name IN ('flashcards', 'quizzes', 'user_topic_progress', 'wrong_cards')
AND constraint_name LIKE '%topic_id%';

-- 2. Verificar a estrutura atual da tabela topics
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'topics' 
ORDER BY ordinal_position;

-- 3. Adicionar coluna subject_id se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'topics' 
        AND column_name = 'subject_id'
    ) THEN
        -- Adicionar coluna subject_id
        ALTER TABLE topics ADD COLUMN subject_id INTEGER REFERENCES subjects(id);
        RAISE NOTICE 'Coluna subject_id adicionada à tabela topics';
    ELSE
        RAISE NOTICE 'Coluna subject_id já existe na tabela topics';
    END IF;
END $$;

-- 4. Atualizar subject_id baseado no nome do tópico
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

-- 5. Se a coluna id for text, vamos alterar para integer de forma segura
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'topics' 
        AND column_name = 'id' 
        AND data_type = 'text'
    ) THEN
        -- Criar sequência para novos IDs
        CREATE SEQUENCE IF NOT EXISTS topics_id_seq;
        
        -- Adicionar coluna id_new
        ALTER TABLE topics ADD COLUMN id_new SERIAL;
        
        -- Atualizar foreign keys para usar id_new temporariamente
        ALTER TABLE flashcards ADD COLUMN topic_id_new INTEGER;
        ALTER TABLE quizzes ADD COLUMN topic_id_new INTEGER;
        ALTER TABLE user_topic_progress ADD COLUMN topic_id_new INTEGER;
        ALTER TABLE wrong_cards ADD COLUMN topic_id_new INTEGER;
        
        -- Copiar dados para as novas colunas
        UPDATE flashcards SET topic_id_new = topics.id_new 
        FROM topics WHERE flashcards.topic_id = topics.id;
        
        UPDATE quizzes SET topic_id_new = topics.id_new 
        FROM topics WHERE quizzes.topic_id = topics.id;
        
        UPDATE user_topic_progress SET topic_id_new = topics.id_new 
        FROM topics WHERE user_topic_progress.topic_id = topics.id;
        
        UPDATE wrong_cards SET topic_id_new = topics.id_new 
        FROM topics WHERE wrong_cards.topic_id = topics.id;
        
        -- Remover colunas antigas e renomear novas
        ALTER TABLE flashcards DROP COLUMN topic_id;
        ALTER TABLE quizzes DROP COLUMN topic_id;
        ALTER TABLE user_topic_progress DROP COLUMN topic_id;
        ALTER TABLE wrong_cards DROP COLUMN topic_id;
        
        ALTER TABLE flashcards RENAME COLUMN topic_id_new TO topic_id;
        ALTER TABLE quizzes RENAME COLUMN topic_id_new TO topic_id;
        ALTER TABLE user_topic_progress RENAME COLUMN topic_id_new TO topic_id;
        ALTER TABLE wrong_cards RENAME COLUMN topic_id_new TO topic_id;
        
        -- Recriar foreign keys
        ALTER TABLE flashcards ADD CONSTRAINT flashcards_topic_id_fkey 
        FOREIGN KEY (topic_id) REFERENCES topics(id_new);
        
        ALTER TABLE quizzes ADD CONSTRAINT quizzes_topic_id_fkey 
        FOREIGN KEY (topic_id) REFERENCES topics(id_new);
        
        ALTER TABLE user_topic_progress ADD CONSTRAINT user_topic_progress_topic_id_fkey 
        FOREIGN KEY (topic_id) REFERENCES topics(id_new);
        
        ALTER TABLE wrong_cards ADD CONSTRAINT wrong_cards_topic_id_fkey 
        FOREIGN KEY (topic_id) REFERENCES topics(id_new);
        
        -- Remover coluna id antiga e renomear id_new
        ALTER TABLE topics DROP COLUMN id;
        ALTER TABLE topics RENAME COLUMN id_new TO id;
        ALTER TABLE topics ALTER COLUMN id SET NOT NULL;
        ALTER TABLE topics ADD PRIMARY KEY (id);
        
        RAISE NOTICE 'Coluna id da tabela topics alterada para INTEGER com sucesso';
    ELSE
        RAISE NOTICE 'Tabela topics já tem id INTEGER';
    END IF;
END $$;

-- 6. Habilitar RLS na tabela topics
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- 7. Criar política RLS para topics
DROP POLICY IF EXISTS "Anyone can view topics" ON topics;
CREATE POLICY "Anyone can view topics" ON topics
  FOR SELECT USING (true);

-- 8. Verificar se os dados estão corretos
SELECT 
    'Verificação dos dados' as info,
    COUNT(*) as total_topics,
    COUNT(*) FILTER (WHERE subject_id = 1) as portugues_topics,
    COUNT(*) FILTER (WHERE subject_id = 2) as regulamentos_topics
FROM topics;

-- 9. Mostrar alguns exemplos
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

-- 10. Verificar se as foreign keys estão funcionando
SELECT 
    'Verificação de foreign keys' as info,
    COUNT(*) as total_flashcards,
    COUNT(*) FILTER (WHERE topic_id IS NOT NULL) as flashcards_com_topic
FROM flashcards; 