-- Script para criar tabelas necessárias para o sistema de quiz
-- Execute este script no Supabase SQL Editor

-- =====================================================
-- TABELAS BÁSICAS DO SISTEMA
-- =====================================================

-- Tabela de matérias/disciplinas
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tópicos por matéria
CREATE TABLE IF NOT EXISTS topics (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(subject_id, name)
);

-- Tabela de quizzes (agrupamentos de questões)
CREATE TABLE IF NOT EXISTS quizzes (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de questões de quiz
CREATE TABLE IF NOT EXISTS quiz_questions (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Array de opções
    correct_answer VARCHAR(500) NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de flashcards
CREATE TABLE IF NOT EXISTS flashcards (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de progresso do usuário
CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    correct_answers INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    accuracy DECIMAL(5,2) DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- em segundos
    xp_gained INTEGER DEFAULT 0,
    last_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, topic_id)
);

-- Tabela de tentativas de quiz
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    correct_answers INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- em segundos
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir matérias básicas
INSERT INTO subjects (name, description) VALUES
('Português', 'Gramática, Literatura e Redação'),
('Regulamentos', 'Normas e Regulamentos Aeronáuticos')
ON CONFLICT (name) DO NOTHING;

-- Inserir tópicos para Português
INSERT INTO topics (subject_id, name, description) VALUES
(1, 'Acentuação Gráfica', 'Regras de acentuação gráfica'),
(1, 'Ortografia', 'Regras ortográficas'),
(1, 'Substantivo, Adjetivo e Artigo', 'Classes gramaticais'),
(1, 'Pronomes, Numeral, Advérbio e Preposição', 'Classes gramaticais'),
(1, 'Conjunções', 'Conjunções coordenativas e subordinativas'),
(1, 'Verbo', 'Conjugação verbal'),
(1, 'Sintaxe: Período Simples', 'Análise sintática'),
(1, 'Período Composto e Pontuação', 'Sintaxe do período composto'),
(1, 'Sintaxe de Colocação de Concordância', 'Concordância verbal e nominal'),
(1, 'Regência e Crase', 'Regência verbal, nominal e uso da crase'),
(1, 'Compreensão Interpretação', 'Técnicas de compreensão e interpretação de texto'),
(1, 'Tipos e Gêneros', 'Tipos textuais e gêneros literários'),
(1, 'Coesão e Coerência', 'Elementos de coesão e coerência textual'),
(1, 'Denotação, Conotação e Análise do Discurso', 'Denotação, conotação e análise do discurso')
ON CONFLICT (subject_id, name) DO NOTHING;

-- Inserir tópicos para Regulamentos
INSERT INTO topics (subject_id, name, description) VALUES
(2, 'Regulamentos Básicos', 'Normas fundamentais'),
(2, 'Procedimentos Operacionais', 'Procedimentos padrão'),
(2, 'Segurança', 'Normas de segurança'),
(2, 'Comunicações', 'Procedimentos de comunicação')
ON CONFLICT (subject_id, name) DO NOTHING;

-- =====================================================
-- EXEMPLOS DE QUESTÕES
-- =====================================================

-- Inserir algumas questões de exemplo para Acentuação Gráfica
INSERT INTO quiz_questions (topic_id, question_text, options, correct_answer, explanation) VALUES
(1, 'Qual palavra está corretamente acentuada?', 
 '["café", "cafe", "cáfe", "cafê"]', 
 'café', 
 'A palavra "café" é acentuada porque é uma oxítona terminada em "é".'),

(1, 'Qual palavra está corretamente acentuada?', 
 '["público", "publico", "publíco", "publíco"]', 
 'público', 
 'A palavra "público" é acentuada porque é uma proparoxítona.'),

(1, 'Qual palavra está corretamente acentuada?', 
 '["história", "historia", "históriá", "históriá"]', 
 'história', 
 'A palavra "história" é acentuada porque é uma proparoxítona.'),

(1, 'Qual palavra está corretamente acentuada?', 
 '["máquina", "maquina", "maquína", "maquína"]', 
 'máquina', 
 'A palavra "máquina" é acentuada porque é uma proparoxítona.'),

(1, 'Qual palavra está corretamente acentuada?', 
 '["último", "ultimo", "ultímo", "ultímo"]', 
 'último', 
 'A palavra "último" é acentuada porque é uma proparoxítona.')
ON CONFLICT DO NOTHING;

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_topics_subject_id ON topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_topic_id ON quiz_questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_topic_id ON flashcards(topic_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_topic_id ON user_progress(topic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_topic_id ON quiz_attempts(topic_id);

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se as tabelas foram criadas
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_name IN ('subjects', 'topics', 'quizzes', 'quiz_questions', 'flashcards', 'user_progress', 'quiz_attempts')
ORDER BY table_name;

-- Verificar dados inseridos
SELECT 'subjects' as tabela, COUNT(*) as registros FROM subjects
UNION ALL
SELECT 'topics' as tabela, COUNT(*) as registros FROM topics
UNION ALL
SELECT 'quiz_questions' as tabela, COUNT(*) as registros FROM quiz_questions
UNION ALL
SELECT 'flashcards' as tabela, COUNT(*) as registros FROM flashcards;
