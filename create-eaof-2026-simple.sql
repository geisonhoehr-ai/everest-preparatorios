-- =====================================================
-- CRIAR CURSO EXTENSIVO EAOF 2026 E TURMA (VERSÃO SIMPLES)
-- =====================================================
-- Este script cria o curso EAOF 2026 e a turma correspondente

-- 1. Inserir subject EXTENSIVO EAOF 2026
-- =====================================================
INSERT INTO subjects (name) VALUES
('EXTENSIVO EAOF 2026')
ON CONFLICT DO NOTHING;

-- 2. Inserir turma TURMA Á - EAOF 2026
-- =====================================================
-- NOTA: curso_id deve referenciar o subject EXTENSIVO EAOF 2026
INSERT INTO classes (nome, max_alunos, curso_id, descricao) VALUES
('TURMA Á - EAOF 2026', 50, (SELECT id FROM subjects WHERE name = 'EXTENSIVO EAOF 2026' LIMIT 1), 'Turma do curso extensivo EAOF 2026')
ON CONFLICT DO NOTHING;

-- 3. Verificar se foram criados (versão simples)
-- =====================================================
SELECT 'Subjects criados:' as info;
SELECT * FROM subjects ORDER BY id;

SELECT 'Classes criadas:' as info;
SELECT * FROM classes ORDER BY id;

-- 4. Verificar relacionamento (versão simples)
-- =====================================================
SELECT 'Verificação de relacionamento:' as info;
SELECT 
  c.id as class_id,
  c.nome as class_name,
  c.curso_id,
  s.id as subject_id,
  s.name as subject_name
FROM classes c, subjects s 
WHERE c.curso_id::text = s.id::text
ORDER BY c.id;
