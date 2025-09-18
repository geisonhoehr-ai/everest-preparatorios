-- ========================================
-- SCRIPT CORRIGIDO PARA MIGRAR QUIZZES
-- ========================================
-- Este script migra os quizzes e questões do banco antigo para o novo

-- 1. VERIFICAR ESTRUTURA ATUAL
SELECT 'VERIFICANDO ESTRUTURA ATUAL' as status;

-- Verificar matérias
SELECT 'MATÉRIAS DISPONÍVEIS' as status, 
       id, 
       name 
FROM "public"."subjects" 
ORDER BY name;

-- Verificar tópicos
SELECT 'TÓPICOS DISPONÍVEIS' as status, 
       t.id, 
       t.name as topico,
       s.name as materia
FROM "public"."topics" t
JOIN "public"."subjects" s ON t.subject_id = s.id
ORDER BY s.name, t.name;

-- Verificar usuários disponíveis
SELECT 'USUÁRIOS DISPONÍVEIS' as status,
       id,
       email,
       role
FROM "public"."users"
WHERE role = 'student'
LIMIT 1;

-- 2. MIGRAR QUIZZES (adaptando topic_id para UUIDs)
-- Acentuação Gráfica
INSERT INTO "public"."quizzes" (topic_id, title, description, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Acentuação Gráfica' LIMIT 1),
    'Quiz de Acentuação Gráfica',
    'Teste seus conhecimentos sobre acentuação gráfica em português',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quizzes" 
    WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Acentuação Gráfica' LIMIT 1)
    AND title = 'Quiz de Acentuação Gráfica'
);

-- Fonética e Fonologia
INSERT INTO "public"."quizzes" (topic_id, title, description, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'Quiz de Fonética e Fonologia',
    'Teste seus conhecimentos sobre fonética e fonologia',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quizzes" 
    WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1)
    AND title = 'Quiz de Fonética e Fonologia'
);

-- Morfologia - Classes de Palavras
INSERT INTO "public"."quizzes" (topic_id, title, description, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras' LIMIT 1),
    'Quiz de Morfologia - Classes de Palavras',
    'Teste seus conhecimentos sobre classes de palavras',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quizzes" 
    WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras' LIMIT 1)
    AND title = 'Quiz de Morfologia - Classes de Palavras'
);

-- Sintaxe - Período Composto
INSERT INTO "public"."quizzes" (topic_id, title, description, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Período Composto' LIMIT 1),
    'Quiz de Sintaxe - Período Composto',
    'Teste seus conhecimentos sobre período composto',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quizzes" 
    WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Período Composto' LIMIT 1)
    AND title = 'Quiz de Sintaxe - Período Composto'
);

-- Crase
INSERT INTO "public"."quizzes" (topic_id, title, description, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Crase' LIMIT 1),
    'Quiz de Crase',
    'Teste seus conhecimentos sobre crase',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quizzes" 
    WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Crase' LIMIT 1)
    AND title = 'Quiz de Crase'
);

-- Ortografia
INSERT INTO "public"."quizzes" (topic_id, title, description, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Ortografia' LIMIT 1),
    'Quiz de Ortografia',
    'Teste seus conhecimentos sobre ortografia',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quizzes" 
    WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Ortografia' LIMIT 1)
    AND title = 'Quiz de Ortografia'
);

-- Concordância
INSERT INTO "public"."quizzes" (topic_id, title, description, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Concordância' LIMIT 1),
    'Quiz de Concordância',
    'Teste seus conhecimentos sobre concordância',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quizzes" 
    WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Concordância' LIMIT 1)
    AND title = 'Quiz de Concordância'
);

-- Colocação Pronominal
INSERT INTO "public"."quizzes" (topic_id, title, description, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Colocação Pronominal' LIMIT 1),
    'Quiz de Colocação Pronominal',
    'Teste seus conhecimentos sobre colocação pronominal',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quizzes" 
    WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Colocação Pronominal' LIMIT 1)
    AND title = 'Quiz de Colocação Pronominal'
);

-- 3. MIGRAR QUESTÕES DE QUIZ (APENAS COLUNAS QUE EXISTEM)
-- Questões para Acentuação Gráfica
INSERT INTO "public"."quiz_questions" (quiz_id, question_text, options, correct_answer, explanation)
SELECT 
    (SELECT id FROM "public"."quizzes" WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Acentuação Gráfica' LIMIT 1) LIMIT 1),
    'Quando acentuar oxítonas?',
    '["Terminadas em A(s), E(s), O(s), EM, ENS", "Todas são acentuadas", "Nunca são acentuadas", "Apenas quando terminam em consoante"]',
    'Terminadas em A(s), E(s), O(s), EM, ENS',
    'Oxítonas são acentuadas quando terminam em A(s), E(s), O(s), EM, ENS.'
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quiz_questions" 
    WHERE question_text = 'Quando acentuar oxítonas?'
);

INSERT INTO "public"."quiz_questions" (quiz_id, question_text, options, correct_answer, explanation)
SELECT 
    (SELECT id FROM "public"."quizzes" WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Acentuação Gráfica' LIMIT 1) LIMIT 1),
    'Quando acentuar proparoxítonas?',
    '["Todas são acentuadas", "Nunca são acentuadas", "Apenas quando terminam em vogal", "Apenas quando terminam em consoante"]',
    'Todas são acentuadas',
    'Todas as proparoxítonas são acentuadas, independentemente da terminação.'
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quiz_questions" 
    WHERE question_text = 'Quando acentuar proparoxítonas?'
);

INSERT INTO "public"."quiz_questions" (quiz_id, question_text, options, correct_answer, explanation)
SELECT 
    (SELECT id FROM "public"."quizzes" WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Acentuação Gráfica' LIMIT 1) LIMIT 1),
    'Qual a regra para acentuar "saúde"?',
    '["Hiato com i ou u tônico", "Oxítona terminada em vogal", "Paroxítona terminada em vogal", "Proparoxítona"]',
    'Hiato com i ou u tônico',
    'A palavra "saúde" é acentuada por ser um hiato com "i" ou "u" tônico seguido ou não de "s".'
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quiz_questions" 
    WHERE question_text = 'Qual a regra para acentuar "saúde"?'
);

-- Questões para Fonética e Fonologia
INSERT INTO "public"."quiz_questions" (quiz_id, question_text, options, correct_answer, explanation)
SELECT 
    (SELECT id FROM "public"."quizzes" WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1) LIMIT 1),
    'O que é fonema?',
    '["Unidade mínima de som", "Unidade mínima de significado", "Unidade mínima de escrita", "Unidade mínima de palavra"]',
    'Unidade mínima de som',
    'Fonema é a unidade mínima de som que pode distinguir palavras.'
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quiz_questions" 
    WHERE question_text = 'O que é fonema?'
);

INSERT INTO "public"."quiz_questions" (quiz_id, question_text, options, correct_answer, explanation)
SELECT 
    (SELECT id FROM "public"."quizzes" WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1) LIMIT 1),
    'Quantos fonemas tem a palavra "casa"?',
    '["4", "3", "5", "2"]',
    '4',
    'A palavra "casa" tem 4 fonemas: /k/, /a/, /s/, /a/.'
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quiz_questions" 
    WHERE question_text = 'Quantos fonemas tem a palavra "casa"?'
);

INSERT INTO "public"."quiz_questions" (quiz_id, question_text, options, correct_answer, explanation)
SELECT 
    (SELECT id FROM "public"."quizzes" WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1) LIMIT 1),
    'Em qual das palavras abaixo ocorre um ditongo?',
    '["Saída", "Canoa", "Quase", "Poesia"]',
    'Quase',
    'Em "quase", o "ua" forma um ditongo crescente (semivogal + vogal) na mesma sílaba.'
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quiz_questions" 
    WHERE question_text = 'Em qual das palavras abaixo ocorre um ditongo?'
);

-- Questões para Morfologia - Classes de Palavras
INSERT INTO "public"."quiz_questions" (quiz_id, question_text, options, correct_answer, explanation)
SELECT 
    (SELECT id FROM "public"."quizzes" WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras' LIMIT 1) LIMIT 1),
    'Quantas classes de palavras existem?',
    '["10", "8", "12", "6"]',
    '10',
    'Existem 10 classes de palavras: substantivo, artigo, adjetivo, numeral, pronome, verbo, advérbio, preposição, conjunção, interjeição.'
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quiz_questions" 
    WHERE question_text = 'Quantas classes de palavras existem?'
);

INSERT INTO "public"."quiz_questions" (quiz_id, question_text, options, correct_answer, explanation)
SELECT 
    (SELECT id FROM "public"."quizzes" WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras' LIMIT 1) LIMIT 1),
    'Qual é a função do artigo?',
    '["Determinar o substantivo", "Modificar o verbo", "Ligar palavras", "Expressar emoção"]',
    'Determinar o substantivo',
    'O artigo tem a função de determinar o substantivo, indicando se é definido ou indefinido.'
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quiz_questions" 
    WHERE question_text = 'Qual é a função do artigo?'
);

-- Questões para Sintaxe - Período Composto
INSERT INTO "public"."quiz_questions" (quiz_id, question_text, options, correct_answer, explanation)
SELECT 
    (SELECT id FROM "public"."quizzes" WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Período Composto' LIMIT 1) LIMIT 1),
    'O que é período composto?',
    '["Período formado por duas ou mais orações", "Período com apenas uma oração", "Período sem verbo", "Período com muitos adjetivos"]',
    'Período formado por duas ou mais orações',
    'Período composto é aquele formado por duas ou mais orações.'
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quiz_questions" 
    WHERE question_text = 'O que é período composto?'
);

INSERT INTO "public"."quiz_questions" (quiz_id, question_text, options, correct_answer, explanation)
SELECT 
    (SELECT id FROM "public"."quizzes" WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Período Composto' LIMIT 1) LIMIT 1),
    'Como se classificam as orações do período composto?',
    '["Coordenadas e subordinadas", "Principais e secundárias", "Simples e complexas", "Independentes e dependentes"]',
    'Coordenadas e subordinadas',
    'As orações do período composto se classificam em coordenadas (independentes) e subordinadas (dependentes).'
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quiz_questions" 
    WHERE question_text = 'Como se classificam as orações do período composto?'
);

-- Questões para Crase
INSERT INTO "public"."quiz_questions" (quiz_id, question_text, options, correct_answer, explanation)
SELECT 
    (SELECT id FROM "public"."quizzes" WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Crase' LIMIT 1) LIMIT 1),
    'A crase é obrigatória em "Vou ___ escola":',
    '["a", "à", "há", "ah"]',
    'à',
    'Verbo "ir" exige preposição "a" + artigo "a" da palavra feminina "escola".'
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quiz_questions" 
    WHERE question_text = 'A crase é obrigatória em "Vou ___ escola":'
);

INSERT INTO "public"."quiz_questions" (quiz_id, question_text, options, correct_answer, explanation)
SELECT 
    (SELECT id FROM "public"."quizzes" WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Crase' LIMIT 1) LIMIT 1),
    'Em "Refiro-me ___ pessoa honesta", usa-se:',
    '["a", "à", "há", "ah"]',
    'à',
    'Verbo "referir-se" exige preposição "a" + artigo "a" de "pessoa".'
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quiz_questions" 
    WHERE question_text = 'Em "Refiro-me ___ pessoa honesta", usa-se:'
);

-- Questões para Ortografia
INSERT INTO "public"."quiz_questions" (quiz_id, question_text, options, correct_answer, explanation)
SELECT 
    (SELECT id FROM "public"."quizzes" WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Ortografia' LIMIT 1) LIMIT 1),
    'A grafia correta é:',
    '["excessão", "exceção", "escesão", "excesão"]',
    'exceção',
    'Palavra derivada do verbo "excetuar", grafa-se com "ç".'
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quiz_questions" 
    WHERE question_text = 'A grafia correta é:'
);

INSERT INTO "public"."quiz_questions" (quiz_id, question_text, options, correct_answer, explanation)
SELECT 
    (SELECT id FROM "public"."quizzes" WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Ortografia' LIMIT 1) LIMIT 1),
    'Usa-se "s" em:',
    '["pesquizar", "analizar", "pesquisar", "analisar"]',
    'pesquisar',
    'Verbos terminados em -isar quando o radical tem "s".'
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quiz_questions" 
    WHERE question_text = 'Usa-se "s" em:'
);

-- Questões para Concordância
INSERT INTO "public"."quiz_questions" (quiz_id, question_text, options, correct_answer, explanation)
SELECT 
    (SELECT id FROM "public"."quizzes" WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Concordância' LIMIT 1) LIMIT 1),
    'Em "Os meninos chegaram", o verbo concorda com:',
    '["o sujeito", "o predicado", "o objeto", "o adjunto"]',
    'o sujeito',
    'Verbo concorda com o sujeito em número e pessoa.'
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quiz_questions" 
    WHERE question_text = 'Em "Os meninos chegaram", o verbo concorda com:'
);

INSERT INTO "public"."quiz_questions" (quiz_id, question_text, options, correct_answer, explanation)
SELECT 
    (SELECT id FROM "public"."quizzes" WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Concordância' LIMIT 1) LIMIT 1),
    'A frase correta é:',
    '["Fazem dois anos", "Faz dois anos", "ambas corretas", "ambas incorretas"]',
    'Faz dois anos',
    'Verbo "fazer" indicando tempo é impessoal (3ª pessoa do singular).'
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quiz_questions" 
    WHERE question_text = 'A frase correta é:'
);

-- Questões para Colocação Pronominal
INSERT INTO "public"."quiz_questions" (quiz_id, question_text, options, correct_answer, explanation)
SELECT 
    (SELECT id FROM "public"."quizzes" WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Colocação Pronominal' LIMIT 1) LIMIT 1),
    'Em "Ele se machucou", temos:',
    '["próclise", "ênclise", "mesóclise", "erro de colocação"]',
    'próclise',
    'Pronome antes do verbo (próclise).'
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quiz_questions" 
    WHERE question_text = 'Em "Ele se machucou", temos:'
);

INSERT INTO "public"."quiz_questions" (quiz_id, question_text, options, correct_answer, explanation)
SELECT 
    (SELECT id FROM "public"."quizzes" WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Colocação Pronominal' LIMIT 1) LIMIT 1),
    'A colocação correta é:',
    '["Machucou-se ontem", "Se machucou ontem", "ambas corretas", "ambas incorretas"]',
    'Machucou-se ontem',
    'Sem palavra atrativa, usa-se ênclise.'
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quiz_questions" 
    WHERE question_text = 'A colocação correta é:'
);

-- 4. VERIFICAR RESULTADOS
SELECT 'QUIZZES CRIADOS' as status,
       q.id,
       q.title,
       t.name as topico,
       s.name as materia
FROM "public"."quizzes" q
JOIN "public"."topics" t ON q.topic_id = t.id
JOIN "public"."subjects" s ON t.subject_id = s.id
ORDER BY s.name, t.name;

SELECT 'QUESTÕES CRIADAS' as status,
       qq.id,
       qq.question_text,
       q.title as quiz,
       t.name as topico
FROM "public"."quiz_questions" qq
JOIN "public"."quizzes" q ON qq.quiz_id = q.id
JOIN "public"."topics" t ON q.topic_id = t.id
ORDER BY t.name, qq.id;

SELECT 'TOTAL DE QUIZZES' as status,
       COUNT(*) as total_quizzes
FROM "public"."quizzes";

SELECT 'TOTAL DE QUESTÕES' as status,
       COUNT(*) as total_questions
FROM "public"."quiz_questions";

SELECT 'DISTRIBUIÇÃO DE QUESTÕES POR TÓPICO' as status,
       t.name as topico,
       COUNT(qq.id) as total_questions
FROM "public"."quiz_questions" qq
JOIN "public"."quizzes" q ON qq.quiz_id = q.id
JOIN "public"."topics" t ON q.topic_id = t.id
GROUP BY t.name
ORDER BY total_questions DESC;