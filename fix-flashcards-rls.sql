-- =====================================================
-- CORRIGIR RLS E CRIAR DADOS PARA FLASHCARDS
-- =====================================================
-- Este script desabilita temporariamente RLS e cria os dados necessários

-- 1. Desabilitar RLS temporariamente
-- =====================================================
ALTER TABLE flashcard_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 2. Criar usuário de teste
-- =====================================================
INSERT INTO user_profiles (id, role) VALUES
('00000000-0000-0000-0000-000000000001', 'student')
ON CONFLICT (id) DO NOTHING;

-- 3. Criar progresso de flashcards para alguns flashcards
-- =====================================================
INSERT INTO flashcard_progress (user_id, flashcard_id, ease_factor, repetitions, next_review, last_reviewed) VALUES
('00000000-0000-0000-0000-000000000001', 1, 2.5, 0, NOW(), NOW()),
('00000000-0000-0000-0000-000000000001', 2, 2.5, 0, NOW(), NOW()),
('00000000-0000-0000-0000-000000000001', 3, 2.5, 0, NOW(), NOW()),
('00000000-0000-0000-0000-000000000001', 4, 2.5, 0, NOW(), NOW()),
('00000000-0000-0000-0000-000000000001', 5, 2.5, 0, NOW(), NOW()),
('00000000-0000-0000-0000-000000000001', 6, 2.5, 0, NOW(), NOW()),
('00000000-0000-0000-0000-000000000001', 7, 2.5, 0, NOW(), NOW()),
('00000000-0000-0000-0000-000000000001', 8, 2.5, 0, NOW(), NOW()),
('00000000-0000-0000-0000-000000000001', 9, 2.5, 0, NOW(), NOW()),
('00000000-0000-0000-0000-000000000001', 10, 2.5, 0, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 4. Reabilitar RLS
-- =====================================================
ALTER TABLE flashcard_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Verificar resultado
-- =====================================================
SELECT 'Usuário criado:' as info;
SELECT * FROM user_profiles WHERE id = '00000000-0000-0000-0000-000000000001';

SELECT 'Progresso criado:' as info;
SELECT COUNT(*) as total_progress FROM flashcard_progress WHERE user_id = '00000000-0000-0000-0000-000000000001';

SELECT 'Flashcards disponíveis:' as info;
SELECT f.id, f.question, f.answer, t.name as topic_name
FROM flashcards f
JOIN topics t ON f.topic_id = t.id
WHERE f.id IN (1, 2, 3, 4, 5)
LIMIT 5;
