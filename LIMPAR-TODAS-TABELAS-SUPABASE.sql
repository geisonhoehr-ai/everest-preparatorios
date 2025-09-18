-- =====================================================
-- SCRIPT PARA EXCLUIR TODAS AS TABELAS DO SUPABASE
-- EVEREST PREPARATÓRIOS - LIMPEZA COMPLETA
-- =====================================================

-- ⚠️ ATENÇÃO: Este script irá EXCLUIR TODAS as tabelas do banco!
-- ⚠️ Faça backup antes de executar!
-- ⚠️ Execute apenas se tiver certeza absoluta!

-- =====================================================
-- VERIFICAÇÃO INICIAL E CONFIRMAÇÃO
-- =====================================================

-- Verificar quantas tabelas existem
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
    
    RAISE NOTICE '🔍 VERIFICAÇÃO INICIAL:';
    RAISE NOTICE '======================';
    RAISE NOTICE '📊 Total de tabelas encontradas: %', table_count;
    
    IF table_count = 0 THEN
        RAISE NOTICE '✅ Nenhuma tabela encontrada. Nada para excluir.';
        RETURN;
    END IF;
    
    RAISE NOTICE '⚠️ ATENÇÃO: % tabelas serão EXCLUÍDAS!', table_count;
    RAISE NOTICE '⚠️ Certifique-se de ter feito backup antes de continuar!';
END $$;

-- =====================================================
-- LISTAR TODAS AS TABELAS ANTES DA EXCLUSÃO
-- =====================================================

-- Mostrar todas as tabelas que serão excluídas
SELECT 
    'TABELAS QUE SERÃO EXCLUÍDAS' as secao,
    table_name as tabela,
    CASE 
        WHEN table_name LIKE '%_backup' THEN '💾 Backup'
        WHEN table_name LIKE '%_temp' THEN '🗑️ Temporária'
        WHEN table_name LIKE '%_old' THEN '🗑️ Antiga'
        ELSE '📋 Principal'
    END as tipo,
    CASE 
        WHEN table_name IN ('auth.users', 'auth.sessions', 'auth.identities') THEN '🔒 Sistema'
        WHEN table_name LIKE 'pg_%' THEN '🔒 PostgreSQL'
        WHEN table_name LIKE 'information_schema.%' THEN '🔒 Sistema'
        ELSE '👤 Usuário'
    END as categoria
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY 
    CASE 
        WHEN table_name LIKE '%_backup' THEN 1
        WHEN table_name LIKE '%_temp' THEN 2
        WHEN table_name LIKE '%_old' THEN 3
        ELSE 4
    END,
    table_name;

-- =====================================================
-- FUNÇÃO PARA EXCLUIR TABELAS COM SEGURANÇA
-- =====================================================

-- Função para excluir tabelas de forma segura
CREATE OR REPLACE FUNCTION drop_all_tables_safely()
RETURNS TABLE(
    tabela TEXT,
    status TEXT,
    erro TEXT
) AS $$
DECLARE
    table_record RECORD;
    drop_sql TEXT;
    error_message TEXT;
BEGIN
    RAISE NOTICE '🔄 Iniciando exclusão de tabelas...';
    
    -- Loop através de todas as tabelas
    FOR table_record IN 
        SELECT table_name
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    LOOP
        BEGIN
            -- Construir comando DROP
            drop_sql := format('DROP TABLE IF EXISTS %I CASCADE', table_record.table_name);
            
            -- Executar exclusão
            EXECUTE drop_sql;
            
            -- Registrar sucesso
            tabela := table_record.table_name;
            status := '✅ Excluída';
            erro := NULL;
            RETURN NEXT;
            
            RAISE NOTICE '✅ Tabela % excluída com sucesso.', table_record.table_name;
            
        EXCEPTION WHEN OTHERS THEN
            -- Registrar erro
            tabela := table_record.table_name;
            status := '❌ Erro';
            erro := SQLERRM;
            RETURN NEXT;
            
            RAISE NOTICE '❌ Erro ao excluir tabela %: %', table_record.table_name, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE '🏁 Exclusão de tabelas concluída.';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- EXECUTAR EXCLUSÃO
-- =====================================================

-- Executar exclusão de todas as tabelas
SELECT * FROM drop_all_tables_safely();

-- =====================================================
-- LIMPEZA ADICIONAL
-- =====================================================

-- Limpar sequências órfãs
DO $$
DECLARE
    seq_record RECORD;
    drop_sql TEXT;
BEGIN
    RAISE NOTICE '🧹 Limpando sequências órfãs...';
    
    FOR seq_record IN 
        SELECT sequencename
        FROM pg_sequences 
        WHERE schemaname = 'public'
    LOOP
        BEGIN
            drop_sql := format('DROP SEQUENCE IF EXISTS %I CASCADE', seq_record.sequencename);
            EXECUTE drop_sql;
            RAISE NOTICE '✅ Sequência % excluída.', seq_record.sequencename;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Erro ao excluir sequência %: %', seq_record.sequencename, SQLERRM;
        END;
    END LOOP;
END $$;

-- Limpar funções personalizadas
DO $$
DECLARE
    func_record RECORD;
    drop_sql TEXT;
BEGIN
    RAISE NOTICE '🧹 Limpando funções personalizadas...';
    
    FOR func_record IN 
        SELECT routine_name
        FROM information_schema.routines 
        WHERE routine_schema = 'public'
        AND routine_type = 'FUNCTION'
        AND routine_name NOT LIKE 'pg_%'
        AND routine_name NOT LIKE 'information_schema_%'
    LOOP
        BEGIN
            drop_sql := format('DROP FUNCTION IF EXISTS %I CASCADE', func_record.routine_name);
            EXECUTE drop_sql;
            RAISE NOTICE '✅ Função % excluída.', func_record.routine_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Erro ao excluir função %: %', func_record.routine_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- Limpar tipos personalizados
DO $$
DECLARE
    type_record RECORD;
    drop_sql TEXT;
BEGIN
    RAISE NOTICE '🧹 Limpando tipos personalizados...';
    
    FOR type_record IN 
        SELECT typname
        FROM pg_type 
        WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND typtype = 'c' -- tipos compostos
    LOOP
        BEGIN
            drop_sql := format('DROP TYPE IF EXISTS %I CASCADE', type_record.typname);
            EXECUTE drop_sql;
            RAISE NOTICE '✅ Tipo % excluído.', type_record.typname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Erro ao excluir tipo %: %', type_record.typname, SQLERRM;
        END;
    END LOOP;
END $$;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se todas as tabelas foram excluídas
DO $$
DECLARE
    remaining_tables INTEGER;
    remaining_sequences INTEGER;
    remaining_functions INTEGER;
    remaining_types INTEGER;
BEGIN
    RAISE NOTICE '🔍 VERIFICAÇÃO FINAL:';
    RAISE NOTICE '====================';
    
    -- Contar tabelas restantes
    SELECT COUNT(*) INTO remaining_tables
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
    
    -- Contar sequências restantes
    SELECT COUNT(*) INTO remaining_sequences
    FROM pg_sequences 
    WHERE schemaname = 'public';
    
    -- Contar funções restantes
    SELECT COUNT(*) INTO remaining_functions
    FROM information_schema.routines 
    WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION'
    AND routine_name NOT LIKE 'pg_%'
    AND routine_name NOT LIKE 'information_schema_%';
    
    -- Contar tipos restantes
    SELECT COUNT(*) INTO remaining_types
    FROM pg_type 
    WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    AND typtype = 'c';
    
    RAISE NOTICE '📊 RESULTADO:';
    RAISE NOTICE '   - Tabelas restantes: %', remaining_tables;
    RAISE NOTICE '   - Sequências restantes: %', remaining_sequences;
    RAISE NOTICE '   - Funções restantes: %', remaining_functions;
    RAISE NOTICE '   - Tipos restantes: %', remaining_types;
    
    IF remaining_tables = 0 AND remaining_sequences = 0 AND remaining_functions = 0 AND remaining_types = 0 THEN
        RAISE NOTICE '✅ LIMPEZA COMPLETA! Todas as tabelas foram excluídas.';
    ELSE
        RAISE NOTICE '⚠️ Alguns objetos ainda existem. Verifique manualmente.';
    END IF;
END $$;

-- =====================================================
-- RELATÓRIO FINAL
-- =====================================================

-- Relatório final
SELECT 
    'RELATÓRIO FINAL DA LIMPEZA' as secao,
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') = 0 
        THEN '✅ Sucesso Total'
        ELSE '⚠️ Parcial'
    END as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE')::text as tabelas_restantes,
    (SELECT COUNT(*) FROM pg_sequences WHERE schemaname = 'public')::text as sequencias_restantes,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION' AND routine_name NOT LIKE 'pg_%' AND routine_name NOT LIKE 'information_schema_%')::text as funcoes_restantes,
    (SELECT COUNT(*) FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'c')::text as tipos_restantes;

-- =====================================================
-- LIMPEZA DAS FUNÇÕES AUXILIARES
-- =====================================================

-- Remover função auxiliar
DROP FUNCTION IF EXISTS drop_all_tables_safely();

-- =====================================================
-- RESUMO FINAL
-- =====================================================

/*
✅ LIMPEZA COMPLETA CONCLUÍDA!

🎯 O QUE FOI FEITO:

1. ✅ VERIFICAÇÃO INICIAL:
   - Contou todas as tabelas existentes
   - Listou tabelas que seriam excluídas
   - Alertou sobre a exclusão

2. ✅ EXCLUSÃO SEGURA:
   - Excluiu todas as tabelas com CASCADE
   - Tratou erros individualmente
   - Registrou status de cada exclusão

3. ✅ LIMPEZA ADICIONAL:
   - Removeu sequências órfãs
   - Excluiu funções personalizadas
   - Limpou tipos personalizados

4. ✅ VERIFICAÇÃO FINAL:
   - Confirmou exclusão completa
   - Contou objetos restantes
   - Relatório detalhado

🔄 PRÓXIMOS PASSOS:

1. ✅ Verificar se todas as tabelas foram excluídas
2. ✅ Confirmar que não há objetos órfãos
3. ✅ Fazer backup do banco limpo se necessário
4. ✅ Recriar estrutura necessária
5. ✅ Restaurar dados de backup se aplicável

⚠️ IMPORTANTE:
- Todas as tabelas foram excluídas com CASCADE
- Sequências e funções personalizadas foram removidas
- O banco está completamente limpo
- Faça backup antes de recriar estrutura
- Restaure dados de backup se necessário

🚀 O banco está pronto para uma nova estrutura!
*/
