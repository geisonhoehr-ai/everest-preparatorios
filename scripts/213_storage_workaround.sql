-- 🚀 Script ALTERNATIVO para resolver problema de storage
-- Execute este script no SQL Editor do Supabase
-- Este script não modifica diretamente as políticas RLS do storage

-- 1. Verificar se o bucket 'redacoes' existe
SELECT 
    'Status do bucket redacoes:' as info,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM storage.buckets 
            WHERE name = 'redacoes'
        )
        THEN '✅ Bucket existe'
        ELSE '❌ Bucket não existe'
    END as status;

-- 2. Criar bucket 'redacoes' se não existir (isso deve funcionar)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'redacoes',
    'redacoes',
    false,
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- 3. Verificar se a tabela redacao_imagens existe
SELECT 
    'Status da tabela redacao_imagens:' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'redacao_imagens')
        THEN '✅ Tabela existe'
        ELSE '❌ Tabela não existe'
    END as status;

-- 4. Criar tabela redacao_imagens se não existir
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

-- 5. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_redacao_imagens_redacao_id ON redacao_imagens(redacao_id);
CREATE INDEX IF NOT EXISTS idx_redacao_imagens_ordem ON redacao_imagens(redacao_id, ordem);

-- 6. Habilitar RLS na tabela redacao_imagens (isso deve funcionar)
ALTER TABLE redacao_imagens ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas RLS para redacao_imagens (isso deve funcionar)
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

-- 8. Verificar estrutura final
SELECT 
    'Estrutura final do sistema de redações:' as info;

SELECT 
    'Tabelas:' as tipo,
    table_name as nome
FROM information_schema.tables 
WHERE table_name IN ('redacoes', 'redacao_imagens', 'temas_redacao')
ORDER BY table_name;

SELECT 
    'Bucket de storage:' as tipo,
    name as nome,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'redacoes';

-- 9. Instruções para configurar storage manualmente
SELECT 
    'INSTRUÇÕES PARA CONFIGURAR STORAGE MANUALMENTE:' as info;

SELECT 
    '1. Vá para o painel do Supabase > Storage' as instrucao;
SELECT 
    '2. Clique em "New bucket" e crie um bucket chamado "redacoes"' as instrucao;
SELECT 
    '3. Configure o bucket como "Private"' as instrucao;
SELECT 
    '4. Em "Policies", adicione as seguintes políticas:' as instrucao;
SELECT 
    '   - INSERT: bucket_id = "redacoes" AND auth.uid() IS NOT NULL' as politica;
SELECT 
    '   - SELECT: bucket_id = "redacoes" AND auth.uid() IS NOT NULL' as politica;
SELECT 
    '   - UPDATE: bucket_id = "redacoes" AND auth.uid() IS NOT NULL' as politica;
SELECT 
    '   - DELETE: bucket_id = "redacoes" AND auth.uid() IS NOT NULL' as politica; 