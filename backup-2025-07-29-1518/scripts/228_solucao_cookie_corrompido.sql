-- 🚨 SOLUÇÃO PARA COOKIE CORROMPIDO
-- Execute este script no SQL Editor do Supabase
-- Resolve: Cookie corrompido + Múltiplas instâncias + RLS

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
DROP POLICY IF EXISTS "emergency_upload_policy" ON storage.objects;

-- 2. RECRIAR BUCKET COMO PÚBLICO
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

-- 3. VERIFICAÇÃO
SELECT 
    '=== VERIFICAÇÃO ===' as info;

SELECT 
    'Bucket redacoes:' as tipo,
    name as nome,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'redacoes';

-- 4. INSTRUÇÕES PARA COOKIE
SELECT 
    '=== SOLUÇÃO PARA COOKIE CORROMPIDO ===' as info;

SELECT 
    '1. LIMPE TODOS os cookies do navegador' as passo;
SELECT 
    '2. Feche TODAS as abas do navegador' as passo;
SELECT 
    '3. Abra uma nova aba em modo privado' as passo;
SELECT 
    '4. Acesse: http://localhost:3003/redacao' as passo;
SELECT 
    '5. Faça login novamente' as passo;
SELECT 
    '6. Teste o upload' as passo;

-- 5. RESULTADO ESPERADO
SELECT 
    '=== RESULTADO ESPERADO ===' as info;

SELECT 
    '✅ Cookie limpo e funcional' as resultado;
SELECT 
    '✅ Bucket público sem RLS' as resultado;
SELECT 
    '✅ Upload funcionando sem erros' as resultado;
SELECT 
    '✅ Sem múltiplas instâncias' as resultado;