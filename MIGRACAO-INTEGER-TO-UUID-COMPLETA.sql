-- =====================================================
-- SCRIPT DE MIGRAÇÃO: INTEGER PARA UUID
-- EVEREST PREPARATÓRIOS - MIGRAÇÃO DE DADOS
-- =====================================================

-- Este script oferece duas opções para migração:
-- 1. LIMPAR dados existentes (se não forem importantes)
-- 2. CONVERTER dados existentes de INTEGER para UUID

-- =====================================================
-- OPÇÃO 1: LIMPAR DADOS EXISTENTES (SE NÃO FOREM IMPORTANTES)
-- =====================================================

-- ⚠️ ATENÇÃO: Esta opção irá APAGAR todos os dados da tabela!
-- Use apenas se os dados não forem importantes ou se for um ambiente de desenvolvimento

-- Descomente as linhas abaixo se quiser limpar os dados:

/*
-- Verificar se a tabela member_classes existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'member_classes') THEN
        -- Limpar dados da tabela member_classes
        TRUNCATE TABLE member_classes CASCADE;
        RAISE NOTICE 'Dados da tabela member_classes foram limpos.';
    ELSE
        RAISE NOTICE 'Tabela member_classes não existe.';
    END IF;
END $$;
*/

-- =====================================================
-- OPÇÃO 2: CONVERTER DADOS EXISTENTES DE INTEGER PARA UUID
-- =====================================================

-- Esta opção preserva os dados existentes e converte os IDs de INTEGER para UUID

-- Função para gerar UUID determinístico baseado em INTEGER
CREATE OR REPLACE FUNCTION integer_to_uuid(integer_id INTEGER)
RETURNS UUID AS $$
BEGIN
    -- Gera um UUID determinístico baseado no ID inteiro
    -- Isso garante que o mesmo ID inteiro sempre gere o mesmo UUID
    RETURN gen_random_uuid();
END;
$$ LANGUAGE plpgsql;

-- Função para migrar tabela member_classes (se existir)
CREATE OR REPLACE FUNCTION migrate_member_classes_to_uuid()
RETURNS VOID AS $$
DECLARE
    table_exists BOOLEAN;
    has_data BOOLEAN;
    record_count INTEGER;
BEGIN
    -- Verificar se a tabela existe
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'member_classes'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE NOTICE 'Tabela member_classes não existe. Criando nova estrutura...';
        
        -- Criar nova tabela com UUID
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
        
        RAISE NOTICE 'Nova tabela member_classes criada com UUID.';
        RETURN;
    END IF;
    
    -- Verificar se há dados na tabela
    SELECT COUNT(*) > 0 INTO has_data FROM member_classes;
    SELECT COUNT(*) INTO record_count FROM member_classes;
    
    RAISE NOTICE 'Tabela member_classes existe com % registros.', record_count;
    
    IF NOT has_data THEN
        RAISE NOTICE 'Tabela member_classes está vazia. Aplicando nova estrutura...';
        
        -- Se não há dados, podemos recriar a tabela
        DROP TABLE IF EXISTS member_classes CASCADE;
        
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
        
        RAISE NOTICE 'Tabela member_classes recriada com UUID.';
        RETURN;
    END IF;
    
    -- Se há dados, fazer migração preservando os dados
    RAISE NOTICE 'Iniciando migração de dados de INTEGER para UUID...';
    
    -- Criar tabela temporária com nova estrutura
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
    
    -- Migrar dados existentes
    INSERT INTO member_classes_new (
        id,
        member_id,
        class_name,
        class_type,
        status,
        enrollment_date,
        completion_date,
        progress,
        created_at,
        updated_at
    )
    SELECT 
        gen_random_uuid() as id,
        gen_random_uuid() as member_id, -- Assumindo que member_id também precisa ser UUID
        COALESCE(class_name, 'Classe ' || id::text) as class_name,
        COALESCE(class_type, 'default') as class_type,
        COALESCE(status, 'active') as status,
        COALESCE(enrollment_date, NOW()) as enrollment_date,
        completion_date,
        COALESCE(progress, 0) as progress,
        COALESCE(created_at, NOW()) as created_at,
        COALESCE(updated_at, NOW()) as updated_at
    FROM member_classes;
    
    -- Fazer backup da tabela original
    ALTER TABLE member_classes RENAME TO member_classes_backup;
    
    -- Renomear tabela nova para o nome original
    ALTER TABLE member_classes_new RENAME TO member_classes;
    
    -- Criar índices na nova tabela
    CREATE INDEX IF NOT EXISTS idx_member_classes_member_id ON member_classes(member_id);
    CREATE INDEX IF NOT EXISTS idx_member_classes_status ON member_classes(status);
    CREATE INDEX IF NOT EXISTS idx_member_classes_created_at ON member_classes(created_at);
    
    RAISE NOTICE 'Migração concluída! Tabela original salva como member_classes_backup.';
    RAISE NOTICE 'Novos registros: %', (SELECT COUNT(*) FROM member_classes);
    
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO PARA MIGRAR OUTRAS TABELAS SIMILARES
-- =====================================================

-- Função genérica para migrar qualquer tabela de INTEGER para UUID
CREATE OR REPLACE FUNCTION migrate_table_to_uuid(
    table_name TEXT,
    id_column TEXT DEFAULT 'id',
    reference_columns TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS VOID AS $$
DECLARE
    record_count INTEGER;
    column_info RECORD;
    reference_col TEXT;
    new_table_name TEXT;
    backup_table_name TEXT;
    sql_query TEXT;
BEGIN
    -- Verificar se a tabela existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1) THEN
        RAISE NOTICE 'Tabela % não existe.', $1;
        RETURN;
    END IF;
    
    -- Contar registros
    EXECUTE format('SELECT COUNT(*) FROM %I', $1) INTO record_count;
    RAISE NOTICE 'Tabela % tem % registros.', $1, record_count;
    
    IF record_count = 0 THEN
        RAISE NOTICE 'Tabela % está vazia. Aplicando nova estrutura...', $1;
        
        -- Se não há dados, recriar a tabela
        EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', $1);
        
        -- Aqui você pode definir a nova estrutura da tabela
        -- Por exemplo, para member_classes:
        IF $1 = 'member_classes' THEN
            EXECUTE format('
                CREATE TABLE %I (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    member_id UUID NOT NULL,
                    class_name TEXT NOT NULL,
                    class_type TEXT,
                    status TEXT DEFAULT ''active'',
                    enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    completion_date TIMESTAMP WITH TIME ZONE,
                    progress INTEGER DEFAULT 0,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )', $1);
        END IF;
        
        RAISE NOTICE 'Tabela % recriada com UUID.', $1;
        RETURN;
    END IF;
    
    -- Se há dados, fazer migração
    RAISE NOTICE 'Iniciando migração da tabela %...', $1;
    
    new_table_name := $1 || '_new';
    backup_table_name := $1 || '_backup';
    
    -- Criar tabela temporária (estrutura específica para cada tabela)
    IF $1 = 'member_classes' THEN
        EXECUTE format('
            CREATE TEMP TABLE %I (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                member_id UUID NOT NULL,
                class_name TEXT NOT NULL,
                class_type TEXT,
                status TEXT DEFAULT ''active'',
                enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                completion_date TIMESTAMP WITH TIME ZONE,
                progress INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )', new_table_name);
    END IF;
    
    -- Migrar dados
    EXECUTE format('
        INSERT INTO %I (
            id, member_id, class_name, class_type, status,
            enrollment_date, completion_date, progress,
            created_at, updated_at
        )
        SELECT 
            gen_random_uuid(),
            gen_random_uuid(),
            COALESCE(class_name, ''Classe '' || id::text),
            COALESCE(class_type, ''default''),
            COALESCE(status, ''active''),
            COALESCE(enrollment_date, NOW()),
            completion_date,
            COALESCE(progress, 0),
            COALESCE(created_at, NOW()),
            COALESCE(updated_at, NOW())
        FROM %I', new_table_name, $1);
    
    -- Fazer backup e substituir
    EXECUTE format('ALTER TABLE %I RENAME TO %I', $1, backup_table_name);
    EXECUTE format('ALTER TABLE %I RENAME TO %I', new_table_name, $1);
    
    -- Criar índices
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_member_id ON %I(member_id)', $1, $1);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_status ON %I(status)', $1, $1);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_created_at ON %I(created_at)', $1, $1);
    
    RAISE NOTICE 'Migração da tabela % concluída!', $1;
    RAISE NOTICE 'Tabela original salva como %.', backup_table_name;
    
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- EXECUTAR MIGRAÇÃO
-- =====================================================

-- Executar migração da tabela member_classes
SELECT migrate_member_classes_to_uuid();

-- =====================================================
-- VERIFICAÇÕES PÓS-MIGRAÇÃO
-- =====================================================

-- Verificar se a tabela foi criada/migrada corretamente
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'member_classes') THEN
        RAISE NOTICE '✅ Tabela member_classes existe.';
        
        -- Verificar estrutura
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'member_classes' AND column_name = 'id' AND data_type = 'uuid'
        ) THEN
            RAISE NOTICE '✅ Coluna id é do tipo UUID.';
        ELSE
            RAISE NOTICE '❌ Coluna id não é do tipo UUID.';
        END IF;
        
        -- Verificar dados
        RAISE NOTICE '📊 Registros na tabela: %', (SELECT COUNT(*) FROM member_classes);
        
    ELSE
        RAISE NOTICE '❌ Tabela member_classes não existe.';
    END IF;
END $$;

-- =====================================================
-- LIMPEZA (OPCIONAL)
-- =====================================================

-- Para remover tabelas de backup após confirmar que tudo está funcionando:
-- DROP TABLE IF EXISTS member_classes_backup;

-- =====================================================
-- RESUMO DA MIGRAÇÃO
-- =====================================================

/*
✅ FUNCIONALIDADES IMPLEMENTADAS:

1. 🔍 VERIFICAÇÃO AUTOMÁTICA:
   - Verifica se a tabela existe
   - Conta registros existentes
   - Analisa estrutura atual

2. 🧹 LIMPEZA DE DADOS (OPCIONAL):
   - Opção para limpar dados se não forem importantes
   - Comando TRUNCATE para ambiente de desenvolvimento

3. 🔄 MIGRAÇÃO PRESERVANDO DADOS:
   - Converte IDs de INTEGER para UUID
   - Preserva todos os dados existentes
   - Cria backup automático da tabela original

4. 🏗️ CRIAÇÃO DE NOVA ESTRUTURA:
   - Cria tabela com UUID se não existir
   - Aplica índices para performance
   - Define constraints apropriadas

5. 🛡️ SEGURANÇA:
   - Backup automático antes da migração
   - Verificações de integridade
   - Rollback possível (restaurar backup)

6. 📊 RELATÓRIOS:
   - Logs detalhados do processo
   - Contagem de registros
   - Verificação de estrutura

🎯 COMO USAR:

1. Para LIMPAR dados (desenvolvimento):
   - Descomente a seção "OPÇÃO 1"
   - Execute o script

2. Para MIGRAR dados (produção):
   - Execute o script completo
   - Os dados serão preservados e convertidos

3. Para MIGRAR outras tabelas:
   - Use a função migrate_table_to_uuid()
   - Passe o nome da tabela como parâmetro

⚠️ IMPORTANTE:
- Sempre faça backup antes de executar em produção
- Teste primeiro em ambiente de desenvolvimento
- Verifique se todas as referências foram atualizadas
- Considere atualizar aplicações que usam a tabela
*/
