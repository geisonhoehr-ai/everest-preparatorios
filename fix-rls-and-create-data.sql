-- =====================================================
-- CORRIGIR RLS E CRIAR DADOS PARA EAOF 2026
-- =====================================================
-- Este script desabilita temporariamente RLS e cria os dados necessários

-- 1. Desabilitar RLS temporariamente
-- =====================================================
ALTER TABLE topics DISABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;

-- 2. Limpar subjects duplicados
-- =====================================================
DELETE FROM subjects WHERE name = 'EXTENSIVO EAOF 2026' AND id != 5;

-- 3. Criar topics para EAOF
-- =====================================================
INSERT INTO topics (id, name, subject_id) VALUES
('matematica-basica', 'Matemática Básica', 5),
('portugues-eaof', 'Português EAOF', 5),
('conhecimentos-gerais', 'Conhecimentos Gerais', 5),
('raciocinio-logico', 'Raciocínio Lógico', 5)
ON CONFLICT (id) DO NOTHING;

-- 4. Criar flashcards de exemplo
-- =====================================================
INSERT INTO flashcards (question, answer, topic_id) VALUES
-- Matemática Básica
('Qual é o resultado de 2 + 2?', '4', 'matematica-basica'),
('Qual é a raiz quadrada de 16?', '4', 'matematica-basica'),
('Quanto é 5 x 3?', '15', 'matematica-basica'),

-- Português EAOF
('Qual é a capital do Brasil?', 'Brasília', 'portugues-eaof'),
('Quantos estados tem o Brasil?', '26', 'portugues-eaof'),
('Qual é o maior rio do Brasil?', 'Rio Amazonas', 'portugues-eaof'),

-- Conhecimentos Gerais
('Em que ano foi descoberto o Brasil?', '1500', 'conhecimentos-gerais'),
('Qual é o maior planeta do sistema solar?', 'Júpiter', 'conhecimentos-gerais'),
('Quem escreveu "Os Lusíadas"?', 'Luís de Camões', 'conhecimentos-gerais'),

-- Raciocínio Lógico
('Se A = B e B = C, então A = ?', 'C', 'raciocinio-logico'),
('Qual é o próximo número na sequência: 2, 4, 6, 8, ?', '10', 'raciocinio-logico'),
('Se um relógio marca 3:15, qual é o ângulo entre os ponteiros?', '7.5 graus', 'raciocinio-logico')
ON CONFLICT DO NOTHING;

-- 5. Criar turma EAOF
-- =====================================================
INSERT INTO classes (nome, max_alunos, curso_id, descricao, status, ano_letivo) VALUES
('TURMA Á - EAOF 2026', 50, 5, 'Turma do curso extensivo EAOF 2026', 'ativa', 2025)
ON CONFLICT DO NOTHING;

-- 6. Criar usuário de teste (estrutura básica)
-- =====================================================
INSERT INTO user_profiles (id, role) VALUES
('00000000-0000-0000-0000-000000000001', 'admin')
ON CONFLICT (id) DO NOTHING;

-- 7. Reabilitar RLS
-- =====================================================
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- 8. Verificar resultado
-- =====================================================
SELECT 'Subjects EAOF:' as info;
SELECT * FROM subjects WHERE name = 'EXTENSIVO EAOF 2026';

SELECT 'Topics EAOF:' as info;
SELECT * FROM topics WHERE subject_id = 5;

SELECT 'Flashcards EAOF:' as info;
SELECT f.*, t.name as topic_name 
FROM flashcards f 
JOIN topics t ON f.topic_id = t.id 
WHERE t.subject_id = 5;

SELECT 'Classes EAOF:' as info;
SELECT * FROM classes WHERE nome = 'TURMA Á - EAOF 2026';

SELECT 'Usuários:' as info;
SELECT * FROM user_profiles;
