-- =====================================================
-- SCRIPT DE VERIFICAÇÃO: ESTADO DA TABELA member_classes
-- EVEREST PREPARATÓRIOS - DIAGNÓSTICO
-- =====================================================

-- Este script verifica o estado atual da tabela member_classes
-- e fornece informações detalhadas para ajudar na decisão de migração

-- =====================================================
-- VERIFICAÇÃO BÁSICA
-- =====================================================

-- Verificar se a tabela existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'member_classes') 
        THEN '✅ EXISTE' 
        ELSE '❌ NÃO EXISTE' 
    END as status_tabela,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'member_classes') 
        THEN (SELECT COUNT(*) FROM member_classes)::text
        ELSE '0'
    END as total_registros;

-- =====================================================
-- ANÁLISE DETALHADA DA ESTRUTURA
-- =====================================================

-- Verificar estrutura da tabela (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'member_classes') THEN
        RAISE NOTICE '📋 ESTRUTURA DA TABELA member_classes:';
        RAISE NOTICE '================================';
    END IF;
END $$;

-- Mostrar colunas da tabela
SELECT 
    column_name as coluna,
    data_type as tipo,
    is_nullable as permite_null,
    column_default as valor_padrao,
    character_maximum_length as tamanho_max
FROM information_schema.columns 
WHERE table_name = 'member_classes'
ORDER BY ordinal_position;

-- =====================================================
-- ANÁLISE DE DADOS
-- =====================================================

-- Verificar dados existentes (se houver)
DO $$
DECLARE
    record_count INTEGER;
    sample_data RECORD;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'member_classes') THEN
        EXECUTE 'SELECT COUNT(*) FROM member_classes' INTO record_count;
        
        IF record_count > 0 THEN
            RAISE NOTICE '📊 ANÁLISE DE DADOS:';
            RAISE NOTICE '===================';
            RAISE NOTICE 'Total de registros: %', record_count;
            
            -- Mostrar amostra dos dados
            RAISE NOTICE 'Amostra dos dados:';
            FOR sample_data IN 
                EXECUTE 'SELECT * FROM member_classes LIMIT 5'
            LOOP
                RAISE NOTICE 'ID: %, Dados: %', sample_data.id, sample_data;
            END LOOP;
        ELSE
            RAISE NOTICE '📊 Tabela vazia - nenhum dado para analisar.';
        END IF;
    END IF;
END $$;

-- =====================================================
-- VERIFICAÇÃO DE REFERÊNCIAS
-- =====================================================

-- Verificar se há outras tabelas que referenciam member_classes
SELECT 
    'Tabelas que referenciam member_classes:' as info,
    tc.table_name as tabela_referenciadora,
    kcu.column_name as coluna_referenciadora,
    ccu.table_name as tabela_referenciada,
    ccu.column_name as coluna_referenciada
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name = 'member_classes';

-- =====================================================
-- VERIFICAÇÃO DE ÍNDICES
-- =====================================================

-- Verificar índices existentes
SELECT 
    'Índices da tabela member_classes:' as info,
    indexname as nome_indice,
    indexdef as definicao
FROM pg_indexes 
WHERE tablename = 'member_classes';

-- =====================================================
-- VERIFICAÇÃO DE RLS
-- =====================================================

-- Verificar se RLS está habilitado
SELECT 
    'RLS Status:' as info,
    CASE 
        WHEN relrowsecurity THEN '✅ HABILITADO'
        ELSE '❌ DESABILITADO'
    END as status_rls
FROM pg_class 
WHERE relname = 'member_classes';

-- Verificar políticas RLS
SELECT 
    'Políticas RLS:' as info,
    policyname as nome_politica,
    permissive as tipo,
    roles as roles,
    cmd as comando,
    qual as condicao
FROM pg_policies 
WHERE tablename = 'member_classes';

-- =====================================================
-- VERIFICAÇÃO DE TRIGGERS
-- =====================================================

-- Verificar triggers existentes
SELECT 
    'Triggers da tabela member_classes:' as info,
    trigger_name as nome_trigger,
    event_manipulation as evento,
    action_timing as timing,
    action_statement as acao
FROM information_schema.triggers 
WHERE event_object_table = 'member_classes';

-- =====================================================
-- VERIFICAÇÃO DE PERMISSÕES
-- =====================================================

-- Verificar permissões na tabela
SELECT 
    'Permissões na tabela member_classes:' as info,
    grantee as usuario,
    privilege_type as privilegio,
    is_grantable as pode_conceder
FROM information_schema.table_privileges 
WHERE table_name = 'member_classes';

-- =====================================================
-- RECOMENDAÇÕES
-- =====================================================

-- Gerar recomendações baseadas no estado atual
DO $$
DECLARE
    table_exists BOOLEAN;
    record_count INTEGER;
    id_column_type TEXT;
    has_rls BOOLEAN;
    has_policies BOOLEAN;
    has_backup BOOLEAN;
BEGIN
    RAISE NOTICE '🎯 RECOMENDAÇÕES:';
    RAISE NOTICE '=================';
    
    -- Verificar existência
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'member_classes'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE NOTICE '📝 RECOMENDAÇÃO: Criar nova tabela com UUID';
        RAISE NOTICE '   - Use o script MIGRACAO-MEMBER-CLASSES-ESPECIFICA.sql';
        RAISE NOTICE '   - Ou use a OPÇÃO 2 do script LIMPAR-MEMBER-CLASSES-SIMPLES.sql';
        RETURN;
    END IF;
    
    -- Verificar registros
    EXECUTE 'SELECT COUNT(*) FROM member_classes' INTO record_count;
    
    -- Verificar tipo da coluna id
    SELECT data_type INTO id_column_type
    FROM information_schema.columns 
    WHERE table_name = 'member_classes' AND column_name = 'id';
    
    -- Verificar RLS
    SELECT relrowsecurity INTO has_rls
    FROM pg_class 
    WHERE relname = 'member_classes';
    
    -- Verificar políticas
    SELECT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'member_classes'
    ) INTO has_policies;
    
    -- Verificar backup
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'member_classes_backup'
    ) INTO has_backup;
    
    -- Gerar recomendações
    IF id_column_type = 'uuid' THEN
        RAISE NOTICE '✅ Tabela já usa UUID - nenhuma migração necessária';
    ELSE
        RAISE NOTICE '🔄 RECOMENDAÇÃO: Migrar para UUID';
        IF record_count = 0 THEN
            RAISE NOTICE '   - Tabela vazia: Use OPÇÃO 2 do script LIMPAR-MEMBER-CLASSES-SIMPLES.sql';
        ELSE
            RAISE NOTICE '   - Tabela com dados: Use MIGRACAO-MEMBER-CLASSES-ESPECIFICA.sql';
        END IF;
    END IF;
    
    IF NOT has_rls THEN
        RAISE NOTICE '🔒 RECOMENDAÇÃO: Habilitar RLS para segurança';
    END IF;
    
    IF NOT has_policies THEN
        RAISE NOTICE '🛡️ RECOMENDAÇÃO: Criar políticas RLS';
    END IF;
    
    IF has_backup THEN
        RAISE NOTICE '💾 Backup disponível: member_classes_backup';
        RAISE NOTICE '   - Pode remover após confirmar funcionamento';
    END IF;
    
    -- Recomendações específicas baseadas no estado
    IF record_count > 0 AND id_column_type != 'uuid' THEN
        RAISE NOTICE '⚠️ ATENÇÃO: Tabela tem % registros com ID INTEGER', record_count;
        RAISE NOTICE '   - Faça backup antes de migrar';
        RAISE NOTICE '   - Teste em ambiente de desenvolvimento primeiro';
    END IF;
    
END $$;

-- =====================================================
-- RESUMO FINAL
-- =====================================================

-- Resumo final do estado
SELECT 
    'RESUMO FINAL' as secao,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'member_classes') 
        THEN 'Tabela existe'
        ELSE 'Tabela não existe'
    END as status_tabela,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'member_classes') 
        THEN (SELECT data_type FROM information_schema.columns WHERE table_name = 'member_classes' AND column_name = 'id')
        ELSE 'N/A'
    END as tipo_id,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'member_classes') 
        THEN (SELECT COUNT(*) FROM member_classes)::text
        ELSE '0'
    END as total_registros,
    CASE 
        WHEN EXISTS (SELECT FROM pg_class WHERE relname = 'member_classes' AND relrowsecurity = true)
        THEN 'Habilitado'
        ELSE 'Desabilitado'
    END as rls_status;

-- =====================================================
-- PRÓXIMOS PASSOS
-- =====================================================

/*
🎯 PRÓXIMOS PASSOS BASEADOS NO ESTADO ATUAL:

1. 📋 SE A TABELA NÃO EXISTE:
   - Use MIGRACAO-MEMBER-CLASSES-ESPECIFICA.sql
   - Ou use OPÇÃO 2 do LIMPAR-MEMBER-CLASSES-SIMPLES.sql

2. 🔄 SE A TABELA EXISTE COM ID INTEGER:
   - Com dados: Use MIGRACAO-MEMBER-CLASSES-ESPECIFICA.sql
   - Sem dados: Use OPÇÃO 2 do LIMPAR-MEMBER-CLASSES-SIMPLES.sql

3. ✅ SE A TABELA JÁ USA UUID:
   - Nenhuma migração necessária
   - Verifique se RLS está habilitado
   - Verifique se há políticas adequadas

4. 🧹 SE QUISER APENAS LIMPAR:
   - Use OPÇÃO 1 do LIMPAR-MEMBER-CLASSES-SIMPLES.sql

5. 🗑️ SE QUISER REMOVER COMPLETAMENTE:
   - Use OPÇÃO 3 do LIMPAR-MEMBER-CLASSES-SIMPLES.sql

⚠️ LEMBRE-SE:
- Sempre faça backup antes de executar
- Teste primeiro em ambiente de desenvolvimento
- Verifique se todas as referências foram atualizadas
- Atualize a aplicação para usar a nova estrutura
*/
