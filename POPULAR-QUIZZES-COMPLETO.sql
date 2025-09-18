-- ========================================
-- SCRIPT PARA POPULAR QUIZZES COMPLETO
-- ========================================
-- Este script cria quizzes e questões para os tópicos existentes

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

-- 2. CRIAR QUIZZES PARA CADA TÓPICO
-- Acentuação Gráfica
INSERT INTO "public"."quizzes" (topic_id, title, description, time_limit_minutes, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Acentuação Gráfica' LIMIT 1),
    'Quiz de Acentuação Gráfica',
    'Teste seus conhecimentos sobre acentuação gráfica em português',
    5,
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quizzes" 
    WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Acentuação Gráfica' LIMIT 1)
);

-- Fonética e Fonologia
INSERT INTO "public"."quizzes" (topic_id, title, description, time_limit_minutes, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'Quiz de Fonética e Fonologia',
    'Teste seus conhecimentos sobre fonética e fonologia',
    5,
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quizzes" 
    WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1)
);

-- Morfologia - Classes de Palavras
INSERT INTO "public"."quizzes" (topic_id, title, description, time_limit_minutes, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras' LIMIT 1),
    'Quiz de Morfologia - Classes de Palavras',
    'Teste seus conhecimentos sobre classes de palavras',
    5,
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quizzes" 
    WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras' LIMIT 1)
);

-- Sintaxe - Período Composto
INSERT INTO "public"."quizzes" (topic_id, title, description, time_limit_minutes, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Período Composto' LIMIT 1),
    'Quiz de Sintaxe - Período Composto',
    'Teste seus conhecimentos sobre período composto',
    5,
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quizzes" 
    WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Período Composto' LIMIT 1)
);

-- 3. CRIAR QUESTÕES PARA OS QUIZZES
-- Questões para Acentuação Gráfica
INSERT INTO "public"."quiz_questions" (quiz_id, question_text, options, correct_answer, explanation, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."quizzes" WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Acentuação Gráfica' LIMIT 1) LIMIT 1),
    'Quando acentuar oxítonas?',
    '["Terminadas em A(s), E(s), O(s), EM, ENS", "Todas são acentuadas", "Nunca são acentuadas", "Apenas quando terminam em consoante"]',
    'Terminadas em A(s), E(s), O(s), EM, ENS',
    'Oxítonas são acentuadas quando terminam em A(s), E(s), O(s), EM, ENS.',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quiz_questions" 
    WHERE question_text = 'Quando acentuar oxítonas?'
);

INSERT INTO "public"."quiz_questions" (quiz_id, question_text, options, correct_answer, explanation, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."quizzes" WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Acentuação Gráfica' LIMIT 1) LIMIT 1),
    'Quando acentuar proparoxítonas?',
    '["Todas são acentuadas", "Nunca são acentuadas", "Apenas quando terminam em vogal", "Apenas quando terminam em consoante"]',
    'Todas são acentuadas',
    'Todas as proparoxítonas são acentuadas, independentemente da terminação.',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quiz_questions" 
    WHERE question_text = 'Quando acentuar proparoxítonas?'
);

INSERT INTO "public"."quiz_questions" (quiz_id, question_text, options, correct_answer, explanation, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."quizzes" WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Acentuação Gráfica' LIMIT 1) LIMIT 1),
    'Qual a regra para acentuar "saúde"?',
    '["Hiato com i ou u tônico", "Oxítona terminada em vogal", "Paroxítona terminada em vogal", "Proparoxítona"]',
    'Hiato com i ou u tônico',
    'A palavra "saúde" é acentuada por ser um hiato com "i" ou "u" tônico seguido ou não de "s".',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quiz_questions" 
    WHERE question_text = 'Qual a regra para acentuar "saúde"?'
);

-- Questões para Fonética e Fonologia
INSERT INTO "public"."quiz_questions" (quiz_id, question_text, options, correct_answer, explanation, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."quizzes" WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1) LIMIT 1),
    'O que é fonema?',
    '["Unidade mínima de som", "Unidade mínima de significado", "Unidade mínima de escrita", "Unidade mínima de palavra"]',
    'Unidade mínima de som',
    'Fonema é a unidade mínima de som que pode distinguir palavras.',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quiz_questions" 
    WHERE question_text = 'O que é fonema?'
);

INSERT INTO "public"."quiz_questions" (quiz_id, question_text, options, correct_answer, explanation, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."quizzes" WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1) LIMIT 1),
    'Quantos fonemas tem a palavra "casa"?',
    '["4", "3", "5", "2"]',
    '4',
    'A palavra "casa" tem 4 fonemas: /k/, /a/, /s/, /a/.',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quiz_questions" 
    WHERE question_text = 'Quantos fonemas tem a palavra "casa"?'
);

-- Questões para Morfologia - Classes de Palavras
INSERT INTO "public"."quiz_questions" (quiz_id, question_text, options, correct_answer, explanation, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."quizzes" WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras' LIMIT 1) LIMIT 1),
    'Quantas classes de palavras existem?',
    '["10", "8", "12", "6"]',
    '10',
    'Existem 10 classes de palavras: substantivo, artigo, adjetivo, numeral, pronome, verbo, advérbio, preposição, conjunção, interjeição.',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quiz_questions" 
    WHERE question_text = 'Quantas classes de palavras existem?'
);

INSERT INTO "public"."quiz_questions" (quiz_id, question_text, options, correct_answer, explanation, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."quizzes" WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras' LIMIT 1) LIMIT 1),
    'Qual é a função do artigo?',
    '["Determinar o substantivo", "Modificar o verbo", "Ligar palavras", "Expressar emoção"]',
    'Determinar o substantivo',
    'O artigo tem a função de determinar o substantivo, indicando se é definido ou indefinido.',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quiz_questions" 
    WHERE question_text = 'Qual é a função do artigo?'
);

-- Questões para Sintaxe - Período Composto
INSERT INTO "public"."quiz_questions" (quiz_id, question_text, options, correct_answer, explanation, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."quizzes" WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Período Composto' LIMIT 1) LIMIT 1),
    'O que é período composto?',
    '["Período formado por duas ou mais orações", "Período com apenas uma oração", "Período sem verbo", "Período com muitos adjetivos"]',
    'Período formado por duas ou mais orações',
    'Período composto é aquele formado por duas ou mais orações.',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quiz_questions" 
    WHERE question_text = 'O que é período composto?'
);

INSERT INTO "public"."quiz_questions" (quiz_id, question_text, options, correct_answer, explanation, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."quizzes" WHERE topic_id = (SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Período Composto' LIMIT 1) LIMIT 1),
    'Como se classificam as orações do período composto?',
    '["Coordenadas e subordinadas", "Principais e secundárias", "Simples e complexas", "Independentes e dependentes"]',
    'Coordenadas e subordinadas',
    'As orações do período composto se classificam em coordenadas (independentes) e subordinadas (dependentes).',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."quiz_questions" 
    WHERE question_text = 'Como se classificam as orações do período composto?'
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
