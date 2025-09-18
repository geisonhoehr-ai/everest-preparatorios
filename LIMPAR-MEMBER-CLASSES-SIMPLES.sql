-- =====================================================
-- SCRIPT SIMPLES: LIMPAR DADOS DA TABELA member_classes
-- EVEREST PREPARATÓRIOS - LIMPEZA DE DADOS
-- =====================================================

-- ⚠️ ATENÇÃO: Este script irá APAGAR todos os dados da tabela member_classes!
-- Use apenas se os dados não forem importantes ou se for um ambiente de desenvolvimento

-- =====================================================
-- VERIFICAÇÃO INICIAL
-- =====================================================

-- Verificar se a tabela existe e quantos registros tem
DO $$
DECLARE
    table_exists BOOLEAN;
    record_count INTEGER;
BEGIN
    -- Verificar existência da tabela
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'member_classes'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Contar registros
        EXECUTE 'SELECT COUNT(*) FROM member_classes' INTO record_count;
        RAISE NOTICE '📊 Tabela member_classes existe com % registros.', record_count;
        
        IF record_count > 0 THEN
            RAISE NOTICE '⚠️ ATENÇÃO: % registros serão APAGADOS!', record_count;
        ELSE
            RAISE NOTICE '✅ Tabela está vazia. Nenhuma ação necessária.';
        END IF;
    ELSE
        RAISE NOTICE '❌ Tabela member_classes não existe.';
    END IF;
END $$;

-- =====================================================
-- OPÇÃO 1: APENAS LIMPAR DADOS (MANTER ESTRUTURA)
-- =====================================================

-- Descomente a linha abaixo para limpar apenas os dados:
-- TRUNCATE TABLE member_classes CASCADE;

-- =====================================================
-- OPÇÃO 2: RECRIAR TABELA COM UUID (RECOMENDADO)
-- =====================================================

-- Descomente as linhas abaixo para recriar a tabela com UUID:

/*
-- Fazer backup da tabela original (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'member_classes') THEN
        ALTER TABLE member_classes RENAME TO member_classes_backup;
        RAISE NOTICE '💾 Tabela original salva como member_classes_backup';
    END IF;
END $$;

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

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_member_classes_member_id ON member_classes(member_id);
CREATE INDEX IF NOT EXISTS idx_member_classes_status ON member_classes(status);
CREATE INDEX IF NOT EXISTS idx_member_classes_created_at ON member_classes(created_at);

-- Habilitar RLS
ALTER TABLE member_classes ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view their own classes" ON member_classes
    FOR SELECT USING (auth.uid()::text = member_id::text);

CREATE POLICY "Users can insert their own classes" ON member_classes
    FOR INSERT WITH CHECK (auth.uid()::text = member_id::text);

CREATE POLICY "Users can update their own classes" ON member_classes
    FOR UPDATE USING (auth.uid()::text = member_id::text);

CREATE POLICY "Users can delete their own classes" ON member_classes
    FOR DELETE USING (auth.uid()::text = member_id::text);

CREATE POLICY "Admins can do everything" ON member_classes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_uuid = auth.uid()::text 
            AND role = 'admin'
        )
    );

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

-- Verificar criação
SELECT 
    'member_classes' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as ativos,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completos,
    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inativos
FROM member_classes;
*/

-- =====================================================
-- OPÇÃO 3: APAGAR TABELA COMPLETAMENTE
-- =====================================================

-- Descomente a linha abaixo para apagar a tabela completamente:
-- DROP TABLE IF EXISTS member_classes CASCADE;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar status final
DO $$
DECLARE
    table_exists BOOLEAN;
    record_count INTEGER;
    id_column_type TEXT;
BEGIN
    -- Verificar existência da tabela
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'member_classes'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Contar registros
        EXECUTE 'SELECT COUNT(*) FROM member_classes' INTO record_count;
        RAISE NOTICE '✅ Tabela member_classes existe com % registros.', record_count;
        
        -- Verificar tipo da coluna id
        SELECT data_type INTO id_column_type
        FROM information_schema.columns 
        WHERE table_name = 'member_classes' AND column_name = 'id';
        
        IF id_column_type = 'uuid' THEN
            RAISE NOTICE '✅ Coluna id é do tipo UUID.';
        ELSE
            RAISE NOTICE '⚠️ Coluna id não é do tipo UUID. Tipo atual: %', id_column_type;
        END IF;
        
        -- Verificar RLS
        IF EXISTS (
            SELECT FROM pg_class 
            WHERE relname = 'member_classes' AND relrowsecurity = true
        ) THEN
            RAISE NOTICE '🔒 RLS habilitado.';
        ELSE
            RAISE NOTICE '⚠️ RLS não habilitado.';
        END IF;
        
    ELSE
        RAISE NOTICE '❌ Tabela member_classes não existe.';
    END IF;
END $$;

-- =====================================================
-- RESUMO DAS OPÇÕES
-- =====================================================

/*
🎯 OPÇÕES DISPONÍVEIS:

1. 🧹 LIMPAR DADOS (OPÇÃO 1):
   - Mantém a estrutura da tabela
   - Remove apenas os dados
   - Use: TRUNCATE TABLE member_classes CASCADE;

2. 🔄 RECRIAR COM UUID (OPÇÃO 2 - RECOMENDADO):
   - Cria nova tabela com UUID
   - Aplica RLS e políticas
   - Inserir dados de exemplo
   - Descomente o bloco da OPÇÃO 2

3. 🗑️ APAGAR TABELA (OPÇÃO 3):
   - Remove a tabela completamente
   - Use: DROP TABLE IF EXISTS member_classes CASCADE;

⚠️ IMPORTANTE:
- Sempre faça backup antes de executar
- Teste primeiro em ambiente de desenvolvimento
- A OPÇÃO 2 é a mais recomendada para produção
- Verifique se todas as referências foram atualizadas

✅ APÓS EXECUTAR:
- Teste a aplicação
- Verifique se todas as queries funcionam
- Atualize documentação se necessário
- Remova backup após confirmar funcionamento
*/
