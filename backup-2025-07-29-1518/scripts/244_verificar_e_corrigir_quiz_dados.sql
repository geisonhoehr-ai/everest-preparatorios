-- Script para verificar e corrigir dados das tabelas subjects e topics
-- Este script resolve o problema de carregamento infinito na página de quiz

-- 1. Verificar se as tabelas existem
SELECT 
    'Verificando tabelas:' as info,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'subjects'
    ) as subjects_exists,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'topics'
    ) as topics_exists;

-- 2. Verificar dados nas tabelas
SELECT 
    'Dados em subjects:' as info,
    COUNT(*) as total_subjects
FROM subjects;

SELECT 
    'Dados em topics:' as info,
    COUNT(*) as total_topics
FROM topics;

-- 3. Se não há dados, inserir dados de exemplo
DO $$ 
BEGIN
    -- Inserir subjects se não existirem
    IF NOT EXISTS (SELECT 1 FROM subjects LIMIT 1) THEN
        INSERT INTO subjects (id, name, created_at) VALUES
        (1, 'Português', NOW()),
        (2, 'Matemática', NOW()),
        (3, 'História', NOW()),
        (4, 'Geografia', NOW()),
        (5, 'Ciências', NOW()),
        (6, 'Inglês', NOW());
        
        RAISE NOTICE 'Subjects inseridos com sucesso';
    ELSE
        RAISE NOTICE 'Subjects já existem';
    END IF;
    
    -- Inserir topics se não existirem
    IF NOT EXISTS (SELECT 1 FROM topics LIMIT 1) THEN
        INSERT INTO topics (id, name, subject_id, created_at) VALUES
        -- Português
        ('pt-gramatica', 'Gramática', 1, NOW()),
        ('pt-literatura', 'Literatura', 1, NOW()),
        ('pt-interpretacao', 'Interpretação de Texto', 1, NOW()),
        ('pt-redacao', 'Redação', 1, NOW()),
        
        -- Matemática
        ('mat-algebra', 'Álgebra', 2, NOW()),
        ('mat-geometria', 'Geometria', 2, NOW()),
        ('mat-trigonometria', 'Trigonometria', 2, NOW()),
        ('mat-calculo', 'Cálculo', 2, NOW()),
        
        -- História
        ('hist-brasil', 'História do Brasil', 3, NOW()),
        ('hist-geral', 'História Geral', 3, NOW()),
        ('hist-contemporanea', 'História Contemporânea', 3, NOW()),
        
        -- Geografia
        ('geo-fisica', 'Geografia Física', 4, NOW()),
        ('geo-humana', 'Geografia Humana', 4, NOW()),
        ('geo-brasil', 'Geografia do Brasil', 4, NOW()),
        
        -- Ciências
        ('cien-biologia', 'Biologia', 5, NOW()),
        ('cien-quimica', 'Química', 5, NOW()),
        ('cien-fisica', 'Física', 5, NOW()),
        
        -- Inglês
        ('ing-grammar', 'Grammar', 6, NOW()),
        ('ing-vocabulary', 'Vocabulary', 6, NOW()),
        ('ing-comprehension', 'Reading Comprehension', 6, NOW());
        
        RAISE NOTICE 'Topics inseridos com sucesso';
    ELSE
        RAISE NOTICE 'Topics já existem';
    END IF;
END $$;

-- 4. Verificar resultado final
SELECT 
    'Resultado final:' as info,
    (SELECT COUNT(*) FROM subjects) as total_subjects,
    (SELECT COUNT(*) FROM topics) as total_topics;

-- 5. Mostrar alguns exemplos
SELECT 
    'Exemplos de subjects:' as info,
    id,
    name
FROM subjects 
LIMIT 5;

SELECT 
    'Exemplos de topics:' as info,
    t.id,
    t.name,
    s.name as subject_name
FROM topics t
JOIN subjects s ON t.subject_id = s.id
LIMIT 10;