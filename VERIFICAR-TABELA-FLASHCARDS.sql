-- =====================================================
-- VERIFICAÇÃO COMPLETA DA TABELA DE FLASHCARDS
-- =====================================================

-- 1. Verificar se a tabela flashcards existe
SELECT 'EXISTÊNCIA DA TABELA' as status,
       CASE 
         WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'flashcards')
         THEN '✅ Tabela flashcards EXISTE'
         ELSE '❌ Tabela flashcards NÃO EXISTE'
       END as resultado;

-- 2. Verificar estrutura da tabela flashcards
SELECT 'ESTRUTURA DA TABELA' as status,
       column_name as coluna,
       data_type as tipo,
       is_nullable as permite_nulo,
       column_default as valor_padrao
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'flashcards'
ORDER BY ordinal_position;

-- 3. Verificar se a tabela subjects existe
SELECT 'TABELA SUBJECTS' as status,
       CASE 
         WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subjects')
         THEN '✅ Tabela subjects EXISTE'
         ELSE '❌ Tabela subjects NÃO EXISTE'
       END as resultado;

-- 4. Verificar se a tabela topics existe
SELECT 'TABELA TOPICS' as status,
       CASE 
         WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'topics')
         THEN '✅ Tabela topics EXISTE'
         ELSE '❌ Tabela topics NÃO EXISTE'
       END as resultado;

-- 5. Verificar se a tabela users existe
SELECT 'TABELA USERS' as status,
       CASE 
         WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')
         THEN '✅ Tabela users EXISTE'
         ELSE '❌ Tabela users NÃO EXISTE'
       END as resultado;

-- 6. Verificar usuários existentes
SELECT 'USUÁRIOS EXISTENTES' as status,
       id,
       email,
       role,
       created_at
FROM "public"."users"
ORDER BY created_at;

-- 7. Verificar se existe usuário admin
SELECT 'USUÁRIO ADMIN' as status,
       CASE 
         WHEN EXISTS (SELECT 1 FROM "public"."users" WHERE email = 'admin@teste.com')
         THEN '✅ Usuário admin@teste.com EXISTE'
         ELSE '❌ Usuário admin@teste.com NÃO EXISTE'
       END as resultado;

-- 8. Verificar role do usuário admin
SELECT 'ROLE DO ADMIN' as status,
       email,
       role
FROM "public"."users"
WHERE email = 'admin@teste.com';

-- 9. Verificar dados existentes nas tabelas
SELECT 'DADOS EXISTENTES' as status,
       'subjects' as tabela,
       COUNT(*) as total_registros
FROM "public"."subjects"
UNION ALL
SELECT 'DADOS EXISTENTES' as status,
       'topics' as tabela,
       COUNT(*) as total_registros
FROM "public"."topics"
UNION ALL
SELECT 'DADOS EXISTENTES' as status,
       'flashcards' as tabela,
       COUNT(*) as total_registros
FROM "public"."flashcards"
UNION ALL
SELECT 'DADOS EXISTENTES' as status,
       'users' as tabela,
       COUNT(*) as total_registros
FROM "public"."users";

-- 10. Verificar RLS (Row Level Security)
SELECT 'RLS STATUS' as status,
       tablename as tabela,
       CASE 
         WHEN rowsecurity THEN '✅ RLS HABILITADO'
         ELSE '❌ RLS DESABILITADO'
       END as rls_status
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('subjects', 'topics', 'flashcards', 'users')
ORDER BY tablename;

-- 11. Verificar políticas RLS
SELECT 'POLÍTICAS RLS' as status,
       tablename as tabela,
       policyname as politica,
       permissive as permissiva,
       cmd as comando
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('subjects', 'topics', 'flashcards', 'users')
ORDER BY tablename, policyname;

-- 12. Verificar constraints e índices
SELECT 'CONSTRAINTS' as status,
       tc.table_name as tabela,
       tc.constraint_name as constraint,
       tc.constraint_type as tipo
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public' 
  AND tc.table_name IN ('subjects', 'topics', 'flashcards', 'users')
ORDER BY tc.table_name, tc.constraint_type;

-- 13. Verificar chaves estrangeiras
SELECT 'CHAVES ESTRANGEIRAS' as status,
       tc.table_name as tabela_origem,
       kcu.column_name as coluna_origem,
       ccu.table_name as tabela_destino,
       ccu.column_name as coluna_destino
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('subjects', 'topics', 'flashcards', 'users')
ORDER BY tc.table_name;

-- 14. Testar inserção simples (sem executar)
SELECT 'TESTE DE INSERÇÃO' as status,
       'Para testar inserção, execute:' as instrucao,
       'INSERT INTO "public"."subjects" (name, description, created_by_user_id) VALUES (''Teste'', ''Teste'', (SELECT id FROM "public"."users" LIMIT 1));' as comando_teste;

-- 15. Verificar permissões do usuário atual
SELECT 'PERMISSÕES ATUAIS' as status,
       current_user as usuario_atual,
       session_user as sessao_usuario,
       current_database() as banco_atual;

-- =====================================================
-- RESUMO DA VERIFICAÇÃO
-- =====================================================

/*
🔍 VERIFICAÇÃO COMPLETA DA TABELA FLASHCARDS:

1. ✅ Existência das tabelas
2. ✅ Estrutura das tabelas
3. ✅ Usuários e roles
4. ✅ Dados existentes
5. ✅ RLS e políticas
6. ✅ Constraints e índices
7. ✅ Chaves estrangeiras
8. ✅ Permissões

📋 Com base nos resultados, poderemos identificar:
- Se as tabelas existem e estão corretas
- Se o usuário admin existe com role correto
- Se há dados existentes
- Se RLS está bloqueando inserções
- Se as estruturas estão corretas

🚀 Execute este script para diagnosticar completamente o problema!
*/
