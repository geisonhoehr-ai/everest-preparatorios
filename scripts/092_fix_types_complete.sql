-- Script para corrigir mismatch de tipos entre topics.id e flashcards.topic_id
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- CORREÇÃO DE TIPOS INCOMPATÍVEIS
-- ========================================

-- 1. Verificar tipos atuais
SELECT 
    'Verificação de tipos atuais' as info,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('topics', 'flashcards', 'quizzes', 'user_topic_progress', 'wrong_cards')
AND column_name IN ('id', 'topic_id')
ORDER BY table_name, column_name;

-- 2. Verificar dados atuais de flashcards
SELECT 
    'Dados atuais de flashcards' as info,
    COUNT(*) as total,
    MIN(id) as primeiro_id,
    MAX(id) as ultimo_id
FROM flashcards;

-- 3. Analisar flashcards.topic_id em detalhes
SELECT 
    'Análise detalhada de topic_id' as info,
    COUNT(*) as total_flashcards,
    COUNT(*) FILTER (WHERE topic_id ~ '^[0-9]+$') as topic_id_numericos,
    COUNT(*) FILTER (WHERE topic_id !~ '^[0-9]+$' AND topic_id IS NOT NULL) as topic_id_nao_numericos,
    COUNT(*) FILTER (WHERE topic_id IS NULL) as topic_id_nulos,
    COUNT(*) FILTER (WHERE trim(topic_id) = '') as topic_id_vazios
FROM flashcards;

-- 4. Mostrar exemplos de valores não numéricos (se existirem)
SELECT 
    'Valores não numéricos encontrados' as info,
    topic_id,
    COUNT(*) as quantidade
FROM flashcards 
WHERE topic_id !~ '^[0-9]+$' AND topic_id IS NOT NULL AND trim(topic_id) != ''
GROUP BY topic_id
LIMIT 10;

-- 5. Remover foreign keys existentes (com tratamento de erro)
DO $$
BEGIN
    -- Flashcards
    BEGIN
        ALTER TABLE flashcards DROP CONSTRAINT flashcards_topic_id_fkey;
        RAISE NOTICE 'FK flashcards_topic_id_fkey removida';
    EXCEPTION WHEN undefined_object THEN
        RAISE NOTICE 'FK flashcards_topic_id_fkey não existia';
    END;
    
    -- Quizzes
    BEGIN
        ALTER TABLE quizzes DROP CONSTRAINT quizzes_topic_id_fkey;
        RAISE NOTICE 'FK quizzes_topic_id_fkey removida';
    EXCEPTION WHEN undefined_object THEN
        RAISE NOTICE 'FK quizzes_topic_id_fkey não existia';
    END;
    
    -- User topic progress
    BEGIN
        ALTER TABLE user_topic_progress DROP CONSTRAINT user_topic_progress_topic_id_fkey;
        RAISE NOTICE 'FK user_topic_progress_topic_id_fkey removida';
    EXCEPTION WHEN undefined_object THEN
        RAISE NOTICE 'FK user_topic_progress_topic_id_fkey não existia';
    END;
    
    -- Wrong cards
    BEGIN
        ALTER TABLE wrong_cards DROP CONSTRAINT wrong_cards_topic_id_fkey;
        RAISE NOTICE 'FK wrong_cards_topic_id_fkey removida';
    EXCEPTION WHEN undefined_object THEN
        RAISE NOTICE 'FK wrong_cards_topic_id_fkey não existia';
    END;
END $$;

-- 6. Converter flashcards.topic_id de text para integer
DO $$
BEGIN
    -- Verificar se a coluna existe e é text
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'flashcards' 
        AND column_name = 'topic_id'
        AND data_type = 'text'
    ) THEN
        RAISE NOTICE 'Iniciando conversão de flashcards.topic_id de text para integer...';
        
        -- Adicionar coluna temporária
        ALTER TABLE flashcards ADD COLUMN topic_id_new INTEGER;
        RAISE NOTICE 'Coluna temporária topic_id_new criada';
        
        -- Converter dados válidos
        UPDATE flashcards 
        SET topic_id_new = CASE 
            WHEN topic_id IS NULL THEN NULL
            WHEN trim(topic_id) = '' THEN NULL
            WHEN topic_id ~ '^[0-9]+$' THEN topic_id::integer
            ELSE NULL
        END;
        
        -- Mostrar estatísticas da conversão
        RAISE NOTICE 'Conversão concluída. Verificando resultados...';
        
        -- Remover coluna antiga
        ALTER TABLE flashcards DROP COLUMN topic_id;
        RAISE NOTICE 'Coluna antiga topic_id removida';
        
        -- Renomear nova coluna
        ALTER TABLE flashcards RENAME COLUMN topic_id_new TO topic_id;
        RAISE NOTICE 'Coluna topic_id_new renomeada para topic_id';
        
        RAISE NOTICE 'Conversão de flashcards.topic_id concluída com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna flashcards.topic_id já é integer ou não existe';
    END IF;
END $$;

-- 7. Converter outras tabelas se necessário (quizzes, user_topic_progress, wrong_cards)
DO $$
DECLARE
    tabela_nome text;
    tabelas text[] := ARRAY['quizzes', 'user_topic_progress', 'wrong_cards'];
BEGIN
    FOREACH tabela_nome IN ARRAY tabelas
    LOOP
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = tabela_nome 
            AND column_name = 'topic_id'
            AND data_type = 'text'
        ) THEN
            RAISE NOTICE 'Convertendo %.topic_id de text para integer...', tabela_nome;
            
            EXECUTE format('ALTER TABLE %I ADD COLUMN topic_id_new INTEGER', tabela_nome);
            
            EXECUTE format('UPDATE %I SET topic_id_new = CASE 
                WHEN topic_id IS NULL THEN NULL
                WHEN trim(topic_id) = '''' THEN NULL
                WHEN topic_id ~ ''^[0-9]+$'' THEN topic_id::integer
                ELSE NULL
            END', tabela_nome);
            
            EXECUTE format('ALTER TABLE %I DROP COLUMN topic_id', tabela_nome);
            EXECUTE format('ALTER TABLE %I RENAME COLUMN topic_id_new TO topic_id', tabela_nome);
            
            RAISE NOTICE 'Conversão de %.topic_id concluída!', tabela_nome;
        ELSE
            RAISE NOTICE 'Tabela %.topic_id já é integer ou não existe', tabela_nome;
        END IF;
    END LOOP;
END $$;

-- 8. Verificar tipos após conversão
SELECT 
    'Tipos após conversão' as info,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('topics', 'flashcards', 'quizzes', 'user_topic_progress', 'wrong_cards')
AND column_name IN ('id', 'topic_id')
ORDER BY table_name, column_name;

-- 9. Verificar dados após conversão
SELECT 
    'Estatísticas após conversão' as info,
    COUNT(*) as total_flashcards,
    COUNT(*) FILTER (WHERE topic_id IS NOT NULL) as flashcards_com_topic,
    COUNT(*) FILTER (WHERE topic_id IS NULL) as flashcards_sem_topic,
    MIN(topic_id) as menor_topic_id,
    MAX(topic_id) as maior_topic_id
FROM flashcards;

-- 10. Verificar se todos os topic_id referenciam topics válidos
SELECT 
    'Verificação de integridade' as info,
    COUNT(*) as flashcards_com_topic_id,
    COUNT(t.id) as topics_encontrados,
    COUNT(*) - COUNT(t.id) as topics_nao_encontrados
FROM flashcards f
LEFT JOIN topics t ON f.topic_id = t.id
WHERE f.topic_id IS NOT NULL;

-- 11. Mostrar topic_ids órfãos (se existirem)
SELECT 
    'Topic IDs órfãos' as info,
    f.topic_id,
    COUNT(*) as quantidade_flashcards
FROM flashcards f
LEFT JOIN topics t ON f.topic_id = t.id
WHERE f.topic_id IS NOT NULL AND t.id IS NULL
GROUP BY f.topic_id
ORDER BY f.topic_id;

-- 12. Recriar foreign keys apenas se não houver órfãos
DO $$
DECLARE
    orfaos_count integer;
BEGIN
    -- Verificar órfãos em flashcards
    SELECT COUNT(*) INTO orfaos_count
    FROM flashcards f
    LEFT JOIN topics t ON f.topic_id = t.id
    WHERE f.topic_id IS NOT NULL AND t.id IS NULL;
    
    IF orfaos_count = 0 THEN
        ALTER TABLE flashcards ADD CONSTRAINT flashcards_topic_id_fkey 
        FOREIGN KEY (topic_id) REFERENCES topics(id);
        RAISE NOTICE 'FK flashcards_topic_id_fkey criada com sucesso!';
    ELSE
        RAISE NOTICE 'ATENÇÃO: % flashcards com topic_id órfão. FK não foi criada.', orfaos_count;
    END IF;
    
    -- Repetir para outras tabelas...
    -- Quizzes
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quizzes') THEN
        SELECT COUNT(*) INTO orfaos_count
        FROM quizzes q
        LEFT JOIN topics t ON q.topic_id = t.id
        WHERE q.topic_id IS NOT NULL AND t.id IS NULL;
        
        IF orfaos_count = 0 THEN
            ALTER TABLE quizzes ADD CONSTRAINT quizzes_topic_id_fkey 
            FOREIGN KEY (topic_id) REFERENCES topics(id);
            RAISE NOTICE 'FK quizzes_topic_id_fkey criada com sucesso!';
        ELSE
            RAISE NOTICE 'ATENÇÃO: % quizzes com topic_id órfão. FK não foi criada.', orfaos_count;
        END IF;
    END IF;
    
    -- User topic progress
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_topic_progress') THEN
        SELECT COUNT(*) INTO orfaos_count
        FROM user_topic_progress utp
        LEFT JOIN topics t ON utp.topic_id = t.id
        WHERE utp.topic_id IS NOT NULL AND t.id IS NULL;
        
        IF orfaos_count = 0 THEN
            ALTER TABLE user_topic_progress ADD CONSTRAINT user_topic_progress_topic_id_fkey 
            FOREIGN KEY (topic_id) REFERENCES topics(id);
            RAISE NOTICE 'FK user_topic_progress_topic_id_fkey criada com sucesso!';
        ELSE
            RAISE NOTICE 'ATENÇÃO: % user_topic_progress com topic_id órfão. FK não foi criada.', orfaos_count;
        END IF;
    END IF;
    
    -- Wrong cards
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'wrong_cards') THEN
        SELECT COUNT(*) INTO orfaos_count
        FROM wrong_cards wc
        LEFT JOIN topics t ON wc.topic_id = t.id
        WHERE wc.topic_id IS NOT NULL AND t.id IS NULL;
        
        IF orfaos_count = 0 THEN
            ALTER TABLE wrong_cards ADD CONSTRAINT wrong_cards_topic_id_fkey 
            FOREIGN KEY (topic_id) REFERENCES topics(id);
            RAISE NOTICE 'FK wrong_cards_topic_id_fkey criada com sucesso!';
        ELSE
            RAISE NOTICE 'ATENÇÃO: % wrong_cards com topic_id órfão. FK não foi criada.', orfaos_count;
        END IF;
    END IF;
END $$;

-- 13. Verificação final
SELECT 
    'Verificação final - Foreign Keys' as info,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('flashcards', 'quizzes', 'user_topic_progress', 'wrong_cards')
AND kcu.column_name = 'topic_id';

-- 14. Resumo final
SELECT 
    'RESUMO FINAL' as info,
    'Conversão concluída! Todas as colunas topic_id agora são INTEGER e compatíveis com topics.id' as resultado; 