-- Script para criar tabelas do sistema EverCast
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Tabela de cursos de áudio
CREATE TABLE IF NOT EXISTS audio_courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    total_duration VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de módulos de áudio
CREATE TABLE IF NOT EXISTS audio_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES audio_courses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    total_duration VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de aulas de áudio
CREATE TABLE IF NOT EXISTS audio_lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID REFERENCES audio_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration VARCHAR(50),
    duration_seconds INTEGER,
    hls_url VARCHAR(500), -- URL HLS da Pandavideo
    embed_url VARCHAR(500), -- URL embed da Pandavideo
    audio_url VARCHAR(500), -- URL de áudio direto (se disponível)
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_preview BOOLEAN DEFAULT false, -- Aula gratuita
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de progresso dos usuários
CREATE TABLE IF NOT EXISTS audio_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    lesson_id UUID REFERENCES audio_lessons(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0,
    current_time INTEGER DEFAULT 0, -- Tempo atual em segundos
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_audio_courses_created_by ON audio_courses(created_by);
CREATE INDEX IF NOT EXISTS idx_audio_courses_active ON audio_courses(is_active);
CREATE INDEX IF NOT EXISTS idx_audio_modules_course_id ON audio_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_audio_modules_order ON audio_modules(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_audio_lessons_module_id ON audio_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_audio_lessons_order ON audio_lessons(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_audio_progress_user_id ON audio_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_progress_lesson_id ON audio_progress(lesson_id);

-- 6. Políticas RLS (Row Level Security)
ALTER TABLE audio_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_progress ENABLE ROW LEVEL SECURITY;

-- 7. Políticas para audio_courses
CREATE POLICY "Allow read access for all authenticated users" ON audio_courses
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert for teachers and admins" ON audio_courses
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('teacher', 'admin')
        )
    );

CREATE POLICY "Allow update for course creators and admins" ON audio_courses
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND (
            created_by = auth.uid() OR
            EXISTS (
                SELECT 1 FROM user_profiles 
                WHERE user_id = auth.uid() 
                AND role = 'admin'
            )
        )
    );

CREATE POLICY "Allow delete for course creators and admins" ON audio_courses
    FOR DELETE USING (
        auth.role() = 'authenticated' AND (
            created_by = auth.uid() OR
            EXISTS (
                SELECT 1 FROM user_profiles 
                WHERE user_id = auth.uid() 
                AND role = 'admin'
            )
        )
    );

-- 8. Políticas para audio_modules
CREATE POLICY "Allow read access for all authenticated users" ON audio_modules
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert for teachers and admins" ON audio_modules
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('teacher', 'admin')
        )
    );

CREATE POLICY "Allow update for teachers and admins" ON audio_modules
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('teacher', 'admin')
        )
    );

CREATE POLICY "Allow delete for teachers and admins" ON audio_modules
    FOR DELETE USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('teacher', 'admin')
        )
    );

-- 9. Políticas para audio_lessons
CREATE POLICY "Allow read access for all authenticated users" ON audio_lessons
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert for teachers and admins" ON audio_lessons
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('teacher', 'admin')
        )
    );

CREATE POLICY "Allow update for teachers and admins" ON audio_lessons
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('teacher', 'admin')
        )
    );

CREATE POLICY "Allow delete for teachers and admins" ON audio_lessons
    FOR DELETE USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('teacher', 'admin')
        )
    );

-- 10. Políticas para audio_progress
CREATE POLICY "Allow read access for own progress" ON audio_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow insert for own progress" ON audio_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update for own progress" ON audio_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow delete for own progress" ON audio_progress
    FOR DELETE USING (auth.uid() = user_id);

-- 11. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 12. Triggers para updated_at
CREATE TRIGGER update_audio_courses_updated_at BEFORE UPDATE ON audio_courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audio_modules_updated_at BEFORE UPDATE ON audio_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audio_lessons_updated_at BEFORE UPDATE ON audio_lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audio_progress_updated_at BEFORE UPDATE ON audio_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. Inserir dados de exemplo
INSERT INTO audio_courses (name, description, created_by) VALUES
('Extensivo EAOF 2026 - Português e Redação', 
 'O preparatório para o concurso do CIAAR da FAB é voltado para as áreas de Gramática e Interpretação de Textos (GIT), bem como Produção Textual (redação).',
 'c8b5bff0-b5cc-4dab-9cfa-0a0cf4983dc5');

-- 14. Verificar se as tabelas foram criadas
SELECT 'Tabelas criadas com sucesso!' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'audio_%'
ORDER BY table_name;
