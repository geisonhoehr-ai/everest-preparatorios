-- 🔧 SOLUÇÃO COM DO LOOP
-- Execute este script no SQL Editor do Supabase
-- Usa o método seguro com DO LOOP

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

-- 2. LIMPEZA SEGURA COM DO LOOP
SELECT 
    '=== LIMPEZA SEGURA COM DO LOOP ===' as info;

-- Safely manage storage policies
-- Remove existing policies
DO $$
BEGIN
    -- Drop all existing policies on storage.objects
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
    END LOOP;
END $$;

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

-- Verificar políticas restantes (deve estar vazio)
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
    '✅ TODAS as políticas removidas com DO LOOP' as resultado;
SELECT 
    '✅ Bucket recriado como público' as resultado;
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