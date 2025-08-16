-- Script FINAL para remover tabelas não utilizadas
-- Baseado na análise completa do código atual

-- Verificar dados antes da remoção
SELECT 
    '=== VERIFICAÇÃO DE DADOS ANTES DA REMOÇÃO ===' as info;

-- Verificar dados nas tabelas candidatas para remoção
SELECT 
    'student_answers' as table_name,
    COUNT(*) as total_records
FROM student_answers;

SELECT 
    'wrong_cards' as table_name,
    COUNT(*) as total_records
FROM wrong_cards;

SELECT 
    'suporte_mensagens' as table_name,
    COUNT(*) as total_records
FROM suporte_mensagens;

SELECT 
    'templates_feedback' as table_name,
    COUNT(*) as total_records
FROM templates_feedback;

SELECT 
    'templates_redacao' as table_name,
    COUNT(*) as total_records
FROM templates_redacao;

SELECT 
    'simulado_questoes' as table_name,
    COUNT(*) as total_records
FROM simulado_questoes;

SELECT 
    'simulado_resultados' as table_name,
    COUNT(*) as total_records
FROM simulado_resultados;

SELECT 
    'simulados' as table_name,
    COUNT(*) as total_records
FROM simulados;

SELECT 
    'paid_users' as table_name,
    COUNT(*) as total_records
FROM paid_users;

-- Verificar tabelas relacionadas que também podem ser removidas
SELECT 
    '=== VERIFICANDO TABELAS RELACIONADAS ===' as info;

SELECT 
    'exam_questions' as table_name,
    COUNT(*) as total_records
FROM exam_questions;

SELECT 
    'exam_results' as table_name,
    COUNT(*) as total_records
FROM exam_results;

-- Verificar outras tabelas que podem não estar sendo usadas
SELECT 
    '=== VERIFICANDO OUTRAS TABELAS ===' as info;

SELECT 
    'alunos_turmas' as table_name,
    COUNT(*) as total_records
FROM alunos_turmas;

SELECT 
    'avaliacoes_redacao' as table_name,
    COUNT(*) as total_records
FROM avaliacoes_redacao;

SELECT 
    'calendar_events' as table_name,
    COUNT(*) as total_records
FROM calendar_events;

SELECT 
    'classes' as table_name,
    COUNT(*) as total_records
FROM classes;

SELECT 
    'content_rules' as table_name,
    COUNT(*) as total_records
FROM content_rules;

SELECT 
    'course_enrollments' as table_name,
    COUNT(*) as total_records
FROM course_enrollments;

SELECT 
    'course_lessons' as table_name,
    COUNT(*) as total_records
FROM course_lessons;

SELECT 
    'course_materials' as table_name,
    COUNT(*) as total_records
FROM course_materials;

SELECT 
    'course_modules' as table_name,
    COUNT(*) as total_records
FROM course_modules;

SELECT 
    'courses' as table_name,
    COUNT(*) as total_records
FROM courses;

SELECT 
    'criterios_avaliacao' as table_name,
    COUNT(*) as total_records
FROM criterios_avaliacao;

SELECT 
    'eaof_exams' as table_name,
    COUNT(*) as total_records
FROM eaof_exams;

SELECT 
    'erros_identificados' as table_name,
    COUNT(*) as total_records
FROM erros_identificados;

SELECT 
    'individual_courses' as table_name,
    COUNT(*) as total_records
FROM individual_courses;

SELECT 
    'lesson_progress' as table_name,
    COUNT(*) as total_records
FROM lesson_progress;

SELECT 
    'live_session_classes' as table_name,
    COUNT(*) as total_records
FROM live_session_classes;

SELECT 
    'live_sessions' as table_name,
    COUNT(*) as total_records
FROM live_sessions;

SELECT 
    'member_classes' as table_name,
    COUNT(*) as total_records
FROM member_classes;

SELECT 
    'notificacoes' as table_name,
    COUNT(*) as total_records
FROM notificacoes;

SELECT 
    'profiles' as table_name,
    COUNT(*) as total_records
FROM profiles;

SELECT 
    'question_alternatives' as table_name,
    COUNT(*) as total_records
FROM question_alternatives;

SELECT 
    'quizzes' as table_name,
    COUNT(*) as total_records
FROM quizzes;

SELECT 
    'redacao_imagens' as table_name,
    COUNT(*) as total_records
FROM redacao_imagens;

SELECT 
    'redacoes' as table_name,
    COUNT(*) as total_records
FROM redacoes;

-- REMOÇÃO SEGURA (descomente apenas se não houver dados importantes)

/*
-- 1. Remover tabelas de simulados (em ordem correta devido às foreign keys)
DROP TABLE IF EXISTS simulado_questoes CASCADE;
DROP TABLE IF EXISTS simulado_resultados CASCADE;
DROP TABLE IF EXISTS simulados CASCADE;

-- 2. Remover tabelas de templates (não implementados)
DROP TABLE IF EXISTS templates_feedback CASCADE;
DROP TABLE IF EXISTS templates_redacao CASCADE;

-- 3. Remover tabelas de suporte (não implementado)
DROP TABLE IF EXISTS suporte_mensagens CASCADE;

-- 4. Remover tabelas duplicadas/obsoletas
-- student_answers depende de exam_questions e exam_results
DROP TABLE IF EXISTS exam_questions CASCADE;
DROP TABLE IF EXISTS exam_results CASCADE;
DROP TABLE IF EXISTS student_answers CASCADE;

-- wrong_cards depende de flashcards e topics (ESSENCIAIS - NÃO REMOVER)
-- Apenas remover wrong_cards se não houver dados importantes
DROP TABLE IF EXISTS wrong_cards CASCADE;

-- 5. Remover paid_users (não mais usada no código atual)
DROP TABLE IF EXISTS paid_users CASCADE;

-- 6. Remover outras tabelas não utilizadas
DROP TABLE IF EXISTS alunos_turmas CASCADE;
DROP TABLE IF EXISTS avaliacoes_redacao CASCADE;
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS content_rules CASCADE;
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS course_lessons CASCADE;
DROP TABLE IF EXISTS course_materials CASCADE;
DROP TABLE IF EXISTS course_modules CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS criterios_avaliacao CASCADE;
DROP TABLE IF EXISTS eaof_exams CASCADE;
DROP TABLE IF EXISTS erros_identificados CASCADE;
DROP TABLE IF EXISTS individual_courses CASCADE;
DROP TABLE IF EXISTS lesson_progress CASCADE;
DROP TABLE IF EXISTS live_session_classes CASCADE;
DROP TABLE IF EXISTS live_sessions CASCADE;
DROP TABLE IF EXISTS member_classes CASCADE;
DROP TABLE IF EXISTS notificacoes CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS question_alternatives CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS redacao_imagens CASCADE;
DROP TABLE IF EXISTS redacoes CASCADE;
*/

-- Verificar tabelas restantes após remoção
SELECT 
    '=== TABELAS RESTANTES APÓS LIMPEZA ===' as info;

SELECT 
    table_name,
    'MANTIDA' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Resumo final
SELECT 
    '=== RESUMO FINAL ===' as info,
    COUNT(*) as total_tabelas_restantes
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Listar tabelas essenciais que devem permanecer
SELECT 
    '=== TABELAS ESSENCIAIS MANTIDAS ===' as info;

SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('user_roles', 'student_profiles', 'teacher_profiles', 'members') THEN 'Usuários e Controle'
        WHEN table_name IN ('subjects', 'topics', 'flashcards', 'quiz', 'quiz_questions', 'quiz_options') THEN 'Conteúdo Educacional'
        WHEN table_name IN ('provas', 'questoes', 'opcoes_questao', 'tentativas_prova', 'respostas_aluno') THEN 'Sistema de Provas'
        WHEN table_name IN ('user_flashcard_progress', 'user_quiz_scores', 'user_topic_progress', 'user_achievements') THEN 'Progresso e Dados'
        WHEN table_name IN ('livros', 'redacao', 'temas_redacao', 'turmas', 'subscriptions') THEN 'Recursos e Assinaturas'
        WHEN table_name IN ('community', 'posts', 'comments', 'calendario', 'events') THEN 'Comunidade e Sistema'
        ELSE 'Outras'
    END as categoria
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name NOT IN (
    'student_answers', 'wrong_cards', 'suporte_mensagens', 
    'templates_feedback', 'templates_redacao', 'simulado_questoes', 
    'simulado_resultados', 'simulados', 'exam_questions', 'exam_results',
    'paid_users', 'alunos_turmas', 'avaliacoes_redacao', 'calendar_events',
    'classes', 'content_rules', 'course_enrollments', 'course_lessons',
    'course_materials', 'course_modules', 'courses', 'criterios_avaliacao',
    'eaof_exams', 'erros_identificados', 'individual_courses', 'lesson_progress',
    'live_session_classes', 'live_sessions', 'member_classes', 'notificacoes',
    'profiles', 'question_alternatives', 'quizzes', 'redacao_imagens', 'redacoes'
)
ORDER BY table_name; 