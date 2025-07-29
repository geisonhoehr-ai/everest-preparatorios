-- 🎯 SOLUÇÃO DEFINITIVA para RLS
-- Execute este script no SQL Editor do Supabase
-- Baseado na análise completa do problema

-- 1. DIAGNÓSTICO INICIAL
SELECT 
    '=== DIAGNÓSTICO INICIAL ===' as info;

-- Verificar se o bucket existe
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
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- 2. LIMPEZA COMPLETA
SELECT 
    '=== LIMPEZA COMPLETA ===' as info;

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

-- 3. CRIAR BUCKET SE NÃO EXISTIR
SELECT 
    '=== CRIANDO/VERIFICANDO BUCKET ===' as info;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'redacoes',
    'redacoes',
    false, -- PRIVADO
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

-- 4. CRIAR POLÍTICAS CORRETAS
SELECT 
    '=== CRIANDO POLÍTICAS CORRETAS ===' as info;

-- Política 1: INSERT (Upload) - Permitir upload para usuários autenticados
CREATE POLICY "Allow upload for authenticated users" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'redacoes');

-- Política 2: SELECT (Visualização) - Permitir visualização para usuários autenticados
CREATE POLICY "Allow view for authenticated users" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (bucket_id = 'redacoes');

-- Política 3: UPDATE (Atualização) - Permitir atualização para usuários autenticados
CREATE POLICY "Allow update for authenticated users" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'redacoes');

-- Política 4: DELETE (Exclusão) - Permitir exclusão para usuários autenticados
CREATE POLICY "Allow delete for authenticated users" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'redacoes');

-- 5. VERIFICAÇÃO FINAL
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

-- Verificar políticas criadas
SELECT 
    'Políticas criadas:' as tipo,
    policyname as nome,
    cmd as operacao,
    roles as usuarios
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%authenticated%'
ORDER BY policyname;

-- Contar total de políticas
SELECT 
    'Total de políticas:' as tipo,
    COUNT(*) as total
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%authenticated%';

-- 6. INSTRUÇÕES PARA TESTE
SELECT 
    '=== INSTRUÇÕES PARA TESTE ===' as info;

SELECT 
    '✅ Execute este script no SQL Editor do Supabase' as instrucao;
SELECT 
    '✅ Verifique se 4 políticas foram criadas' as instrucao;
SELECT 
    '✅ Teste o upload em: http://localhost:3003/redacao' as instrucao;
SELECT 
    '✅ Faça login com usuário autenticado' as instrucao;
SELECT 
    '✅ Tente fazer upload de uma imagem ou PDF' as instrucao;
SELECT 
    '✅ Verifique se não há mais erros de RLS' as instrucao;

-- 7. RESULTADO ESPERADO
SELECT 
    '=== RESULTADO ESPERADO ===' as info;

SELECT 
    '✅ 4 políticas ativas para bucket redacoes' as resultado;
SELECT 
    '✅ Bucket configurado como privado' as resultado;
SELECT 
    '✅ Upload funcionando sem erros' as resultado;
SELECT 
    '✅ Arquivos salvos no storage' as resultado;
SELECT 
    '✅ Metadados registrados no banco' as resultado; 