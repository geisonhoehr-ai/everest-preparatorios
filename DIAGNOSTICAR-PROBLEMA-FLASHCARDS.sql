-- =====================================================
-- SCRIPT DE DIAGNÓSTICO PARA FLASHCARDS
-- =====================================================

-- 1. Verificar se as tabelas existem
SELECT 'TABELAS EXISTENTES' as status, 
       table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('subjects', 'topics', 'flashcards', 'users')
ORDER BY table_name;

-- 2. Verificar usuários existentes
SELECT 'USUÁRIOS EXISTENTES' as status,
       id, email, role, created_at
FROM "public"."users"
ORDER BY created_at;

-- 3. Verificar se existe usuário admin
SELECT 'USUÁRIO ADMIN' as status,
       id, email, role
FROM "public"."users"
WHERE email = 'admin@teste.com' OR role = 'admin' OR role = 'administrator';

-- 4. Verificar estrutura da tabela subjects
SELECT 'ESTRUTURA SUBJECTS' as status,
       column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'subjects'
ORDER BY ordinal_position;

-- 5. Verificar estrutura da tabela topics
SELECT 'ESTRUTURA TOPICS' as status,
       column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'topics'
ORDER BY ordinal_position;

-- 6. Verificar estrutura da tabela flashcards
SELECT 'ESTRUTURA FLASHCARDS' as status,
       column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'flashcards'
ORDER BY ordinal_position;

-- 7. Verificar se RLS está habilitado
SELECT 'RLS STATUS' as status,
       schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('subjects', 'topics', 'flashcards', 'users');

-- 8. Verificar políticas RLS
SELECT 'POLÍTICAS RLS' as status,
       schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('subjects', 'topics', 'flashcards', 'users')
ORDER BY tablename, policyname;

-- 9. Verificar dados existentes
SELECT 'DADOS EXISTENTES' as status,
       'subjects' as tabela, COUNT(*) as total
FROM "public"."subjects"
UNION ALL
SELECT 'DADOS EXISTENTES' as status,
       'topics' as tabela, COUNT(*) as total
FROM "public"."topics"
UNION ALL
SELECT 'DADOS EXISTENTES' as status,
       'flashcards' as tabela, COUNT(*) as total
FROM "public"."flashcards"
UNION ALL
SELECT 'DADOS EXISTENTES' as status,
       'users' as tabela, COUNT(*) as total
FROM "public"."users";

-- 10. Testar inserção simples
SELECT 'TESTE INSERÇÃO' as status,
       'Testando se conseguimos inserir...' as mensagem;

-- =====================================================
-- RESUMO DO DIAGNÓSTICO
-- =====================================================

/*
🔍 DIAGNÓSTICO COMPLETO:

1. ✅ Verificar tabelas existentes
2. ✅ Verificar usuários e roles
3. ✅ Verificar estrutura das tabelas
4. ✅ Verificar RLS e políticas
5. ✅ Verificar dados existentes
6. ✅ Testar inserção

📋 Com base nos resultados, poderemos identificar:
- Se as tabelas existem
- Se o usuário admin existe
- Se as estruturas estão corretas
- Se RLS está bloqueando
- Se há dados existentes

🚀 Execute este script primeiro para diagnosticar o problema!
*/
