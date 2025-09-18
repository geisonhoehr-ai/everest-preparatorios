-- ========================================
-- VERIFICAR DADOS DO EVERCAST
-- ========================================

-- 1. Verificar estrutura das tabelas do EverCast
SELECT 'ESTRUTURA DA TABELA EVERCAST_COURSES' as status,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns 
WHERE table_name = 'evercast_courses' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'ESTRUTURA DA TABELA EVERCAST_MODULES' as status,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns 
WHERE table_name = 'evercast_modules' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'ESTRUTURA DA TABELA EVERCAST_LESSONS' as status,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns 
WHERE table_name = 'evercast_lessons' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'ESTRUTURA DA TABELA EVERCAST_USER_PROGRESS' as status,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns 
WHERE table_name = 'evercast_user_progress' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar dados existentes
SELECT 'DADOS EXISTENTES - EVERCAST_COURSES' as status,
       COUNT(*) as total_courses
FROM "public"."evercast_courses";

SELECT 'DADOS EXISTENTES - EVERCAST_MODULES' as status,
       COUNT(*) as total_modules
FROM "public"."evercast_modules";

SELECT 'DADOS EXISTENTES - EVERCAST_LESSONS' as status,
       COUNT(*) as total_lessons
FROM "public"."evercast_lessons";

SELECT 'DADOS EXISTENTES - EVERCAST_USER_PROGRESS' as status,
       COUNT(*) as total_progress
FROM "public"."evercast_user_progress";

-- 3. Verificar se as tabelas existem
SELECT 'VERIFICAR EXISTÊNCIA DAS TABELAS' as status,
       CASE 
           WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'evercast_courses' AND table_schema = 'public') 
           THEN 'evercast_courses: ✅ EXISTE'
           ELSE 'evercast_courses: ❌ NÃO EXISTE'
       END as evercast_courses,
       CASE 
           WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'evercast_modules' AND table_schema = 'public') 
           THEN 'evercast_modules: ✅ EXISTE'
           ELSE 'evercast_modules: ❌ NÃO EXISTE'
       END as evercast_modules,
       CASE 
           WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'evercast_lessons' AND table_schema = 'public') 
           THEN 'evercast_lessons: ✅ EXISTE'
           ELSE 'evercast_lessons: ❌ NÃO EXISTE'
       END as evercast_lessons,
       CASE 
           WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'evercast_user_progress' AND table_schema = 'public') 
           THEN 'evercast_user_progress: ✅ EXISTE'
           ELSE 'evercast_user_progress: ❌ NÃO EXISTE'
       END as evercast_user_progress;
