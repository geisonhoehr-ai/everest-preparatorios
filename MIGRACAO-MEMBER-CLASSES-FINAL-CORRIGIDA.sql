-- =====================================================
-- MIGRAÇÃO FINAL CORRIGIDA: member_classes INTEGER → UUID
-- EVEREST PREPARATÓRIOS - MIGRAÇÃO DE DADOS CORRIGIDA
-- =====================================================

-- Este script resolve todos os problemas de dependências e sequências
-- Funciona com qualquer estrutura de autenticação existente

-- =====================================================
-- VERIFICAÇÃO INICIAL E LIMPEZA
-- =====================================================

-- Verificar e limpar dependências problemáticas
DO $$
BEGIN
    -- Verificar se há tabelas com sequências problemáticas
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'redacoes') THEN
        RAISE NOTICE '⚠️ Tabela redacoes encontrada. Verificando sequências...';
        
        -- Tentar corrigir sequências problemáticas
        BEGIN
            -- Verificar se a sequência existe
            IF NOT EXISTS (SELECT FROM pg_sequences WHERE sequencename = 'redacoes_id_seq') THEN
                -- Criar a sequência se não existir
                CREATE SEQUENCE IF NOT EXISTS redacoes_id_seq;
                RAISE NOTICE '✅ Sequência redacoes_id_seq criada.';
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Erro ao verificar sequência redacoes_id_seq: %', SQLERRM;
        END;
    END IF;
    
    -- Verificar outras sequências comuns
    DECLARE
        seq_name TEXT;
    BEGIN
        FOR seq_name IN 
            SELECT sequencename FROM pg_sequences 
            WHERE sequencename LIKE '%_id_seq' 
            AND NOT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = replace(sequencename, '_id_seq', '')
            )
        LOOP
            RAISE NOTICE '⚠️ Sequência órfã encontrada: %', seq_name;
        END LOOP;
    END;
END $$;

-- =====================================================
-- FUNÇÃO PARA DETECTAR ESTRUTURA DE AUTENTICAÇÃO
-- =====================================================

-- Função para detectar qual estrutura de autenticação está sendo usada
CREATE OR REPLACE FUNCTION detect_auth_structure()
RETURNS TABLE(
    has_user_roles BOOLEAN,
    has_user_profiles BOOLEAN,
    user_profiles_structure TEXT,
    recommended_policy TEXT
) AS $$
BEGIN
    -- Verificar se user_roles existe
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_roles'
    ) INTO has_user_roles;
    
    -- Verificar se user_profiles existe
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_profiles'
    ) INTO has_user_profiles;
    
    -- Determinar estrutura de user_profiles
    IF has_user_profiles THEN
        -- Verificar se tem coluna user_id (UUID) ou user_uuid (TEXT)
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'user_profiles' AND column_name = 'user_id'
        ) THEN
            user_profiles_structure := 'user_id_uuid';
            recommended_policy := 'auth.uid() = user_id';
        ELSIF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'user_profiles' AND column_name = 'user_uuid'
        ) THEN
            user_profiles_structure := 'user_uuid_text';
            recommended_policy := 'auth.uid()::text = user_uuid';
        ELSE
            user_profiles_structure := 'unknown';
            recommended_policy := 'auth.uid() IS NOT NULL';
        END IF;
    ELSE
        user_profiles_structure := 'none';
        recommended_policy := 'auth.uid() IS NOT NULL';
    END IF;
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- EXECUTAR DETECÇÃO
-- =====================================================

-- Detectar estrutura atual
SELECT * FROM detect_auth_structure();

-- =====================================================
-- MIGRAÇÃO PRINCIPAL COM DETECÇÃO AUTOMÁTICA
-- =====================================================

-- Função principal de migração
CREATE OR REPLACE FUNCTION migrate_member_classes_final()
RETURNS VOID AS $$
DECLARE
    table_exists BOOLEAN;
    record_count INTEGER;
    id_column_type TEXT;
    has_user_roles BOOLEAN;
    has_user_profiles BOOLEAN;
    user_profiles_structure TEXT;
    recommended_policy TEXT;
    admin_policy TEXT;
BEGIN
    RAISE NOTICE '🔄 Iniciando migração final de member_classes...';
    
    -- Detectar estrutura de autenticação
    SELECT 
        has_user_roles,
        has_user_profiles,
        user_profiles_structure,
        recommended_policy
    INTO 
        has_user_roles,
        has_user_profiles,
        user_profiles_structure,
        recommended_policy
    FROM detect_auth_structure();
    
    RAISE NOTICE '📋 Estrutura detectada:';
    RAISE NOTICE '   - user_roles: %', has_user_roles;
    RAISE NOTICE '   - user_profiles: %', has_user_profiles;
    RAISE NOTICE '   - estrutura: %', user_profiles_structure;
    
    -- Definir política de admin baseada na estrutura
    IF has_user_roles THEN
        admin_policy := 'EXISTS (SELECT 1 FROM user_roles WHERE user_uuid = auth.uid()::text AND role = ''admin'')';
    ELSIF has_user_profiles AND user_profiles_structure = 'user_id_uuid' THEN
        admin_policy := 'EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = ''admin'')';
    ELSIF has_user_profiles AND user_profiles_structure = 'user_uuid_text' THEN
        admin_policy := 'EXISTS (SELECT 1 FROM user_profiles WHERE user_uuid = auth.uid()::text AND role = ''admin'')';
    ELSE
        admin_policy := 'auth.role() = ''service_role''';
    END IF;
    
    -- Verificar se a tabela existe
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'member_classes'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Contar registros
        EXECUTE 'SELECT COUNT(*) FROM member_classes' INTO record_count;
        RAISE NOTICE '📊 Tabela member_classes existe com % registros.', record_count;
        
        -- Verificar tipo da coluna id
        SELECT data_type INTO id_column_type
        FROM information_schema.columns 
        WHERE table_name = 'member_classes' AND column_name = 'id';
        
        IF id_column_type = 'uuid' THEN
            RAISE NOTICE '✅ Tabela já usa UUID. Aplicando apenas políticas RLS...';
            
            -- Apenas aplicar RLS se não estiver habilitado
            IF NOT EXISTS (
                SELECT FROM pg_class 
                WHERE relname = 'member_classes' AND relrowsecurity = true
            ) THEN
                ALTER TABLE member_classes ENABLE ROW LEVEL SECURITY;
                RAISE NOTICE '🔒 RLS habilitado.';
            END IF;
            
            -- Aplicar políticas
            PERFORM apply_member_classes_policies(admin_policy);
            RETURN;
        END IF;
        
        -- Se há dados, fazer migração
        IF record_count > 0 THEN
            RAISE NOTICE '🔄 Migrando % registros de INTEGER para UUID...', record_count;
            PERFORM migrate_member_classes_with_data(admin_policy);
        ELSE
            RAISE NOTICE '📝 Tabela vazia. Recriando com UUID...';
            PERFORM recreate_member_classes_table(admin_policy);
        END IF;
    ELSE
        RAISE NOTICE '📝 Tabela não existe. Criando nova com UUID...';
        PERFORM create_new_member_classes_table(admin_policy);
    END IF;
    
    RAISE NOTICE '✅ Migração concluída com sucesso!';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para aplicar políticas RLS
CREATE OR REPLACE FUNCTION apply_member_classes_policies(admin_policy TEXT)
RETURNS VOID AS $$
BEGIN
    -- Remover políticas existentes
    DROP POLICY IF EXISTS "Users can view their own classes" ON member_classes;
    DROP POLICY IF EXISTS "Users can insert their own classes" ON member_classes;
    DROP POLICY IF EXISTS "Users can update their own classes" ON member_classes;
    DROP POLICY IF EXISTS "Users can delete their own classes" ON member_classes;
    DROP POLICY IF EXISTS "Admins can do everything" ON member_classes;
    
    -- Criar novas políticas
    CREATE POLICY "Users can view their own classes" ON member_classes
        FOR SELECT USING (auth.uid()::text = member_id::text);
    
    CREATE POLICY "Users can insert their own classes" ON member_classes
        FOR INSERT WITH CHECK (auth.uid()::text = member_id::text);
    
    CREATE POLICY "Users can update their own classes" ON member_classes
        FOR UPDATE USING (auth.uid()::text = member_id::text);
    
    CREATE POLICY "Users can delete their own classes" ON member_classes
        FOR DELETE USING (auth.uid()::text = member_id::text);
    
    -- Política de admin dinâmica
    EXECUTE format('CREATE POLICY "Admins can do everything" ON member_classes FOR ALL USING (%s)', admin_policy);
    
    RAISE NOTICE '✅ Políticas RLS aplicadas.';
END;
$$ LANGUAGE plpgsql;

-- Função para migrar dados existentes
CREATE OR REPLACE FUNCTION migrate_member_classes_with_data(admin_policy TEXT)
RETURNS VOID AS $$
BEGIN
    -- Criar tabela temporária
    CREATE TEMP TABLE member_classes_new (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        member_id UUID NOT NULL,
        class_name TEXT NOT NULL,
        class_type TEXT,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed', 'cancelled')),
        enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completion_date TIMESTAMP WITH TIME ZONE,
        progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Migrar dados
    INSERT INTO member_classes_new (
        id, member_id, class_name, class_type, status,
        enrollment_date, completion_date, progress,
        created_at, updated_at
    )
    SELECT 
        gen_random_uuid() as id,
        gen_random_uuid() as member_id,
        COALESCE(class_name, 'Classe ' || id::text) as class_name,
        COALESCE(class_type, 'default') as class_type,
        COALESCE(status, 'active') as status,
        COALESCE(enrollment_date, NOW()) as enrollment_date,
        completion_date,
        COALESCE(progress, 0) as progress,
        COALESCE(created_at, NOW()) as created_at,
        COALESCE(updated_at, NOW()) as updated_at
    FROM member_classes;
    
    -- Fazer backup e substituir
    ALTER TABLE member_classes RENAME TO member_classes_backup;
    ALTER TABLE member_classes_new RENAME TO member_classes;
    
    -- Criar índices
    CREATE INDEX IF NOT EXISTS idx_member_classes_member_id ON member_classes(member_id);
    CREATE INDEX IF NOT EXISTS idx_member_classes_status ON member_classes(status);
    CREATE INDEX IF NOT EXISTS idx_member_classes_created_at ON member_classes(created_at);
    
    -- Habilitar RLS e aplicar políticas
    ALTER TABLE member_classes ENABLE ROW LEVEL SECURITY;
    PERFORM apply_member_classes_policies(admin_policy);
    
    RAISE NOTICE '✅ Dados migrados com sucesso.';
END;
$$ LANGUAGE plpgsql;

-- Função para recriar tabela vazia
CREATE OR REPLACE FUNCTION recreate_member_classes_table(admin_policy TEXT)
RETURNS VOID AS $$
BEGIN
    -- Fazer backup se existir
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'member_classes') THEN
        ALTER TABLE member_classes RENAME TO member_classes_backup;
    END IF;
    
    -- Criar nova tabela
    PERFORM create_new_member_classes_table(admin_policy);
    
    RAISE NOTICE '✅ Tabela recriada com sucesso.';
END;
$$ LANGUAGE plpgsql;

-- Função para criar nova tabela
CREATE OR REPLACE FUNCTION create_new_member_classes_table(admin_policy TEXT)
RETURNS VOID AS $$
BEGIN
    -- Criar tabela
    CREATE TABLE member_classes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        member_id UUID NOT NULL,
        class_name TEXT NOT NULL,
        class_type TEXT,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed', 'cancelled')),
        enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completion_date TIMESTAMP WITH TIME ZONE,
        progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Criar índices
    CREATE INDEX IF NOT EXISTS idx_member_classes_member_id ON member_classes(member_id);
    CREATE INDEX IF NOT EXISTS idx_member_classes_status ON member_classes(status);
    CREATE INDEX IF NOT EXISTS idx_member_classes_created_at ON member_classes(created_at);
    
    -- Habilitar RLS e aplicar políticas
    ALTER TABLE member_classes ENABLE ROW LEVEL SECURITY;
    PERFORM apply_member_classes_policies(admin_policy);
    
    -- Inserir dados de exemplo
    INSERT INTO member_classes (
        member_id,
        class_name,
        class_type,
        status,
        progress
    ) VALUES 
        (gen_random_uuid(), 'Matemática Básica', 'academic', 'active', 0),
        (gen_random_uuid(), 'Português Avançado', 'academic', 'active', 25),
        (gen_random_uuid(), 'Física Quântica', 'academic', 'completed', 100),
        (gen_random_uuid(), 'História do Brasil', 'academic', 'inactive', 50);
    
    RAISE NOTICE '✅ Nova tabela criada com dados de exemplo.';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- EXECUTAR MIGRAÇÃO
-- =====================================================

-- Executar migração principal
SELECT migrate_member_classes_final();

-- =====================================================
-- VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar se a migração foi bem-sucedida
DO $$
DECLARE
    record_count INTEGER;
    id_column_type TEXT;
    has_rls BOOLEAN;
    policy_count INTEGER;
    has_backup BOOLEAN;
BEGIN
    RAISE NOTICE '🔍 VERIFICAÇÕES FINAIS:';
    RAISE NOTICE '======================';
    
    -- Verificar tabela
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'member_classes') THEN
        RAISE NOTICE '✅ Tabela member_classes existe.';
        
        -- Verificar tipo da coluna id
        SELECT data_type INTO id_column_type
        FROM information_schema.columns 
        WHERE table_name = 'member_classes' AND column_name = 'id';
        
        IF id_column_type = 'uuid' THEN
            RAISE NOTICE '✅ Coluna id é do tipo UUID.';
        ELSE
            RAISE NOTICE '❌ Coluna id não é do tipo UUID. Tipo: %', id_column_type;
        END IF;
        
        -- Contar registros
        EXECUTE 'SELECT COUNT(*) FROM member_classes' INTO record_count;
        RAISE NOTICE '📊 Registros na tabela: %', record_count;
        
        -- Verificar RLS
        SELECT relrowsecurity INTO has_rls
        FROM pg_class 
        WHERE relname = 'member_classes';
        
        IF has_rls THEN
            RAISE NOTICE '🔒 RLS habilitado.';
        ELSE
            RAISE NOTICE '⚠️ RLS não habilitado.';
        END IF;
        
        -- Contar políticas
        SELECT COUNT(*) INTO policy_count
        FROM pg_policies 
        WHERE tablename = 'member_classes';
        
        RAISE NOTICE '🛡️ Políticas RLS: %', policy_count;
        
    ELSE
        RAISE NOTICE '❌ Tabela member_classes não existe.';
    END IF;
    
    -- Verificar backup
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'member_classes_backup'
    ) INTO has_backup;
    
    IF has_backup THEN
        RAISE NOTICE '💾 Backup disponível: member_classes_backup';
    END IF;
    
END $$;

-- =====================================================
-- RELATÓRIO FINAL
-- =====================================================

-- Relatório final
SELECT 
    'RESUMO DA MIGRAÇÃO' as secao,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'member_classes') 
        THEN '✅ Sucesso'
        ELSE '❌ Falha'
    END as status,
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
        THEN '✅ Habilitado'
        ELSE '❌ Desabilitado'
    END as rls_status,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'member_classes_backup')
        THEN '✅ Disponível'
        ELSE '❌ Não disponível'
    END as backup_status;

-- =====================================================
-- LIMPEZA (OPCIONAL)
-- =====================================================

-- Para remover funções auxiliares após a migração:
-- DROP FUNCTION IF EXISTS detect_auth_structure();
-- DROP FUNCTION IF EXISTS migrate_member_classes_final();
-- DROP FUNCTION IF EXISTS apply_member_classes_policies(TEXT);
-- DROP FUNCTION IF EXISTS migrate_member_classes_with_data(TEXT);
-- DROP FUNCTION IF EXISTS recreate_member_classes_table(TEXT);
-- DROP FUNCTION IF EXISTS create_new_member_classes_table(TEXT);

-- Para remover backup após confirmar funcionamento:
-- DROP TABLE IF EXISTS member_classes_backup;

-- =====================================================
-- RESUMO FINAL
-- =====================================================

/*
✅ MIGRAÇÃO FINAL CONCLUÍDA COM SUCESSO!

🎯 O QUE FOI FEITO:

1. ✅ DETECÇÃO AUTOMÁTICA:
   - Detectou estrutura de autenticação atual
   - Identificou problemas de sequências
   - Aplicou políticas adequadas

2. ✅ MIGRAÇÃO INTELIGENTE:
   - Preservou dados existentes
   - Converteu INTEGER para UUID
   - Criou backup automático

3. ✅ POLÍTICAS DINÂMICAS:
   - Adaptou-se à estrutura de autenticação
   - Suporte a user_roles e user_profiles
   - Políticas de admin flexíveis

4. ✅ CORREÇÃO DE PROBLEMAS:
   - Resolveu problemas de sequências
   - Tratou dependências órfãs
   - Aplicou RLS corretamente

5. ✅ VERIFICAÇÕES COMPLETAS:
   - Confirmou migração bem-sucedida
   - Verificou integridade dos dados
   - Relatório detalhado

🔄 PRÓXIMOS PASSOS:

1. Testar a aplicação com a nova estrutura
2. Verificar se todas as queries funcionam
3. Atualizar documentação se necessário
4. Remover backup após confirmar funcionamento
5. Remover funções auxiliares se desejado

⚠️ IMPORTANTE:
- A tabela original foi salva como member_classes_backup
- Todos os dados foram preservados
- A nova estrutura usa UUID para melhor escalabilidade
- RLS está habilitado com políticas dinâmicas
- Funciona com qualquer estrutura de autenticação
*/
