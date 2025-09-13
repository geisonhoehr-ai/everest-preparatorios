-- Script para popular a tabela quiz_questions com questões de exemplo
-- Baseado nos tópicos existentes: fonetica-fonologia, ortografia, acentuacao-grafica

-- Questões para FONÉTICA E FONOLOGIA
INSERT INTO quiz_questions (topic_id, quiz_id, question_text, options, correct_answer, explanation) VALUES
('fonetica-fonologia', 1, 'Quantos fonemas existem na palavra "casa"?', 
 '["2", "3", "4", "5"]', '4', 
 'A palavra "casa" tem 4 fonemas: /k/, /a/, /s/, /a/.'),

('fonetica-fonologia', 1, 'Qual é o número de sílabas na palavra "computador"?', 
 '["3", "4", "5", "6"]', '4', 
 'A palavra "computador" tem 4 sílabas: com-pu-ta-dor.'),

('fonetica-fonologia', 1, 'Em "saúde", qual é o tipo de encontro vocálico?', 
 '["Ditongo", "Tritongo", "Hiato", "Dígrafo"]', 'Hiato', 
 'Em "saúde" temos hiato: a-ú (vogais em sílabas diferentes).'),

-- Questões para ORTOGRAFIA
('ortografia', 2, 'Qual é a grafia correta?', 
 '["Exceção", "Excessão", "Excecão", "Excessão"]', 'Exceção', 
 'A grafia correta é "exceção" com "ç".'),

('ortografia', 2, 'Complete: "Ele fez uma _____ importante."', 
 '["concessão", "conceção", "concesssão", "concecão"]', 'concessão', 
 'A grafia correta é "concessão" com "ss".'),

('ortografia', 2, 'Qual palavra está escrita corretamente?', 
 '["Ansioso", "Ancioso", "Anxioso", "Ansioso"]', 'Ansioso', 
 'A grafia correta é "ansioso" com "s".'),

-- Questões para ACENTUAÇÃO GRÁFICA
('acentuacao-grafica', 3, 'Qual palavra é acentuada por ser proparoxítona?', 
 '["café", "médico", "português", "inglês"]', 'médico', 
 'Médico é proparoxítona (sílaba tônica na antepenúltima).'),

('acentuacao-grafica', 3, 'Em "saúde", o acento é obrigatório porque:', 
 '["É oxítona terminada em e", "É paroxítona terminada em e", "É proparoxítona", "Tem hiato"]', 'Tem hiato', 
 'Saúde tem acento porque forma hiato (a-ú).'),

('acentuacao-grafica', 3, 'Qual palavra NÃO precisa de acento?', 
 '["você", "português", "inglês", "alemão"]', 'alemão', 
 'Alemão não precisa de acento (paroxítona terminada em ão).'),

-- Questões para MORFOLOGIA (se existir)
('morfologia', 4, 'Em "casa", qual é a classe gramatical?', 
 '["Verbo", "Substantivo", "Adjetivo", "Advérbio"]', 'Substantivo', 
 'Casa é um substantivo comum concreto.'),

('morfologia', 4, 'Qual é o plural de "cidadão"?', 
 '["cidadãos", "cidadões", "cidadães", "cidadãos"]', 'cidadãos', 
 'O plural de cidadão é cidadãos.'),

-- Questões para SINTAXE
('sintaxe', 5, 'Em "O menino estudou", qual é o sujeito?', 
 '["O menino", "estudou", "O", "menino"]', 'O menino', 
 'O sujeito é "O menino" (quem praticou a ação).'),

('sintaxe', 5, 'Qual é o predicado em "Maria comprou um livro"?', 
 '["Maria", "comprou um livro", "um livro", "comprou"]', 'comprou um livro', 
 'O predicado é "comprou um livro" (o que se diz do sujeito).'),

-- Questões para REGULAMENTOS
('regulamentos-gerais', 6, 'Qual é a idade mínima para prestar o EAOF?', 
 '["16 anos", "17 anos", "18 anos", "21 anos"]', '18 anos', 
 'A idade mínima para prestar o EAOF é 18 anos.'),

('regulamentos-gerais', 6, 'O EAOF é realizado quantas vezes por ano?', 
 '["1 vez", "2 vezes", "3 vezes", "4 vezes"]', '2 vezes', 
 'O EAOF é realizado 2 vezes por ano.'),

-- Questões para REGULAMENTOS ESPECÍFICOS
('regulamentos-especificos', 7, 'Qual é a duração máxima do curso de formação?', 
 '["6 meses", "1 ano", "18 meses", "2 anos"]', '18 meses', 
 'A duração máxima do curso de formação é 18 meses.'),

('regulamentos-especificos', 7, 'Quantas horas de voo são necessárias para a licença?', 
 '["40 horas", "45 horas", "50 horas", "55 horas"]', '45 horas', 
 'São necessárias 45 horas de voo para a licença.');

-- Verificar se as questões foram inseridas
SELECT 
    t.name as topico,
    q.title as quiz,
    COUNT(qq.id) as total_questoes
FROM topics t
LEFT JOIN quizzes q ON q.topic_id = t.id
LEFT JOIN quiz_questions qq ON qq.topic_id = t.id
GROUP BY t.id, t.name, q.id, q.title
ORDER BY t.name, q.title;
