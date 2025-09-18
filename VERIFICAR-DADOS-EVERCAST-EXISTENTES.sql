-- ========================================
-- VERIFICAR DADOS EXISTENTES DO EVERCAST
-- ========================================

-- 1. Verificar estrutura das tabelas
SELECT 'ESTRUTURA DA TABELA AUDIO_COURSES' as status,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns 
WHERE table_name = 'audio_courses' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'ESTRUTURA DA TABELA AUDIO_MODULES' as status,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns 
WHERE table_name = 'audio_modules' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'ESTRUTURA DA TABELA AUDIO_LESSONS' as status,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns 
WHERE table_name = 'audio_lessons' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'ESTRUTURA DA TABELA AUDIO_PROGRESS' as status,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns 
WHERE table_name = 'audio_progress' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar dados existentes
SELECT 'DADOS EXISTENTES - AUDIO_COURSES' as status,
       COUNT(*) as total_courses
FROM "public"."audio_courses";

SELECT 'DADOS EXISTENTES - AUDIO_MODULES' as status,
       COUNT(*) as total_modules
FROM "public"."audio_modules";

SELECT 'DADOS EXISTENTES - AUDIO_LESSONS' as status,
       COUNT(*) as total_lessons
FROM "public"."audio_lessons";

SELECT 'DADOS EXISTENTES - AUDIO_PROGRESS' as status,
       COUNT(*) as total_progress
FROM "public"."audio_progress";

-- 3. Verificar dados detalhados (se existirem)
SELECT 'CURSOS DISPONÍVEIS' as status,
       id,
       name,
       description,
       created_at
FROM "public"."audio_courses"
ORDER BY created_at DESC
LIMIT 5;

SELECT 'MÓDULOS DISPONÍVEIS' as status,
       id,
       name,
       course_id,
       created_at
FROM "public"."audio_modules"
ORDER BY created_at DESC
LIMIT 5;

SELECT 'AULAS DISPONÍVEIS' as status,
       id,
       title,
       module_id,
       audio_url,
       hls_url,
       soundcloud_url,
       duration,
       created_at
FROM "public"."audio_lessons"
ORDER BY created_at DESC
LIMIT 5;

SELECT 'PROGRESSO DOS USUÁRIOS' as status,
       id,
       user_id,
       lesson_id,
       progress_percentage,
       completed_at
FROM "public"."audio_progress"
ORDER BY completed_at DESC
LIMIT 5;
