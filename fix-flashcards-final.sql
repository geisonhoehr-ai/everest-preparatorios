-- Corrigir flashcards - versão final
-- Desabilitar RLS temporariamente
ALTER TABLE flashcard_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Criar usuário de teste (sem user_profiles por enquanto)
-- Vamos criar apenas o progresso de flashcards

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
SELECT 'Progresso criado:' as info;
SELECT COUNT(*) as total_progress FROM flashcard_progress WHERE user_id = '00000000-0000-0000-0000-000000000001';

SELECT 'Flashcards disponíveis:' as info;
SELECT f.id, f.question, f.answer, t.name as topic_name
FROM flashcards f
JOIN topics t ON f.topic_id = t.id
WHERE f.id IN (1, 2, 3, 4, 5)
LIMIT 5;
