-- Tabela para armazenar os tópicos de estudo
CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Tabela para armazenar os flashcards
CREATE TABLE IF NOT EXISTS flashcards (
  id SERIAL PRIMARY KEY,
  topic_id TEXT NOT NULL REFERENCES topics(id),
  question TEXT NOT NULL,
  answer TEXT NOT NULL
);

-- Tabela para armazenar o progresso do usuário por tópico
-- Usaremos um user_id fixo por enquanto, já que o login será implementado depois
CREATE TABLE IF NOT EXISTS user_topic_progress (
  user_id INTEGER NOT NULL DEFAULT 1, -- ID de usuário temporário
  topic_id TEXT NOT NULL REFERENCES topics(id),
  correct_count INTEGER NOT NULL DEFAULT 0,
  incorrect_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, topic_id)
);

-- Tabela para armazenar a pontuação total do usuário
-- Usaremos um user_id fixo por enquanto
CREATE TABLE IF NOT EXISTS user_scores (
  user_id INTEGER PRIMARY KEY DEFAULT 1, -- ID de usuário temporário
  total_score INTEGER NOT NULL DEFAULT 0
);

-- Opcional: Tabela para flashcards que o usuário errou e precisa revisar
-- Isso pode ser mais complexo sem um user_id real, mas podemos prever
-- CREATE TABLE IF NOT EXISTS user_incorrect_cards (
--   user_id INTEGER NOT NULL REFERENCES users(id),
--   flashcard_id INTEGER NOT NULL REFERENCES flashcards(id),
--   PRIMARY KEY (user_id, flashcard_id)
-- );
