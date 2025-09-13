-- =====================================================
-- CRIAR CURSO EXTENSIVO EAOF 2026 E TURMA
-- =====================================================
-- Este script cria o curso EAOF 2026 e a turma correspondente

-- 1. Inserir subject EXTENSIVO EAOF 2026
-- =====================================================
INSERT INTO subjects (name) VALUES
('EXTENSIVO EAOF 2026')
ON CONFLICT DO NOTHING;

-- 2. Obter o ID do subject criado
-- =====================================================
-- O ID será gerado automaticamente pelo PostgreSQL

-- 3. Inserir turma TURMA Á - EAOF 2026
-- =====================================================
-- NOTA: curso_id deve referenciar o subject EXTENSIVO EAOF 2026
INSERT INTO classes (nome, max_alunos, curso_id, descricao) VALUES
('TURMA Á - EAOF 2026', 50, (SELECT id FROM subjects WHERE name = 'EXTENSIVO EAOF 2026' LIMIT 1), 'Turma do curso extensivo EAOF 2026')
ON CONFLICT DO NOTHING;

-- 4. Verificar se foram criados
-- =====================================================
SELECT 'Subjects criados:' as info;
SELECT * FROM subjects ORDER BY id;

SELECT 'Classes criadas:' as info;
SELECT c.*, s.name as subject_name 
FROM classes c 
LEFT JOIN subjects s ON c.curso_id::text = s.id::text 
ORDER BY c.id;

-- 5. Comentários para documentação
-- =====================================================
COMMENT ON TABLE subjects IS 'Matérias/cursos disponíveis no sistema';
COMMENT ON TABLE classes IS 'Turmas de cada curso/matéria';

-- 6. Dados criados
-- =====================================================
-- Subject: EXTENSIVO EAOF 2026
-- Turma: TURMA Á - EAOF 2026 (50 alunos)
-- Relacionamento: Turma vinculada ao curso EAOF 2026
