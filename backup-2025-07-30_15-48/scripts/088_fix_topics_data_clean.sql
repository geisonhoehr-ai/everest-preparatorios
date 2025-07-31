-- Script para limpar e corrigir dados da tabela topics
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- LIMPEZA E CORREÇÃO DE DADOS
-- ========================================

-- 1. Verificar dados atuais da tabela topics
SELECT 
    'Dados atuais da tabela topics' as info,
    id,
    name,
    subject_id
FROM topics 
ORDER BY id 
LIMIT 10;

-- 2. Verificar se há IDs não numéricos
SELECT 
    'IDs não numéricos encontrados' as info,
    id,
    name
FROM topics 
WHERE id !~ '^[0-9]+$'
ORDER BY id;

-- 3. Criar nova tabela topics com estrutura correta
CREATE TABLE topics_new (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    subject_id INTEGER REFERENCES subjects(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Inserir dados limpos na nova tabela
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

-- 5. Verificar dados inseridos
SELECT 
    'Dados inseridos na nova tabela' as info,
    COUNT(*) as total_topics,
    COUNT(*) FILTER (WHERE subject_id = 1) as portugues_topics,
    COUNT(*) FILTER (WHERE subject_id = 2) as regulamentos_topics
FROM topics_new;

-- 6. Mostrar alguns exemplos
SELECT 
    id,
    name,
    subject_id,
    CASE subject_id 
        WHEN 1 THEN 'Português'
        WHEN 2 THEN 'Regulamentos'
        ELSE 'Desconhecido'
    END as materia
FROM topics_new 
ORDER BY subject_id, name 
LIMIT 10;

-- 7. Remover foreign keys existentes
ALTER TABLE flashcards DROP CONSTRAINT IF EXISTS flashcards_topic_id_fkey;
ALTER TABLE quizzes DROP CONSTRAINT IF EXISTS quizzes_topic_id_fkey;
ALTER TABLE user_topic_progress DROP CONSTRAINT IF EXISTS user_topic_progress_topic_id_fkey;
ALTER TABLE wrong_cards DROP CONSTRAINT IF EXISTS wrong_cards_topic_id_fkey;

-- 8. Dropar tabela antiga e renomear nova
DROP TABLE topics;
ALTER TABLE topics_new RENAME TO topics;

-- 9. Recriar foreign keys com a nova tabela
ALTER TABLE flashcards ADD CONSTRAINT flashcards_topic_id_fkey 
FOREIGN KEY (topic_id) REFERENCES topics(id);

ALTER TABLE quizzes ADD CONSTRAINT quizzes_topic_id_fkey 
FOREIGN KEY (topic_id) REFERENCES topics(id);

ALTER TABLE user_topic_progress ADD CONSTRAINT user_topic_progress_topic_id_fkey 
FOREIGN KEY (topic_id) REFERENCES topics(id);

ALTER TABLE wrong_cards ADD CONSTRAINT wrong_cards_topic_id_fkey 
FOREIGN KEY (topic_id) REFERENCES topics(id);

-- 10. Habilitar RLS na tabela topics
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- 11. Criar política RLS para topics
DROP POLICY IF EXISTS "Anyone can view topics" ON topics;
CREATE POLICY "Anyone can view topics" ON topics
  FOR SELECT USING (true);

-- 12. Verificar estrutura final
SELECT 
    'Estrutura final da tabela topics' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'topics' 
ORDER BY ordinal_position;

-- 13. Verificar tipos de todas as tabelas relacionadas
SELECT 
    'Verificação final de tipos' as info,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('topics', 'flashcards', 'quizzes', 'user_topic_progress', 'wrong_cards')
AND column_name IN ('id', 'topic_id')
ORDER BY table_name, column_name;

-- 14. Verificar se foreign keys estão funcionando
SELECT 
    'Verificação de foreign keys' as info,
    COUNT(*) as total_flashcards,
    COUNT(*) FILTER (WHERE topic_id IS NOT NULL) as flashcards_com_topic
FROM flashcards;

-- 15. Verificar dados finais
SELECT 
    'Dados finais da tabela topics' as info,
    COUNT(*) as total_topics,
    COUNT(*) FILTER (WHERE subject_id = 1) as portugues_topics,
    COUNT(*) FILTER (WHERE subject_id = 2) as regulamentos_topics
FROM topics; 