-- Tabela para armazenar o progresso de repetição espaçada de cada flashcard por usuário
CREATE TABLE IF NOT EXISTS user_flashcard_progress (
  user_id INTEGER NOT NULL DEFAULT 1, -- ID de usuário temporário
  flashcard_id INTEGER NOT NULL REFERENCES flashcards(id),
  ease_factor NUMERIC(4, 2) NOT NULL DEFAULT 2.5, -- Fator de facilidade (E-Factor)
  repetitions INTEGER NOT NULL DEFAULT 0, -- Número de repetições corretas consecutivas
  interval_days INTEGER NOT NULL DEFAULT 0, -- Intervalo em dias para a próxima revisão
  next_review_date DATE NOT NULL DEFAULT CURRENT_DATE, -- Data da próxima revisão
  last_reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Última vez revisado
  PRIMARY KEY (user_id, flashcard_id)
);

-- Adicionar um índice para otimizar buscas por data de revisão
CREATE INDEX IF NOT EXISTS idx_next_review_date ON user_flashcard_progress (user_id, next_review_date);
