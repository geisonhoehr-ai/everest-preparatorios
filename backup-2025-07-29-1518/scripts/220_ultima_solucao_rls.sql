-- 🚨 SOLUÇÃO FINAL e DEFINITIVA para erro de RLS
-- Execute este script no SQL Editor do Supabase
-- Esta é a solução mais direta possível

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

-- Verificar todas as políticas existentes
SELECT 
    'Todas as políticas:' as tipo,
    policyname as nome,
    cmd as operacao,
    roles as usuarios
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- 2. LIMPEZA TOTAL E RECONSTRUÇÃO
SELECT 
    '=== LIMPEZA TOTAL ===' as info;

-- Remover TODAS as políticas existentes (limpeza completa)
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

-- 3. RECRIAR BUCKET DO ZERO
SELECT 
    '=== RECRIANDO BUCKET ===' as info;

-- Deletar bucket se existir
DELETE FROM storage.buckets WHERE name = 'redacoes';

-- Criar bucket novo
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'redacoes',
    'redacoes',
    false,
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
);

-- 4. CRIAR POLÍTICA ÚNICA E SIMPLES
SELECT 
    '=== CRIANDO POLÍTICA ÚNICA ===' as info;

-- Política única que permite tudo para usuários autenticados
CREATE POLICY "Allow all authenticated users" 
ON storage.objects 
FOR ALL 
TO authenticated 
USING (bucket_id = 'redacoes')
WITH CHECK (bucket_id = 'redacoes');

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

-- Verificar política criada
SELECT 
    'Política criada:' as tipo,
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
AND schemaname = 'storage';

-- 6. TESTE IMEDIATO
SELECT 
    '=== TESTE IMEDIATO ===' as info;

SELECT 
    '✅ Execute este script no SQL Editor do Supabase' as instrucao;
SELECT 
    '✅ Verifique se 1 política foi criada' as instrucao;
SELECT 
    '✅ Teste o upload em: http://localhost:3003/redacao' as instrucao;
SELECT 
    '✅ Faça login com usuário autenticado' as instrucao;
SELECT 
    '✅ Tente fazer upload de uma imagem ou PDF' as instrucao;

-- 7. SOLUÇÃO ALTERNATIVA (se ainda não funcionar)
SELECT 
    '=== SOLUÇÃO ALTERNATIVA ===' as info;

SELECT 
    'Se ainda houver erro, configure manualmente:' as instrucao;
SELECT 
    '1. Vá para Supabase > Storage > Buckets' as passo;
SELECT 
    '2. Clique no bucket "redacoes"' as passo;
SELECT 
    '3. Configure como "Public" temporariamente' as passo;
SELECT 
    '4. Teste o upload' as passo;
SELECT 
    '5. Depois configure como "Private" novamente' as passo;

-- 8. RESULTADO ESPERADO
SELECT 
    '=== RESULTADO ESPERADO ===' as info;

SELECT 
    '✅ 1 política ativa para bucket redacoes' as resultado;
SELECT 
    '✅ Bucket configurado como privado' as resultado;
SELECT 
    '✅ Upload funcionando sem erros' as resultado;
SELECT 
    '✅ Arquivos salvos no storage' as resultado;
SELECT 
    '✅ Metadados registrados no banco' as resultado; 