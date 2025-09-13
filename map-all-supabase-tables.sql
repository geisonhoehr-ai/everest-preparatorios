-- Script para mapear todas as tabelas do Supabase
-- Este script lista todas as tabelas, suas colunas, tipos de dados e informações adicionais

-- ===== MAPEAMENTO COMPLETO DAS TABELAS =====

-- 1. Listar todas as tabelas do schema public
SELECT 
    'TABELAS DO SCHEMA PUBLIC' as categoria,
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Listar todas as tabelas do schema auth (Supabase Auth)
SELECT 
    'TABELAS DO SCHEMA AUTH' as categoria,
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'auth'
ORDER BY tablename;

-- 3. Listar todas as tabelas do schema storage (Supabase Storage)
SELECT 
    'TABELAS DO SCHEMA STORAGE' as categoria,
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'storage'
ORDER BY tablename;

-- 4. Listar todas as tabelas do schema extensions
SELECT 
    'TABELAS DO SCHEMA EXTENSIONS' as categoria,
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'extensions'
ORDER BY tablename;

-- ===== DETALHES DAS COLUNAS =====

-- 5. Mapear todas as colunas de todas as tabelas do schema public
SELECT 
    'COLUNAS DO SCHEMA PUBLIC' as categoria,
    t.table_name,
    c.column_name,
    c.data_type,
    c.character_maximum_length,
    c.is_nullable,
    c.column_default,
    c.ordinal_position,
    CASE 
        WHEN pk.column_name IS NOT NULL THEN 'PRIMARY KEY'
        WHEN fk.column_name IS NOT NULL THEN 'FOREIGN KEY'
        ELSE ''
    END as key_type
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
LEFT JOIN (
    SELECT ku.table_name, ku.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
    WHERE tc.constraint_type = 'PRIMARY KEY'
) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
LEFT JOIN (
    SELECT ku.table_name, ku.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
) fk ON c.table_name = fk.table_name AND c.column_name = fk.column_name
WHERE t.table_schema = 'public'
ORDER BY t.table_name, c.ordinal_position;

-- 6. Mapear colunas das tabelas do schema auth
SELECT 
    'COLUNAS DO SCHEMA AUTH' as categoria,
    t.table_name,
    c.column_name,
    c.data_type,
    c.character_maximum_length,
    c.is_nullable,
    c.column_default,
    c.ordinal_position
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'auth'
ORDER BY t.table_name, c.ordinal_position;

-- 7. Mapear colunas das tabelas do schema storage
SELECT 
    'COLUNAS DO SCHEMA STORAGE' as categoria,
    t.table_name,
    c.column_name,
    c.data_type,
    c.character_maximum_length,
    c.is_nullable,
    c.column_default,
    c.ordinal_position
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'storage'
ORDER BY t.table_name, c.ordinal_position;

-- ===== RELACIONAMENTOS E CONSTRAINTS =====

-- 8. Mapear todas as foreign keys
SELECT 
    'FOREIGN KEYS' as categoria,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 9. Mapear todos os índices
SELECT 
    'ÍNDICES' as categoria,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 10. Mapear todas as políticas RLS
SELECT 
    'POLÍTICAS RLS' as categoria,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ===== ESTATÍSTICAS DAS TABELAS =====

-- 11. Contar registros em cada tabela do schema public
SELECT 
    'CONTAGEM DE REGISTROS' as categoria,
    schemaname,
    relname as tablename,
    n_tup_ins as "Inserções",
    n_tup_upd as "Atualizações",
    n_tup_del as "Exclusões",
    n_live_tup as "Registros Ativos",
    n_dead_tup as "Registros Mortos"
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- 12. Tamanho das tabelas
SELECT 
    'TAMANHO DAS TABELAS' as categoria,
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as "Tamanho Total",
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as "Tamanho da Tabela",
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as "Tamanho dos Índices"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ===== RESUMO EXECUTIVO =====

-- 13. Resumo geral das tabelas
SELECT 
    'RESUMO GERAL' as categoria,
    'Total de Tabelas no Schema Public' as descricao,
    COUNT(*) as quantidade
FROM pg_tables 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'RESUMO GERAL',
    'Total de Tabelas no Schema Auth',
    COUNT(*)
FROM pg_tables 
WHERE schemaname = 'auth'

UNION ALL

SELECT 
    'RESUMO GERAL',
    'Total de Tabelas no Schema Storage',
    COUNT(*)
FROM pg_tables 
WHERE schemaname = 'storage'

UNION ALL

SELECT 
    'RESUMO GERAL',
    'Total de Colunas no Schema Public',
    COUNT(*)
FROM information_schema.columns
WHERE table_schema = 'public'

UNION ALL

SELECT 
    'RESUMO GERAL',
    'Total de Foreign Keys',
    COUNT(*)
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public'

UNION ALL

SELECT 
    'RESUMO GERAL',
    'Total de Políticas RLS',
    COUNT(*)
FROM pg_policies
WHERE schemaname = 'public';

-- ===== TABELAS ESPECÍFICAS DO PROJETO =====

-- 14. Focar nas tabelas principais do projeto
SELECT 
    'TABELAS PRINCIPAIS DO PROJETO' as categoria,
    table_name,
    CASE 
        WHEN table_name = 'user_profiles' THEN 'Perfis de usuários (estudantes, professores, admins)'
        WHEN table_name = 'subjects' THEN 'Matérias/Disciplinas'
        WHEN table_name = 'topics' THEN 'Tópicos das matérias'
        WHEN table_name = 'questions' THEN 'Perguntas dos quizzes'
        WHEN table_name = 'quizzes' THEN 'Quizzes'
        WHEN table_name = 'quiz_attempts' THEN 'Tentativas de quiz'
        WHEN table_name = 'flashcards' THEN 'Flashcards'
        WHEN table_name = 'user_progress' THEN 'Progresso dos usuários'
        WHEN table_name = 'audio_courses' THEN 'Cursos de áudio (Evercast)'
        WHEN table_name = 'audio_modules' THEN 'Módulos de áudio'
        WHEN table_name = 'audio_lessons' THEN 'Aulas de áudio'
        WHEN table_name = 'calendar_events' THEN 'Eventos do calendário'
        WHEN table_name = 'classes' THEN 'Turmas/Classes'
        WHEN table_name = 'access_plans' THEN 'Planos de acesso'
        WHEN table_name = 'page_permissions' THEN 'Permissões por página'
        WHEN table_name = 'student_subscriptions' THEN 'Assinaturas de estudantes'
        WHEN table_name = 'temporary_passwords' THEN 'Senhas provisórias'
        ELSE 'Outra tabela'
    END as descricao
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN (
        'user_profiles', 'subjects', 'topics', 'questions', 'quizzes', 
        'quiz_attempts', 'flashcards', 'user_progress', 'audio_courses', 
        'audio_modules', 'audio_lessons', 'calendar_events', 'classes', 
        'access_plans', 'page_permissions', 'student_subscriptions', 
        'temporary_passwords'
    )
ORDER BY table_name;

-- ===== VERIFICAÇÃO DE INTEGRIDADE =====

-- 15. Verificar tabelas órfãs (sem registros)
SELECT 
    'TABELAS VAZIAS' as categoria,
    schemaname,
    tablename,
    'Tabela sem registros' as status
FROM pg_stat_user_tables
WHERE schemaname = 'public' 
    AND n_live_tup = 0
ORDER BY tablename;

-- 16. Verificar tabelas com muitos registros mortos
SELECT 
    'TABELAS COM REGISTROS MORTOS' as categoria,
    schemaname,
    tablename,
    n_live_tup as "Registros Ativos",
    n_dead_tup as "Registros Mortos",
    ROUND((n_dead_tup::float / NULLIF(n_live_tup + n_dead_tup, 0)) * 100, 2) as "% Mortos"
FROM pg_stat_user_tables
WHERE schemaname = 'public' 
    AND n_dead_tup > 0
ORDER BY n_dead_tup DESC;

-- ===== COMANDOS DE MANUTENÇÃO =====

-- 17. Comandos para análise e limpeza (comentados)
/*
-- Analisar todas as tabelas
ANALYZE;

-- Vacuum para limpar registros mortos
VACUUM ANALYZE;

-- Vacuum completo (mais agressivo)
VACUUM FULL;

-- Reindexar todas as tabelas
REINDEX DATABASE postgres;
*/

-- ===== EXPORTAR ESTRUTURA =====

-- 18. Gerar script de criação das tabelas (estrutura)
SELECT 
    'SCRIPT DE CRIAÇÃO' as categoria,
    'Para exportar a estrutura completa, execute:' as instrucao,
    'pg_dump -h [host] -U [user] -d [database] --schema-only --no-owner --no-privileges > estrutura_completa.sql' as comando;

-- 19. Gerar script de dados (sem estrutura)
SELECT 
    'SCRIPT DE DADOS' as categoria,
    'Para exportar apenas os dados, execute:' as instrucao,
    'pg_dump -h [host] -U [user] -d [database] --data-only --no-owner --no-privileges > dados_completos.sql' as comando;

-- ===== FIM DO MAPEAMENTO =====

-- Comentário final
SELECT 
    'FIM DO MAPEAMENTO' as categoria,
    'Mapeamento completo executado em: ' || NOW() as timestamp,
    'Execute este script no Supabase SQL Editor para obter informações completas do banco' as instrucao;
