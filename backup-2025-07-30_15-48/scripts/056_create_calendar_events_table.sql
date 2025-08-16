-- Criar tabela de eventos do calendário
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('live', 'simulado', 'prova', 'redacao', 'aula')),
    event_date DATE NOT NULL,
    event_time TIME,
    duration_minutes INTEGER,
    instructor VARCHAR(255),
    location VARCHAR(255),
    is_mandatory BOOLEAN DEFAULT false,
    max_participants INTEGER,
    registration_required BOOLEAN DEFAULT false,
    event_url VARCHAR(500),
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON public.calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON public.calendar_events(event_type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_created_by ON public.calendar_events(created_by);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_calendar_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_calendar_events_updated_at_trigger ON public.calendar_events;
CREATE TRIGGER update_calendar_events_updated_at_trigger
    BEFORE UPDATE ON public.calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION update_calendar_events_updated_at();

-- RLS (Row Level Security) - apenas professores e administradores podem criar/editar
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Policy para leitura - todos podem ver
CREATE POLICY "calendar_events_select_policy" ON public.calendar_events
    FOR SELECT USING (true);

-- Policy para inserção - apenas professores e administradores
CREATE POLICY "calendar_events_insert_policy" ON public.calendar_events
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_uuid = auth.uid()::text 
            AND role IN ('teacher', 'admin')
        )
    );

-- Policy para atualização - apenas professores e administradores que criaram o evento ou admins
CREATE POLICY "calendar_events_update_policy" ON public.calendar_events
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_uuid = auth.uid()::text 
            AND (
                role = 'admin' 
                OR (role = 'teacher' AND public.calendar_events.created_by = auth.uid())
            )
        )
    );

-- Policy para exclusão - apenas admins ou quem criou o evento
CREATE POLICY "calendar_events_delete_policy" ON public.calendar_events
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_uuid = auth.uid()::text 
            AND (
                role = 'admin' 
                OR public.calendar_events.created_by = auth.uid()
            )
        )
    );

-- Criar alguns eventos de exemplo
INSERT INTO public.calendar_events (
    title, description, event_type, event_date, event_time, 
    duration_minutes, instructor, created_by
) VALUES 
(
    'Live: Português - Análise Sintática', 
    'Revisão completa de análise sintática com exercícios práticos', 
    'live', 
    CURRENT_DATE + INTERVAL '3 days', 
    '19:00', 
    120, 
    'Prof. Carlos Silva',
    (SELECT id FROM auth.users WHERE email = 'professor@teste.com' LIMIT 1)
),
(
    'Simulado CIAAR - 1ª Aplicação', 
    'Simulado completo nos moldes do concurso da Aeronáutica', 
    'simulado', 
    CURRENT_DATE + INTERVAL '7 days', 
    '14:00', 
    240, 
    'Equipe Everest',
    (SELECT id FROM auth.users WHERE email = 'professor@teste.com' LIMIT 1)
),
(
    'Entrega de Redação - Tema Livre', 
    'Tema: Os desafios da mobilidade urbana no Brasil contemporâneo', 
    'redacao', 
    CURRENT_DATE + INTERVAL '10 days', 
    '23:59', 
    NULL, 
    NULL,
    (SELECT id FROM auth.users WHERE email = 'professor@teste.com' LIMIT 1)
),
(
    'Prova de Matemática - Módulo 1', 
    'Avaliação do primeiro módulo de matemática: aritmética e álgebra', 
    'prova', 
    CURRENT_DATE + INTERVAL '14 days', 
    '10:00', 
    180, 
    'Prof. Ana Santos',
    (SELECT id FROM auth.users WHERE email = 'professor@teste.com' LIMIT 1)
); 