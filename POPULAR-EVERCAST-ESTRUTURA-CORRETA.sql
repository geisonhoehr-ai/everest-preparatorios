-- ========================================
-- POPULAR DADOS DE EXEMPLO PARA O EVERCAST (ESTRUTURA CORRETA)
-- ========================================
-- Este script cria dados de exemplo baseado na estrutura real das tabelas

-- 1. VERIFICAR USUÁRIOS DISPONÍVEIS
SELECT 'USUÁRIOS DISPONÍVEIS' as status,
       id,
       email,
       role
FROM "public"."users"
WHERE role = 'student'
LIMIT 1;

-- 2. CRIAR CURSOS DE ÁUDIO DE EXEMPLO (ESTRUTURA CORRETA)
INSERT INTO "public"."audio_courses" (name, description, thumbnail_url, total_duration_seconds, is_active, created_by_user_id)
SELECT 
    'Português para Concursos',
    'Curso completo de português para concursos públicos com foco em gramática, interpretação de texto e redação.',
    'https://example.com/thumbnails/portugues-concursos.jpg',
    7200, -- 2 horas
    true,
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_courses" WHERE name = 'Português para Concursos'
);

INSERT INTO "public"."audio_courses" (name, description, thumbnail_url, total_duration_seconds, is_active, created_by_user_id)
SELECT 
    'Matemática Básica',
    'Curso de matemática básica cobrindo aritmética, álgebra, geometria e estatística.',
    'https://example.com/thumbnails/matematica-basica.jpg',
    5400, -- 1.5 horas
    true,
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_courses" WHERE name = 'Matemática Básica'
);

INSERT INTO "public"."audio_courses" (name, description, thumbnail_url, total_duration_seconds, is_active, created_by_user_id)
SELECT 
    'Direito Constitucional',
    'Curso de direito constitucional com foco na Constituição Federal de 1988.',
    'https://example.com/thumbnails/direito-constitucional.jpg',
    6300, -- 1.75 horas
    true,
    (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_courses" WHERE name = 'Direito Constitucional'
);

-- 3. CRIAR MÓDULOS PARA OS CURSOS (ESTRUTURA CORRETA)
-- Módulos para Português para Concursos
INSERT INTO "public"."audio_modules" (course_id, name, description, order_index, total_duration_seconds, is_active)
SELECT 
    (SELECT id FROM "public"."audio_courses" WHERE name = 'Português para Concursos' LIMIT 1),
    'Gramática Fundamental',
    'Módulo introdutório sobre gramática básica do português.',
    1,
    2400, -- 40 minutos
    true
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_modules" WHERE name = 'Gramática Fundamental'
);

INSERT INTO "public"."audio_modules" (course_id, name, description, order_index, total_duration_seconds, is_active)
SELECT 
    (SELECT id FROM "public"."audio_courses" WHERE name = 'Português para Concursos' LIMIT 1),
    'Interpretação de Texto',
    'Técnicas e estratégias para interpretação de textos em concursos.',
    2,
    2400, -- 40 minutos
    true
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_modules" WHERE name = 'Interpretação de Texto'
);

INSERT INTO "public"."audio_modules" (course_id, name, description, order_index, total_duration_seconds, is_active)
SELECT 
    (SELECT id FROM "public"."audio_courses" WHERE name = 'Português para Concursos' LIMIT 1),
    'Redação Oficial',
    'Como escrever redações oficiais para concursos públicos.',
    3,
    2400, -- 40 minutos
    true
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_modules" WHERE name = 'Redação Oficial'
);

-- Módulos para Matemática Básica
INSERT INTO "public"."audio_modules" (course_id, name, description, order_index, total_duration_seconds, is_active)
SELECT 
    (SELECT id FROM "public"."audio_courses" WHERE name = 'Matemática Básica' LIMIT 1),
    'Aritmética',
    'Operações básicas: adição, subtração, multiplicação e divisão.',
    1,
    2700, -- 45 minutos
    true
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_modules" WHERE name = 'Aritmética'
);

INSERT INTO "public"."audio_modules" (course_id, name, description, order_index, total_duration_seconds, is_active)
SELECT 
    (SELECT id FROM "public"."audio_courses" WHERE name = 'Matemática Básica' LIMIT 1),
    'Álgebra',
    'Equações, inequações e sistemas de equações.',
    2,
    2700, -- 45 minutos
    true
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_modules" WHERE name = 'Álgebra'
);

-- Módulos para Direito Constitucional
INSERT INTO "public"."audio_modules" (course_id, name, description, order_index, total_duration_seconds, is_active)
SELECT 
    (SELECT id FROM "public"."audio_courses" WHERE name = 'Direito Constitucional' LIMIT 1),
    'Fundamentos da Constituição',
    'Introdução aos princípios fundamentais da Constituição Federal.',
    1,
    3150, -- 52.5 minutos
    true
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_modules" WHERE name = 'Fundamentos da Constituição'
);

-- 4. CRIAR AULAS DE EXEMPLO (ESTRUTURA CORRETA)
-- Aulas para Gramática Fundamental
INSERT INTO "public"."audio_lessons" (module_id, title, description, duration_seconds, audio_source_type, audio_source_url, order_index, is_active, is_preview)
SELECT 
    (SELECT id FROM "public"."audio_modules" WHERE name = 'Gramática Fundamental' LIMIT 1),
    'Introdução à Gramática',
    'Aula introdutória sobre os conceitos básicos da gramática portuguesa.',
    930, -- 15:30
    'mp3',
    'https://example.com/audio/gramatica-intro.mp3',
    1,
    true,
    true
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_lessons" WHERE title = 'Introdução à Gramática'
);

INSERT INTO "public"."audio_lessons" (module_id, title, description, duration_seconds, audio_source_type, audio_source_url, order_index, is_active, is_preview)
SELECT 
    (SELECT id FROM "public"."audio_modules" WHERE name = 'Gramática Fundamental' LIMIT 1),
    'Classes de Palavras',
    'Estudo das dez classes de palavras da língua portuguesa.',
    1335, -- 22:15
    'mp3',
    'https://example.com/audio/classes-palavras.mp3',
    2,
    true,
    false
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_lessons" WHERE title = 'Classes de Palavras'
);

INSERT INTO "public"."audio_lessons" (module_id, title, description, duration_seconds, audio_source_type, audio_source_url, order_index, is_active, is_preview)
SELECT 
    (SELECT id FROM "public"."audio_modules" WHERE name = 'Gramática Fundamental' LIMIT 1),
    'Sintaxe Básica',
    'Conceitos fundamentais de sintaxe: sujeito, predicado e complementos.',
    1125, -- 18:45
    'hls',
    'https://example.com/hls/sintaxe-basica.m3u8',
    3,
    true,
    false
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_lessons" WHERE title = 'Sintaxe Básica'
);

-- Aulas para Interpretação de Texto
INSERT INTO "public"."audio_lessons" (module_id, title, description, duration_seconds, audio_source_type, audio_source_url, order_index, is_active, is_preview)
SELECT 
    (SELECT id FROM "public"."audio_modules" WHERE name = 'Interpretação de Texto' LIMIT 1),
    'Estratégias de Leitura',
    'Técnicas para leitura eficiente e compreensão de textos.',
    1210, -- 20:10
    'soundcloud',
    'https://soundcloud.com/example/estrategias-leitura',
    1,
    true,
    true
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_lessons" WHERE title = 'Estratégias de Leitura'
);

INSERT INTO "public"."audio_lessons" (module_id, title, description, duration_seconds, audio_source_type, audio_source_url, order_index, is_active, is_preview)
SELECT 
    (SELECT id FROM "public"."audio_modules" WHERE name = 'Interpretação de Texto' LIMIT 1),
    'Tipos de Texto',
    'Identificação e características dos diferentes tipos de texto.',
    990, -- 16:30
    'mp3',
    'https://example.com/audio/tipos-texto.mp3',
    2,
    true,
    false
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_lessons" WHERE title = 'Tipos de Texto'
);

-- Aulas para Redação Oficial
INSERT INTO "public"."audio_lessons" (module_id, title, description, duration_seconds, audio_source_type, audio_source_url, order_index, is_active, is_preview)
SELECT 
    (SELECT id FROM "public"."audio_modules" WHERE name = 'Redação Oficial' LIMIT 1),
    'Estrutura da Redação',
    'Como estruturar uma redação oficial seguindo as normas técnicas.',
    1160, -- 19:20
    'hls',
    'https://example.com/hls/estrutura-redacao.m3u8',
    1,
    true,
    false
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_lessons" WHERE title = 'Estrutura da Redação'
);

-- Aulas para Aritmética
INSERT INTO "public"."audio_lessons" (module_id, title, description, duration_seconds, audio_source_type, audio_source_url, order_index, is_active, is_preview)
SELECT 
    (SELECT id FROM "public"."audio_modules" WHERE name = 'Aritmética' LIMIT 1),
    'Operações Básicas',
    'Revisão das quatro operações fundamentais da matemática.',
    1065, -- 17:45
    'mp3',
    'https://example.com/audio/operacoes-basicas.mp3',
    1,
    true,
    true
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_lessons" WHERE title = 'Operações Básicas'
);

INSERT INTO "public"."audio_lessons" (module_id, title, description, duration_seconds, audio_source_type, audio_source_url, order_index, is_active, is_preview)
SELECT 
    (SELECT id FROM "public"."audio_modules" WHERE name = 'Aritmética' LIMIT 1),
    'Frações e Decimais',
    'Como trabalhar com frações e números decimais.',
    1275, -- 21:15
    'hls',
    'https://example.com/hls/fracoes-decimais.m3u8',
    2,
    true,
    false
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_lessons" WHERE title = 'Frações e Decimais'
);

-- Aulas para Álgebra
INSERT INTO "public"."audio_lessons" (module_id, title, description, duration_seconds, audio_source_type, audio_source_url, order_index, is_active, is_preview)
SELECT 
    (SELECT id FROM "public"."audio_modules" WHERE name = 'Álgebra' LIMIT 1),
    'Equações do Primeiro Grau',
    'Resolução de equações do primeiro grau com uma incógnita.',
    1110, -- 18:30
    'mp3',
    'https://example.com/audio/equacoes-1-grau.mp3',
    1,
    true,
    false
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_lessons" WHERE title = 'Equações do Primeiro Grau'
);

-- Aulas para Fundamentos da Constituição
INSERT INTO "public"."audio_lessons" (module_id, title, description, duration_seconds, audio_source_type, audio_source_url, order_index, is_active, is_preview)
SELECT 
    (SELECT id FROM "public"."audio_modules" WHERE name = 'Fundamentos da Constituição' LIMIT 1),
    'Histórico Constitucional',
    'Evolução histórica das constituições brasileiras.',
    1460, -- 24:20
    'soundcloud',
    'https://soundcloud.com/example/historico-constitucional',
    1,
    true,
    true
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."audio_lessons" WHERE title = 'Histórico Constitucional'
);

INSERT INTO "public"."audio_lessons" (module_id, title, description, duration_seconds, audio_source_type, audio_source_url, order_index, is_active, is_preview)
SELECT 
    (SELECT id FROM "public"."audio_modules" WHERE name = 'Fundamentos da Constituição' LIMIT 1),
    'Princípios Fundamentais',
    'Os princípios fundamentais da República Federativa do Brasil.',
    1245, -- 20:45
    'hls',
    'https://example.com/hls/principios-fundamentais.m3u8',
    2,
    true,
    false
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
       COUNT(l.id) as total_aulas,
       SUM(l.duration_seconds) as duracao_total_segundos
FROM "public"."audio_modules" m
LEFT JOIN "public"."audio_lessons" l ON m.id = l.module_id
GROUP BY m.name
ORDER BY total_aulas DESC;

SELECT 'CURSOS E MÓDULOS CRIADOS' as status,
       c.name as curso,
       m.name as modulo,
       COUNT(l.id) as total_aulas,
       SUM(l.duration_seconds) as duracao_total_segundos
FROM "public"."audio_courses" c
LEFT JOIN "public"."audio_modules" m ON c.id = m.course_id
LEFT JOIN "public"."audio_lessons" l ON m.id = l.module_id
GROUP BY c.name, m.name
ORDER BY c.name, m.name;

SELECT 'TIPOS DE FONTE DE ÁUDIO' as status,
       audio_source_type,
       COUNT(*) as total_aulas
FROM "public"."audio_lessons"
GROUP BY audio_source_type
ORDER BY total_aulas DESC;
