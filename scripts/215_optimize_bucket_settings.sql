-- 🚀 Script para otimizar configurações do bucket 'redacoes'
-- Execute este script no SQL Editor do Supabase

-- 1. Atualizar configurações do bucket para melhor performance
UPDATE storage.buckets 
SET 
    public = false,  -- Mudar para privado por segurança
    file_size_limit = 52428800,  -- Aumentar para 50MB
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
WHERE name = 'redacoes';

-- 2. Verificar se as alterações foram aplicadas
SELECT 
    'Configurações otimizadas do bucket:' as info,
    name as nome,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'redacoes';

-- 3. Verificar se as políticas RLS estão configuradas
SELECT 
    'Políticas RLS para storage.objects:' as info;

SELECT 
    policyname as nome,
    cmd as operacao,
    roles as usuarios
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%redacoes%'
ORDER BY policyname;

-- 4. Se não houver políticas, criar as básicas
DO $$
BEGIN
    -- Verificar se existem políticas para o bucket redacoes
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage'
        AND policyname LIKE '%redacoes%'
    ) THEN
        -- Criar política para INSERT
        EXECUTE 'CREATE POLICY "Users can upload files to redacoes bucket" 
                 ON storage.objects 
                 FOR INSERT 
                 TO authenticated 
                 WITH CHECK (bucket_id = ''redacoes'' AND auth.uid() IS NOT NULL)';
        
        -- Criar política para SELECT
        EXECUTE 'CREATE POLICY "Users can view files in redacoes bucket" 
                 ON storage.objects 
                 FOR SELECT 
                 TO authenticated 
                 USING (bucket_id = ''redacoes'' AND auth.uid() IS NOT NULL)';
        
        -- Criar política para UPDATE
        EXECUTE 'CREATE POLICY "Users can update files in redacoes bucket" 
                 ON storage.objects 
                 FOR UPDATE 
                 TO authenticated 
                 USING (bucket_id = ''redacoes'' AND auth.uid() IS NOT NULL)';
        
        -- Criar política para DELETE
        EXECUTE 'CREATE POLICY "Users can delete files in redacoes bucket" 
                 ON storage.objects 
                 FOR DELETE 
                 TO authenticated 
                 USING (bucket_id = ''redacoes'' AND auth.uid() IS NOT NULL)';
        
        RAISE NOTICE 'Políticas RLS criadas automaticamente para o bucket redacoes';
    ELSE
        RAISE NOTICE 'Políticas RLS já existem para o bucket redacoes';
    END IF;
END $$;

-- 5. Verificar estrutura final
SELECT 
    'Status final do sistema de redações:' as info;

SELECT 
    'Bucket configurado:' as tipo,
    name as nome,
    public,
    file_size_limit,
    array_length(allowed_mime_types, 1) as tipos_permitidos
FROM storage.buckets 
WHERE name = 'redacoes';

SELECT 
    'Políticas ativas:' as tipo,
    COUNT(*) as total_politicas
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%redacoes%';

SELECT 
    'Tabela redacao_imagens:' as tipo,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'redacao_imagens')
        THEN '✅ Criada'
        ELSE '❌ Não criada'
    END as status; 