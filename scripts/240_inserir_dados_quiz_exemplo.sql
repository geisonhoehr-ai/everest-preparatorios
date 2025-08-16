-- Script para inserir dados de exemplo para o quiz funcionar

-- 1. Inserir subjects se não existirem
INSERT INTO subjects (id, name) VALUES 
(1, 'Português'),
(2, 'Matemática'),
(3, 'História'),
(4, 'Geografia'),
(5, 'Ciências')
ON CONFLICT (id) DO NOTHING;

-- 2. Inserir topics se não existirem
INSERT INTO topics (id, name, subject_id) VALUES 
(1, 'Gramática', 1),
(2, 'Interpretação de Texto', 1),
(3, 'Redação', 1),
(4, 'Álgebra', 2),
(5, 'Geometria', 2),
(6, 'História do Brasil', 3),
(7, 'História Geral', 3),
(8, 'Geografia Física', 4),
(9, 'Geografia Humana', 4),
(10, 'Biologia', 5)
ON CONFLICT (id) DO NOTHING;

-- 3. Inserir quizzes se não existirem
INSERT INTO quizzes (id, topic_id, title, description) VALUES 
(1, 1, 'Quiz de Gramática Básica', 'Teste seus conhecimentos em gramática portuguesa'),
(2, 2, 'Interpretação de Texto', 'Exercícios de compreensão textual'),
(3, 4, 'Álgebra Fundamental', 'Conceitos básicos de álgebra'),
(4, 6, 'História do Brasil - Independência', 'Quiz sobre a independência do Brasil'),
(5, 8, 'Geografia Física - Clima', 'Conhecimentos sobre clima e relevo')
ON CONFLICT (id) DO NOTHING;

-- 4. Inserir questões para o quiz de gramática
INSERT INTO quiz_questions (id, quiz_id, question_text, options, correct_answer, explanation) VALUES 
(1, 1, 'Qual é a função da vírgula na frase: "João, que é médico, chegou cedo."?', 
 '["Separar sujeito e predicado", "Isolar o aposto", "Separar orações coordenadas", "Indicar pausa na fala"]', 
 'Isolar o aposto', 
 'A vírgula está isolando o aposto "que é médico", que explica quem é João.'),
 
(2, 1, 'Em qual alternativa há erro de acentuação?', 
 '["café", "público", "último", "tambem"]', 
 'tambem', 
 'A palavra "também" deve ser acentuada na penúltima sílaba.'),
 
(3, 1, 'Qual é a classe gramatical da palavra "rapidamente"?', 
 '["Substantivo", "Adjetivo", "Advérbio", "Verbo"]', 
 'Advérbio', 
 '"Rapidamente" é um advérbio de modo, derivado do adjetivo "rápido".')
ON CONFLICT (id) DO NOTHING;

-- 5. Inserir questões para o quiz de interpretação
INSERT INTO quiz_questions (id, quiz_id, question_text, options, correct_answer, explanation) VALUES 
(4, 2, 'Qual é o tema principal do texto?', 
 '["A importância da leitura", "O desenvolvimento tecnológico", "A preservação ambiental", "A educação formal"]', 
 'A importância da leitura', 
 'O texto enfatiza a importância da leitura para o desenvolvimento pessoal.'),
 
(5, 2, 'Qual é o tipo de texto predominante?', 
 '["Narrativo", "Dissertativo", "Descritivo", "Injuntivo"]', 
 'Dissertativo', 
 'O texto apresenta argumentos e defende uma tese sobre a leitura.')
ON CONFLICT (id) DO NOTHING;

-- 6. Inserir questões para o quiz de álgebra
INSERT INTO quiz_questions (id, quiz_id, question_text, options, correct_answer, explanation) VALUES 
(6, 3, 'Qual é o valor de x na equação 2x + 5 = 13?', 
 '["3", "4", "5", "6"]', 
 '4', 
 '2x + 5 = 13 → 2x = 13 - 5 → 2x = 8 → x = 4'),
 
(7, 3, 'Qual é o resultado de (a + b)²?', 
 '["a² + b²", "a² + 2ab + b²", "a² - 2ab + b²", "a² + ab + b²"]', 
 'a² + 2ab + b²', 
 'Esta é a fórmula do quadrado da soma: (a + b)² = a² + 2ab + b²')
ON CONFLICT (id) DO NOTHING;

-- 7. Verificar se os dados foram inseridos
SELECT 
    'Dados inseridos com sucesso!' as status,
    (SELECT COUNT(*) FROM subjects) as total_subjects,
    (SELECT COUNT(*) FROM topics) as total_topics,
    (SELECT COUNT(*) FROM quizzes) as total_quizzes,
    (SELECT COUNT(*) FROM quiz_questions) as total_questions;