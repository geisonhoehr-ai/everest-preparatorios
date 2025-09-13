-- Script simples para mapear as tabelas do projeto Everest
-- Execute este script no Supabase SQL Editor para obter informações das tabelas

-- ===== 1. LISTAR TODAS AS TABELAS DO PROJETO =====
SELECT 
    'TABELAS DO PROJETO' as categoria,
    table_name as "Nome da Tabela",
    CASE 
        WHEN table_name = 'user_profiles' THEN 'Perfis de usuários'
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
    END as "Descrição"
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- ===== 2. CONTAR TOTAL DE TABELAS =====
SELECT 
    'RESUMO' as categoria,
    'Total de Tabelas no Projeto' as descricao,
    COUNT(*) as quantidade
FROM information_schema.tables
WHERE table_schema = 'public';

-- ===== 3. MAPEAR COLUNAS DAS TABELAS PRINCIPAIS =====

-- Tabela: user_profiles
SELECT 
    'COLUNAS - user_profiles' as categoria,
    column_name as "Coluna",
    data_type as "Tipo",
    is_nullable as "Pode ser NULL",
    column_default as "Valor Padrão"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Tabela: subjects
SELECT 
    'COLUNAS - subjects' as categoria,
    column_name as "Coluna",
    data_type as "Tipo",
    is_nullable as "Pode ser NULL",
    column_default as "Valor Padrão"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'subjects'
ORDER BY ordinal_position;

-- Tabela: topics
SELECT 
    'COLUNAS - topics' as categoria,
    column_name as "Coluna",
    data_type as "Tipo",
    is_nullable as "Pode ser NULL",
    column_default as "Valor Padrão"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'topics'
ORDER BY ordinal_position;

-- Tabela: questions
SELECT 
    'COLUNAS - questions' as categoria,
    column_name as "Coluna",
    data_type as "Tipo",
    is_nullable as "Pode ser NULL",
    column_default as "Valor Padrão"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'questions'
ORDER BY ordinal_position;

-- Tabela: quizzes
SELECT 
    'COLUNAS - quizzes' as categoria,
    column_name as "Coluna",
    data_type as "Tipo",
    is_nullable as "Pode ser NULL",
    column_default as "Valor Padrão"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'quizzes'
ORDER BY ordinal_position;

-- Tabela: flashcards
SELECT 
    'COLUNAS - flashcards' as categoria,
    column_name as "Coluna",
    data_type as "Tipo",
    is_nullable as "Pode ser NULL",
    column_default as "Valor Padrão"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'flashcards'
ORDER BY ordinal_position;

-- Tabela: audio_courses
SELECT 
    'COLUNAS - audio_courses' as categoria,
    column_name as "Coluna",
    data_type as "Tipo",
    is_nullable as "Pode ser NULL",
    column_default as "Valor Padrão"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'audio_courses'
ORDER BY ordinal_position;

-- Tabela: calendar_events
SELECT 
    'COLUNAS - calendar_events' as categoria,
    column_name as "Coluna",
    data_type as "Tipo",
    is_nullable as "Pode ser NULL",
    column_default as "Valor Padrão"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'calendar_events'
ORDER BY ordinal_position;

-- Tabela: classes
SELECT 
    'COLUNAS - classes' as categoria,
    column_name as "Coluna",
    data_type as "Tipo",
    is_nullable as "Pode ser NULL",
    column_default as "Valor Padrão"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'classes'
ORDER BY ordinal_position;

-- Tabela: access_plans
SELECT 
    'COLUNAS - access_plans' as categoria,
    column_name as "Coluna",
    data_type as "Tipo",
    is_nullable as "Pode ser NULL",
    column_default as "Valor Padrão"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'access_plans'
ORDER BY ordinal_position;

-- Tabela: page_permissions
SELECT 
    'COLUNAS - page_permissions' as categoria,
    column_name as "Coluna",
    data_type as "Tipo",
    is_nullable as "Pode ser NULL",
    column_default as "Valor Padrão"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'page_permissions'
ORDER BY ordinal_position;

-- Tabela: student_subscriptions
SELECT 
    'COLUNAS - student_subscriptions' as categoria,
    column_name as "Coluna",
    data_type as "Tipo",
    is_nullable as "Pode ser NULL",
    column_default as "Valor Padrão"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'student_subscriptions'
ORDER BY ordinal_position;

-- Tabela: temporary_passwords
SELECT 
    'COLUNAS - temporary_passwords' as categoria,
    column_name as "Coluna",
    data_type as "Tipo",
    is_nullable as "Pode ser NULL",
    column_default as "Valor Padrão"
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'temporary_passwords'
ORDER BY ordinal_position;

-- ===== 4. CONTAR REGISTROS EM CADA TABELA =====
SELECT 
    'CONTAGEM DE REGISTROS' as categoria,
    schemaname as "Schema",
    relname as "Tabela",
    n_live_tup as "Registros Ativos"
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- ===== 5. VERIFICAR FOREIGN KEYS =====
SELECT 
    'FOREIGN KEYS' as categoria,
    tc.table_name as "Tabela",
    kcu.column_name as "Coluna",
    ccu.table_name AS "Tabela Referenciada",
    ccu.column_name AS "Coluna Referenciada"
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ===== 6. VERIFICAR POLÍTICAS RLS =====
SELECT 
    'POLÍTICAS RLS' as categoria,
    schemaname as "Schema",
    tablename as "Tabela",
    policyname as "Nome da Política",
    cmd as "Comando",
    roles as "Roles"
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ===== 7. RESUMO FINAL =====
SELECT 
    'RESUMO FINAL' as categoria,
    'Total de Tabelas' as item,
    COUNT(*)::text as valor
FROM information_schema.tables
WHERE table_schema = 'public'

UNION ALL

SELECT 
    'RESUMO FINAL',
    'Total de Colunas',
    COUNT(*)::text
FROM information_schema.columns
WHERE table_schema = 'public'

UNION ALL

SELECT 
    'RESUMO FINAL',
    'Total de Foreign Keys',
    COUNT(*)::text
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public'

UNION ALL

SELECT 
    'RESUMO FINAL',
    'Total de Políticas RLS',
    COUNT(*)::text
FROM pg_policies
WHERE schemaname = 'public';

-- ===== FIM DO MAPEAMENTO =====
SELECT 
    'FIM' as categoria,
    'Mapeamento executado em: ' || NOW() as timestamp,
    'Script concluído com sucesso!' as status;
