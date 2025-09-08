-- Script ROBUSTO para corrigir políticas RLS
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se as tabelas existem antes de modificar
DO $$
BEGIN
    -- Verificar se as tabelas existem
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subjects') THEN
        RAISE NOTICE 'Tabela subjects não existe';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'topics') THEN
        RAISE NOTICE 'Tabela topics não existe';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'flashcards') THEN
        RAISE NOTICE 'Tabela flashcards não existe';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quizzes') THEN
        RAISE NOTICE 'Tabela quizzes não existe';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_questions') THEN
        RAISE NOTICE 'Tabela quiz_questions não existe';
    END IF;
END $$;

-- 2. Desabilitar RLS temporariamente (com verificação)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subjects') THEN
        ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS desabilitado para subjects';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'topics') THEN
        ALTER TABLE topics DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS desabilitado para topics';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'flashcards') THEN
        ALTER TABLE flashcards DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS desabilitado para flashcards';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quizzes') THEN
        ALTER TABLE quizzes DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS desabilitado para quizzes';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_questions') THEN
        ALTER TABLE quiz_questions DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS desabilitado para quiz_questions';
    END IF;
END $$;

-- 3. Inserir usuário professor
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

-- 4. Verificar se o usuário foi inserido
SELECT 'Usuário inserido:' as status, * FROM user_profiles WHERE user_id = 'c8b5bff0-b5cc-4dab-9cfa-0a0cf4983dc5';

-- 5. Verificar se as tabelas estão acessíveis
SELECT 'subjects' as tabela, COUNT(*) as registros FROM subjects
UNION ALL
SELECT 'topics' as tabela, COUNT(*) as registros FROM topics
UNION ALL
SELECT 'flashcards' as tabela, COUNT(*) as registros FROM flashcards
UNION ALL
SELECT 'quizzes' as tabela, COUNT(*) as registros FROM quizzes;

-- 6. Reabilitar RLS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subjects') THEN
        ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS reabilitado para subjects';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'topics') THEN
        ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS reabilitado para topics';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'flashcards') THEN
        ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS reabilitado para flashcards';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quizzes') THEN
        ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS reabilitado para quizzes';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_questions') THEN
        ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS reabilitado para quiz_questions';
    END IF;
END $$;

-- 7. Remover políticas existentes (se existirem)
DO $$
BEGIN
    -- Remover políticas existentes
    DROP POLICY IF EXISTS "Allow all for authenticated users" ON subjects;
    DROP POLICY IF EXISTS "Allow all for authenticated users" ON topics;
    DROP POLICY IF EXISTS "Allow all for authenticated users" ON flashcards;
    DROP POLICY IF EXISTS "Allow all for authenticated users" ON quizzes;
    DROP POLICY IF EXISTS "Allow all for authenticated users" ON quiz_questions;
    
    -- Remover outras políticas que possam existir
    DROP POLICY IF EXISTS "Enable read access for all users" ON subjects;
    DROP POLICY IF EXISTS "Enable read access for all users" ON topics;
    DROP POLICY IF EXISTS "Enable read access for all users" ON flashcards;
    DROP POLICY IF EXISTS "Enable read access for all users" ON quizzes;
    DROP POLICY IF EXISTS "Enable read access for all users" ON quiz_questions;
    
    RAISE NOTICE 'Políticas existentes removidas';
END $$;

-- 8. Criar políticas permissivas
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subjects') THEN
        CREATE POLICY "Allow all for authenticated users" ON subjects
            FOR ALL USING (auth.role() = 'authenticated');
        RAISE NOTICE 'Política criada para subjects';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'topics') THEN
        CREATE POLICY "Allow all for authenticated users" ON topics
            FOR ALL USING (auth.role() = 'authenticated');
        RAISE NOTICE 'Política criada para topics';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'flashcards') THEN
        CREATE POLICY "Allow all for authenticated users" ON flashcards
            FOR ALL USING (auth.role() = 'authenticated');
        RAISE NOTICE 'Política criada para flashcards';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quizzes') THEN
        CREATE POLICY "Allow all for authenticated users" ON quizzes
            FOR ALL USING (auth.role() = 'authenticated');
        RAISE NOTICE 'Política criada para quizzes';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_questions') THEN
        CREATE POLICY "Allow all for authenticated users" ON quiz_questions
            FOR ALL USING (auth.role() = 'authenticated');
        RAISE NOTICE 'Política criada para quiz_questions';
    END IF;
END $$;

-- 9. Verificar políticas criadas
SELECT 'Políticas criadas:' as status, schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('subjects', 'topics', 'flashcards', 'quizzes', 'quiz_questions')
ORDER BY tablename, policyname;

-- 10. Teste final
SELECT 'SCRIPT EXECUTADO COM SUCESSO!' as resultado;
