-- 🚀 Script FINAL para resolver erro de RLS no Storage
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar status atual
SELECT 
    '=== DIAGNÓSTICO DO ERRO RLS ===' as info;

SELECT 
    'Bucket redacoes:' as item,
    name as nome,
    public,
    file_size_limit
FROM storage.buckets 
WHERE name = 'redacoes';

-- 2. Verificar políticas existentes
SELECT 
    'Políticas existentes:' as item,
    COUNT(*) as total
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%redacoes%';

-- 3. REMOVER TODAS as políticas existentes (limpeza completa)
DROP POLICY IF EXISTS "Users can upload files to redacoes bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can view files in redacoes bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can update files in redacoes bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete files in redacoes bucket" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload para usuários autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir visualização para usuários autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização para usuários autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão para usuários autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem fazer upload de arquivos de redação" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem ver arquivos de suas redações" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar arquivos de suas redações" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar arquivos de suas redações" ON storage.objects;

-- 4. Criar políticas SIMPLES e FUNCIONAIS
CREATE POLICY "Allow authenticated users to upload to redacoes" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
    bucket_id = 'redacoes'
);

CREATE POLICY "Allow authenticated users to view redacoes files" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (
    bucket_id = 'redacoes'
);

CREATE POLICY "Allow authenticated users to update redacoes files" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (
    bucket_id = 'redacoes'
);

CREATE POLICY "Allow authenticated users to delete redacoes files" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (
    bucket_id = 'redacoes'
);

-- 5. Verificar se as políticas foram criadas
SELECT 
    '=== POLÍTICAS CRIADAS ===' as info;

SELECT 
    policyname as nome,
    cmd as operacao,
    roles as usuarios
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%redacoes%'
ORDER BY policyname;

-- 6. Verificar se RLS está habilitado
SELECT 
    '=== STATUS RLS ===' as info,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'storage' 
            AND tablename = 'objects' 
            AND rowsecurity = true
        )
        THEN '✅ RLS habilitado'
        ELSE '❌ RLS desabilitado'
    END as status;

-- 7. Habilitar RLS se necessário
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 8. Teste final
SELECT 
    '=== TESTE FINAL ===' as info;

SELECT 
    'Status do sistema:' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'redacoes')
        AND EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'objects' 
            AND schemaname = 'storage'
            AND policyname LIKE '%redacoes%'
        )
        THEN '✅ SISTEMA PRONTO'
        ELSE '❌ SISTEMA INCOMPLETO'
    END as status;

-- 9. Instruções para teste
SELECT 
    '=== INSTRUÇÕES ===' as info;

SELECT 
    '1. Teste o upload novamente' as instrucao;
SELECT 
    '2. Se ainda der erro, configure manualmente no painel' as instrucao;
SELECT 
    '3. Vá para Storage > Policies > redacoes' as instrucao;
SELECT 
    '4. Adicione política: bucket_id = "redacoes"' as instrucao; 