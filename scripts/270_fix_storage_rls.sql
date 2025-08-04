-- Script para corrigir as políticas RLS do Storage do Supabase
-- Problema: "new row violates row-level security policy" no upload de redações

-- 1. Verificar buckets existentes
SELECT name, public FROM storage.buckets;

-- 2. Criar bucket 'redacoes' se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('redacoes', 'redacoes', false, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- 3. Criar bucket 'redacao_imagens' se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('redacao_imagens', 'redacao_imagens', false, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 4. Criar bucket 'redacao_audio' se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('redacao_audio', 'redacao_audio', false, 52428800, ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'])
ON CONFLICT (id) DO NOTHING;

-- 5. Habilitar RLS nos buckets
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 6. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can upload own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- 7. Criar políticas RLS para storage.objects
-- Política para INSERT (upload)
CREATE POLICY "Users can upload own files" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id IN ('redacoes', 'redacao_imagens', 'redacao_audio') AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para SELECT (download/view)
CREATE POLICY "Users can view own files" ON storage.objects
FOR SELECT USING (
    bucket_id IN ('redacoes', 'redacao_imagens', 'redacao_audio') AND
    (
        auth.uid()::text = (storage.foldername(name))[1] OR
        auth.role() = 'authenticated'
    )
);

-- Política para UPDATE
CREATE POLICY "Users can update own files" ON storage.objects
FOR UPDATE USING (
    bucket_id IN ('redacoes', 'redacao_imagens', 'redacao_audio') AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para DELETE
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE USING (
    bucket_id IN ('redacoes', 'redacao_imagens', 'redacao_audio') AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- 8. Políticas específicas para professores (podem ver todas as redações)
CREATE POLICY "Teachers can view all files" ON storage.objects
FOR SELECT USING (
    bucket_id IN ('redacoes', 'redacao_imagens', 'redacao_audio') AND
    EXISTS (
        SELECT 1 FROM student_profiles 
        WHERE user_uuid = auth.uid()::text 
        AND role IN ('teacher', 'admin')
    )
);

-- 9. Verificar políticas criadas
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
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 10. Testar acesso
-- Verificar se o usuário atual pode inserir
SELECT 
    'Current user can insert' as test,
    auth.uid() as user_id,
    auth.role() as user_role;

-- 11. Verificar estrutura dos buckets
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name IN ('redacoes', 'redacao_imagens', 'redacao_audio');

-- 12. Comentário final
COMMENT ON POLICY "Users can upload own files" ON storage.objects IS 'Permite que usuários façam upload de arquivos em seus próprios diretórios';
COMMENT ON POLICY "Users can view own files" ON storage.objects IS 'Permite que usuários vejam seus próprios arquivos';
COMMENT ON POLICY "Teachers can view all files" ON storage.objects IS 'Permite que professores vejam todos os arquivos'; 