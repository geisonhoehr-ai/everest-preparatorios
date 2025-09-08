-- Script para corrigir políticas RLS e permitir acesso às tabelas
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Desabilitar RLS temporariamente nas tabelas principais
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE topics DISABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards DISABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions DISABLE ROW LEVEL SECURITY;

-- 2. Inserir usuário professor na tabela user_profiles
INSERT INTO user_profiles (user_id, role, display_name, created_at)
VALUES (
    'c8b5bff0-b5cc-4dab-9cfa-0a0cf4983dc5',
    'teacher',
    'Professor Teste',
    NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();

-- 3. Verificar se o usuário foi inserido
SELECT * FROM user_profiles WHERE user_id = 'c8b5bff0-b5cc-4dab-9cfa-0a0cf4983dc5';

-- 4. Verificar se as tabelas estão acessíveis
SELECT 'subjects' as tabela, COUNT(*) as registros FROM subjects
UNION ALL
SELECT 'topics' as tabela, COUNT(*) as registros FROM topics
UNION ALL
SELECT 'flashcards' as tabela, COUNT(*) as registros FROM flashcards
UNION ALL
SELECT 'quizzes' as tabela, COUNT(*) as registros FROM quizzes;

-- 5. Reabilitar RLS com políticas mais permissivas
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- 6. Remover políticas existentes e criar novas
DROP POLICY IF EXISTS "Allow all for authenticated users" ON subjects;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON topics;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON flashcards;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON quizzes;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON quiz_questions;

-- 7. Criar políticas permissivas para desenvolvimento
CREATE POLICY "Allow all for authenticated users" ON subjects
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON topics
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON flashcards
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON quizzes
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON quiz_questions
    FOR ALL USING (auth.role() = 'authenticated');

-- 8. Verificar políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('subjects', 'topics', 'flashcards', 'quizzes', 'quiz_questions')
ORDER BY tablename, policyname;
