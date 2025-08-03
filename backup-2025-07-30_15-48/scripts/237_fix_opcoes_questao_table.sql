-- Script para corrigir a tabela opcoes_questao e adicionar a coluna is_correta

-- 1. Adicionar a coluna is_correta se ela não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'opcoes_questao' 
        AND column_name = 'is_correta'
    ) THEN
        ALTER TABLE opcoes_questao ADD COLUMN is_correta boolean DEFAULT false NOT NULL;
        RAISE NOTICE 'Coluna is_correta adicionada à tabela opcoes_questao';
    ELSE
        RAISE NOTICE 'Coluna is_correta já existe na tabela opcoes_questao';
    END IF;
END $$;

-- 2. Verificar a estrutura atual da tabela opcoes_questao
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'opcoes_questao'
ORDER BY ordinal_position;

-- 3. Verificar se há dados existentes na tabela
SELECT 
    'Dados existentes em opcoes_questao:' as info,
    COUNT(*) as total_registros
FROM opcoes_questao;

-- 4. Se houver dados existentes, definir is_correta como false para registros antigos
UPDATE opcoes_questao 
SET is_correta = false 
WHERE is_correta IS NULL;

-- 5. Verificar se a coluna foi adicionada corretamente
SELECT 
    'Verificação da coluna is_correta:' as info,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'opcoes_questao' 
            AND column_name = 'is_correta'
        ) THEN '✅ Coluna is_correta existe'
        ELSE '❌ Coluna is_correta não existe'
    END as status;