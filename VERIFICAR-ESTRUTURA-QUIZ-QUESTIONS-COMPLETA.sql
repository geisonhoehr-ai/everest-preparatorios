-- ========================================
-- VERIFICAR ESTRUTURA COMPLETA DA TABELA QUIZ_QUESTIONS
-- ========================================

-- 1. Verificar estrutura da tabela quiz_questions
SELECT 'ESTRUTURA DA TABELA QUIZ_QUESTIONS' as status,
       column_name,
       data_type,
       is_nullable,
       column_default
FROM information_schema.columns 
WHERE table_name = 'quiz_questions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar se há quizzes criados
SELECT 'QUIZZES CRIADOS' as status,
       q.id,
       q.title,
       q.topic_id,
       t.name as topico
FROM "public"."quizzes" q
LEFT JOIN "public"."topics" t ON q.topic_id = t.id
ORDER BY q.title;

-- 3. Verificar se há questões existentes
SELECT 'QUESTÕES EXISTENTES' as status,
       qq.id,
       qq.quiz_id,
       qq.question_text,
       q.title as quiz
FROM "public"."quiz_questions" qq
LEFT JOIN "public"."quizzes" q ON qq.quiz_id = q.id
ORDER BY qq.id;

-- 4. Verificar tópicos disponíveis
SELECT 'TÓPICOS DISPONÍVEIS' as status,
       t.id,
       t.name as topico,
       s.name as materia
FROM "public"."topics" t
JOIN "public"."subjects" s ON t.subject_id = s.id
ORDER BY s.name, t.name;
