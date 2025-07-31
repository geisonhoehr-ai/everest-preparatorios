-- Script para corrigir a estrutura da tabela redacoes
-- Adicionar colunas que estão faltando

-- Adicionar coluna tema_id se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'redacoes' AND column_name = 'tema_id'
    ) THEN
        ALTER TABLE redacoes ADD COLUMN tema_id INTEGER;
    END IF;
END $$;

-- Adicionar coluna observacoes se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'redacoes' AND column_name = 'observacoes'
    ) THEN
        ALTER TABLE redacoes ADD COLUMN observacoes TEXT;
    END IF;
END $$;

-- Adicionar coluna imagens se não existir (para armazenar array de URLs)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'redacoes' AND column_name = 'imagens'
    ) THEN
        ALTER TABLE redacoes ADD COLUMN imagens JSONB;
    END IF;
END $$;

-- Adicionar coluna total_imagens se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'redacoes' AND column_name = 'total_imagens'
    ) THEN
        ALTER TABLE redacoes ADD COLUMN total_imagens INTEGER DEFAULT 0;
    END IF;
END $$;

-- Verificar estrutura atual da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'redacoes' 
ORDER BY ordinal_position;

-- Verificar se as políticas RLS estão corretas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'redacoes'; 