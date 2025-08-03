-- Script para gerar questões de quiz para regulamentos militares
-- Execute este script no Supabase SQL Editor

-- Questões para Quiz de ICA 111-6 (Regulamento de Inspeção)
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_answer, explanation) VALUES
-- Questão 1
((SELECT id FROM quizzes WHERE topic_id = 'ica-111-6' LIMIT 1), 
'Qual é o objetivo principal do ICA 111-6?', 
'["Estabelecer normas de voo", "Regulamentar inspeções na Aeronáutica", "Definir hierarquia militar", "Organizar treinamentos"]', 
'Regulamentar inspeções na Aeronáutica', 
'O ICA 111-6 tem como objetivo principal regulamentar as inspeções realizadas na Aeronáutica.'),

-- Questão 2
((SELECT id FROM quizzes WHERE topic_id = 'ica-111-6' LIMIT 1), 
'Quem pode realizar inspeções conforme o ICA 111-6?', 
'["Apenas oficiais", "Apenas sargentos", "Pessoal autorizado", "Apenas civis"]', 
'Pessoal autorizado', 
'As inspeções conforme o ICA 111-6 podem ser realizadas por pessoal devidamente autorizado.'),

-- Questão 3
((SELECT id FROM quizzes WHERE topic_id = 'ica-111-6' LIMIT 1), 
'Qual a frequência mínima das inspeções de segurança?', 
'["Mensal", "Trimestral", "Semestral", "Anual"]', 
'Semestral', 
'As inspeções de segurança devem ser realizadas com frequência mínima semestral.'),

-- Questão 4
((SELECT id FROM quizzes WHERE topic_id = 'ica-111-6' LIMIT 1), 
'O que deve ser verificado em uma inspeção de segurança?', 
'["Apenas documentos", "Apenas equipamentos", "Documentos e equipamentos", "Apenas pessoal"]', 
'Documentos e equipamentos', 
'Uma inspeção de segurança deve verificar tanto documentos quanto equipamentos.'),

-- Questão 5
((SELECT id FROM quizzes WHERE topic_id = 'ica-111-6' LIMIT 1), 
'Qual documento deve ser elaborado após uma inspeção?', 
'["Relatório de inspeção", "Apenas checklist", "Apenas fotos", "Apenas assinatura"]', 
'Relatório de inspeção', 
'Após uma inspeção, deve ser elaborado um relatório detalhado da inspeção.')
ON CONFLICT DO NOTHING;

-- Questões para Quiz de Estatuto dos Militares
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_answer, explanation) VALUES
-- Questão 1
((SELECT id FROM quizzes WHERE topic_id = 'estatuto-militares' LIMIT 1), 
'Qual lei estabelece o Estatuto dos Militares?', 
'["Lei 6.880/1980", "Lei 6.880/1981", "Lei 6.880/1982", "Lei 6.880/1983"]', 
'Lei 6.880/1980', 
'O Estatuto dos Militares é estabelecido pela Lei 6.880/1980.'),

-- Questão 2
((SELECT id FROM quizzes WHERE topic_id = 'estatuto-militares' LIMIT 1), 
'Quais são os deveres fundamentais do militar?', 
'["Apenas obedecer", "Apenas estudar", "Obedecer, estudar e servir", "Apenas servir"]', 
'Obedecer, estudar e servir', 
'Os deveres fundamentais do militar incluem obedecer, estudar e servir.'),

-- Questão 3
((SELECT id FROM quizzes WHERE topic_id = 'estatuto-militares' LIMIT 1), 
'Qual a hierarquia militar?', 
'["Apenas oficial e praça", "Oficial, sargento e praça", "Oficial, sargento, cabo e soldado", "Apenas sargento e praça"]', 
'Oficial, sargento, cabo e soldado', 
'A hierarquia militar inclui oficial, sargento, cabo e soldado.'),

-- Questão 4
((SELECT id FROM quizzes WHERE topic_id = 'estatuto-militares' LIMIT 1), 
'O que é a disciplina militar?', 
'["Apenas obediência", "Obediência e respeito à hierarquia", "Apenas respeito", "Apenas hierarquia"]', 
'Obediência e respeito à hierarquia', 
'A disciplina militar é a obediência e respeito à hierarquia estabelecida.'),

-- Questão 5
((SELECT id FROM quizzes WHERE topic_id = 'estatuto-militares' LIMIT 1), 
'Qual a pena máxima para crime militar?', 
'["Reclusão", "Detenção", "Prisão simples", "Multa"]', 
'Reclusão', 
'A pena máxima para crime militar é a reclusão.')
ON CONFLICT DO NOTHING;

-- Questões para Quiz de ICA 111-3 (Regulamento de Tráfego Aéreo)
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_answer, explanation) VALUES
-- Questão 1
((SELECT id FROM quizzes WHERE topic_id = 'ica-111-3' LIMIT 1), 
'Qual é o objetivo do ICA 111-3?', 
'["Regulamentar voos civis", "Regulamentar tráfego aéreo militar", "Regulamentar aeroportos", "Regulamentar pilotos"]', 
'Regulamentar tráfego aéreo militar', 
'O ICA 111-3 tem como objetivo regulamentar o tráfego aéreo militar.'),

-- Questão 2
((SELECT id FROM quizzes WHERE topic_id = 'ica-111-3' LIMIT 1), 
'Quem controla o tráfego aéreo militar?', 
'["Apenas civis", "Apenas militares", "Órgãos militares", "Apenas pilotos"]', 
'Órgãos militares', 
'O tráfego aéreo militar é controlado por órgãos militares.'),

-- Questão 3
((SELECT id FROM quizzes WHERE topic_id = 'ica-111-3' LIMIT 1), 
'Qual a altitude mínima para voo VFR?', 
'["500 pés", "1000 pés", "1500 pés", "2000 pés"]', 
'1000 pés', 
'A altitude mínima para voo VFR é de 1000 pés.'),

-- Questão 4
((SELECT id FROM quizzes WHERE topic_id = 'ica-111-3' LIMIT 1), 
'O que significa VFR?', 
'["Visual Flight Rules", "Very Fast Rules", "Visual Flying Rules", "Very Flight Rules"]', 
'Visual Flight Rules', 
'VFR significa Visual Flight Rules (Regras de Voo Visual).'),

-- Questão 5
((SELECT id FROM quizzes WHERE topic_id = 'ica-111-3' LIMIT 1), 
'Qual a separação mínima entre aeronaves?', 
'["5 milhas", "10 milhas", "15 milhas", "20 milhas"]', 
'10 milhas', 
'A separação mínima entre aeronaves é de 10 milhas.')
ON CONFLICT DO NOTHING;

-- Questões para Quiz de RDAER (Regulamento de Defesa Aérea)
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_answer, explanation) VALUES
-- Questão 1
((SELECT id FROM quizzes WHERE topic_id = 'rdaer' LIMIT 1), 
'Qual é o objetivo do RDAER?', 
'["Regulamentar voos civis", "Regulamentar defesa aérea", "Regulamentar aeroportos", "Regulamentar pilotos"]', 
'Regulamentar defesa aérea', 
'O RDAER tem como objetivo regulamentar a defesa aérea.'),

-- Questão 2
((SELECT id FROM quizzes WHERE topic_id = 'rdaer' LIMIT 1), 
'Quem coordena a defesa aérea?', 
'["Apenas Exército", "Apenas Marinha", "Apenas Aeronáutica", "Forças Armadas"]', 
'Forças Armadas', 
'A defesa aérea é coordenada pelas Forças Armadas.'),

-- Questão 3
((SELECT id FROM quizzes WHERE topic_id = 'rdaer' LIMIT 1), 
'Qual a responsabilidade da defesa aérea?', 
'["Apenas vigilância", "Vigilância e controle", "Apenas controle", "Apenas interceptação"]', 
'Vigilância e controle', 
'A defesa aérea tem responsabilidade de vigilância e controle.'),

-- Questão 4
((SELECT id FROM quizzes WHERE topic_id = 'rdaer' LIMIT 1), 
'O que é o CODAER?', 
'["Centro de Operações de Defesa Aérea", "Comando de Defesa Aérea", "Centro de Defesa Aérea", "Comando de Operações"]', 
'Centro de Operações de Defesa Aérea', 
'CODAER significa Centro de Operações de Defesa Aérea.'),

-- Questão 5
((SELECT id FROM quizzes WHERE topic_id = 'rdaer' LIMIT 1), 
'Qual a prioridade da defesa aérea?', 
'["Apenas civis", "Apenas militares", "Segurança nacional", "Apenas aeronaves"]', 
'Segurança nacional', 
'A prioridade da defesa aérea é a segurança nacional.')
ON CONFLICT DO NOTHING;

-- Questões para Quiz de ICA 111-2 (Regulamento de Navegação Aérea)
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_answer, explanation) VALUES
-- Questão 1
((SELECT id FROM quizzes WHERE topic_id = 'ica-111-2' LIMIT 1), 
'Qual é o objetivo do ICA 111-2?', 
'["Regulamentar voos civis", "Regulamentar navegação aérea militar", "Regulamentar aeroportos", "Regulamentar pilotos"]', 
'Regulamentar navegação aérea militar', 
'O ICA 111-2 tem como objetivo regulamentar a navegação aérea militar.'),

-- Questão 2
((SELECT id FROM quizzes WHERE topic_id = 'ica-111-2' LIMIT 1), 
'Quem pode navegar em espaço aéreo militar?', 
'["Apenas civis", "Apenas militares", "Aeronaves autorizadas", "Apenas pilotos"]', 
'Aeronaves autorizadas', 
'Apenas aeronaves devidamente autorizadas podem navegar em espaço aéreo militar.'),

-- Questão 3
((SELECT id FROM quizzes WHERE topic_id = 'ica-111-2' LIMIT 1), 
'Qual a altitude máxima para voo VFR?', 
'["FL 100", "FL 150", "FL 200", "FL 250"]', 
'FL 100', 
'A altitude máxima para voo VFR é FL 100.'),

-- Questão 4
((SELECT id FROM quizzes WHERE topic_id = 'ica-111-2' LIMIT 1), 
'O que significa IFR?', 
'["Instrument Flight Rules", "International Flight Rules", "Instrument Flying Rules", "International Flying Rules"]', 
'Instrument Flight Rules', 
'IFR significa Instrument Flight Rules (Regras de Voo por Instrumentos).'),

-- Questão 5
((SELECT id FROM quizzes WHERE topic_id = 'ica-111-2' LIMIT 1), 
'Qual a visibilidade mínima para voo VFR?', 
'["5 km", "8 km", "10 km", "15 km"]', 
'8 km', 
'A visibilidade mínima para voo VFR é de 8 km.')
ON CONFLICT DO NOTHING;

-- Verificar questões criadas
SELECT 
  'QUESTÕES DE REGULAMENTOS CRIADAS' as info,
  qq.id,
  q.title as quiz_title,
  qq.question_text,
  qq.correct_answer
FROM quiz_questions qq
JOIN quizzes q ON qq.quiz_id = q.id
WHERE q.topic_id IN ('ica-111-6', 'estatuto-militares', 'ica-111-3', 'rdaer', 'ica-111-2')
ORDER BY q.topic_id, qq.id; 