-- Script para criar tabela subjects e reorganizar dados
-- Data: 2025-01-25
-- Descrição: Cria tabela subjects e reorganiza os tópicos existentes

BEGIN;

-- 1. Criar tabela subjects
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Inserir matérias baseadas nos tópicos existentes
INSERT INTO subjects (name, description) VALUES
('Português', 'Língua Portuguesa - Gramática, Literatura e Redação'),
('Matemática', 'Matemática - Álgebra, Geometria e Trigonometria'),
('História', 'História - História Geral e do Brasil'),
('Geografia', 'Geografia - Geografia Geral e do Brasil'),
('Biologia', 'Biologia - Ciências da Vida'),
('Física', 'Física - Ciências da Natureza'),
('Química', 'Química - Ciências da Natureza'),
('Filosofia', 'Filosofia - Ciências Humanas'),
('Sociologia', 'Sociologia - Ciências Humanas'),
('Inglês', 'Língua Inglesa - Gramática e Literatura')
ON CONFLICT (name) DO NOTHING;

-- 3. Adicionar coluna subject_id na tabela topics
ALTER TABLE topics ADD COLUMN IF NOT EXISTS subject_id INTEGER REFERENCES subjects(id);

-- 4. Mapear tópicos existentes para matérias
UPDATE topics SET subject_id = (
    CASE 
        WHEN name ILIKE '%fonetica%' OR name ILIKE '%fonologia%' OR 
             name ILIKE '%ortografia%' OR name ILIKE '%acentuacao%' OR 
             name ILIKE '%morfologia%' OR name ILIKE '%sintaxe%' OR
             name ILIKE '%gramatica%' OR name ILIKE '%portugues%'
        THEN (SELECT id FROM subjects WHERE name = 'Português')
        
        WHEN name ILIKE '%algebra%' OR name ILIKE '%geometria%' OR 
             name ILIKE '%trigonometria%' OR name ILIKE '%matematica%' OR
             name ILIKE '%calculo%' OR name ILIKE '%equacao%'
        THEN (SELECT id FROM subjects WHERE name = 'Matemática')
        
        WHEN name ILIKE '%historia%' OR name ILIKE '%brasil%' OR
             name ILIKE '%independencia%' OR name ILIKE '%republica%'
        THEN (SELECT id FROM subjects WHERE name = 'História')
        
        WHEN name ILIKE '%geografia%' OR name ILIKE '%clima%' OR
             name ILIKE '%relevo%' OR name ILIKE '%populacao%'
        THEN (SELECT id FROM subjects WHERE name = 'Geografia')
        
        WHEN name ILIKE '%biologia%' OR name ILIKE '%celula%' OR
             name ILIKE '%genetica%' OR name ILIKE '%ecologia%'
        THEN (SELECT id FROM subjects WHERE name = 'Biologia')
        
        WHEN name ILIKE '%fisica%' OR name ILIKE '%mecanica%' OR
             name ILIKE '%termodinamica%' OR name ILIKE '%eletricidade%'
        THEN (SELECT id FROM subjects WHERE name = 'Física')
        
        WHEN name ILIKE '%quimica%' OR name ILIKE '%molecula%' OR
             name ILIKE '%reacao%' OR name ILIKE '%tabela%'
        THEN (SELECT id FROM subjects WHERE name = 'Química')
        
        WHEN name ILIKE '%filosofia%' OR name ILIKE '%etica%' OR
             name ILIKE '%logica%' OR name ILIKE '%metafisica%'
        THEN (SELECT id FROM subjects WHERE name = 'Filosofia')
        
        WHEN name ILIKE '%sociologia%' OR name ILIKE '%sociedade%' OR
             name ILIKE '%cultura%' OR name ILIKE '%politica%'
        THEN (SELECT id FROM subjects WHERE name = 'Sociologia')
        
        WHEN name ILIKE '%ingles%' OR name ILIKE '%english%' OR
             name ILIKE '%grammar%' OR name ILIKE '%vocabulary%'
        THEN (SELECT id FROM subjects WHERE name = 'Inglês')
        
        ELSE (SELECT id FROM subjects WHERE name = 'Português') -- Padrão
    END
)
WHERE subject_id IS NULL;

-- 5. Verificar se todos os tópicos foram mapeados
SELECT 
    'Tópicos sem matéria' as status,
    COUNT(*) as total
FROM topics 
WHERE subject_id IS NULL
UNION ALL
SELECT 
    'Tópicos mapeados' as status,
    COUNT(*) as total
FROM topics 
WHERE subject_id IS NOT NULL;

-- 6. Mostrar distribuição por matéria
SELECT 
    s.name as materia,
    COUNT(t.id) as total_topicos
FROM subjects s
LEFT JOIN topics t ON s.id = t.subject_id
GROUP BY s.id, s.name
ORDER BY s.name;

-- 7. Mostrar alguns tópicos mapeados
SELECT 
    t.name as topico,
    s.name as materia
FROM topics t
LEFT JOIN subjects s ON t.subject_id = s.id
ORDER BY s.name, t.name
LIMIT 20;

COMMIT;

-- Log da operação
DO $$
BEGIN
    RAISE NOTICE '✅ Tabela subjects criada com sucesso';
    RAISE NOTICE '📚 Matérias inseridas: %', (SELECT COUNT(*) FROM subjects);
    RAISE NOTICE '📝 Tópicos mapeados: %', (SELECT COUNT(*) FROM topics WHERE subject_id IS NOT NULL);
    RAISE NOTICE '❌ Tópicos sem mapeamento: %', (SELECT COUNT(*) FROM topics WHERE subject_id IS NULL);
END $$; 