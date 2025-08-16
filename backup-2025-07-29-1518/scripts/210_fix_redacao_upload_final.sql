-- 🚀 Script para verificar e corrigir upload de redações
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar estrutura das tabelas de redação
SELECT 
    'Estrutura das tabelas de redação:' as info;
    
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('redacoes', 'redacao_imagens', 'temas_redacao')
ORDER BY table_name, ordinal_position;

-- 2. Verificar se a tabela redacao_imagens existe
SELECT 
    'Status da tabela redacao_imagens:' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'redacao_imagens')
        THEN '✅ Tabela existe'
        ELSE '❌ Tabela não existe'
    END as status;

-- 3. Criar tabela redacao_imagens se não existir
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

-- 4. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_redacao_imagens_redacao_id ON redacao_imagens(redacao_id);
CREATE INDEX IF NOT EXISTS idx_redacao_imagens_ordem ON redacao_imagens(redacao_id, ordem);

-- 5. Habilitar RLS na tabela redacao_imagens
ALTER TABLE redacao_imagens ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS para redacao_imagens
DROP POLICY IF EXISTS "Usuários podem ver imagens de suas próprias redações" ON redacao_imagens;
CREATE POLICY "Usuários podem ver imagens de suas próprias redações" 
ON redacao_imagens 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 
        FROM redacoes r 
        WHERE r.id = redacao_imagens.redacao_id 
        AND r.user_uuid = auth.uid()
    )
);

DROP POLICY IF EXISTS "Usuários podem inserir imagens em suas redações" ON redacao_imagens;
CREATE POLICY "Usuários podem inserir imagens em suas redações" 
ON redacao_imagens 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM redacoes r 
        WHERE r.id = redacao_imagens.redacao_id 
        AND r.user_uuid = auth.uid()
    )
);

DROP POLICY IF EXISTS "Usuários podem atualizar imagens de suas redações" ON redacao_imagens;
CREATE POLICY "Usuários podem atualizar imagens de suas redações" 
ON redacao_imagens 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 
        FROM redacoes r 
        WHERE r.id = redacao_imagens.redacao_id 
        AND r.user_uuid = auth.uid()
    )
);

DROP POLICY IF EXISTS "Usuários podem deletar imagens de suas redações" ON redacao_imagens;
CREATE POLICY "Usuários podem deletar imagens de suas redações" 
ON redacao_imagens 
FOR DELETE 
USING (
    EXISTS (
        SELECT 1 
        FROM redacoes r 
        WHERE r.id = redacao_imagens.redacao_id 
        AND r.user_uuid = auth.uid()
    )
);

-- 7. Verificar se o bucket 'redacoes' existe
SELECT 
    'Verificando bucket de storage:' as info;
    
-- Nota: Buckets são criados via API, não via SQL
-- O bucket será criado automaticamente pela aplicação

-- 8. Verificar dados existentes
SELECT 
    'Dados existentes:' as info;
    
SELECT 
    'Redações:' as tabela,
    COUNT(*) as total
FROM redacoes;

SELECT 
    'Imagens de redação:' as tabela,
    COUNT(*) as total
FROM redacao_imagens;

-- 9. Verificar redações sem imagens
SELECT 
    'Redações sem imagens:' as info,
    COUNT(*) as total
FROM redacoes r
WHERE NOT EXISTS (
    SELECT 1 FROM redacao_imagens ri WHERE ri.redacao_id = r.id
);

-- 10. Status final
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

-- 11. Teste de inserção (opcional - descomente se quiser testar)
/*
INSERT INTO redacoes (user_uuid, titulo, tema, status) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Teste', 'Teste', 'enviada')
ON CONFLICT DO NOTHING;

INSERT INTO redacao_imagens (redacao_id, url, ordem, file_name) 
SELECT id, 'https://example.com/test.jpg', 1, 'test.jpg'
FROM redacoes 
WHERE titulo = 'Teste'
LIMIT 1;
*/ 