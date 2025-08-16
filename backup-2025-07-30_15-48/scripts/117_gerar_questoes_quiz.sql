-- Script para gerar questões de quiz baseadas nos flashcards existentes
-- Execute este script no Supabase SQL Editor

-- 1. Função para gerar questões de quiz baseadas em flashcards
-- Vamos criar questões para alguns tópicos de exemplo

-- Questões para Quiz de Concordância (baseadas nos flashcards de concordância)
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_answer, explanation) VALUES
-- Questão 1
((SELECT id FROM quizzes WHERE topic_id = 'concordancia' LIMIT 1), 
'Qual é a relação de harmonia entre o verbo e o sujeito chamada?', 
'["Concordância verbal", "Concordância nominal", "Regência verbal", "Regência nominal"]', 
'Concordância verbal', 
'A concordância verbal é a relação de harmonia entre o verbo e o sujeito, de modo que o verbo deve concordar em número e pessoa com o sujeito da oração.'),

-- Questão 2
((SELECT id FROM quizzes WHERE topic_id = 'concordancia' LIMIT 1), 
'Em um sujeito simples, o verbo concorda com:', 
'["Todos os termos do sujeito", "Apenas o núcleo do sujeito", "O termo mais próximo", "O último termo"]', 
'Apenas o núcleo do sujeito', 
'Em um sujeito simples, o verbo concorda em número e pessoa com o núcleo do sujeito, mesmo que haja termos acessórios ligados a ele.'),

-- Questão 3
((SELECT id FROM quizzes WHERE topic_id = 'concordancia' LIMIT 1), 
'Quando o sujeito é composto, o verbo fica:', 
'["No singular", "No plural", "No infinitivo", "No gerúndio"]', 
'No plural', 
'Quando o sujeito é composto, o verbo fica no plural. Se os núcleos do sujeito não estiverem juntos, o verbo concorda com o núcleo mais próximo ou vai para o plural.'),

-- Questão 4
((SELECT id FROM quizzes WHERE topic_id = 'concordancia' LIMIT 1), 
'O verbo "haver" quando usado no sentido de existir é:', 
'["Pessoal", "Impersonal", "Transitivo", "Intransitivo"]', 
'Impersonal', 
'O verbo "haver", quando usado no sentido de existir, é impessoal e deve ser empregado sempre na 3ª pessoa do singular.'),

-- Questão 5
((SELECT id FROM quizzes WHERE topic_id = 'concordancia' LIMIT 1), 
'A concordância nominal é a relação de harmonia entre:', 
'["Verbo e sujeito", "Substantivo e seus determinantes", "Preposição e objeto", "Conjunção e oração"]', 
'Substantivo e seus determinantes', 
'A concordância nominal é a relação de harmonia entre o substantivo e seus determinantes e modificadores, que devem concordar em gênero e número.'),

-- Questão 6
((SELECT id FROM quizzes WHERE topic_id = 'concordancia' LIMIT 1), 
'Quando o adjetivo se refere a dois ou mais substantivos do mesmo gênero, pode:', 
'["Ir apenas para o plural", "Concordar só com o mais próximo", "Ir para o plural ou concordar só com o mais próximo", "Ficar invariável"]', 
'Ir para o plural ou concordar só com o mais próximo', 
'Quando o adjetivo se refere a dois ou mais substantivos do mesmo gênero, pode ir para o plural ou concordar só com o mais próximo.'),

-- Questão 7
((SELECT id FROM quizzes WHERE topic_id = 'concordancia' LIMIT 1), 
'A concordância atrativa ocorre quando:', 
'["O verbo concorda com o termo mais próximo", "O verbo concorda com o núcleo do sujeito", "O verbo fica no infinitivo", "O verbo fica no gerúndio"]', 
'O verbo concorda com o termo mais próximo', 
'A concordância atrativa ocorre quando o verbo concorda com o termo mais próximo, mesmo que não seja o núcleo do sujeito, por uma questão estilística.'),

-- Questão 8
((SELECT id FROM quizzes WHERE topic_id = 'concordancia' LIMIT 1), 
'Verbos que indicam fenômenos da natureza normalmente são:', 
'["Pessoais", "Impersonais", "Transitivos", "Intransitivos"]', 
'Impersonais', 
'Verbos que indicam fenômenos da natureza normalmente são impessoais e empregados na 3ª pessoa do singular, exceto quando usados figuradamente.'),

-- Questão 9
((SELECT id FROM quizzes WHERE topic_id = 'concordancia' LIMIT 1), 
'Com expressões quantitativas como "mais de um", geralmente o verbo:', 
'["Vai para o plural", "Permanece no singular", "Fica no infinitivo", "Fica no gerúndio"]', 
'Permanece no singular', 
'Com expressões quantitativas como "mais de um", geralmente o verbo permanece no singular, pois a ideia considerada é a de unidade.'),

-- Questão 10
((SELECT id FROM quizzes WHERE topic_id = 'concordancia' LIMIT 1), 
'A concordância ideológica, ou silepse, ocorre quando:', 
'["A concordância se faz com a forma literal", "A concordância se faz com a ideia ou sentido", "A concordância se faz com o termo mais próximo", "A concordância se faz com o núcleo"]', 
'A concordância se faz com a ideia ou sentido', 
'A concordância ideológica, ou silepse, ocorre quando a concordância se faz com a ideia ou sentido, e não com a forma literal.')
ON CONFLICT DO NOTHING;

-- Questões para Quiz de Fonética e Fonologia
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_answer, explanation) VALUES
-- Questão 1
((SELECT id FROM quizzes WHERE topic_id = 'fonetica-fonologia' LIMIT 1), 
'Qual o nome da menor unidade sonora da fala que distingue significados?', 
'["Fonema", "Letra", "Sílaba", "Morfema"]', 
'Fonema', 
'O fonema é a menor unidade sonora capaz de diferenciar palavras.'),

-- Questão 2
((SELECT id FROM quizzes WHERE topic_id = 'fonetica-fonologia' LIMIT 1), 
'Em qual das palavras abaixo ocorre um ditongo?', 
'["Saída", "Canoa", "Quase", "Poesia"]', 
'Quase', 
'Em "quase", o "ua" forma um ditongo crescente (semivogal + vogal) na mesma sílaba.'),

-- Questão 3
((SELECT id FROM quizzes WHERE topic_id = 'fonetica-fonologia' LIMIT 1), 
'A palavra "psicologia" possui quantos fonemas?', 
'["9", "10", "8", "7"]', 
'9', 
'A palavra "psicologia" tem 9 fonemas: /p/, /s/, /i/, /k/, /o/, /l/, /o/, /ʒ/, /i/. O "ps" inicial representa apenas um som /s/.'),

-- Questão 4
((SELECT id FROM quizzes WHERE topic_id = 'fonetica-fonologia' LIMIT 1), 
'Qual o tipo de encontro vocálico em "saída"?', 
'["Ditongo", "Tritongo", "Hiato", "Dígrafo"]', 
'Hiato', 
'Em "saída", as vogais "a" e "í" ficam em sílabas separadas, formando um hiato.'),

-- Questão 5
((SELECT id FROM quizzes WHERE topic_id = 'fonetica-fonologia' LIMIT 1), 
'Qual das alternativas apresenta um dígrafo?', 
'["Planta", "Chuva", "Livro", "Prato"]', 
'Chuva', 
'Em "chuva", o "ch" representa um único som, sendo um dígrafo.')
ON CONFLICT DO NOTHING;

-- Questões para Quiz de Crase
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_answer, explanation) VALUES
-- Questão 1
((SELECT id FROM quizzes WHERE topic_id = 'crase' LIMIT 1), 
'A crase é o encontro de:', 
'["Duas vogais iguais", "Vogal + vogal", "Vogal + semivogal", "A + A"]', 
'A + A', 
'A crase é o encontro da preposição "a" com o artigo "a", formando "à".'),

-- Questão 2
((SELECT id FROM quizzes WHERE topic_id = 'crase' LIMIT 1), 
'Em qual frase há crase obrigatória?', 
'["Vou a escola", "Vou à escola", "Vou para escola", "Vou na escola"]', 
'Vou à escola', 
'Há crase obrigatória quando a preposição "a" se junta ao artigo "a" antes de substantivo feminino.'),

-- Questão 3
((SELECT id FROM quizzes WHERE topic_id = 'crase' LIMIT 1), 
'Antes de verbos no infinitivo, há crase?', 
'["Sempre", "Nunca", "Às vezes", "Depende do verbo"]', 
'Nunca', 
'Antes de verbos no infinitivo não há crase, pois não há artigo definido.'),

-- Questão 4
((SELECT id FROM quizzes WHERE topic_id = 'crase' LIMIT 1), 
'Em "às vezes", há crase porque:', 
'["É uma expressão fixa", "Há preposição + artigo", "É uma exceção", "É uma regra especial"]', 
'Há preposição + artigo', 
'Em "às vezes" há crase porque há a preposição "a" + o artigo "as" (plural de "a").'),

-- Questão 5
((SELECT id FROM quizzes WHERE topic_id = 'crase' LIMIT 1), 
'Antes de nomes próprios femininos, há crase?', 
'["Sempre", "Nunca", "Depende do contexto", "Apenas se houver artigo"]', 
'Depende do contexto', 
'Antes de nomes próprios femininos, a crase depende do contexto e da presença do artigo.')
ON CONFLICT DO NOTHING;

-- 2. Verificar questões criadas
SELECT 
  'QUESTÕES CRIADAS' as info,
  qq.id,
  q.title as quiz_title,
  qq.question_text,
  qq.correct_answer
FROM quiz_questions qq
JOIN quizzes q ON qq.quiz_id = q.id
ORDER BY q.topic_id, qq.id; 