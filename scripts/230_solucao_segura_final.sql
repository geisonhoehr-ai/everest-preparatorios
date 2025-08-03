-- 🔧 SOLUÇÃO SEGURA FINAL
-- Execute este script no SQL Editor do Supabase
-- Resolve o erro de DELETE FROM pg_policies

-- 1. DIAGNÓSTICO
SELECT 
    '=== DIAGNÓSTICO ===' as info;

-- Verificar bucket atual
SELECT 
    'Bucket redacoes:' as tipo,
    name as nome,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'redacoes';

-- Verificar políticas existentes
SELECT 
    'Políticas existentes:' as tipo,
    policyname as nome,
    cmd as operacao,
    roles as usuarios
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY policyname;

-- 2. LIMPEZA SEGURA
SELECT 
    '=== LIMPEZA SEGURA ===' as info;

-- Remover políticas conhecidas (método seguro)
DROP POLICY IF EXISTS "Allow authenticated users to manage redacoes files" ON storage.objects;
DROP POLICY IF EXISTS "Allow all authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload to redacoes" ON storage.objects;
DROP POLICY IF EXISTS "Allow view redacoes files" ON storage.objects;
DROP POLICY IF EXISTS "Allow update redacoes files" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete redacoes files" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload para usuários autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir visualização para usuários autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização para usuários autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão para usuários autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem fazer upload de arquivos de redação" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem ver arquivos de suas redações" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar arquivos de suas redações" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar arquivos de suas redações" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload files to redacoes bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can view files in redacoes bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can update files in redacoes bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete files in redacoes bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow all users" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Allow view for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "temp_allow_all_uploads" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_upload_redacoes" ON storage.objects;
DROP POLICY IF EXISTS "emergency_upload_policy" ON storage.objects;

-- 3. RECRIAR BUCKET
SELECT 
    '=== RECRIANDO BUCKET ===' as info;

-- Deletar bucket se existir
DELETE FROM storage.buckets WHERE name = 'redacoes';

-- Criar bucket como PÚBLICO
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'redacoes',
    'redacoes',
    true, -- PÚBLICO
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
);

-- 4. VERIFICAÇÃO
SELECT 
    '=== VERIFICAÇÃO ===' as info;

-- Verificar bucket
SELECT 
    'Bucket redacoes:' as tipo,
    name as nome,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'redacoes';

-- Verificar políticas restantes
SELECT 
    'Políticas restantes:' as tipo,
    COUNT(*) as total
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- 5. INSTRUÇÕES
SELECT 
    '=== INSTRUÇÕES ===' as info;

SELECT 
    '✅ Bucket recriado como público' as resultado;
SELECT 
    '✅ Políticas conhecidas removidas' as resultado;
SELECT 
    '✅ Agora limpe os cookies COMPLETAMENTE' as resultado;
SELECT 
    '✅ Use modo privado/anônimo' as resultado;
SELECT 
    '✅ Teste o upload' as resultado;

-- 6. CÓDIGO DE TESTE
SELECT 
    '=== CÓDIGO DE TESTE ===' as info;

SELECT 
    '// Execute no console do navegador (modo privado):' as codigo;
SELECT 
    'const testFile = new File(["test"], "test.txt", { type: "text/plain" });' as codigo;
SELECT 
    'const { data, error } = await supabase.storage.from("redacoes").upload("test.txt", testFile);' as codigo;
SELECT 
    'console.log("Resultado:", { data, error });' as codigo;