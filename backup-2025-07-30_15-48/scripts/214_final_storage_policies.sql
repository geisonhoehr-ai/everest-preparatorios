-- 🚀 Políticas RLS FINAIS para o bucket 'redacoes'
-- Execute estas políticas no painel do Supabase > Storage > Policies

-- 1. Política para INSERT (upload de arquivos)
CREATE POLICY "Users can upload files to redacoes bucket" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
    bucket_id = 'redacoes' 
    AND auth.uid() IS NOT NULL
);

-- 2. Política para SELECT (visualização/download de arquivos)
CREATE POLICY "Users can view files in redacoes bucket" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (
    bucket_id = 'redacoes' 
    AND auth.uid() IS NOT NULL
);

-- 3. Política para UPDATE (atualização de arquivos)
CREATE POLICY "Users can update files in redacoes bucket" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (
    bucket_id = 'redacoes' 
    AND auth.uid() IS NOT NULL
);

-- 4. Política para DELETE (exclusão de arquivos)
CREATE POLICY "Users can delete files in redacoes bucket" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (
    bucket_id = 'redacoes' 
    AND auth.uid() IS NOT NULL
);

-- 5. Verificar se as políticas foram criadas
SELECT 
    'Políticas RLS criadas para storage.objects:' as info;

SELECT 
    policyname as nome,
    cmd as operacao,
    roles as usuarios
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%redacoes%'
ORDER BY policyname;

-- 6. Verificar se o bucket existe e está configurado
SELECT 
    'Status do bucket redacoes:' as info,
    name as nome,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'redacoes'; 