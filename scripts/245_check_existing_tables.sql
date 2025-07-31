-- Script para verificar todas as tabelas existentes no Supabase
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

-- Verificar se há dados na tabela student_progress (se existir)
SELECT 
    'Dados na tabela student_progress:' as info,
    COUNT(*) as total_records
FROM student_progress;

-- Verificar estrutura da tabela student_progress (se existir)
SELECT 
    'Estrutura da tabela student_progress:' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'student_progress'
ORDER BY ordinal_position;

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