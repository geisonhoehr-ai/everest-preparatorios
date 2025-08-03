-- Script para criar quizzes automaticamente baseados nos flashcards existentes
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se as tabelas de quiz existem
SELECT 
  'VERIFICANDO TABELAS DE QUIZ' as info,
  table_name,
  CASE WHEN table_name IS NOT NULL THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END as status
FROM information_schema.tables 
WHERE table_name IN ('quizzes', 'quiz_questions')
AND table_schema = 'public';

-- 2. Criar quizzes para tópicos de Português
-- Cada tópico terá um quiz com 10 questões baseadas nos flashcards

-- Quiz para Sintaxe: Termos Integrantes
INSERT INTO quizzes (topic_id, title, description) VALUES
('sintaxe-termos-integrantes', 'Quiz: Termos Integrantes da Oração', 'Teste seus conhecimentos sobre objeto direto, objeto indireto, complemento nominal e agente da passiva.')
ON CONFLICT DO NOTHING;

-- Quiz para Regência
INSERT INTO quizzes (topic_id, title, description) VALUES
('regencia', 'Quiz: Regência Verbal e Nominal', 'Avalie seu domínio sobre a regência de verbos e nomes, incluindo preposições obrigatórias.')
ON CONFLICT DO NOTHING;

-- Quiz para Crase
INSERT INTO quizzes (topic_id, title, description) VALUES
('crase', 'Quiz: Uso da Crase', 'Teste seus conhecimentos sobre quando usar a crase, incluindo casos obrigatórios e facultativos.')
ON CONFLICT DO NOTHING;

-- Quiz para Morfologia: Flexão
INSERT INTO quizzes (topic_id, title, description) VALUES
('morfologia-flexao', 'Quiz: Flexões Gramaticais', 'Avalie seu conhecimento sobre flexões nominais, verbais, pronominais e adjetivas.')
ON CONFLICT DO NOTHING;

-- Quiz para Fonética e Fonologia
INSERT INTO quizzes (topic_id, title, description) VALUES
('fonetica-fonologia', 'Quiz: Fonética e Fonologia', 'Teste seus conhecimentos sobre fonemas, sílabas, encontros vocálicos e processos fonológicos.')
ON CONFLICT DO NOTHING;

-- Quiz para Concordância
INSERT INTO quizzes (topic_id, title, description) VALUES
('concordancia', 'Quiz: Concordância Verbal e Nominal', 'Avalie seu domínio sobre concordância verbal e nominal, incluindo casos especiais.')
ON CONFLICT DO NOTHING;

-- Quiz para Acentuação Gráfica
INSERT INTO quizzes (topic_id, title, description) VALUES
('acentuacao-grafica', 'Quiz: Acentuação Gráfica', 'Teste seus conhecimentos sobre regras de acentuação e acentos diferenciais.')
ON CONFLICT DO NOTHING;

-- Quiz para Ortografia
INSERT INTO quizzes (topic_id, title, description) VALUES
('ortografia', 'Quiz: Ortografia', 'Avalie seu conhecimento sobre uso de letras, hífen e grafia correta.')
ON CONFLICT DO NOTHING;

-- Quiz para Colocação Pronominal
INSERT INTO quizzes (topic_id, title, description) VALUES
('colocacao-pronominal', 'Quiz: Colocação Pronominal', 'Teste seus conhecimentos sobre próclise, mesóclise e ênclise.')
ON CONFLICT DO NOTHING;

-- Quiz para Morfologia: Classes de Palavras
INSERT INTO quizzes (topic_id, title, description) VALUES
('morfologia-classes', 'Quiz: Classes de Palavras', 'Avalie seu conhecimento sobre substantivo, adjetivo, verbo e outras classes gramaticais.')
ON CONFLICT DO NOTHING;

-- Quiz para Semântica e Estilística
INSERT INTO quizzes (topic_id, title, description) VALUES
('semantica-estilistica', 'Quiz: Semântica e Estilística', 'Teste seus conhecimentos sobre sinonímia, antonímia, polissemia e figuras de linguagem.')
ON CONFLICT DO NOTHING;

-- Quiz para Sintaxe: Período Composto
INSERT INTO quizzes (topic_id, title, description) VALUES
('sintaxe-periodo-composto', 'Quiz: Período Composto', 'Avalie seu conhecimento sobre orações coordenadas e subordinadas.')
ON CONFLICT DO NOTHING;

-- Quiz para Sintaxe: Termos Acessórios
INSERT INTO quizzes (topic_id, title, description) VALUES
('sintaxe-termos-acessorios', 'Quiz: Termos Acessórios', 'Teste seus conhecimentos sobre adjunto adnominal, adjunto adverbial, aposto e vocativo.')
ON CONFLICT DO NOTHING;

-- Quiz para Sintaxe: Termos Essenciais
INSERT INTO quizzes (topic_id, title, description) VALUES
('sintaxe-termos-essenciais', 'Quiz: Termos Essenciais', 'Avalie seu conhecimento sobre sujeito e predicado.')
ON CONFLICT DO NOTHING;

-- 3. Criar quizzes para Regulamentos Militares
-- Quiz para ICA 111-6
INSERT INTO quizzes (topic_id, title, description) VALUES
('ica-111-6', 'Quiz: ICA 111-6 - Regulamento de Inspeção', 'Teste seus conhecimentos sobre o regulamento de inspeção da Aeronáutica.')
ON CONFLICT DO NOTHING;

-- Quiz para Estatuto dos Militares
INSERT INTO quizzes (topic_id, title, description) VALUES
('estatuto-militares', 'Quiz: Estatuto dos Militares', 'Avalie seu conhecimento sobre o estatuto dos militares das Forças Armadas.')
ON CONFLICT DO NOTHING;

-- Quiz para ICA 111-3
INSERT INTO quizzes (topic_id, title, description) VALUES
('ica-111-3', 'Quiz: ICA 111-3 - Regulamento de Tráfego Aéreo', 'Teste seus conhecimentos sobre regulamento de tráfego aéreo.')
ON CONFLICT DO NOTHING;

-- Quiz para RDAER
INSERT INTO quizzes (topic_id, title, description) VALUES
('rdaer', 'Quiz: RDAER - Regulamento de Defesa Aérea', 'Avalie seu conhecimento sobre o regulamento de defesa aérea.')
ON CONFLICT DO NOTHING;

-- Quiz para ICA 111-2
INSERT INTO quizzes (topic_id, title, description) VALUES
('ica-111-2', 'Quiz: ICA 111-2 - Regulamento de Navegação Aérea', 'Teste seus conhecimentos sobre regulamento de navegação aérea.')
ON CONFLICT DO NOTHING;

-- 4. Verificar quizzes criados
SELECT 
  'QUIZZES CRIADOS' as info,
  q.id,
  q.topic_id,
  q.title,
  q.description
FROM quizzes q
ORDER BY q.topic_id; 