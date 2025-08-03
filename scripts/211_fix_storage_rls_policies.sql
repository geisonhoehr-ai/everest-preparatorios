-- 🚀 Script para corrigir políticas RLS do Storage para redações
-- Execute este script no SQL Editor do Supabase

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

-- 2. Criar bucket 'redacoes' se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'redacoes',
    'redacoes',
    false,
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- 3. Habilitar RLS no bucket
UPDATE storage.buckets 
SET public = false 
WHERE name = 'redacoes';

-- 4. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Usuários podem fazer upload de arquivos de redação" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem ver arquivos de suas redações" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar arquivos de suas redações" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar arquivos de suas redações" ON storage.objects;

-- 5. Criar política para INSERT (upload)
CREATE POLICY "Usuários podem fazer upload de arquivos de redação" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
    bucket_id = 'redacoes' 
    AND auth.uid() IS NOT NULL
);

-- 6. Criar política para SELECT (download/visualização)
CREATE POLICY "Usuários podem ver arquivos de suas redações" 
ON storage.objects 
FOR SELECT 
USING (
    bucket_id = 'redacoes' 
    AND (
        -- Usuário pode ver arquivos de suas próprias redações
        EXISTS (
            SELECT 1 
            FROM redacoes r 
            JOIN redacao_imagens ri ON r.id = ri.redacao_id 
            WHERE ri.file_name = storage.objects.name 
            AND r.user_uuid = auth.uid()
        )
        OR
        -- Professores podem ver arquivos de redações de seus alunos
        EXISTS (
            SELECT 1 
            FROM redacoes r 
            JOIN redacao_imagens ri ON r.id = ri.redacao_id 
            WHERE ri.file_name = storage.objects.name 
            AND r.professor_uuid = auth.uid()
        )
    )
);

-- 7. Criar política para UPDATE
CREATE POLICY "Usuários podem atualizar arquivos de suas redações" 
ON storage.objects 
FOR UPDATE 
USING (
    bucket_id = 'redacoes' 
    AND EXISTS (
        SELECT 1 
        FROM redacoes r 
        JOIN redacao_imagens ri ON r.id = ri.redacao_id 
        WHERE ri.file_name = storage.objects.name 
        AND r.user_uuid = auth.uid()
    )
);

-- 8. Criar política para DELETE
CREATE POLICY "Usuários podem deletar arquivos de suas redações" 
ON storage.objects 
FOR DELETE 
USING (
    bucket_id = 'redacoes' 
    AND EXISTS (
        SELECT 1 
        FROM redacoes r 
        JOIN redacao_imagens ri ON r.id = ri.redacao_id 
        WHERE ri.file_name = storage.objects.name 
        AND r.user_uuid = auth.uid()
    )
);

-- 9. Verificar políticas criadas
SELECT 
    'Políticas RLS criadas para storage.objects:' as info;

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
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- 10. Verificar se RLS está habilitado
SELECT 
    'Status RLS no storage.objects:' as info,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM pg_tables 
            WHERE schemaname = 'storage' 
            AND tablename = 'objects' 
            AND rowsecurity = true
        )
        THEN '✅ RLS habilitado'
        ELSE '❌ RLS desabilitado'
    END as status;

-- 11. Habilitar RLS se não estiver habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 12. Teste final - verificar estrutura completa
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

SELECT 
    'Políticas RLS:' as tipo,
    policyname as nome,
    cmd as operacao
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname; 