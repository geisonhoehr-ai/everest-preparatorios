-- Script para corrigir especificamente a tabela topics
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- CORREÇÃO DA TABELA TOPICS
-- ========================================

-- 1. Verificar se a coluna subject_id existe
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

-- 2. Verificar se a coluna id é do tipo correto
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'topics' 
        AND column_name = 'id' 
        AND data_type = 'text'
    ) THEN
        -- Criar nova tabela com estrutura correta
        CREATE TABLE IF NOT EXISTS topics_new (
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
        
        -- Dropar tabela antiga e renomear nova
        DROP TABLE topics;
        ALTER TABLE topics_new RENAME TO topics;
        
        RAISE NOTICE 'Tabela topics recriada com estrutura correta';
    ELSE
        RAISE NOTICE 'Tabela topics já tem estrutura correta';
    END IF;
END $$;

-- 3. Habilitar RLS na tabela topics
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- 4. Criar política RLS para topics
DROP POLICY IF EXISTS "Anyone can view topics" ON topics;
CREATE POLICY "Anyone can view topics" ON topics
  FOR SELECT USING (true);

-- 5. Verificar se os dados estão corretos
SELECT 
    'Verificação dos dados' as info,
    COUNT(*) as total_topics,
    COUNT(*) FILTER (WHERE subject_id = 1) as portugues_topics,
    COUNT(*) FILTER (WHERE subject_id = 2) as regulamentos_topics
FROM topics;

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
FROM topics 
ORDER BY subject_id, name 
LIMIT 10; 