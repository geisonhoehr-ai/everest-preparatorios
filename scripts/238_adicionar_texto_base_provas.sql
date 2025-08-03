-- Script para adicionar campo texto_base na tabela provas

-- 1. Adicionar coluna texto_base na tabela provas
ALTER TABLE provas 
ADD COLUMN IF NOT EXISTS texto_base TEXT,
ADD COLUMN IF NOT EXISTS tem_texto_base BOOLEAN DEFAULT false;

-- 2. Adicionar coluna para título do texto base
ALTER TABLE provas 
ADD COLUMN IF NOT EXISTS titulo_texto_base VARCHAR(255);

-- 3. Adicionar coluna para fonte do texto base
ALTER TABLE provas 
ADD COLUMN IF NOT EXISTS fonte_texto_base VARCHAR(500);

-- 4. Verificar se as colunas foram adicionadas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'provas' 
AND column_name IN ('texto_base', 'tem_texto_base', 'titulo_texto_base', 'fonte_texto_base')
ORDER BY ordinal_position;

-- 5. Atualizar provas existentes para não ter texto base por padrão
UPDATE provas 
SET tem_texto_base = false 
WHERE tem_texto_base IS NULL;

-- 6. Verificar estrutura final da tabela provas
SELECT 
    'Estrutura da tabela provas:' as info,
    COUNT(*) as total_colunas
FROM information_schema.columns 
WHERE table_name = 'provas';

-- 7. Mostrar exemplo de como ficará
SELECT 
    'Exemplo de uso:' as info,
    'tem_texto_base = true para provas de interpretação' as exemplo1,
    'tem_texto_base = false para provas diretas (V/F, múltipla escolha)' as exemplo2;