-- 🚀 Script simplificado para criar a tabela redacao_imagens
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar quais tabelas relacionadas a redação existem
SELECT 
    'Tabelas existentes relacionadas a redação:' as info;
    
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND (tablename LIKE '%redacao%' OR tablename LIKE '%imagem%');

-- 2. Criar a tabela redacao_imagens se não existir
CREATE TABLE IF NOT EXISTS redacao_imagens (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    redacao_id BIGINT NOT NULL REFERENCES redacoes(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    ordem INTEGER NOT NULL DEFAULT 1,
    rotation INTEGER NOT NULL DEFAULT 0,
    file_name TEXT,
    file_size BIGINT,
    mime_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_redacao_imagens_redacao_id ON redacao_imagens(redacao_id);
CREATE INDEX IF NOT EXISTS idx_redacao_imagens_ordem ON redacao_imagens(redacao_id, ordem);

-- 4. Habilitar Row Level Security
ALTER TABLE redacao_imagens ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS básicas
-- Política para SELECT
CREATE POLICY "Usuários podem ver imagens de suas próprias redações" 
ON redacao_imagens 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 
        FROM redacoes r 
        WHERE r.id = redacao_imagens.redacao_id 
        AND (r.aluno_id = auth.uid() OR r.professor_id = auth.uid())
    )
);

-- Política para INSERT
CREATE POLICY "Usuários podem inserir imagens em suas redações" 
ON redacao_imagens 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM redacoes r 
        WHERE r.id = redacao_imagens.redacao_id 
        AND r.aluno_id = auth.uid()
    )
);

-- Política para UPDATE
CREATE POLICY "Usuários podem atualizar imagens de suas redações" 
ON redacao_imagens 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 
        FROM redacoes r 
        WHERE r.id = redacao_imagens.redacao_id 
        AND (r.aluno_id = auth.uid() OR r.professor_id = auth.uid())
    )
);

-- Política para DELETE
CREATE POLICY "Usuários podem deletar imagens de suas redações" 
ON redacao_imagens 
FOR DELETE 
USING (
    EXISTS (
        SELECT 1 
        FROM redacoes r 
        WHERE r.id = redacao_imagens.redacao_id 
        AND (r.aluno_id = auth.uid() OR r.professor_id = auth.uid())
    )
);

-- 6. Verificar se a tabela foi criada com sucesso
SELECT 
    'Status da criação:' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'redacao_imagens')
        THEN '✅ Tabela redacao_imagens criada com sucesso'
        ELSE '❌ Erro ao criar tabela redacao_imagens'
    END as status;

-- 7. Verificar estrutura da tabela
SELECT 
    'Estrutura da tabela redacao_imagens:' as info;
    
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'redacao_imagens' 
ORDER BY ordinal_position;

-- 8. Verificar políticas RLS
SELECT 
    'Políticas RLS da tabela redacao_imagens:' as info;
    
SELECT 
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'redacao_imagens'
ORDER BY policyname;

-- 9. Status final
SELECT 
    'Status Final' as sistema,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'redacao_imagens')
        THEN '✅ Tabela redacao_imagens existe'
        ELSE '❌ Tabela redacao_imagens não existe'
    END as tabela,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'redacao_imagens')
        THEN '✅ RLS configurado'
        ELSE '❌ RLS não configurado'
    END as rls,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'redacao_imagens')
        THEN '✅ Índices criados'
        ELSE '❌ Índices não criados'
    END as indices;