-- 🚨 POLÍTICA DE EMERGÊNCIA - SOLUÇÃO DEFINITIVA
-- Execute este script no SQL Editor do Supabase
-- Esta é a solução mais permissiva possível para resolver o erro

-- 1. LIMPEZA TOTAL
SELECT 
    '=== LIMPEZA TOTAL ===' as info;

-- Remover TODAS as políticas existentes
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

-- 2. CRIAR POLÍTICA DE EMERGÊNCIA
SELECT 
    '=== CRIANDO POLÍTICA DE EMERGÊNCIA ===' as info;

-- Política de emergência (MUITO PERMISSIVA)
CREATE POLICY "emergency_upload_policy" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'redacoes')
WITH CHECK (bucket_id = 'redacoes');

-- 3. VERIFICAR POLÍTICA CRIADA
SELECT 
    '=== VERIFICANDO POLÍTICA ===' as info;

SELECT 
    'Política de emergência:' as tipo,
    policyname as nome,
    cmd as operacao,
    roles as usuarios
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname = 'emergency_upload_policy';

-- 4. VERIFICAR BUCKET
SELECT 
    '=== VERIFICANDO BUCKET ===' as info;

SELECT 
    'Bucket redacoes:' as tipo,
    name as nome,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'redacoes';

-- 5. INSTRUÇÕES PARA TESTE
SELECT 
    '=== INSTRUÇÕES PARA TESTE ===' as info;

SELECT 
    '✅ Política de emergência criada' as resultado;
SELECT 
    '✅ Teste o upload imediatamente' as resultado;
SELECT 
    '✅ Se funcionar, o problema era a política' as resultado;
SELECT 
    '⚠️ Esta política é muito permissiva - use apenas para teste!' as aviso;

-- 6. CÓDIGO DE TESTE RÁPIDO
SELECT 
    '=== CÓDIGO DE TESTE RÁPIDO ===' as info;

SELECT 
    '// Execute no console do navegador:' as codigo;
SELECT 
    'const testFile = new File(["test"], "test.txt", { type: "text/plain" });' as codigo;
SELECT 
    'const { data, error } = await supabase.storage.from("redacoes").upload("test.txt", testFile);' as codigo;
SELECT 
    'console.log("Resultado:", { data, error });' as codigo;