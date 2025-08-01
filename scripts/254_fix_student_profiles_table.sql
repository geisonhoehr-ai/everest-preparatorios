-- Script para corrigir a tabela student_profiles
-- Altera o campo user_uuid de uuid para text para aceitar emails

-- 1. Verificar se a tabela existe e sua estrutura atual
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'student_profiles';

-- 2. Dropar a tabela se existir (cuidado: isso apaga todos os dados)
DROP TABLE IF EXISTS student_profiles CASCADE;

-- 3. Recriar a tabela com a estrutura correta
CREATE TABLE student_profiles (
    id SERIAL PRIMARY KEY,
    user_uuid TEXT NOT NULL UNIQUE, -- Alterado de UUID para TEXT para aceitar emails
    nome_completo TEXT,
    total_flashcards INTEGER DEFAULT 0,
    completed_flashcards INTEGER DEFAULT 0,
    total_quizzes INTEGER DEFAULT 0,
    completed_quizzes INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_study_time INTEGER DEFAULT 0, -- em minutos
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    first_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar índices para melhor performance
CREATE INDEX idx_student_profiles_user_uuid ON student_profiles(user_uuid);
CREATE INDEX idx_student_profiles_current_level ON student_profiles(current_level);
CREATE INDEX idx_student_profiles_total_xp ON student_profiles(total_xp);

-- 5. Desabilitar RLS temporariamente para inserção de dados de teste
ALTER TABLE student_profiles DISABLE ROW LEVEL SECURITY;

-- 6. Inserir dados de teste para verificar se está funcionando
INSERT INTO student_profiles (
    user_uuid,
    nome_completo,
    total_flashcards,
    completed_flashcards,
    total_quizzes,
    completed_quizzes,
    average_score,
    current_streak,
    longest_streak,
    total_study_time,
    total_xp,
    current_level
) VALUES 
('teste@example.com', 'Aluno Teste', 100, 50, 10, 5, 85.5, 3, 7, 120, 500, 2),
('admin@example.com', 'Admin Teste', 200, 150, 20, 15, 92.0, 5, 10, 300, 1500, 3);

-- 7. Verificar se os dados foram inseridos corretamente
SELECT * FROM student_profiles;

-- 8. Reabilitar RLS
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- 9. Criar políticas RLS permissivas (temporariamente)
CREATE POLICY "Enable insert for all users" ON student_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for all users" ON student_profiles FOR SELECT USING (true);
CREATE POLICY "Enable update for all users" ON student_profiles FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON student_profiles FOR DELETE USING (true);

-- 10. Verificar as políticas criadas
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'student_profiles';

-- 11. Limpar dados de teste
DELETE FROM student_profiles WHERE user_uuid IN ('teste@example.com', 'admin@example.com');

-- 12. Verificar estrutura final
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'student_profiles'
ORDER BY ordinal_position; 