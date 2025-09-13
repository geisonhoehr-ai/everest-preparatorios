-- Criar tabela calendar_events para eventos do calendário
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME,
  location TEXT,
  type TEXT NOT NULL DEFAULT 'Evento',
  participants INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON calendar_events(type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_created_by ON calendar_events(created_by);

-- Habilitar RLS (Row Level Security)
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Política para permitir que todos os usuários autenticados vejam os eventos
CREATE POLICY "Todos podem ver eventos" ON calendar_events
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir que professores e admins criem eventos
CREATE POLICY "Professores e admins podem criar eventos" ON calendar_events
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

-- Política para permitir que professores e admins atualizem eventos
CREATE POLICY "Professores e admins podem atualizar eventos" ON calendar_events
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

-- Política para permitir que professores e admins excluam eventos
CREATE POLICY "Professores e admins podem excluir eventos" ON calendar_events
  FOR DELETE USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

-- Inserir alguns eventos de exemplo (opcional)
INSERT INTO calendar_events (title, description, date, time, location, type, participants) VALUES
('Simulado ENEM', 'Simulado oficial do ENEM com todas as matérias', '2024-12-15', '08:00:00', 'Auditório Principal', 'Simulado', 150),
('Aula de Revisão - Matemática', 'Revisão de tópicos importantes de matemática', '2024-12-16', '14:00:00', 'Sala 201', 'Aula', 30),
('Workshop de Redação', 'Workshop prático de técnicas de redação', '2024-12-18', '09:00:00', 'Laboratório de Informática', 'Workshop', 25),
('Prova de Física', 'Prova de física com questões de vestibulares', '2024-12-20', '10:00:00', 'Sala 105', 'Prova', 45),
('Palestra Motivacional', 'Palestra sobre motivação e técnicas de estudo', '2024-12-22', '19:00:00', 'Auditório Principal', 'Palestra', 200);

-- Comentários sobre a tabela
COMMENT ON TABLE calendar_events IS 'Tabela para armazenar eventos do calendário da plataforma';
COMMENT ON COLUMN calendar_events.title IS 'Título do evento';
COMMENT ON COLUMN calendar_events.description IS 'Descrição detalhada do evento';
COMMENT ON COLUMN calendar_events.date IS 'Data do evento';
COMMENT ON COLUMN calendar_events.time IS 'Horário do evento';
COMMENT ON COLUMN calendar_events.location IS 'Local onde o evento será realizado';
COMMENT ON COLUMN calendar_events.type IS 'Tipo do evento (Simulado, Aula, Workshop, Prova, Palestra, etc.)';
COMMENT ON COLUMN calendar_events.participants IS 'Número estimado de participantes';
COMMENT ON COLUMN calendar_events.created_by IS 'ID do usuário que criou o evento';
