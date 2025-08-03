-- 🧪 TESTE COM POLÍTICA PERMISSIVA
-- Execute este script no SQL Editor do Supabase
-- ⚠️ IMPORTANTE: Esta é só para testar! Remova depois.

-- 1. REMOVER POLÍTICA ATUAL DE INSERT
SELECT 
    '=== REMOVENDO POLÍTICA ATUAL ===' as info;

DROP POLICY IF EXISTS "Allow upload for authenticated users" ON storage.objects;

-- 2. CRIAR POLÍTICA TEMPORÁRIA PERMISSIVA
SELECT 
    '=== CRIANDO POLÍTICA TEMPORÁRIA ===' as info;

-- Política temporária para debug (MUITO PERMISSIVA)
CREATE POLICY "temp_allow_all_uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (true);

-- 3. VERIFICAR POLÍTICAS ATIVAS
SELECT 
    '=== POLÍTICAS ATIVAS ===' as info;

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

-- 4. INSTRUÇÕES PARA TESTE
SELECT 
    '=== INSTRUÇÕES PARA TESTE ===' as info;

SELECT 
    '✅ Política temporária criada' as resultado;
SELECT 
    '✅ Teste o upload agora' as resultado;
SELECT 
    '✅ Se funcionar, o problema era a política' as resultado;
SELECT 
    '⚠️ REMOVA esta política depois do teste!' as aviso;

-- 5. CÓDIGO PARA REMOVER DEPOIS DO TESTE
SELECT 
    '=== CÓDIGO PARA REMOVER DEPOIS ===' as info;

SELECT 
    'DROP POLICY "temp_allow_all_uploads" ON storage.objects;' as comando_remover;