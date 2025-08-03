-- Script para implementar o sistema RPG completo
-- Sistema de XP específico por categoria e ranks épicos

-- 1. Adicionar campos de XP específicos à tabela student_profiles
ALTER TABLE student_profiles 
ADD COLUMN IF NOT EXISTS flashcard_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS quiz_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS redacao_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS prova_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS flashcard_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS quiz_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS redacao_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS prova_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS flashcard_rank TEXT DEFAULT 'Novato da Guilda',
ADD COLUMN IF NOT EXISTS quiz_rank TEXT DEFAULT 'Novato da Guilda',
ADD COLUMN IF NOT EXISTS redacao_rank TEXT DEFAULT 'Novato da Guilda',
ADD COLUMN IF NOT EXISTS prova_rank TEXT DEFAULT 'Novato da Guilda',
ADD COLUMN IF NOT EXISTS general_rank TEXT DEFAULT 'Novato da Guilda',
ADD COLUMN IF NOT EXISTS last_level_up TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS total_achievements INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_streak_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak_days INTEGER DEFAULT 0;

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_student_profiles_flashcard_xp ON student_profiles(flashcard_xp);
CREATE INDEX IF NOT EXISTS idx_student_profiles_quiz_xp ON student_profiles(quiz_xp);
CREATE INDEX IF NOT EXISTS idx_student_profiles_redacao_xp ON student_profiles(redacao_xp);
CREATE INDEX IF NOT EXISTS idx_student_profiles_prova_xp ON student_profiles(prova_xp);
CREATE INDEX IF NOT EXISTS idx_student_profiles_total_xp ON student_profiles(total_xp);

-- 3. Criar tabela de ranks RPG
CREATE TABLE IF NOT EXISTS rpg_ranks (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL, -- 'general', 'flashcard', 'quiz', 'redacao', 'prova'
    level INTEGER NOT NULL,
    title TEXT NOT NULL,
    insignia TEXT NOT NULL,
    blessing TEXT NOT NULL,
    xp_required INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category, level)
);

-- 4. Inserir ranks do sistema RPG
INSERT INTO rpg_ranks (category, level, title, insignia, blessing, xp_required) VALUES
-- Ranking Geral (5 ligas, 25 níveis)
('general', 1, 'Novato da Guilda', '🧿', 'Todo herói começou do zero. Você já começou.', 0),
('general', 2, 'Estudante Arcano', '📜', 'Conhecimento é o primeiro feitiço.', 500),
('general', 3, 'Explorador das Ruínas', '🧭', 'Os mapas se revelam para quem ousa explorar.', 1000),
('general', 4, 'Portador da Chama', '🔥', 'Uma pequena chama pode incendiar o mundo.', 1500),
('general', 5, 'Aprendiz de Batalha', '🛡️', 'Cada erro te fortalece para a próxima luta.', 2000),
('general', 6, 'Guerreiro Errante', '⚔️', 'A estrada é longa, mas você já empunha sua arma.', 3000),
('general', 7, 'Mago Iniciado', '🔮', 'O poder está na mente disciplinada.', 4000),
('general', 8, 'Ranger da Fronteira', '🦅', 'Você enxerga longe, e sabe onde quer chegar.', 5000),
('general', 9, 'Alquimista do Saber', '🧪', 'Misturar ideias também é uma forma de magia.', 6000),
('general', 10, 'Guardião do Portão', '🏰', 'Agora você guarda conhecimento valioso.', 7000),
('general', 11, 'Paladino da Lógica', '⚖️', 'Você defende ideias com verdade e sabedoria.', 10000),
('general', 12, 'Feiticeiro Elemental', '🌩️', 'Você manipula o saber como forças da natureza.', 12000),
('general', 13, 'Assassino de Dúvidas', '🗡️', 'Nenhuma dúvida resiste à sua disciplina.', 14000),
('general', 14, 'Bardo dos Códigos', '🎻', 'Seu conhecimento já inspira outros heróis.', 16000),
('general', 15, 'Domador de Pergaminhos', '📚', 'Os livros já te obedecem como aliados.', 18000),
('general', 16, 'Arcanista Supremo', '💠', 'Você toca as estrelas com o que sabe.', 25000),
('general', 17, 'General da Mente', '🎖️', 'Você lidera batalhas com estratégia e clareza.', 30000),
('general', 18, 'Mestre Ilusionista', '🪞', 'Você transforma o complexo em algo simples.', 35000),
('general', 19, 'Xamã do Conhecimento Ancestral', '🐺', 'Você carrega a sabedoria de eras.', 40000),
('general', 20, 'Arquimago do Saber', '🧙‍♂️', 'Você não apenas aprende: você revela mistérios.', 45000),
('general', 21, 'Lâmina do Infinito', '🗡️', 'Seu esforço cortou os limites da dúvida.', 60000),
('general', 22, 'Profeta das Runas', '🔤', 'Você lê além das palavras. Você compreende.', 70000),
('general', 23, 'Guardião do Portal do Tempo', '⏳', 'Você respeita o tempo, e o tempo te honra.', 80000),
('general', 24, 'Avatar do Conhecimento', '🌠', 'Você é a encarnação do que estudou.', 90000),
('general', 25, 'Lenda da Torre Eterna', '🏯', 'Seu nome está cravado no topo. Muitos o seguirão.', 100000),

-- Ranking Flashcards - Mago da Memória
('flashcard', 1, 'Aprendiz de Feitiços', '🧿', 'Primeiros encantamentos da memória.', 0),
('flashcard', 2, 'Mago de Pergaminhos', '📜', 'Memória como magia.', 100),
('flashcard', 3, 'Arcanista da Memória', '🔮', 'Conhecimento imortal.', 300),
('flashcard', 4, 'Arquimago do Saber', '🧙‍♂️', 'Domina o conhecimento.', 600),
('flashcard', 5, 'Lenda da Memória', '🌟', 'Sua mente é lendária.', 1000),

-- Ranking Quizzes - Guerreiro do Conhecimento
('quiz', 1, 'Recruta da Batalha', '🛡️', 'Primeira luta vencida.', 0),
('quiz', 2, 'Soldado Experiente', '⚔️', 'Técnica apurada.', 200),
('quiz', 3, 'Capitão da Estratégia', '🎖️', 'Lidera com sabedoria.', 500),
('quiz', 4, 'General da Mente', '🏰', 'Comanda o conhecimento.', 800),
('quiz', 5, 'Lenda da Batalha', '⚡', 'Invencível no saber.', 1200),

-- Ranking Redações - Bardo da Escrita
('redacao', 1, 'Contador de Histórias', '📖', 'Primeiras palavras.', 0),
('redacao', 2, 'Poeta da Expressão', '🎭', 'Arte da comunicação.', 300),
('redacao', 3, 'Bardo Inspirador', '🎻', 'Inspira com palavras.', 600),
('redacao', 4, 'Mestre da Escrita', '✍️', 'Domina a expressão.', 1000),
('redacao', 5, 'Lenda da Escrita', '📚', 'Suas palavras são lendárias.', 1500),

-- Ranking Provas - Paladino da Sabedoria
('prova', 1, 'Acolito da Verdade', '⚖️', 'Primeira prova de fé.', 0),
('prova', 2, 'Cavaleiro da Sabedoria', '🛡️', 'Defende o conhecimento.', 400),
('prova', 3, 'Paladino da Lógica', '⚔️', 'Justiça através do saber.', 800),
('prova', 4, 'Guardião da Sabedoria', '🏰', 'Protege o conhecimento.', 1200),
('prova', 5, 'Lenda da Sabedoria', '🌟', 'Sua sabedoria é lendária.', 2000);

-- 5. Criar tabela de conquistas
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    user_uuid TEXT NOT NULL,
    achievement_type TEXT NOT NULL, -- 'level_up', 'streak', 'perfect_score', etc.
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    xp_reward INTEGER NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    shared BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_uuid) REFERENCES student_profiles(user_uuid) ON DELETE CASCADE
);

-- 6. Criar tabela de streaks
CREATE TABLE IF NOT EXISTS study_streaks (
    id SERIAL PRIMARY KEY,
    user_uuid TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    days_count INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_uuid) REFERENCES student_profiles(user_uuid) ON DELETE CASCADE
);

-- 7. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_achievements_user_uuid ON achievements(user_uuid);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_study_streaks_user_uuid ON study_streaks(user_uuid);
CREATE INDEX IF NOT EXISTS idx_study_streaks_active ON study_streaks(is_active);

-- 8. Habilitar RLS nas novas tabelas
ALTER TABLE rpg_ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_streaks ENABLE ROW LEVEL SECURITY;

-- 9. Criar políticas RLS
CREATE POLICY "Allow select for all users" ON rpg_ranks FOR SELECT USING (true);
CREATE POLICY "Users can view own achievements" ON achievements FOR SELECT USING (auth.uid()::text = user_uuid);
CREATE POLICY "Users can insert own achievements" ON achievements FOR INSERT WITH CHECK (auth.uid()::text = user_uuid);
CREATE POLICY "Users can view own streaks" ON study_streaks FOR SELECT USING (auth.uid()::text = user_uuid);
CREATE POLICY "Users can insert own streaks" ON study_streaks FOR INSERT WITH CHECK (auth.uid()::text = user_uuid);

-- 10. Função para calcular rank baseado no XP
CREATE OR REPLACE FUNCTION calculate_rank(xp_amount INTEGER, category TEXT)
RETURNS TEXT AS $$
DECLARE
    rank_title TEXT;
BEGIN
    SELECT title INTO rank_title
    FROM rpg_ranks
    WHERE category = $2 AND xp_required <= $1
    ORDER BY level DESC
    LIMIT 1;
    
    RETURN COALESCE(rank_title, 'Novato da Guilda');
END;
$$ LANGUAGE plpgsql;

-- 11. Função para calcular nível baseado no XP
CREATE OR REPLACE FUNCTION calculate_level(xp_amount INTEGER, category TEXT)
RETURNS INTEGER AS $$
DECLARE
    rank_level INTEGER;
BEGIN
    SELECT level INTO rank_level
    FROM rpg_ranks
    WHERE category = $2 AND xp_required <= $1
    ORDER BY level DESC
    LIMIT 1;
    
    RETURN COALESCE(rank_level, 1);
END;
$$ LANGUAGE plpgsql;

-- 12. Verificar estrutura final
SELECT 
    'student_profiles' as table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'student_profiles'
ORDER BY ordinal_position;

SELECT 
    'rpg_ranks' as table_name,
    COUNT(*) as total_ranks
FROM rpg_ranks;

SELECT 
    'achievements' as table_name,
    COUNT(*) as total_achievements
FROM achievements;

SELECT 
    'study_streaks' as table_name,
    COUNT(*) as total_streaks
FROM study_streaks; 