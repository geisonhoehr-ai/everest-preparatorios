-- Script para adicionar a coluna tempo_estimado que está faltando na tabela questoes

-- Adicionar a coluna tempo_estimado se ela não existir
ALTER TABLE questoes 
ADD COLUMN IF NOT EXISTS tempo_estimado INTEGER DEFAULT 60;

-- Verificar se a coluna foi adicionada
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'questoes' 
AND column_name = 'tempo_estimado';

-- Atualizar registros existentes que podem ter NULL
UPDATE questoes 
SET tempo_estimado = 60 
WHERE tempo_estimado IS NULL;

-- Verificar o resultado
SELECT 
    'Coluna tempo_estimado adicionada com sucesso!' as status,
    COUNT(*) as total_questoes
FROM questoes; 