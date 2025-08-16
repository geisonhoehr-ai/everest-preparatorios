-- Script para verificar e inserir dados necessários para o quiz funcionar

-- 1. Verificar se a tabela subjects existe e tem dados
DO $$
BEGIN
    -- Verificar se a tabela subjects existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subjects') THEN
        RAISE NOTICE '✅ Tabela subjects existe';
        
        -- Verificar se tem dados
        IF (SELECT COUNT(*) FROM subjects) = 0 THEN
            RAISE NOTICE '⚠️ Tabela subjects está vazia, inserindo dados...';
            
            -- Inserir subjects básicos
            INSERT INTO subjects (id, name, description) VALUES 
            (1, 'Português', 'Língua Portuguesa - Gramática, Literatura e Redação'),
            (2, 'Matemática', 'Matemática - Álgebra, Geometria e Trigonometria'),
            (3, 'História', 'História - História Geral e do Brasil'),
            (4, 'Geografia', 'Geografia - Geografia Geral e do Brasil'),
            (5, 'Ciências', 'Ciências - Biologia, Física e Química')
            ON CONFLICT (id) DO NOTHING;
            
            RAISE NOTICE '✅ Subjects inseridos com sucesso';
        ELSE
            RAISE NOTICE '✅ Tabela subjects já tem dados';
        END IF;
    ELSE
        RAISE NOTICE '❌ Tabela subjects não existe';
    END IF;
END $$;

-- 2. Verificar se a tabela topics existe e tem dados
DO $$
BEGIN
    -- Verificar se a tabela topics existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'topics') THEN
        RAISE NOTICE '✅ Tabela topics existe';
        
        -- Verificar se tem dados
        IF (SELECT COUNT(*) FROM topics) = 0 THEN
            RAISE NOTICE '⚠️ Tabela topics está vazia, inserindo dados...';
            
            -- Inserir topics básicos
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
            
            RAISE NOTICE '✅ Topics inseridos com sucesso';
        ELSE
            RAISE NOTICE '✅ Tabela topics já tem dados';
        END IF;
    ELSE
        RAISE NOTICE '❌ Tabela topics não existe';
    END IF;
END $$;

-- 3. Verificar se há quizzes com topic_id válidos
SELECT 
    'Verificando quizzes:' as info,
    COUNT(*) as total_quizzes
FROM quizzes;

-- 4. Verificar se há quizzes com topic_id que existem na tabela topics
SELECT 
    'Quizzes com topic_id válidos:' as info,
    COUNT(*) as total_quizzes_validos
FROM quizzes q
INNER JOIN topics t ON q.topic_id = t.id;

-- 5. Mostrar alguns exemplos de subjects
SELECT 
    'Exemplos de subjects:' as info,
    id,
    name
FROM subjects 
LIMIT 5;

-- 6. Mostrar alguns exemplos de topics
SELECT 
    'Exemplos de topics:' as info,
    id,
    name,
    subject_id
FROM topics 
LIMIT 5;

-- 7. Mostrar alguns exemplos de quizzes com topic válido
SELECT 
    'Quizzes com topic válido:' as info,
    q.id as quiz_id,
    q.title as quiz_title,
    q.topic_id,
    t.name as topic_name
FROM quizzes q
INNER JOIN topics t ON q.topic_id = t.id
LIMIT 5;