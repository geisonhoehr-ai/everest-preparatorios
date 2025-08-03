-- Script para corrigir problemas da tabela calendar_events
-- Garantir que a tabela existe e as permissões estão corretas

-- 1. Criar tabela se não existir
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

-- 2. Criar índices
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON public.calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON public.calendar_events(event_type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_created_by ON public.calendar_events(created_by);

-- 3. Função para updated_at
CREATE OR REPLACE FUNCTION update_calendar_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger
DROP TRIGGER IF EXISTS update_calendar_events_updated_at_trigger ON public.calendar_events;
CREATE TRIGGER update_calendar_events_updated_at_trigger
    BEFORE UPDATE ON public.calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION update_calendar_events_updated_at();

-- 5. Habilitar RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- 6. Remover policies antigas
DROP POLICY IF EXISTS "calendar_events_select_policy" ON public.calendar_events;
DROP POLICY IF EXISTS "calendar_events_insert_policy" ON public.calendar_events;
DROP POLICY IF EXISTS "calendar_events_update_policy" ON public.calendar_events;
DROP POLICY IF EXISTS "calendar_events_delete_policy" ON public.calendar_events;

-- 7. Recriar policies
-- Policy para leitura - todos autenticados podem ver
CREATE POLICY "calendar_events_select_policy" ON public.calendar_events
    FOR SELECT USING (auth.uid() IS NOT NULL);

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

-- Policy para atualização - apenas professores e administradores
CREATE POLICY "calendar_events_update_policy" ON public.calendar_events
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_uuid = auth.uid()::text 
            AND role IN ('teacher', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_uuid = auth.uid()::text 
            AND role IN ('teacher', 'admin')
        )
    );

-- Policy para exclusão - apenas professores e administradores
CREATE POLICY "calendar_events_delete_policy" ON public.calendar_events
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_uuid = auth.uid()::text 
            AND role IN ('teacher', 'admin')
        )
    );

-- 8. Verificar se existem usuários com role teacher
-- Se não existir, criar um usuário teste
DO $$
DECLARE
    teacher_count INTEGER;
    admin_count INTEGER;
    test_user_id UUID;
BEGIN
    -- Contar professores existentes
    SELECT COUNT(*) INTO teacher_count 
    FROM public.user_roles 
    WHERE role = 'teacher';
    
    -- Contar administradores existentes
    SELECT COUNT(*) INTO admin_count 
    FROM public.user_roles 
    WHERE role = 'admin';
    
    RAISE NOTICE 'Professores encontrados: %', teacher_count;
    RAISE NOTICE 'Administradores encontrados: %', admin_count;
    
    -- Se não há professores nem admins, criar um usuário teste com role teacher
    IF teacher_count = 0 AND admin_count = 0 THEN
        -- Procurar por um usuário existente para dar role de teacher
        SELECT id INTO test_user_id 
        FROM auth.users 
        WHERE email LIKE '%@teste.com' OR email LIKE 'professor%' 
        LIMIT 1;
        
        IF test_user_id IS NOT NULL THEN
            -- Garantir que o usuário tem role teacher
            INSERT INTO public.user_roles (user_uuid, role) 
            VALUES (test_user_id::text, 'teacher')
            ON CONFLICT (user_uuid) DO UPDATE SET role = 'teacher';
            
            RAISE NOTICE 'Role teacher atribuído ao usuário: %', test_user_id;
        ELSE
            RAISE NOTICE 'Nenhum usuário encontrado para atribuir role teacher';
        END IF;
    END IF;
END $$;

-- 9. Inserir eventos de exemplo se a tabela estiver vazia
INSERT INTO public.calendar_events (
    title, description, event_type, event_date, event_time, 
    duration_minutes, instructor, created_by
)
SELECT 
    'Live: Português - Análise Sintática', 
    'Revisão completa de análise sintática com exercícios práticos', 
    'live', 
    CURRENT_DATE + INTERVAL '3 days', 
    '19:00', 
    120, 
    'Prof. Carlos Silva',
    (SELECT auth.users.id FROM auth.users 
     INNER JOIN public.user_roles ON auth.users.id::text = public.user_roles.user_uuid 
     WHERE public.user_roles.role IN ('teacher', 'admin') 
     LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.calendar_events);

-- 10. Verificar o estado final
SELECT 
    'calendar_events' as tabela,
    COUNT(*) as total_eventos
FROM public.calendar_events

UNION ALL

SELECT 
    'user_roles_teacher' as tabela,
    COUNT(*) as total
FROM public.user_roles 
WHERE role = 'teacher'

UNION ALL

SELECT 
    'user_roles_admin' as tabela,
    COUNT(*) as total
FROM public.user_roles 
WHERE role = 'admin'; 