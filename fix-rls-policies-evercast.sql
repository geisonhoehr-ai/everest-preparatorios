-- Configurar políticas RLS para as tabelas do EverCast

-- 1. Habilitar RLS nas tabelas
ALTER TABLE audio_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_progress ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para audio_courses
-- Todos podem ler cursos ativos
CREATE POLICY "Cursos ativos são visíveis para todos" ON audio_courses
    FOR SELECT USING (is_active = true);

-- Apenas professores e admins podem criar cursos
CREATE POLICY "Professores e admins podem criar cursos" ON audio_courses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('teacher', 'admin')
        )
    );

-- Apenas professores e admins podem atualizar cursos
CREATE POLICY "Professores e admins podem atualizar cursos" ON audio_courses
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('teacher', 'admin')
        )
    );

-- 3. Políticas para audio_modules
-- Todos podem ler módulos ativos
CREATE POLICY "Módulos ativos são visíveis para todos" ON audio_modules
    FOR SELECT USING (is_active = true);

-- Apenas professores e admins podem criar módulos
CREATE POLICY "Professores e admins podem criar módulos" ON audio_modules
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('teacher', 'admin')
        )
    );

-- Apenas professores e admins podem atualizar módulos
CREATE POLICY "Professores e admins podem atualizar módulos" ON audio_modules
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('teacher', 'admin')
        )
    );

-- 4. Políticas para audio_lessons
-- Todos podem ler aulas ativas
CREATE POLICY "Aulas ativas são visíveis para todos" ON audio_lessons
    FOR SELECT USING (is_active = true);

-- Apenas professores e admins podem criar aulas
CREATE POLICY "Professores e admins podem criar aulas" ON audio_lessons
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('teacher', 'admin')
        )
    );

-- Apenas professores e admins podem atualizar aulas
CREATE POLICY "Professores e admins podem atualizar aulas" ON audio_lessons
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('teacher', 'admin')
        )
    );

-- 5. Políticas para audio_progress
-- Usuários podem ver apenas seu próprio progresso
CREATE POLICY "Usuários podem ver seu próprio progresso" ON audio_progress
    FOR SELECT USING (user_id = auth.uid());

-- Usuários podem inserir/atualizar seu próprio progresso
CREATE POLICY "Usuários podem gerenciar seu próprio progresso" ON audio_progress
    FOR ALL USING (user_id = auth.uid());

-- 6. Inserir dados de exemplo (se não existirem)
INSERT INTO audio_courses (name, description, created_by, is_active) 
VALUES (
    'Extensivo EAOF 2026 - Português e Redação', 
    'O preparatório para o concurso do CIAAR da FAB é voltado para as áreas de Gramática e Interpretação de Textos (GIT), bem como Produção Textual (redação).',
    'c8b5bff0-b5cc-4dab-9cfa-0a0cf4983dc5',
    true
) ON CONFLICT DO NOTHING;

-- 7. Verificar se as políticas foram criadas
SELECT 'Políticas RLS configuradas com sucesso!' as status;
