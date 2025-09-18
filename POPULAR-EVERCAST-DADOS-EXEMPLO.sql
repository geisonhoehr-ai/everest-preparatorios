-- ========================================
-- POPULAR DADOS DE EXEMPLO PARA O EVERCAST
-- ========================================
-- Este script cria dados de exemplo para testar o EverCast

-- 1. VERIFICAR USUÁRIOS DISPONÍVEIS
SELECT 'USUÁRIOS DISPONÍVEIS' as status,
       id,
       email,
       role
FROM "public"."users"
WHERE role = 'student'
LIMIT 1;

-- 2. CRIAR CURSOS DE ÁUDIO DE EXEMPLO
INSERT INTO "public"."audio_courses" (name, description, created_by_user_id)
SELECT 
    'Português para Concursos',
    'Curso completo de português para concursos públicos com foco em gramática, interpretação de texto e redação.',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_courses" WHERE name = 'Português para Concursos'
);

INSERT INTO "public"."audio_courses" (name, description, created_by_user_id)
SELECT 
    'Matemática Básica',
    'Curso de matemática básica cobrindo aritmética, álgebra, geometria e estatística.',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_courses" WHERE name = 'Matemática Básica'
);

INSERT INTO "public"."audio_courses" (name, description, created_by_user_id)
SELECT 
    'Direito Constitucional',
    'Curso de direito constitucional com foco na Constituição Federal de 1988.',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_courses" WHERE name = 'Direito Constitucional'
);

-- 3. CRIAR MÓDULOS PARA OS CURSOS
-- Módulos para Português para Concursos
INSERT INTO "public"."audio_modules" (name, description, course_id, created_by_user_id)
SELECT 
    'Gramática Fundamental',
    'Módulo introdutório sobre gramática básica do português.',
    (SELECT id FROM "public"."audio_courses" WHERE name = 'Português para Concursos' LIMIT 1),
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_modules" WHERE name = 'Gramática Fundamental'
);

INSERT INTO "public"."audio_modules" (name, description, course_id, created_by_user_id)
SELECT 
    'Interpretação de Texto',
    'Técnicas e estratégias para interpretação de textos em concursos.',
    (SELECT id FROM "public"."audio_courses" WHERE name = 'Português para Concursos' LIMIT 1),
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_modules" WHERE name = 'Interpretação de Texto'
);

INSERT INTO "public"."audio_modules" (name, description, course_id, created_by_user_id)
SELECT 
    'Redação Oficial',
    'Como escrever redações oficiais para concursos públicos.',
    (SELECT id FROM "public"."audio_courses" WHERE name = 'Português para Concursos' LIMIT 1),
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_modules" WHERE name = 'Redação Oficial'
);

-- Módulos para Matemática Básica
INSERT INTO "public"."audio_modules" (name, description, course_id, created_by_user_id)
SELECT 
    'Aritmética',
    'Operações básicas: adição, subtração, multiplicação e divisão.',
    (SELECT id FROM "public"."audio_courses" WHERE name = 'Matemática Básica' LIMIT 1),
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_modules" WHERE name = 'Aritmética'
);

INSERT INTO "public"."audio_modules" (name, description, course_id, created_by_user_id)
SELECT 
    'Álgebra',
    'Equações, inequações e sistemas de equações.',
    (SELECT id FROM "public"."audio_courses" WHERE name = 'Matemática Básica' LIMIT 1),
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_modules" WHERE name = 'Álgebra'
);

-- Módulos para Direito Constitucional
INSERT INTO "public"."audio_modules" (name, description, course_id, created_by_user_id)
SELECT 
    'Fundamentos da Constituição',
    'Introdução aos princípios fundamentais da Constituição Federal.',
    (SELECT id FROM "public"."audio_courses" WHERE name = 'Direito Constitucional' LIMIT 1),
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_modules" WHERE name = 'Fundamentos da Constituição'
);

-- 4. CRIAR AULAS DE EXEMPLO
-- Aulas para Gramática Fundamental
INSERT INTO "public"."audio_lessons" (title, description, module_id, audio_url, duration, created_by_user_id)
SELECT 
    'Introdução à Gramática',
    'Aula introdutória sobre os conceitos básicos da gramática portuguesa.',
    (SELECT id FROM "public"."audio_modules" WHERE name = 'Gramática Fundamental' LIMIT 1),
    'https://example.com/audio/gramatica-intro.mp3',
    '00:15:30',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_lessons" WHERE title = 'Introdução à Gramática'
);

INSERT INTO "public"."audio_lessons" (title, description, module_id, audio_url, duration, created_by_user_id)
SELECT 
    'Classes de Palavras',
    'Estudo das dez classes de palavras da língua portuguesa.',
    (SELECT id FROM "public"."audio_modules" WHERE name = 'Gramática Fundamental' LIMIT 1),
    'https://example.com/audio/classes-palavras.mp3',
    '00:22:15',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_lessons" WHERE title = 'Classes de Palavras'
);

INSERT INTO "public"."audio_lessons" (title, description, module_id, audio_url, duration, created_by_user_id)
SELECT 
    'Sintaxe Básica',
    'Conceitos fundamentais de sintaxe: sujeito, predicado e complementos.',
    (SELECT id FROM "public"."audio_modules" WHERE name = 'Gramática Fundamental' LIMIT 1),
    'https://example.com/audio/sintaxe-basica.mp3',
    '00:18:45',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_lessons" WHERE title = 'Sintaxe Básica'
);

-- Aulas para Interpretação de Texto
INSERT INTO "public"."audio_lessons" (title, description, module_id, audio_url, duration, created_by_user_id)
SELECT 
    'Estratégias de Leitura',
    'Técnicas para leitura eficiente e compreensão de textos.',
    (SELECT id FROM "public"."audio_modules" WHERE name = 'Interpretação de Texto' LIMIT 1),
    'https://example.com/audio/estrategias-leitura.mp3',
    '00:20:10',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_lessons" WHERE title = 'Estratégias de Leitura'
);

INSERT INTO "public"."audio_lessons" (title, description, module_id, audio_url, duration, created_by_user_id)
SELECT 
    'Tipos de Texto',
    'Identificação e características dos diferentes tipos de texto.',
    (SELECT id FROM "public"."audio_modules" WHERE name = 'Interpretação de Texto' LIMIT 1),
    'https://example.com/audio/tipos-texto.mp3',
    '00:16:30',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_lessons" WHERE title = 'Tipos de Texto'
);

-- Aulas para Redação Oficial
INSERT INTO "public"."audio_lessons" (title, description, module_id, audio_url, duration, created_by_user_id)
SELECT 
    'Estrutura da Redação',
    'Como estruturar uma redação oficial seguindo as normas técnicas.',
    (SELECT id FROM "public"."audio_modules" WHERE name = 'Redação Oficial' LIMIT 1),
    'https://example.com/audio/estrutura-redacao.mp3',
    '00:19:20',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_lessons" WHERE title = 'Estrutura da Redação'
);

-- Aulas para Aritmética
INSERT INTO "public"."audio_lessons" (title, description, module_id, audio_url, duration, created_by_user_id)
SELECT 
    'Operações Básicas',
    'Revisão das quatro operações fundamentais da matemática.',
    (SELECT id FROM "public"."audio_modules" WHERE name = 'Aritmética' LIMIT 1),
    'https://example.com/audio/operacoes-basicas.mp3',
    '00:17:45',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_lessons" WHERE title = 'Operações Básicas'
);

INSERT INTO "public"."audio_lessons" (title, description, module_id, audio_url, duration, created_by_user_id)
SELECT 
    'Frações e Decimais',
    'Como trabalhar com frações e números decimais.',
    (SELECT id FROM "public"."audio_modules" WHERE name = 'Aritmética' LIMIT 1),
    'https://example.com/audio/fracoes-decimais.mp3',
    '00:21:15',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_lessons" WHERE title = 'Frações e Decimais'
);

-- Aulas para Álgebra
INSERT INTO "public"."audio_lessons" (title, description, module_id, audio_url, duration, created_by_user_id)
SELECT 
    'Equações do Primeiro Grau',
    'Resolução de equações do primeiro grau com uma incógnita.',
    (SELECT id FROM "public"."audio_modules" WHERE name = 'Álgebra' LIMIT 1),
    'https://example.com/audio/equacoes-1-grau.mp3',
    '00:18:30',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_lessons" WHERE title = 'Equações do Primeiro Grau'
);

-- Aulas para Fundamentos da Constituição
INSERT INTO "public"."audio_lessons" (title, description, module_id, audio_url, duration, created_by_user_id)
SELECT 
    'Histórico Constitucional',
    'Evolução histórica das constituições brasileiras.',
    (SELECT id FROM "public"."audio_modules" WHERE name = 'Fundamentos da Constituição' LIMIT 1),
    'https://example.com/audio/historico-constitucional.mp3',
    '00:24:20',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_lessons" WHERE title = 'Histórico Constitucional'
);

INSERT INTO "public"."audio_lessons" (title, description, module_id, audio_url, duration, created_by_user_id)
SELECT 
    'Princípios Fundamentais',
    'Os princípios fundamentais da República Federativa do Brasil.',
    (SELECT id FROM "public"."audio_modules" WHERE name = 'Fundamentos da Constituição' LIMIT 1),
    'https://example.com/audio/principios-fundamentais.mp3',
    '00:20:45',
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_lessons" WHERE title = 'Princípios Fundamentais'
);

-- 5. VERIFICAR RESULTADOS
SELECT 'CURSOS CRIADOS' as status,
       COUNT(*) as total_courses
FROM "public"."audio_courses";

SELECT 'MÓDULOS CRIADOS' as status,
       COUNT(*) as total_modules
FROM "public"."audio_modules";

SELECT 'AULAS CRIADAS' as status,
       COUNT(*) as total_lessons
FROM "public"."audio_lessons";

SELECT 'DISTRIBUIÇÃO DE AULAS POR MÓDULO' as status,
       m.name as modulo,
       COUNT(l.id) as total_aulas
FROM "public"."audio_modules" m
LEFT JOIN "public"."audio_lessons" l ON m.id = l.module_id
GROUP BY m.name
ORDER BY total_aulas DESC;

SELECT 'CURSOS E MÓDULOS CRIADOS' as status,
       c.name as curso,
       m.name as modulo,
       COUNT(l.id) as total_aulas
FROM "public"."audio_courses" c
LEFT JOIN "public"."audio_modules" m ON c.id = m.course_id
LEFT JOIN "public"."audio_lessons" l ON m.id = l.module_id
GROUP BY c.name, m.name
ORDER BY c.name, m.name;
