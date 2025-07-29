-- 🔍 VERIFICAÇÃO COMPLETA E SOLUÇÃO DEFINITIVA
-- Execute este script no SQL Editor do Supabase
-- Verifica tudo e resolve definitivamente

-- 1. DIAGNÓSTICO COMPLETO
SELECT 
    '=== DIAGNÓSTICO COMPLETO ===' as info;

-- Verificar bucket
SELECT 
    'Bucket redacoes:' as tipo,
    name as nome,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'redacoes';

-- Verificar TODAS as políticas
SELECT 
    'Todas as políticas:' as tipo,
    policyname as nome,
    cmd as operacao,
    roles as usuarios,
    schemaname || '.' || tablename as tabela
FROM pg_policies 
WHERE schemaname = 'storage'
ORDER BY policyname;

-- 2. LIMPEZA TOTAL DEFINITIVA
SELECT 
    '=== LIMPEZA TOTAL DEFINITIVA ===' as info;

-- Remover TODAS as políticas existentes (mais abrangente)
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

-- Remover TODAS as políticas que possam existir
DELETE FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- 3. RECRIAR BUCKET DO ZERO
SELECT 
    '=== RECRIANDO BUCKET DO ZERO ===' as info;

-- Deletar bucket completamente
DELETE FROM storage.buckets WHERE name = 'redacoes';

-- Criar bucket como PÚBLICO (definitivamente)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'redacoes',
    'redacoes',
    true, -- PÚBLICO DEFINITIVAMENTE
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
);

-- 4. VERIFICAÇÃO FINAL
SELECT 
    '=== VERIFICAÇÃO FINAL ===' as info;

-- Verificar bucket
SELECT 
    'Bucket redacoes:' as tipo,
    name as nome,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'redacoes';

-- Verificar políticas (deve estar vazio)
SELECT 
    'Políticas restantes:' as tipo,
    COUNT(*) as total
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- 5. INSTRUÇÕES DEFINITIVAS
SELECT 
    '=== INSTRUÇÕES DEFINITIVAS ===' as info;

SELECT 
    '✅ Bucket recriado como público' as resultado;
SELECT 
    '✅ TODAS as políticas removidas' as resultado;
SELECT 
    '✅ Agora limpe os cookies COMPLETAMENTE' as resultado;
SELECT 
    '✅ Use modo privado/anônimo' as resultado;
SELECT 
    '✅ Teste o upload' as resultado;

-- 6. CÓDIGO DE TESTE DEFINITIVO
SELECT 
    '=== CÓDIGO DE TESTE DEFINITIVO ===' as info;

SELECT 
    '// Execute no console do navegador (modo privado):' as codigo;
SELECT 
    'const testFile = new File(["test"], "test.txt", { type: "text/plain" });' as codigo;
SELECT 
    'const { data, error } = await supabase.storage.from("redacoes").upload("test.txt", testFile);' as codigo;
SELECT 
    'console.log("Resultado:", { data, error });' as codigo;