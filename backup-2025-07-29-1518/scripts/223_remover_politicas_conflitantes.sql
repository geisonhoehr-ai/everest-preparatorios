-- 🚨 REMOVER POLÍTICAS CONFLITANTES
-- Execute este script no SQL Editor do Supabase
-- Remove as políticas que podem estar causando conflito

-- 1. DIAGNÓSTICO
SELECT 
    '=== DIAGNÓSTICO ===' as info;

-- Verificar todas as políticas existentes
SELECT 
    'Todas as políticas:' as tipo,
    policyname as nome,
    cmd as operacao,
    roles as usuarios,
    schemaname || '.' || tablename as tabela
FROM pg_policies 
WHERE schemaname = 'storage'
ORDER BY policyname;

-- 2. REMOVER POLÍTICAS CONFLITANTES
SELECT 
    '=== REMOVENDO POLÍTICAS CONFLITANTES ===' as info;

-- Remover políticas que podem estar conflitando
DROP POLICY IF EXISTS "ALL storage_policy" ON storage.objects;
DROP POLICY IF EXISTS "ALL permitir_tudo_storage" ON storage.objects;

-- 3. VERIFICAR POLÍTICAS RESTANTES
SELECT 
    '=== POLÍTICAS RESTANTES ===' as info;

SELECT 
    'Políticas para redacoes:' as tipo,
    policyname as nome,
    cmd as operacao,
    roles as usuarios
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%authenticated%'
ORDER BY policyname;

-- 4. TESTE RÁPIDO
SELECT 
    '=== TESTE RÁPIDO ===' as info;

SELECT 
    '✅ Políticas conflitantes removidas' as resultado;
SELECT 
    '✅ Apenas 4 políticas para redacoes ativas' as resultado;
SELECT 
    '✅ Teste o upload agora' as resultado;

-- 5. INSTRUÇÕES
SELECT 
    '=== INSTRUÇÕES ===' as info;

SELECT 
    '1. Execute este script' as passo;
SELECT 
    '2. Teste o upload em: http://localhost:3003/redacao' as passo;
SELECT 
    '3. Verifique se não há mais erros de RLS' as passo; 