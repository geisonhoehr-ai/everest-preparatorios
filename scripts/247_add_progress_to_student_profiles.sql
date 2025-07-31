-- Script para adicionar campos de progresso à tabela student_profiles existente
-- Verificar estrutura atual
SELECT 
    'Estrutura atual da tabela student_profiles:' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'student_profiles'
ORDER BY ordinal_position;

-- Adicionar campos de progresso à tabela student_profiles
ALTER TABLE student_profiles 
ADD COLUMN IF NOT EXISTS total_flashcards INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_flashcards INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_quizzes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_quizzes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_score DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_study_time INTEGER DEFAULT 0, -- em minutos
ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS first_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Verificar se os campos foram adicionados
SELECT 
    'Estrutura atualizada da tabela student_profiles:' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'student_profiles'
ORDER BY ordinal_position;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_student_profiles_level ON student_profiles(current_level);
CREATE INDEX IF NOT EXISTS idx_student_profiles_streak ON student_profiles(current_streak);
CREATE INDEX IF NOT EXISTS idx_student_profiles_xp ON student_profiles(total_xp);

-- Verificar se há dados na tabela
SELECT 
    'Dados na tabela student_profiles:' as info,
    COUNT(*) as total_records
FROM student_profiles;

-- Mostrar alguns registros de exemplo
SELECT 
    id,
    user_uuid,
    nome_completo,
    current_level,
    total_xp,
    current_streak,
    completed_flashcards,
    completed_quizzes
FROM student_profiles 
LIMIT 5; 