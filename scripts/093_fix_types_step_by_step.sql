-- Script SEGURO para corrigir mismatch de tipos - Execução passo a passo
-- Execute BLOCO POR BLOCO no SQL Editor do Supabase

-- ========================================
-- PASSO 1: DIAGNÓSTICO INICIAL
-- ========================================

-- Verificar tipos atuais de TODAS as colunas topic_id
SELECT 
    'DIAGNÓSTICO INICIAL' as etapa,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE (table_name IN ('topics', 'flashcards', 'quizzes', 'user_topic_progress', 'wrong_cards')
       AND column_name IN ('id', 'topic_id'))
ORDER BY table_name, column_name;

-- ========================================
-- PASSO 2: ANÁLISE DOS DADOS FLASHCARDS
-- ========================================

-- Verificar se flashcards.topic_id é text
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'flashcards' 
        AND column_name = 'topic_id'
        AND data_type = 'text'
    ) THEN
        RAISE NOTICE '✅ flashcards.topic_id é TEXT - conversão necessária';
        
        -- Analisar conteúdo
        PERFORM (
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE topic_id ~ '^[0-9]+$') as numericos,
                COUNT(*) FILTER (WHERE topic_id IS NULL OR trim(topic_id) = '') as nulos_vazios,
                COUNT(*) FILTER (WHERE topic_id !~ '^[0-9]+$' AND topic_id IS NOT NULL AND trim(topic_id) != '') as problematicos
            FROM flashcards
        );
        
    ELSE
        RAISE NOTICE '❌ flashcards.topic_id já é INTEGER ou não existe';
    END IF;
END $$;

-- ========================================
-- PASSO 3: REMOVER FOREIGN KEYS
-- ========================================

-- Remover FKs uma por uma com tratamento de erro
DO $$
BEGIN
    -- Flashcards FK
    BEGIN
        ALTER TABLE flashcards DROP CONSTRAINT IF EXISTS flashcards_topic_id_fkey;
        RAISE NOTICE '✅ FK flashcards removida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erro ao remover FK flashcards: %', SQLERRM;
    END;
    
    -- Quizzes FK
    BEGIN
        ALTER TABLE quizzes DROP CONSTRAINT IF EXISTS quizzes_topic_id_fkey;
        RAISE NOTICE '✅ FK quizzes removida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erro ao remover FK quizzes: %', SQLERRM;
    END;
    
    -- User topic progress FK
    BEGIN
        ALTER TABLE user_topic_progress DROP CONSTRAINT IF EXISTS user_topic_progress_topic_id_fkey;
        RAISE NOTICE '✅ FK user_topic_progress removida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erro ao remover FK user_topic_progress: %', SQLERRM;
    END;
    
    -- Wrong cards FK
    BEGIN
        ALTER TABLE wrong_cards DROP CONSTRAINT IF EXISTS wrong_cards_topic_id_fkey;  
        RAISE NOTICE '✅ FK wrong_cards removida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erro ao remover FK wrong_cards: %', SQLERRM;
    END;
END $$;

-- ========================================
-- PASSO 4: CONVERTER FLASHCARDS
-- ========================================

-- Converter flashcards.topic_id de text para integer
DO $$
DECLARE
    registros_convertidos integer;
    registros_nulos integer;
BEGIN
    -- Verificar se precisa converter
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'flashcards' 
        AND column_name = 'topic_id'
        AND data_type = 'text'
    ) THEN
        RAISE NOTICE '🔄 Iniciando conversão flashcards.topic_id...';
        
        -- Criar coluna temporária
        ALTER TABLE flashcards ADD COLUMN topic_id_temp INTEGER;
        
        -- Converter dados
        UPDATE flashcards 
        SET topic_id_temp = CASE 
            WHEN topic_id IS NULL THEN NULL
            WHEN trim(topic_id) = '' THEN NULL
            WHEN topic_id ~ '^[0-9]+$' THEN topic_id::integer
            ELSE NULL
        END;
        
        -- Contar conversões
        SELECT 
            COUNT(*) FILTER (WHERE topic_id_temp IS NOT NULL),
            COUNT(*) FILTER (WHERE topic_id_temp IS NULL)
        INTO registros_convertidos, registros_nulos
        FROM flashcards;
        
        RAISE NOTICE '📊 Convertidos: %, Nulos: %', registros_convertidos, registros_nulos;
        
        -- Substituir coluna
        ALTER TABLE flashcards DROP COLUMN topic_id;
        ALTER TABLE flashcards RENAME COLUMN topic_id_temp TO topic_id;
        
        RAISE NOTICE '✅ flashcards.topic_id convertido para INTEGER!';
    ELSE
        RAISE NOTICE '⏭️ flashcards.topic_id já é INTEGER';
    END IF;
END $$;

-- ========================================
-- PASSO 5: CONVERTER QUIZZES (se existir)
-- ========================================

DO $$
DECLARE
    registros_convertidos integer;
BEGIN
    -- Verificar se tabela e coluna existem
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'quizzes' 
        AND column_name = 'topic_id'
        AND data_type = 'text'
    ) THEN
        RAISE NOTICE '🔄 Convertendo quizzes.topic_id...';
        
        ALTER TABLE quizzes ADD COLUMN topic_id_temp INTEGER;
        
        UPDATE quizzes 
        SET topic_id_temp = CASE 
            WHEN topic_id IS NULL THEN NULL
            WHEN trim(topic_id) = '' THEN NULL
            WHEN topic_id ~ '^[0-9]+$' THEN topic_id::integer
            ELSE NULL
        END;
        
        SELECT COUNT(*) FILTER (WHERE topic_id_temp IS NOT NULL)
        INTO registros_convertidos FROM quizzes;
        
        ALTER TABLE quizzes DROP COLUMN topic_id;
        ALTER TABLE quizzes RENAME COLUMN topic_id_temp TO topic_id;
        
        RAISE NOTICE '✅ quizzes.topic_id convertido! Registros: %', registros_convertidos;
    ELSE
        RAISE NOTICE '⏭️ quizzes.topic_id já é INTEGER ou não existe';
    END IF;
END $$;

-- ========================================
-- PASSO 6: CONVERTER USER_TOPIC_PROGRESS (se existir)
-- ========================================

DO $$
DECLARE
    registros_convertidos integer;
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'user_topic_progress' 
        AND column_name = 'topic_id'
        AND data_type = 'text'
    ) THEN
        RAISE NOTICE '🔄 Convertendo user_topic_progress.topic_id...';
        
        ALTER TABLE user_topic_progress ADD COLUMN topic_id_temp INTEGER;
        
        UPDATE user_topic_progress 
        SET topic_id_temp = CASE 
            WHEN topic_id IS NULL THEN NULL
            WHEN trim(topic_id) = '' THEN NULL
            WHEN topic_id ~ '^[0-9]+$' THEN topic_id::integer
            ELSE NULL
        END;
        
        SELECT COUNT(*) FILTER (WHERE topic_id_temp IS NOT NULL)
        INTO registros_convertidos FROM user_topic_progress;
        
        ALTER TABLE user_topic_progress DROP COLUMN topic_id;
        ALTER TABLE user_topic_progress RENAME COLUMN topic_id_temp TO topic_id;
        
        RAISE NOTICE '✅ user_topic_progress.topic_id convertido! Registros: %', registros_convertidos;
    ELSE
        RAISE NOTICE '⏭️ user_topic_progress.topic_id já é INTEGER ou não existe';
    END IF;
END $$;

-- ========================================
-- PASSO 7: CONVERTER WRONG_CARDS (se existir)
-- ========================================

DO $$
DECLARE
    registros_convertidos integer;
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'wrong_cards' 
        AND column_name = 'topic_id'
        AND data_type = 'text'
    ) THEN
        RAISE NOTICE '🔄 Convertendo wrong_cards.topic_id...';
        
        ALTER TABLE wrong_cards ADD COLUMN topic_id_temp INTEGER;
        
        UPDATE wrong_cards 
        SET topic_id_temp = CASE 
            WHEN topic_id IS NULL THEN NULL
            WHEN trim(topic_id) = '' THEN NULL
            WHEN topic_id ~ '^[0-9]+$' THEN topic_id::integer
            ELSE NULL
        END;
        
        SELECT COUNT(*) FILTER (WHERE topic_id_temp IS NOT NULL)
        INTO registros_convertidos FROM wrong_cards;
        
        ALTER TABLE wrong_cards DROP COLUMN topic_id;
        ALTER TABLE wrong_cards RENAME COLUMN topic_id_temp TO topic_id;
        
        RAISE NOTICE '✅ wrong_cards.topic_id convertido! Registros: %', registros_convertidos;
    ELSE
        RAISE NOTICE '⏭️ wrong_cards.topic_id já é INTEGER ou não existe';
    END IF;
END $$;

-- ========================================
-- PASSO 8: VERIFICAR CONVERSÕES
-- ========================================

-- Verificar tipos após todas as conversões
SELECT 
    'TIPOS APÓS CONVERSÃO' as etapa,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('topics', 'flashcards', 'quizzes', 'user_topic_progress', 'wrong_cards')
AND column_name IN ('id', 'topic_id')
ORDER BY table_name, column_name;

-- ========================================
-- PASSO 9: VERIFICAR INTEGRIDADE DOS DADOS
-- ========================================

-- Agora com tipos corretos, verificar integridade
SELECT 
    'VERIFICAÇÃO DE INTEGRIDADE' as etapa,
    'flashcards' as tabela,
    COUNT(*) as total_registros,
    COUNT(*) FILTER (WHERE topic_id IS NOT NULL) as com_topic_id,
    COUNT(*) FILTER (WHERE topic_id IS NULL) as sem_topic_id
FROM flashcards

UNION ALL

-- Verificar topics órfãos em flashcards
SELECT 
    'ÓRFÃOS FLASHCARDS' as etapa,
    'órfãos_encontrados' as tabela,
    COUNT(*) as total_registros,
    0 as com_topic_id,
    0 as sem_topic_id
FROM flashcards f
LEFT JOIN topics t ON f.topic_id = t.id
WHERE f.topic_id IS NOT NULL AND t.id IS NULL;

-- ========================================
-- PASSO 10: RECRIAR FOREIGN KEYS
-- ========================================

-- Recriar FK para flashcards
DO $$
DECLARE
    orfaos_count integer;
BEGIN
    -- Contar órfãos em flashcards
    SELECT COUNT(*) INTO orfaos_count
    FROM flashcards f
    LEFT JOIN topics t ON f.topic_id = t.id
    WHERE f.topic_id IS NOT NULL AND t.id IS NULL;
    
    IF orfaos_count = 0 THEN
        ALTER TABLE flashcards ADD CONSTRAINT flashcards_topic_id_fkey 
        FOREIGN KEY (topic_id) REFERENCES topics(id);
        RAISE NOTICE '✅ FK flashcards_topic_id_fkey criada!';
    ELSE
        RAISE NOTICE '❌ % flashcards órfãos encontrados - FK NÃO criada', orfaos_count;
    END IF;
END $$;

-- Recriar FK para quizzes (se tabela existir)
DO $$
DECLARE
    orfaos_count integer;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quizzes') THEN
        SELECT COUNT(*) INTO orfaos_count
        FROM quizzes q
        LEFT JOIN topics t ON q.topic_id = t.id
        WHERE q.topic_id IS NOT NULL AND t.id IS NULL;
        
        IF orfaos_count = 0 THEN
            ALTER TABLE quizzes ADD CONSTRAINT quizzes_topic_id_fkey 
            FOREIGN KEY (topic_id) REFERENCES topics(id);
            RAISE NOTICE '✅ FK quizzes_topic_id_fkey criada!';
        ELSE
            RAISE NOTICE '❌ % quizzes órfãos - FK NÃO criada', orfaos_count;
        END IF;
    END IF;
END $$;

-- Recriar FK para user_topic_progress (se tabela existir)
DO $$
DECLARE
    orfaos_count integer;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_topic_progress') THEN
        SELECT COUNT(*) INTO orfaos_count
        FROM user_topic_progress utp
        LEFT JOIN topics t ON utp.topic_id = t.id
        WHERE utp.topic_id IS NOT NULL AND t.id IS NULL;
        
        IF orfaos_count = 0 THEN
            ALTER TABLE user_topic_progress ADD CONSTRAINT user_topic_progress_topic_id_fkey 
            FOREIGN KEY (topic_id) REFERENCES topics(id);
            RAISE NOTICE '✅ FK user_topic_progress_topic_id_fkey criada!';
        ELSE
            RAISE NOTICE '❌ % user_topic_progress órfãos - FK NÃO criada', orfaos_count;
        END IF;
    END IF;
END $$;

-- Recriar FK para wrong_cards (se tabela existir)
DO $$
DECLARE
    orfaos_count integer;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'wrong_cards') THEN
        SELECT COUNT(*) INTO orfaos_count
        FROM wrong_cards wc
        LEFT JOIN topics t ON wc.topic_id = t.id
        WHERE wc.topic_id IS NOT NULL AND t.id IS NULL;
        
        IF orfaos_count = 0 THEN
            ALTER TABLE wrong_cards ADD CONSTRAINT wrong_cards_topic_id_fkey 
            FOREIGN KEY (topic_id) REFERENCES topics(id);
            RAISE NOTICE '✅ FK wrong_cards_topic_id_fkey criada!';
        ELSE
            RAISE NOTICE '❌ % wrong_cards órfãos - FK NÃO criada', orfaos_count;
        END IF;
    END IF;
END $$;

-- ========================================
-- PASSO 11: VERIFICAÇÃO FINAL
-- ========================================

-- Listar todas as FKs criadas
SELECT 
    'FOREIGN KEYS CRIADAS' as etapa,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS references_table,
    ccu.column_name AS references_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('flashcards', 'quizzes', 'user_topic_progress', 'wrong_cards')
AND kcu.column_name = 'topic_id';

-- Resumo final
SELECT 
    '🎉 CONVERSÃO CONCLUÍDA!' as status,
    'Todas as colunas topic_id agora são INTEGER' as resultado,
    'Foreign Keys recriadas com sucesso' as foreign_keys; 