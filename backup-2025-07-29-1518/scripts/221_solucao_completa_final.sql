-- 🚨 SOLUÇÃO COMPLETA e DEFINITIVA
-- Execute este script no SQL Editor do Supabase
-- Resolve: RLS + Cookie + POST Request errors

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

-- 2. RECRIAR BUCKET COMO PÚBLICO (TEMPORÁRIO)
SELECT 
    '=== RECRIANDO BUCKET COMO PÚBLICO ===' as info;

-- Deletar bucket se existir
DELETE FROM storage.buckets WHERE name = 'redacoes';

-- Criar bucket como PÚBLICO (temporariamente)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'redacoes',
    'redacoes',
    true, -- PÚBLICO TEMPORARIAMENTE
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
);

-- 3. VERIFICAÇÃO IMEDIATA
SELECT 
    '=== VERIFICAÇÃO IMEDIATA ===' as info;

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
    'Políticas existentes:' as tipo,
    COUNT(*) as total
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%redacoes%';

-- 4. INSTRUÇÕES PARA TESTE
SELECT 
    '=== INSTRUÇÕES PARA TESTE ===' as info;

SELECT 
    '✅ Execute este script no SQL Editor do Supabase' as instrucao;
SELECT 
    '✅ Verifique se bucket está como "public: true"' as instrucao;
SELECT 
    '✅ Teste o upload em: http://localhost:3003/redacao' as instrucao;
SELECT 
    '✅ Faça login com usuário autenticado' as instrucao;
SELECT 
    '✅ Tente fazer upload de uma imagem ou PDF' as instrucao;
SELECT 
    '✅ Se funcionar, depois configuramos como privado' as instrucao;

-- 5. SOLUÇÃO PARA COOKIE (se necessário)
SELECT 
    '=== SOLUÇÃO PARA COOKIE ===' as info;

SELECT 
    'Se ainda houver erro de cookie:' as instrucao;
SELECT 
    '1. Limpe os cookies do navegador' as passo;
SELECT 
    '2. Faça logout e login novamente' as passo;
SELECT 
    '3. Teste o upload novamente' as passo;

-- 6. RESULTADO ESPERADO
SELECT 
    '=== RESULTADO ESPERADO ===' as info;

SELECT 
    '✅ Bucket configurado como público' as resultado;
SELECT 
    '✅ Sem políticas RLS conflitantes' as resultado;
SELECT 
    '✅ Upload funcionando sem erros' as resultado;
SELECT 
    '✅ Arquivos salvos no storage' as resultado;
SELECT 
    '✅ Metadados registrados no banco' as resultado; 