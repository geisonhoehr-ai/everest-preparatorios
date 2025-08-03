-- Criar tabela para armazenar cards errados pelos usuários
CREATE TABLE IF NOT EXISTS wrong_cards (
    id SERIAL PRIMARY KEY,
    user_uuid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    flashcard_id INTEGER NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
    topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed BOOLEAN DEFAULT FALSE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_uuid, flashcard_id)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_wrong_cards_user_uuid ON wrong_cards(user_uuid);
CREATE INDEX IF NOT EXISTS idx_wrong_cards_topic_id ON wrong_cards(topic_id);
CREATE INDEX IF NOT EXISTS idx_wrong_cards_reviewed ON wrong_cards(reviewed);
CREATE INDEX IF NOT EXISTS idx_wrong_cards_user_topic ON wrong_cards(user_uuid, topic_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE wrong_cards ENABLE ROW LEVEL SECURITY;

-- Política para que usuários só vejam seus próprios cards errados
CREATE POLICY "Users can only see their own wrong cards" ON wrong_cards
    FOR ALL USING (auth.uid() = user_uuid);

-- Política para inserção
CREATE POLICY "Users can insert their own wrong cards" ON wrong_cards
    FOR INSERT WITH CHECK (auth.uid() = user_uuid);

-- Política para atualização  
CREATE POLICY "Users can update their own wrong cards" ON wrong_cards
    FOR UPDATE USING (auth.uid() = user_uuid);

-- Política para deleção
CREATE POLICY "Users can delete their own wrong cards" ON wrong_cards
    FOR DELETE USING (auth.uid() = user_uuid);

-- Comentários para documentação
COMMENT ON TABLE wrong_cards IS 'Tabela para armazenar flashcards que os usuários erraram para revisão posterior';
COMMENT ON COLUMN wrong_cards.user_uuid IS 'UUID do usuário que errou o card';
COMMENT ON COLUMN wrong_cards.flashcard_id IS 'ID do flashcard que foi errado';
COMMENT ON COLUMN wrong_cards.topic_id IS 'ID do tópico do flashcard';
COMMENT ON COLUMN wrong_cards.created_at IS 'Data/hora em que o card foi errado';
COMMENT ON COLUMN wrong_cards.reviewed IS 'Se o card errado foi revisado (acertado em sessão posterior)';
COMMENT ON COLUMN wrong_cards.reviewed_at IS 'Data/hora em que o card foi marcado como revisado'; 