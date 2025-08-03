-- Script seguro para verificar tabelas existentes
-- Listar todas as tabelas do schema public
SELECT 
    'Tabelas existentes no schema public:' as info;

SELECT 
    table_name,
    'EXISTE' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar especificamente se a tabela student_progress existe
SELECT 
    'Verificando tabela student_progress:' as info;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'student_progress'
        ) THEN 'EXISTE'
        ELSE 'NÃO EXISTE'
    END as student_progress_status;

-- Verificar outras tabelas relacionadas ao progresso
SELECT 
    'Tabelas relacionadas ao progresso:' as info;

SELECT 
    table_name,
    'EXISTE' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'user_flashcard_progress',
    'user_quiz_scores', 
    'user_topic_progress',
    'user_achievements',
    'student_profiles',
    'teacher_profiles'
)
ORDER BY table_name;

-- Verificar estrutura das tabelas de progresso existentes
SELECT 
    'Estrutura das tabelas de progresso:' as info;

-- user_flashcard_progress
SELECT 
    'user_flashcard_progress' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_flashcard_progress'
ORDER BY ordinal_position;

-- user_quiz_scores
SELECT 
    'user_quiz_scores' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_quiz_scores'
ORDER BY ordinal_position;

-- user_achievements
SELECT 
    'user_achievements' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_achievements'
ORDER BY ordinal_position;

-- student_profiles
SELECT 
    'student_profiles' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'student_profiles'
ORDER BY ordinal_position; 