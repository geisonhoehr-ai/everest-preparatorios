-- =====================================================
-- SCRIPT DE LIMPEZA DE TABELAS OBSOLETAS - ATUALIZADO
-- EVEREST PREPARATÓRIOS - SUPABASE CLEANUP
-- =====================================================

-- Este script remove tabelas que não estão sendo usadas no projeto
-- Baseado na análise real das tabelas existentes no Supabase
-- Execute com cuidado e faça backup antes se necessário

-- =====================================================
-- TABELAS OBSOLETAS (FUNCIONALIDADES NÃO IMPLEMENTADAS)
-- =====================================================

-- 1. user_profiles - Substituído por student_profiles/teacher_profiles
DROP TABLE IF EXISTS user_profiles CASCADE;

-- 2. quiz - Substituído por quiz_questions
DROP TABLE IF EXISTS quiz CASCADE;

-- 3. redacao_templates - Substituído por templates_redacao
DROP TABLE IF EXISTS redacao_templates CASCADE;

-- 4. user_sessions - Não implementado
DROP TABLE IF EXISTS user_sessions CASCADE;

-- =====================================================
-- TABELAS DUPLICADAS/REPETIDAS (CONSOLIDAR)
-- =====================================================

-- 5. available_achievements - Duplicado com achievements
DROP TABLE IF EXISTS available_achievements CASCADE;

-- 6. question_alternatives - Duplicado com opcoes_questao
DROP TABLE IF EXISTS question_alternatives CASCADE;

-- 7. student_answers - Duplicado com respostas_aluno
DROP TABLE IF EXISTS student_answers CASCADE;

-- 8. user_activity_log - Duplicado com user_daily_stats
DROP TABLE IF EXISTS user_activity_log CASCADE;

-- =====================================================
-- TABELAS OPCIONAIS VAZIAS (PODEM SER REMOVIDAS)
-- =====================================================

-- 9. paid_users - Controle de acesso pago (0 registros)
-- DESCOMENTE A LINHA ABAIXO SE NÃO FOR USAR CONTROLE DE ACESSO PAGO
-- DROP TABLE IF EXISTS paid_users CASCADE;

-- 10. wrong_cards - Cards marcados como errados (0 registros)
-- DESCOMENTE A LINHA ABAIXO SE NÃO FOR USAR SISTEMA DE CARDS ERRADOS
-- DROP TABLE IF EXISTS wrong_cards CASCADE;

-- 11. achievements - Sistema de conquistas (0 registros)
-- DESCOMENTE A LINHA ABAIXO SE NÃO FOR USAR SISTEMA DE CONQUISTAS
-- DROP TABLE IF EXISTS achievements CASCADE;

-- =====================================================
-- TABELAS QUE DEVEM SER MANTIDAS
-- =====================================================

-- ✅ TABELAS ESSENCIAIS (FUNCIONANDO)
-- user_roles - Sistema de autenticação (ESSENCIAL)
-- subjects - Matérias (ESSENCIAL)
-- topics - Tópicos por matéria (ESSENCIAL)
-- flashcards - Cards de estudo (ESSENCIAL)
-- quiz_questions - Questões de quiz (ESSENCIAL)
-- student_profiles - Perfis de alunos (ESSENCIAL)
-- teacher_profiles - Perfis de professores (ESSENCIAL)
-- user_achievements - Conquistas dos usuários (EM USO)

-- 🚧 TABELAS NECESSÁRIAS PARA FUNCIONALIDADES PARCIAIS
-- calendar_events - Calendário de eventos (PARCIAL)
-- redacoes - Redações dos alunos (PARCIAL)
-- temas_redacao - Temas de redação (PARCIAL)
-- redacao_imagens - Imagens das redações (PARCIAL)
-- avaliacoes_redacao - Avaliações de redação (PARCIAL)
-- provas - Provas online (PARCIAL)
-- suporte_mensagens - Sistema de suporte (PARCIAL)
-- templates_redacao - Templates de redação (PARCIAL)

-- 📋 TABELAS PARA FUNCIONALIDADES FUTURAS
-- community_posts - Posts da comunidade (PLANEJADO)
-- turmas - Turmas (PLANEJADO)
-- alunos_turmas - Alunos por turma (PLANEJADO)
-- user_topic_progress - Progresso por tópico (PLANEJADO)

-- 🆕 TABELAS NOVAS (CRIAR COM SCRIPT 500)
-- member_subscriptions - Assinaturas dos membros (CRIAR)
-- member_courses - Cursos dos membros (CRIAR)
-- member_activities - Atividades dos membros (CRIAR)

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar tabelas restantes
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =====================================================
-- RESUMO DA LIMPEZA
-- =====================================================

/*
TABELAS REMOVIDAS:
- user_profiles - Substituído por student_profiles/teacher_profiles
- quiz - Substituído por quiz_questions
- redacao_templates - Substituído por templates_redacao
- user_sessions - Não implementado
- available_achievements - Duplicado com achievements
- question_alternatives - Duplicado com opcoes_questao
- student_answers - Duplicado com respostas_aluno
- user_activity_log - Duplicado com user_daily_stats

TABELAS MANTIDAS:
✅ ESSENCIAIS (FUNCIONANDO):
- user_roles (6 colunas) - Sistema de auth
- subjects (2 colunas) - Português, Regulamentos
- topics (4 colunas) - Tópicos por matéria
- flashcards (4 colunas) - Cards de estudo
- quiz_questions (6 colunas) - Questões de quiz
- student_profiles (34 colunas) - Perfis de alunos
- teacher_profiles (12 colunas) - Perfis de professores
- user_achievements (4 colunas) - Sistema de conquistas

🚧 NECESSÁRIAS (PARCIAIS):
- calendar_events (17 colunas) - Calendário
- redacoes (25 colunas) - Redações
- temas_redacao (11 colunas) - Temas de redação
- redacao_imagens (10 colunas) - Imagens de redação
- avaliacoes_redacao (49 colunas) - Avaliações
- provas (17 colunas) - Provas online
- suporte_mensagens (6 colunas) - Suporte
- templates_redacao (7 colunas) - Templates

📋 FUTURAS (PLANEJADO):
- turmas (10 colunas) - Turmas
- alunos_turmas (3 colunas) - Alunos por turma
- user_topic_progress (6 colunas) - Progresso por tópico

🆕 NOVAS (CRIAR):
- member_subscriptions - Assinaturas
- member_courses - Cursos
- member_activities - Atividades

TABELAS OPCIONAIS (manter se usar):
- paid_users (5 colunas) - Controle de acesso pago
- wrong_cards (7 colunas) - Cards marcados como errados
- achievements (9 colunas) - Sistema de conquistas
*/

-- =====================================================
-- PRÓXIMOS PASSOS
-- =====================================================

/*
1. ✅ Manter tabelas essenciais (já funcionam)
2. 🚧 Verificar/criar tabelas para funcionalidades parciais
3. 🗑️ Remover tabelas obsoletas e duplicadas (este script)
4. 🆕 Criar novas tabelas de membros (script 500)
5. 📋 Planejar tabelas para funcionalidades futuras
6. 🔧 Corrigir erro da página de quiz
7. 🚀 Implementar funcionalidades parciais
*/
