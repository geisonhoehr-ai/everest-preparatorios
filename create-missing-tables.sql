-- Criar tabela questions
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  answer_text TEXT,
  question_type VARCHAR(50) DEFAULT 'multiple_choice',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela question_options
CREATE TABLE IF NOT EXISTS question_options (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;

-- Criar políticas básicas de RLS
CREATE POLICY "Permitir leitura para todos" ON questions FOR SELECT USING (true);
CREATE POLICY "Permitir leitura para todos" ON question_options FOR SELECT USING (true);

-- Políticas para professores e administradores
CREATE POLICY "Permitir inserção para professores" ON questions FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para professores" ON question_options FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');