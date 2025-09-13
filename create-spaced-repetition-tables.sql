-- ========================================
-- SISTEMA DE REPETIÇÃO ESPAÇADA (SM2/ANKI)
-- ========================================

-- Tabela para progresso de flashcards com algoritmo SM2
CREATE TABLE IF NOT EXISTS flashcard_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    flashcard_id INTEGER NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
    
    -- Algoritmo SM2
    ease_factor DECIMAL(4,2) NOT NULL DEFAULT 2.50, -- Fator de facilidade (1.3 - 2.5)
    interval_days INTEGER NOT NULL DEFAULT 1, -- Intervalo em dias
    repetitions INTEGER NOT NULL DEFAULT 0, -- Número de repetições
    quality INTEGER NOT NULL DEFAULT 0, -- Qualidade da última resposta (0-5)
    
    -- Datas
    last_reviewed TIMESTAMP WITH TIME ZONE,
    next_review TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Status do card
    status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'learning', 'review', 'relearning')),
    
    -- Constraints
    UNIQUE(user_id, flashcard_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_user_id ON flashcard_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_flashcard_id ON flashcard_progress(flashcard_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_next_review ON flashcard_progress(next_review);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_status ON flashcard_progress(status);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_user_next_review ON flashcard_progress(user_id, next_review);

-- Tabela para categorias de flashcards
CREATE TABLE IF NOT EXISTS flashcard_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) NOT NULL DEFAULT '#3B82F6', -- Cor em hex
    icon VARCHAR(50), -- Ícone do Lucide
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela para tags de flashcards
CREATE TABLE IF NOT EXISTS flashcard_tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL DEFAULT '#6B7280',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de relacionamento flashcards-categorias
CREATE TABLE IF NOT EXISTS flashcard_category_relations (
    id BIGSERIAL PRIMARY KEY,
    flashcard_id INTEGER NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES flashcard_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(flashcard_id, category_id)
);

-- Tabela de relacionamento flashcards-tags
CREATE TABLE IF NOT EXISTS flashcard_tag_relations (
    id BIGSERIAL PRIMARY KEY,
    flashcard_id INTEGER NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES flashcard_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(flashcard_id, tag_id)
);

-- Tabela para histórico de estudos
CREATE TABLE IF NOT EXISTS study_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id VARCHAR(100) NOT NULL,
    session_type VARCHAR(20) NOT NULL DEFAULT 'review' CHECK (session_type IN ('review', 'learning', 'cramming', 'test')),
    
    -- Estatísticas da sessão
    total_cards INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    incorrect_answers INTEGER NOT NULL DEFAULT 0,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    
    -- Datas
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadados
    metadata JSONB, -- Dados adicionais da sessão
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para study_sessions
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_topic_id ON study_sessions(topic_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_started_at ON study_sessions(started_at);

-- Tabela para detalhes de cada card estudado na sessão
CREATE TABLE IF NOT EXISTS study_session_cards (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
    flashcard_id INTEGER NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
    
    -- Resultado do card nesta sessão
    quality INTEGER NOT NULL CHECK (quality >= 0 AND quality <= 5),
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    was_correct BOOLEAN NOT NULL,
    
    -- Progresso antes e depois
    ease_factor_before DECIMAL(4,2),
    ease_factor_after DECIMAL(4,2),
    interval_before INTEGER,
    interval_after INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para study_session_cards
CREATE INDEX IF NOT EXISTS idx_study_session_cards_session_id ON study_session_cards(session_id);
CREATE INDEX IF NOT EXISTS idx_study_session_cards_flashcard_id ON study_session_cards(flashcard_id);

-- Tabela para metas de estudo
CREATE TABLE IF NOT EXISTS study_goals (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Tipo de meta
    goal_type VARCHAR(20) NOT NULL CHECK (goal_type IN ('daily_cards', 'weekly_cards', 'daily_time', 'weekly_time', 'accuracy', 'streak')),
    
    -- Configuração da meta
    target_value INTEGER NOT NULL,
    current_value INTEGER NOT NULL DEFAULT 0,
    
    -- Período
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    
    -- Metadados
    description TEXT,
    reward TEXT, -- Recompensa por completar
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para study_goals
CREATE INDEX IF NOT EXISTS idx_study_goals_user_id ON study_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_study_goals_period ON study_goals(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_study_goals_active ON study_goals(is_active);

-- ========================================
-- DADOS INICIAIS
-- ========================================

-- Inserir categorias padrão
INSERT INTO flashcard_categories (name, description, color, icon) VALUES
('Gramática', 'Regras gramaticais e estruturas', '#EF4444', 'BookOpen'),
('Vocabulário', 'Palavras e expressões', '#3B82F6', 'Book'),
('Ortografia', 'Escrita correta das palavras', '#10B981', 'Edit'),
('Acentuação', 'Regras de acentuação', '#F59E0B', 'Type'),
('Morfologia', 'Estrutura das palavras', '#8B5CF6', 'Layers'),
('Sintaxe', 'Estrutura das frases', '#EC4899', 'Code'),
('Semântica', 'Significado das palavras', '#06B6D4', 'Lightbulb'),
('Regulamentos', 'Normas e regulamentos', '#6B7280', 'FileText')
ON CONFLICT (name) DO NOTHING;

-- Inserir tags padrão
INSERT INTO flashcard_tags (name, color) VALUES
('Fácil', '#10B981'),
('Médio', '#F59E0B'),
('Difícil', '#EF4444'),
('Importante', '#8B5CF6'),
('Recorrente', '#3B82F6'),
('Conceito', '#06B6D4'),
('Exceção', '#EC4899'),
('Regra', '#6B7280')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- FUNÇÕES E TRIGGERS
-- ========================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_flashcard_progress_updated_at 
    BEFORE UPDATE ON flashcard_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcard_categories_updated_at 
    BEFORE UPDATE ON flashcard_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_goals_updated_at 
    BEFORE UPDATE ON study_goals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- RLS (Row Level Security)
-- ========================================

-- Habilitar RLS
ALTER TABLE flashcard_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_category_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_session_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_goals ENABLE ROW LEVEL SECURITY;

-- Políticas para flashcard_progress
CREATE POLICY "Users can view their own flashcard progress" ON flashcard_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flashcard progress" ON flashcard_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcard progress" ON flashcard_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para categorias (todos podem ver, apenas admins podem modificar)
CREATE POLICY "Everyone can view categories" ON flashcard_categories
    FOR SELECT USING (true);

-- Políticas para tags (todos podem ver, apenas admins podem modificar)
CREATE POLICY "Everyone can view tags" ON flashcard_tags
    FOR SELECT USING (true);

-- Políticas para study_sessions
CREATE POLICY "Users can view their own study sessions" ON study_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sessions" ON study_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para study_goals
CREATE POLICY "Users can view their own study goals" ON study_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study goals" ON study_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study goals" ON study_goals
    FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- COMENTÁRIOS
-- ========================================

COMMENT ON TABLE flashcard_progress IS 'Progresso dos flashcards com algoritmo SM2/Anki';
COMMENT ON TABLE flashcard_categories IS 'Categorias para organizar flashcards';
COMMENT ON TABLE flashcard_tags IS 'Tags para classificar flashcards';
COMMENT ON TABLE study_sessions IS 'Sessões de estudo dos usuários';
COMMENT ON TABLE study_goals IS 'Metas de estudo dos usuários';

COMMENT ON COLUMN flashcard_progress.ease_factor IS 'Fator de facilidade do algoritmo SM2 (1.3-2.5)';
COMMENT ON COLUMN flashcard_progress.interval_days IS 'Intervalo em dias até próxima revisão';
COMMENT ON COLUMN flashcard_progress.quality IS 'Qualidade da resposta (0-5)';
COMMENT ON COLUMN flashcard_progress.status IS 'Status do card: new, learning, review, relearning';
