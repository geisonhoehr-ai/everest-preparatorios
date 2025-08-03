-- Script para adicionar a coluna created_by que está faltando na tabela members
-- Verificar estrutura atual da tabela
SELECT 
    'Estrutura atual da tabela members:' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'members'
ORDER BY ordinal_position;

-- Adicionar a coluna created_by se ela não existir
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Adicionar outras colunas que podem estar faltando
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Verificar se as colunas foram adicionadas
SELECT 
    'Verificando colunas após correção:' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'members'
ORDER BY ordinal_position;

-- Atualizar registros existentes que podem ter created_by NULL
UPDATE members 
SET created_by = auth.uid()
WHERE created_by IS NULL
AND auth.uid() IS NOT NULL;

-- Verificar se tudo foi corrigido
SELECT 
    'Correção completa!' as info,
    'Coluna created_by adicionada com sucesso' as status,
    COUNT(*) as total_members
FROM members; 