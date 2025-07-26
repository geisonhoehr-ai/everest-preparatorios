-- Script para testar conexão com Supabase
-- Data: 2025-01-25
-- Descrição: Testa se as tabelas estão acessíveis e funcionando

-- 1. Testar conexão básica
SELECT 
    'Conexão OK' as status,
    current_database() as database,
    current_user as user,
    version() as postgres_version;

-- 2. Verificar se as tabelas existem
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('subjects', 'topics', 'flashcards')
ORDER BY table_name;

-- 3. Verificar permissões do usuário atual
SELECT 
    table_name,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
    AND table_name IN ('subjects', 'topics', 'flashcards')
    AND grantee = current_user
ORDER BY table_name, privilege_type;

-- 4. Testar SELECT básico em subjects
SELECT 
    'Teste SELECT subjects' as teste,
    COUNT(*) as total_registros
FROM subjects;

-- 5. Testar SELECT básico em topics
SELECT 
    'Teste SELECT topics' as teste,
    COUNT(*) as total_registros
FROM topics;

-- 6. Verificar se há RLS (Row Level Security) ativo
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('subjects', 'topics', 'flashcards');

-- 7. Testar a query exata da função getAllSubjects
SELECT 
    'Query getAllSubjects' as teste,
    id,
    name
FROM subjects 
ORDER BY name;

-- 8. Verificar se há triggers ou funções que possam estar interferindo
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
    AND event_object_table IN ('subjects', 'topics', 'flashcards');

-- 9. Resumo final
SELECT 
    'RESUMO CONEXÃO' as secao,
    'Tabelas encontradas' as info,
    COUNT(*) as valor
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('subjects', 'topics', 'flashcards')
UNION ALL
SELECT 
    'RESUMO CONEXÃO' as secao,
    'Registros em subjects' as info,
    COUNT(*) as valor
FROM subjects
UNION ALL
SELECT 
    'RESUMO CONEXÃO' as secao,
    'Registros em topics' as info,
    COUNT(*) as valor
FROM topics; 