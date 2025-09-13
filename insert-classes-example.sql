-- =====================================================
-- INSERIR CLASSES DE EXEMPLO
-- =====================================================
-- Este script insere classes de exemplo com curso_id válido
-- Execute este SQL separadamente se houver problemas de RLS

-- Inserir classes de exemplo
-- NOTA: curso_id deve referenciar subjects existentes (1 = Português, 2 = Regulamentos)
INSERT INTO classes (nome, max_alunos, curso_id) VALUES
('Turma A - Manhã', 30, 1),
('Turma B - Tarde', 25, 1),
('Turma C - Noite', 20, 2)
ON CONFLICT DO NOTHING;

-- Verificar se as classes foram inseridas
SELECT * FROM classes ORDER BY id;
