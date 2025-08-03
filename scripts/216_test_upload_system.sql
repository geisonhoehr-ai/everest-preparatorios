-- 🚀 Script para testar o sistema de upload de redações
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar estrutura completa do sistema
SELECT 
    '=== TESTE DO SISTEMA DE REDAÇÕES ===' as info;

-- 2. Verificar bucket
SELECT 
    '1. Bucket de storage:' as teste,
    name as nome,
    public,
    file_size_limit,
    array_length(allowed_mime_types, 1) as tipos_permitidos
FROM storage.buckets 
WHERE name = 'redacoes';

-- 3. Verificar políticas RLS
SELECT 
    '2. Políticas RLS ativas:' as teste,
    COUNT(*) as total_politicas
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%redacoes%';

-- 4. Verificar tabela redacao_imagens
SELECT 
    '3. Tabela redacao_imagens:' as teste,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'redacao_imagens')
        THEN '✅ Criada'
        ELSE '❌ Não criada'
    END as status;

-- 5. Verificar estrutura da tabela redacao_imagens
SELECT 
    '4. Estrutura da tabela redacao_imagens:' as teste;

SELECT 
    column_name as coluna,
    data_type as tipo,
    is_nullable as nullable,
    column_default as padrao
FROM information_schema.columns 
WHERE table_name = 'redacao_imagens'
ORDER BY ordinal_position;

-- 6. Verificar políticas RLS da tabela redacao_imagens
SELECT 
    '5. Políticas RLS da tabela redacao_imagens:' as teste,
    COUNT(*) as total_politicas
FROM pg_policies 
WHERE tablename = 'redacao_imagens'
AND schemaname = 'public';

-- 7. Verificar se existem redações de teste
SELECT 
    '6. Redações existentes:' as teste,
    COUNT(*) as total_redacoes
FROM redacoes;

-- 8. Verificar se existem imagens de teste
SELECT 
    '7. Imagens existentes:' as teste,
    COUNT(*) as total_imagens
FROM redacao_imagens;

-- 9. Teste de inserção (simulação)
SELECT 
    '8. Teste de permissões:' as teste,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'redacao_imagens'
            AND cmd = 'INSERT'
        )
        THEN '✅ Política INSERT ativa'
        ELSE '❌ Política INSERT ausente'
    END as politica_insert,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'redacao_imagens'
            AND cmd = 'SELECT'
        )
        THEN '✅ Política SELECT ativa'
        ELSE '❌ Política SELECT ausente'
    END as politica_select;

-- 10. Resumo final
SELECT 
    '=== RESUMO DO TESTE ===' as info;

SELECT 
    'Status do sistema:' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'redacoes')
        AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'redacao_imagens')
        AND EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname LIKE '%redacoes%')
        THEN '✅ SISTEMA PRONTO PARA TESTE'
        ELSE '❌ SISTEMA INCOMPLETO'
    END as status;

-- 11. Instruções para teste manual
SELECT 
    '=== INSTRUÇÕES PARA TESTE MANUAL ===' as info;

SELECT 
    '1. Acesse: http://localhost:3003/redacao' as instrucao;
SELECT 
    '2. Faça login com um usuário autenticado' as instrucao;
SELECT 
    '3. Tente fazer upload de uma imagem ou PDF' as instrucao;
SELECT 
    '4. Verifique se o arquivo aparece na listagem' as instrucao;
SELECT 
    '5. Verifique se não há erros no console' as instrucao; 