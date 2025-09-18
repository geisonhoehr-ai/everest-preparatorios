-- ========================================
-- CORRIGIR FUNÇÕES DE SERVER ACTIONS PARA QUIZ
-- ========================================
-- Este script identifica os problemas nas funções de server actions

-- 1. VERIFICAR ESTRUTURA ATUAL DAS TABELAS
SELECT 'ESTRUTURA DA TABELA SUBJECTS' as status,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns 
WHERE table_name = 'subjects' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'ESTRUTURA DA TABELA TOPICS' as status,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns 
WHERE table_name = 'topics' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'ESTRUTURA DA TABELA QUIZZES' as status,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns 
WHERE table_name = 'quizzes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'ESTRUTURA DA TABELA QUIZ_QUESTIONS' as status,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns 
WHERE table_name = 'quiz_questions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. VERIFICAR DADOS EXISTENTES
SELECT 'DADOS EXISTENTES - SUBJECTS' as status,
       id,
       name,
       description
FROM "public"."subjects"
ORDER BY name;

SELECT 'DADOS EXISTENTES - TOPICS' as status,
       t.id,
       t.name as topico,
       s.name as materia,
       t.subject_id
FROM "public"."topics" t
JOIN "public"."subjects" s ON t.subject_id = s.id
ORDER BY s.name, t.name;

SELECT 'DADOS EXISTENTES - QUIZZES' as status,
       q.id,
       q.title,
       q.topic_id,
       t.name as topico
FROM "public"."quizzes" q
JOIN "public"."topics" t ON q.topic_id = t.id
ORDER BY t.name;

SELECT 'DADOS EXISTENTES - QUIZ_QUESTIONS' as status,
       qq.id,
       qq.quiz_id,
       qq.topic_id,
       qq.question_text,
       qq.question_type,
       qq.points
FROM "public"."quiz_questions" qq
ORDER BY qq.id;

-- 3. VERIFICAR PROBLEMAS IDENTIFICADOS
SELECT 'PROBLEMAS IDENTIFICADOS' as status,
       '1. getAllSubjects() retorna id como UUID, mas frontend espera number' as problema_1,
       '2. getTopicsBySubject(subjectId: number) usa number, mas database usa UUID' as problema_2,
       '3. getAllQuizzesByTopic(quizId: string) busca por quiz_id, mas deveria buscar por topic_id' as problema_3,
       '4. Estrutura de dados não está alinhada entre frontend e backend' as problema_4;