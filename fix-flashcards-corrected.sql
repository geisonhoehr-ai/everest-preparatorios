-- Corrigir flashcards - versão corrigida
-- Desabilitar RLS temporariamente
ALTER TABLE flashcard_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Criar usuário de teste com user_id
INSERT INTO user_profiles (id, user_id, role) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'student')
ON CONFLICT (id) DO NOTHING;

-- Criar progresso de flashcards
INSERT INTO flashcard_progress (user_id, flashcard_id, ease_factor, repetitions, next_review, last_reviewed) VALUES
('00000000-0000-0000-0000-000000000001', 1, 2.5, 0, NOW(), NOW()),
('00000000-0000-0000-0000-000000000001', 2, 2.5, 0, NOW(), NOW()),
('00000000-0000-0000-0000-000000000001', 3, 2.5, 0, NOW(), NOW()),
('00000000-0000-0000-0000-000000000001', 4, 2.5, 0, NOW(), NOW()),
('00000000-0000-0000-0000-000000000001', 5, 2.5, 0, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Reabilitar RLS
ALTER TABLE flashcard_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Verificar resultado
SELECT 'Usuário criado:' as info;
SELECT * FROM user_profiles WHERE id = '00000000-0000-0000-0000-000000000001';

SELECT 'Progresso criado:' as info;
SELECT COUNT(*) as total_progress FROM flashcard_progress WHERE user_id = '00000000-0000-0000-0000-000000000001';
