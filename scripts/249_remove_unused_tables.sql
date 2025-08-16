-- Script para remover tabelas não utilizadas
-- ATENÇÃO: Execute apenas após verificar que não há dados importantes

-- Verificar se há dados importantes antes de remover
SELECT 
    'Verificando dados antes da remoção:' as info;

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

-- Remover tabelas não utilizadas (apenas se não houver dados importantes)
-- Descomente as linhas abaixo se quiser remover as tabelas

/*
-- Remover tabelas de simulados (não implementados)
DROP TABLE IF EXISTS simulado_questoes CASCADE;
DROP TABLE IF EXISTS simulado_resultados CASCADE;
DROP TABLE IF EXISTS simulados CASCADE;

-- Remover tabelas de templates (não implementados)
DROP TABLE IF EXISTS templates_feedback CASCADE;
DROP TABLE IF EXISTS templates_redacao CASCADE;

-- Remover tabelas de suporte (não implementado)
DROP TABLE IF EXISTS suporte_mensagens CASCADE;

-- Remover tabelas duplicadas/obsoletas
DROP TABLE IF EXISTS student_answers CASCADE; -- Substituída por respostas_aluno
DROP TABLE IF EXISTS wrong_cards CASCADE; -- Funcionalidade não implementada
*/

-- Verificar tabelas restantes após remoção
SELECT 
    'Tabelas restantes após limpeza:' as info;

SELECT 
    table_name,
    'MANTIDA' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Resumo das tabelas essenciais
SELECT 
    'TABELAS ESSENCIAIS MANTIDAS:' as categoria,
    COUNT(*) as total_tabelas
FROM information_schema.tables 
WHERE table_schema = 'public'; 