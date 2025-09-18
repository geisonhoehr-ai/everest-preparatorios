-- ========================================
-- VERIFICAR ESTRUTURA REAL DAS TABELAS DE ÁUDIO
-- ========================================

-- 1. Verificar estrutura da tabela audio_courses
SELECT 'ESTRUTURA DA TABELA AUDIO_COURSES' as status,
       column_name,
       data_type,
       is_nullable,
       column_default
FROM information_schema.columns 
WHERE table_name = 'audio_courses' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar estrutura da tabela audio_modules
SELECT 'ESTRUTURA DA TABELA AUDIO_MODULES' as status,
       column_name,
       data_type,
       is_nullable,
       column_default
FROM information_schema.columns 
WHERE table_name = 'audio_modules' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar estrutura da tabela audio_lessons
SELECT 'ESTRUTURA DA TABELA AUDIO_LESSONS' as status,
       column_name,
       data_type,
       is_nullable,
       column_default
FROM information_schema.columns 
WHERE table_name = 'audio_lessons' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar estrutura da tabela audio_progress
SELECT 'ESTRUTURA DA TABELA AUDIO_PROGRESS' as status,
       column_name,
       data_type,
       is_nullable,
       column_default
FROM information_schema.columns 
WHERE table_name = 'audio_progress' 
AND table_schema = 'public'
ORDER BY ordinal_position;
