-- Inserir um quiz de exemplo para "Fonetica e Fonologia"
INSERT INTO quizzes (topic_id, title, description) VALUES
('fonetica-fonologia', 'Quiz Básico de Fonética e Fonologia', 'Teste seus conhecimentos fundamentais sobre fonemas, sílabas e encontros vocálicos.')
ON CONFLICT DO NOTHING;

-- Inserir perguntas para o quiz de Fonética e Fonologia
-- Certifique-se de que o quiz_id corresponde ao ID do quiz que você acabou de inserir
-- (Você pode precisar ajustar o quiz_id manualmente se o SERIAL não começar de 1 ou se já tiver outros quizzes)
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_answer, explanation) VALUES
(1, 'Qual o nome da menor unidade sonora da fala que distingue significados?', '["Fonema", "Letra", "Sílaba", "Morfema"]', 'Fonema', 'O fonema é a menor unidade sonora capaz de diferenciar palavras.'),
(1, 'Em qual das palavras abaixo ocorre um ditongo?', '["Saída", "Canoa", "Quase", "Poesia"]', 'Quase', 'Em "quase", o "ua" forma um ditongo crescente (semivogal + vogal) na mesma sílaba.'),
(1, 'A palavra "psicologia" possui quantos fonemas?', '["9", "10", "8", "7"]', '9', 'A palavra "psicologia" tem 9 fonemas: /p/, /s/, /i/, /k/, /o/, /l/, /o/, /ʒ/, /i/. O "ps" inicial representa apenas um som /s/.'),
(1, 'Qual o tipo de encontro vocálico em "saída"?', '["Ditongo", "Tritongo", "Hiato", "Dígrafo"]', 'Hiato', 'Em "saída", as vogais "a" e "í" ficam em sílabas separadas, formando um hiato.'),
(1, 'Qual das alternativas apresenta um dígrafo?', '["Planta", "Chuva", "Livro", "Prato"]', 'Chuva', 'Em "chuva", o "ch" representa um único som, sendo um dígrafo.')
ON CONFLICT DO NOTHING;
