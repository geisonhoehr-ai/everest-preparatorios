-- Script para criar a tabela de progresso dos alunos
-- Criar tabela para armazenar o progresso individual de cada aluno
CREATE TABLE IF NOT EXISTS student_progress (
    id SERIAL PRIMARY KEY,
    user_uuid UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    total_flashcards INTEGER DEFAULT 0,
    completed_flashcards INTEGER DEFAULT 0,
    total_quizzes INTEGER DEFAULT 0,
    completed_quizzes INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0.00,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_study_time INTEGER DEFAULT 0, -- em minutos
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    first_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_uuid)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_student_progress_user_uuid ON student_progress(user_uuid);
CREATE INDEX IF NOT EXISTS idx_student_progress_level ON student_progress(current_level);
CREATE INDEX IF NOT EXISTS idx_student_progress_streak ON student_progress(current_streak);

-- Habilitar RLS
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
DROP POLICY IF EXISTS "Users can view own progress" ON student_progress;
CREATE POLICY "Users can view own progress" ON student_progress
FOR SELECT TO authenticated
USING (auth.uid() = user_uuid);

DROP POLICY IF EXISTS "Users can update own progress" ON student_progress;
CREATE POLICY "Users can update own progress" ON student_progress
FOR UPDATE TO authenticated
USING (auth.uid() = user_uuid);

DROP POLICY IF EXISTS "Users can insert own progress" ON student_progress;
CREATE POLICY "Users can insert own progress" ON student_progress
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_uuid);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_student_progress_updated_at ON student_progress;
CREATE TRIGGER update_student_progress_updated_at
    BEFORE UPDATE ON student_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verificar se a tabela foi criada
SELECT 
    'Tabela student_progress criada com sucesso!' as info,
    COUNT(*) as total_records
FROM student_progress;

-- Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'student_progress'
ORDER BY ordinal_position; 