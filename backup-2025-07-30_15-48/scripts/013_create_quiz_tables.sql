-- Tabela para armazenar os quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id SERIAL PRIMARY KEY,
  topic_id TEXT NOT NULL REFERENCES topics(id), -- Relaciona com a tabela de tópicos existente
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para armazenar as perguntas de cada quiz
CREATE TABLE IF NOT EXISTS quiz_questions (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- Armazena as opções como um array JSON (ex: ["Opção A", "Opção B", "Opção C"])
  correct_answer TEXT NOT NULL, -- A resposta correta (deve ser uma das opções)
  explanation TEXT -- Opcional: explicação da resposta
);

-- Tabela para armazenar a pontuação do usuário em cada quiz
CREATE TABLE IF NOT EXISTS user_quiz_scores (
  user_uuid UUID NOT NULL,
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  incorrect_answers INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_uuid, quiz_id)
);

-- Adicionar índices para otimização de consultas
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions (quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_scores_user_uuid ON user_quiz_scores (user_uuid);
