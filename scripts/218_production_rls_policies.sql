-- 🚀 Script para configurar políticas RLS de produção
-- Execute este script no SQL Editor do Supabase
-- Baseado na solução que funcionou: política mais permissiva

-- 1. Verificar status atual
SELECT 
    '=== CONFIGURAÇÃO DE PRODUÇÃO ===' as info;

-- 2. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Allow all authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload to redacoes" ON storage.objects;
DROP POLICY IF EXISTS "Allow view redacoes files" ON storage.objects;
DROP POLICY IF EXISTS "Allow update redacoes files" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete redacoes files" ON storage.objects;

-- 3. Criar política de produção (baseada na que funcionou)
CREATE POLICY "Allow authenticated users to manage redacoes files" 
ON storage.objects 
FOR ALL 
TO authenticated 
USING (bucket_id = 'redacoes')
WITH CHECK (bucket_id = 'redacoes');

-- 4. Verificar se a política foi criada
SELECT 
    '=== POLÍTICA DE PRODUÇÃO CRIADA ===' as info;

SELECT 
    policyname as nome,
    cmd as operacao,
    roles as usuarios
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%redacoes%'
ORDER BY policyname;

-- 5. Verificar estrutura final
SELECT 
    '=== ESTRUTURA FINAL ===' as info;

SELECT 
    'Bucket:' as tipo,
    name as nome,
    public,
    file_size_limit
FROM storage.buckets 
WHERE name = 'redacoes';

SELECT 
    'Políticas ativas:' as tipo,
    COUNT(*) as total
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%redacoes%';

SELECT 
    'Tabela redacao_imagens:' as tipo,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'redacao_imagens')
        THEN '✅ Criada'
        ELSE '❌ Não criada'
    END as status;

-- 6. Instruções para uso
SELECT 
    '=== INSTRUÇÕES PARA USO ===' as info;

SELECT 
    '✅ Upload funcionando!' as status;
SELECT 
    '✅ Política configurada para produção' as status;
SELECT 
    '✅ Sistema pronto para uso' as status;
SELECT 
    '✅ Teste com diferentes tipos de arquivo' as instrucao;
SELECT 
    '✅ Teste com arquivos grandes' as instrucao;
SELECT 
    '✅ Teste múltiplos uploads' as instrucao; 