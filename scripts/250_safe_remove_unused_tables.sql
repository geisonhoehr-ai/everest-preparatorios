-- Script SEGURO para remover tabelas não utilizadas
-- Considerando as foreign keys identificadas

-- Verificar dados antes da remoção
SELECT 
    '=== VERIFICAÇÃO DE DADOS ANTES DA REMOÇÃO ===' as info;

-- Verificar dados nas tabelas candidatas
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

-- Verificar se há dados importantes nas tabelas relacionadas
SELECT 
    '=== VERIFICANDO TABELAS RELACIONADAS ===' as info;

-- Verificar exam_questions e exam_results (referenciadas por student_answers)
SELECT 
    'exam_questions' as table_name,
    COUNT(*) as total_records
FROM exam_questions;

SELECT 
    'exam_results' as table_name,
    COUNT(*) as total_records
FROM exam_results;

-- Verificar se há dados nas tabelas essenciais que podem ser afetadas
SELECT 
    '=== VERIFICANDO TABELAS ESSENCIAIS ===' as info;

SELECT 
    'flashcards' as table_name,
    COUNT(*) as total_records
FROM flashcards;

SELECT 
    'topics' as table_name,
    COUNT(*) as total_records
FROM topics;

-- REMOÇÃO SEGURA (descomente apenas se não houver dados importantes)

/*
-- 1. Remover tabelas de simulados (em ordem correta devido às foreign keys)
-- Primeiro as tabelas que dependem de simulados
DROP TABLE IF EXISTS simulado_questoes CASCADE;
DROP TABLE IF EXISTS simulado_resultados CASCADE;
-- Depois a tabela principal
DROP TABLE IF EXISTS simulados CASCADE;

-- 2. Remover tabelas de templates (não implementados)
DROP TABLE IF EXISTS templates_feedback CASCADE;
DROP TABLE IF EXISTS templates_redacao CASCADE;

-- 3. Remover tabelas de suporte (não implementado)
DROP TABLE IF EXISTS suporte_mensagens CASCADE;

-- 4. Remover tabelas duplicadas/obsoletas
-- student_answers depende de exam_questions e exam_results
-- Verificar se essas tabelas também podem ser removidas
SELECT 
    'exam_questions' as table_name,
    COUNT(*) as total_records
FROM exam_questions;

SELECT 
    'exam_results' as table_name,
    COUNT(*) as total_records
FROM exam_results;

-- Se exam_questions e exam_results também não são usadas:
-- DROP TABLE IF EXISTS exam_questions CASCADE;
-- DROP TABLE IF EXISTS exam_results CASCADE;
-- DROP TABLE IF EXISTS student_answers CASCADE;

-- wrong_cards depende de flashcards e topics (ESSENCIAIS - NÃO REMOVER)
-- Apenas remover wrong_cards se não houver dados importantes
DROP TABLE IF EXISTS wrong_cards CASCADE;
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
    'simulado_resultados', 'simulados', 'exam_questions', 'exam_results'
)
ORDER BY table_name; 