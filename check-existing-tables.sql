-- Script para verificar quais tabelas já existem no Supabase
-- Execute este script para ver o estado atual do banco

-- ===== VERIFICAR TABELAS EXISTENTES =====
SELECT 
    'TABELAS EXISTENTES' as status,
    table_name as "Nome da Tabela",
    CASE 
        WHEN table_name = 'user_profiles' THEN '✅ Perfis de usuários'
        WHEN table_name = 'subjects' THEN '✅ Matérias/Disciplinas'
        WHEN table_name = 'topics' THEN '✅ Tópicos das matérias'
        WHEN table_name = 'questions' THEN '✅ Perguntas dos quizzes'
        WHEN table_name = 'quizzes' THEN '✅ Quizzes'
        WHEN table_name = 'quiz_attempts' THEN '✅ Tentativas de quiz'
        WHEN table_name = 'flashcards' THEN '✅ Flashcards'
        WHEN table_name = 'user_progress' THEN '✅ Progresso dos usuários'
        WHEN table_name = 'audio_courses' THEN '✅ Cursos de áudio (Evercast)'
        WHEN table_name = 'audio_modules' THEN '✅ Módulos de áudio'
        WHEN table_name = 'audio_lessons' THEN '✅ Aulas de áudio'
        WHEN table_name = 'calendar_events' THEN '✅ Eventos do calendário'
        WHEN table_name = 'classes' THEN '✅ Turmas/Classes'
        WHEN table_name = 'access_plans' THEN '✅ Planos de acesso'
        WHEN table_name = 'page_permissions' THEN '✅ Permissões por página'
        WHEN table_name = 'student_subscriptions' THEN '✅ Assinaturas de estudantes'
        WHEN table_name = 'temporary_passwords' THEN '✅ Senhas provisórias'
        ELSE '❓ Outra tabela'
    END as "Descrição"
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- ===== CONTAR REGISTROS =====
SELECT 
    'CONTAGEM DE REGISTROS' as categoria,
    relname as "Tabela",
    n_live_tup as "Registros"
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- ===== VERIFICAR TABELAS ESPECÍFICAS =====

-- Verificar se user_profiles existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public')
        THEN '✅ user_profiles existe'
        ELSE '❌ user_profiles NÃO existe'
    END as status;

-- Verificar se subjects existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subjects' AND table_schema = 'public')
        THEN '✅ subjects existe'
        ELSE '❌ subjects NÃO existe'
    END as status;

-- Verificar se topics existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'topics' AND table_schema = 'public')
        THEN '✅ topics existe'
        ELSE '❌ topics NÃO existe'
    END as status;

-- Verificar se questions existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'questions' AND table_schema = 'public')
        THEN '✅ questions existe'
        ELSE '❌ questions NÃO existe'
    END as status;

-- Verificar se quizzes existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quizzes' AND table_schema = 'public')
        THEN '✅ quizzes existe'
        ELSE '❌ quizzes NÃO existe'
    END as status;

-- Verificar se flashcards existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'flashcards' AND table_schema = 'public')
        THEN '✅ flashcards existe'
        ELSE '❌ flashcards NÃO existe'
    END as status;

-- Verificar se audio_courses existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audio_courses' AND table_schema = 'public')
        THEN '✅ audio_courses existe'
        ELSE '❌ audio_courses NÃO existe'
    END as status;

-- Verificar se calendar_events existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calendar_events' AND table_schema = 'public')
        THEN '✅ calendar_events existe'
        ELSE '❌ calendar_events NÃO existe'
    END as status;

-- Verificar se classes existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'classes' AND table_schema = 'public')
        THEN '✅ classes existe'
        ELSE '❌ classes NÃO existe'
    END as status;

-- Verificar se access_plans existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'access_plans' AND table_schema = 'public')
        THEN '✅ access_plans existe'
        ELSE '❌ access_plans NÃO existe'
    END as status;

-- Verificar se page_permissions existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'page_permissions' AND table_schema = 'public')
        THEN '✅ page_permissions existe'
        ELSE '❌ page_permissions NÃO existe'
    END as status;

-- Verificar se student_subscriptions existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_subscriptions' AND table_schema = 'public')
        THEN '✅ student_subscriptions existe'
        ELSE '❌ student_subscriptions NÃO existe'
    END as status;

-- Verificar se temporary_passwords existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'temporary_passwords' AND table_schema = 'public')
        THEN '✅ temporary_passwords existe'
        ELSE '❌ temporary_passwords NÃO existe'
    END as status;

-- ===== RESUMO FINAL =====
SELECT 
    'RESUMO' as categoria,
    'Total de tabelas no projeto' as descricao,
    COUNT(*) as quantidade
FROM information_schema.tables
WHERE table_schema = 'public';
