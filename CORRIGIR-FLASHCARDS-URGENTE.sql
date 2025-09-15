-- Script URGENTE para corrigir acesso aos flashcards
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se a tabela flashcards existe
SELECT 'Verificando tabela flashcards...' as status;
SELECT COUNT(*) as total_flashcards FROM flashcards;

-- 2. Desabilitar RLS temporariamente para permitir acesso
ALTER TABLE flashcards DISABLE ROW LEVEL SECURITY;

-- 3. Verificar se existem as tabelas subjects e topics
SELECT 'Verificando tabela subjects...' as status;
SELECT COUNT(*) as total_subjects FROM subjects;

SELECT 'Verificando tabela topics...' as status;
SELECT COUNT(*) as total_topics FROM topics;

-- 4. Se subjects não existir, criar
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Se topics não existir, criar
CREATE TABLE IF NOT EXISTS topics (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(subject_id, name)
);

-- 6. Inserir dados básicos se não existirem
INSERT INTO subjects (name) VALUES
('Português'),
('Regulamentos')
ON CONFLICT (name) DO NOTHING;

-- 7. Inserir tópicos baseados nos topic_ids dos flashcards
INSERT INTO topics (subject_id, name, description) VALUES
(1, 'Fonética e Fonologia', 'Estudo dos sons da língua'),
(1, 'Ortografia', 'Regras de escrita'),
(1, 'Acentuação Gráfica', 'Regras de acentuação'),
(1, 'Morfologia - Classes', 'Classes gramaticais'),
(1, 'Sintaxe - Termos Essenciais', 'Termos essenciais da oração'),
(1, 'Sintaxe - Termos Integrantes', 'Termos integrantes da oração'),
(1, 'Sintaxe - Termos Acessórios', 'Termos acessórios da oração'),
(1, 'Sintaxe - Período Composto', 'Período composto'),
(1, 'Concordância', 'Concordância verbal e nominal'),
(1, 'Regência', 'Regência verbal e nominal'),
(1, 'Crase', 'Uso da crase'),
(1, 'Colocação Pronominal', 'Colocação dos pronomes'),
(1, 'Semântica e Estilística', 'Significado e estilo')
ON CONFLICT (subject_id, name) DO NOTHING;

-- 8. Criar políticas RLS permissivas para flashcards
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Allow public read access to flashcards" ON flashcards
    FOR SELECT USING (true);

-- Política para permitir inserção (apenas para usuários autenticados)
CREATE POLICY "Allow authenticated users to insert flashcards" ON flashcards
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir atualização (apenas para usuários autenticados)
CREATE POLICY "Allow authenticated users to update flashcards" ON flashcards
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para permitir exclusão (apenas para usuários autenticados)
CREATE POLICY "Allow authenticated users to delete flashcards" ON flashcards
    FOR DELETE USING (auth.role() = 'authenticated');

-- 9. Criar políticas para subjects e topics
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to subjects" ON subjects
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to topics" ON topics
    FOR SELECT USING (true);

-- 10. Verificar resultado final
SELECT 'Verificação final...' as status;
SELECT COUNT(*) as total_flashcards FROM flashcards;
SELECT COUNT(*) as total_subjects FROM subjects;
SELECT COUNT(*) as total_topics FROM topics;

-- 11. Mostrar alguns flashcards de exemplo
SELECT 'Exemplos de flashcards:' as status;
SELECT id, topic_id, LEFT(question, 50) as question_preview 
FROM flashcards 
LIMIT 5;
