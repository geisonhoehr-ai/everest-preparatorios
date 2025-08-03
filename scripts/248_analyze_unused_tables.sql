-- Script para analisar tabelas e identificar quais podem ser removidas
-- Listar todas as tabelas existentes
SELECT 
    'Todas as tabelas existentes:' as info;

SELECT 
    table_name,
    'EXISTE' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar tabelas que podem ser removidas
SELECT 
    'Análise de tabelas para remoção:' as info;

-- Tabelas que podem ser removidas (não usadas no projeto atual)
SELECT 
    'CANDIDATAS PARA REMOÇÃO:' as categoria,
    table_name,
    'Pode ser removida' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'student_answers', -- Substituída por respostas_aluno
    'wrong_cards', -- Funcionalidade não implementada
    'suporte_mensagens', -- Sistema de suporte não implementado
    'templates_feedback', -- Templates não implementados
    'templates_redacao', -- Templates não implementados
    'simulado_questoes', -- Simulados não implementados
    'simulado_resultados', -- Simulados não implementados
    'simulados', -- Simulados não implementados
    'tentativas_prova' -- Substituída por tentativas_prova
)
ORDER BY table_name;

-- Tabelas essenciais (NÃO REMOVER)
SELECT 
    'TABELAS ESSENCIAIS (NÃO REMOVER):' as categoria,
    table_name,
    'Manter' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'user_roles', -- Controle de acesso
    'student_profiles', -- Perfis dos alunos
    'teacher_profiles', -- Perfis dos professores
    'members', -- Gestão de membros
    'user_flashcard_progress', -- Progresso flashcards
    'user_quiz_scores', -- Pontuações quizzes
    'user_topic_progress', -- Progresso tópicos
    'user_achievements', -- Conquistas
    'user_sessions', -- Sessões usuário
    'subjects', -- Matérias
    'topics', -- Tópicos
    'flashcards', -- Flashcards
    'quiz', -- Quizzes
    'quiz_questions', -- Questões quiz
    'quiz_options', -- Opções quiz
    'provas', -- Provas
    'questoes', -- Questões provas
    'opcoes_questao', -- Opções questões
    'tentativas_prova', -- Tentativas provas
    'respostas_aluno', -- Respostas alunos
    'livros', -- Acervo digital
    'redacao', -- Redações
    'temas_redacao', -- Temas redação
    'turmas', -- Turmas
    'subscriptions', -- Assinaturas
    'community', -- Comunidade
    'posts', -- Posts comunidade
    'comments', -- Comentários
    'calendario', -- Calendário
    'events' -- Eventos
)
ORDER BY table_name;

-- Verificar dados nas tabelas candidatas para remoção
SELECT 
    'Dados nas tabelas candidatas para remoção:' as info;

-- student_answers
SELECT 
    'student_answers' as table_name,
    COUNT(*) as total_records
FROM student_answers;

-- wrong_cards
SELECT 
    'wrong_cards' as table_name,
    COUNT(*) as total_records
FROM wrong_cards;

-- suporte_mensagens
SELECT 
    'suporte_mensagens' as table_name,
    COUNT(*) as total_records
FROM suporte_mensagens;

-- templates_feedback
SELECT 
    'templates_feedback' as table_name,
    COUNT(*) as total_records
FROM templates_feedback;

-- templates_redacao
SELECT 
    'templates_redacao' as table_name,
    COUNT(*) as total_records
FROM templates_redacao;

-- simulado_questoes
SELECT 
    'simulado_questoes' as table_name,
    COUNT(*) as total_records
FROM simulado_questoes;

-- simulado_resultados
SELECT 
    'simulado_resultados' as table_name,
    COUNT(*) as total_records
FROM simulado_resultados;

-- simulados
SELECT 
    'simulados' as table_name,
    COUNT(*) as total_records
FROM simulados;

-- Verificar dependências entre tabelas
SELECT 
    'Análise de dependências:' as info;

-- Verificar se há foreign keys para as tabelas candidatas
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
AND tc.table_name IN (
    'student_answers',
    'wrong_cards',
    'suporte_mensagens',
    'templates_feedback',
    'templates_redacao',
    'simulado_questoes',
    'simulado_resultados',
    'simulados'
); 