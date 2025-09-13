-- Script para verificar a estrutura das tabelas principais
-- Execute este script para ver as colunas de cada tabela

-- ===== ESTRUTURA DA TABELA user_profiles =====
SELECT 
    'user_profiles' as tabela,
    column_name as coluna,
    data_type as tipo,
    character_maximum_length as tamanho,
    is_nullable as nullable,
    column_default as padrao
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- ===== ESTRUTURA DA TABELA subjects =====
SELECT 
    'subjects' as tabela,
    column_name as coluna,
    data_type as tipo,
    character_maximum_length as tamanho,
    is_nullable as nullable,
    column_default as padrao
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'subjects'
ORDER BY ordinal_position;

-- ===== ESTRUTURA DA TABELA topics =====
SELECT 
    'topics' as tabela,
    column_name as coluna,
    data_type as tipo,
    character_maximum_length as tamanho,
    is_nullable as nullable,
    column_default as padrao
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'topics'
ORDER BY ordinal_position;

-- ===== ESTRUTURA DA TABELA questions =====
SELECT 
    'questions' as tabela,
    column_name as coluna,
    data_type as tipo,
    character_maximum_length as tamanho,
    is_nullable as nullable,
    column_default as padrao
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'questions'
ORDER BY ordinal_position;

-- ===== ESTRUTURA DA TABELA quizzes =====
SELECT 
    'quizzes' as tabela,
    column_name as coluna,
    data_type as tipo,
    character_maximum_length as tamanho,
    is_nullable as nullable,
    column_default as padrao
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'quizzes'
ORDER BY ordinal_position;

-- ===== ESTRUTURA DA TABELA flashcards =====
SELECT 
    'flashcards' as tabela,
    column_name as coluna,
    data_type as tipo,
    character_maximum_length as tamanho,
    is_nullable as nullable,
    column_default as padrao
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'flashcards'
ORDER BY ordinal_position;

-- ===== ESTRUTURA DA TABELA audio_courses =====
SELECT 
    'audio_courses' as tabela,
    column_name as coluna,
    data_type as tipo,
    character_maximum_length as tamanho,
    is_nullable as nullable,
    column_default as padrao
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'audio_courses'
ORDER BY ordinal_position;

-- ===== ESTRUTURA DA TABELA calendar_events =====
SELECT 
    'calendar_events' as tabela,
    column_name as coluna,
    data_type as tipo,
    character_maximum_length as tamanho,
    is_nullable as nullable,
    column_default as padrao
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'calendar_events'
ORDER BY ordinal_position;

-- ===== ESTRUTURA DA TABELA classes =====
SELECT 
    'classes' as tabela,
    column_name as coluna,
    data_type as tipo,
    character_maximum_length as tamanho,
    is_nullable as nullable,
    column_default as padrao
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'classes'
ORDER BY ordinal_position;

-- ===== ESTRUTURA DA TABELA access_plans =====
SELECT 
    'access_plans' as tabela,
    column_name as coluna,
    data_type as tipo,
    character_maximum_length as tamanho,
    is_nullable as nullable,
    column_default as padrao
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'access_plans'
ORDER BY ordinal_position;

-- ===== ESTRUTURA DA TABELA page_permissions =====
SELECT 
    'page_permissions' as tabela,
    column_name as coluna,
    data_type as tipo,
    character_maximum_length as tamanho,
    is_nullable as nullable,
    column_default as padrao
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'page_permissions'
ORDER BY ordinal_position;

-- ===== ESTRUTURA DA TABELA student_subscriptions =====
SELECT 
    'student_subscriptions' as tabela,
    column_name as coluna,
    data_type as tipo,
    character_maximum_length as tamanho,
    is_nullable as nullable,
    column_default as padrao
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'student_subscriptions'
ORDER BY ordinal_position;

-- ===== ESTRUTURA DA TABELA temporary_passwords =====
SELECT 
    'temporary_passwords' as tabela,
    column_name as coluna,
    data_type as tipo,
    character_maximum_length as tamanho,
    is_nullable as nullable,
    column_default as padrao
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'temporary_passwords'
ORDER BY ordinal_position;