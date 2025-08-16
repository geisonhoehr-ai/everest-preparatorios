-- 📚 SISTEMA DE PROVAS ONLINE
-- Execute este script no SQL Editor do Supabase

-- 1. TABELA DE PROVAS
CREATE TABLE IF NOT EXISTS provas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    materia VARCHAR(100) NOT NULL,
    dificuldade VARCHAR(20) CHECK (dificuldade IN ('facil', 'medio', 'dificil')) DEFAULT 'medio',
    tempo_limite INTEGER NOT NULL DEFAULT 60, -- em minutos
    tentativas_permitidas INTEGER DEFAULT 1,
    nota_minima DECIMAL(3,1) DEFAULT 7.0,
    status VARCHAR(20) CHECK (status IN ('rascunho', 'publicada', 'arquivada')) DEFAULT 'rascunho',
    tags TEXT[], -- array de tags
    criado_por UUID REFERENCES auth.users(id),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE QUESTÕES
CREATE TABLE IF NOT EXISTS questoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prova_id UUID REFERENCES provas(id) ON DELETE CASCADE,
    tipo VARCHAR(50) CHECK (tipo IN ('multipla_escolha', 'dissertativa', 'verdadeiro_falso', 'completar')) NOT NULL,
    enunciado TEXT NOT NULL, -- HTML formatado
    imagens TEXT[], -- URLs das imagens
    pontuacao DECIMAL(5,2) DEFAULT 1.0,
    explicacao TEXT,
    ordem INTEGER NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE OPÇÕES (para questões de múltipla escolha)
CREATE TABLE IF NOT EXISTS opcoes_questao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    questao_id UUID REFERENCES questoes(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    correta BOOLEAN DEFAULT FALSE,
    ordem INTEGER NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE TENTATIVAS
CREATE TABLE IF NOT EXISTS tentativas_prova (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prova_id UUID REFERENCES provas(id) ON DELETE CASCADE,
    aluno_id UUID REFERENCES auth.users(id),
    nota_final DECIMAL(5,2),
    tempo_gasto INTEGER, -- em segundos
    iniciada_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    finalizada_em TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) CHECK (status IN ('em_andamento', 'finalizada', 'expirada')) DEFAULT 'em_andamento',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA DE RESPOSTAS DOS ALUNOS
CREATE TABLE IF NOT EXISTS respostas_aluno (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tentativa_id UUID REFERENCES tentativas_prova(id) ON DELETE CASCADE,
    questao_id UUID REFERENCES questoes(id) ON DELETE CASCADE,
    resposta TEXT,
    correta BOOLEAN,
    pontos_obtidos DECIMAL(5,2) DEFAULT 0,
    tempo_gasto INTEGER, -- em segundos
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_provas_status ON provas(status);
CREATE INDEX IF NOT EXISTS idx_provas_materia ON provas(materia);
CREATE INDEX IF NOT EXISTS idx_provas_criado_por ON provas(criado_por);
CREATE INDEX IF NOT EXISTS idx_questoes_prova_id ON questoes(prova_id);
CREATE INDEX IF NOT EXISTS idx_questoes_ordem ON questoes(ordem);
CREATE INDEX IF NOT EXISTS idx_opcoes_questao_id ON opcoes_questao(questao_id);
CREATE INDEX IF NOT EXISTS idx_tentativas_prova_id ON tentativas_prova(prova_id);
CREATE INDEX IF NOT EXISTS idx_tentativas_aluno_id ON tentativas_prova(aluno_id);
CREATE INDEX IF NOT EXISTS idx_respostas_tentativa_id ON respostas_aluno(tentativa_id);

-- 7. RLS (Row Level Security)
ALTER TABLE provas ENABLE ROW LEVEL SECURITY;
ALTER TABLE questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE opcoes_questao ENABLE ROW LEVEL SECURITY;
ALTER TABLE tentativas_prova ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas_aluno ENABLE ROW LEVEL SECURITY;

-- 8. POLÍTICAS RLS PARA PROVAS
-- Professores podem gerenciar suas provas
CREATE POLICY "Teachers can manage their own provas" ON provas
    FOR ALL TO authenticated
    USING (criado_por = auth.uid())
    WITH CHECK (criado_por = auth.uid());

-- Alunos podem ver provas publicadas
CREATE POLICY "Students can view published provas" ON provas
    FOR SELECT TO authenticated
    USING (status = 'publicada');

-- 9. POLÍTICAS RLS PARA QUESTÕES
-- Professores podem gerenciar questões de suas provas
CREATE POLICY "Teachers can manage questions of their provas" ON questoes
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM provas 
            WHERE provas.id = questoes.prova_id 
            AND provas.criado_por = auth.uid()
        )
    );

-- Alunos podem ver questões de provas publicadas
CREATE POLICY "Students can view questions of published provas" ON questoes
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM provas 
            WHERE provas.id = questoes.prova_id 
            AND provas.status = 'publicada'
        )
    );

-- 10. POLÍTICAS RLS PARA OPÇÕES
-- Professores podem gerenciar opções de suas questões
CREATE POLICY "Teachers can manage options of their questions" ON opcoes_questao
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM questoes q
            JOIN provas p ON p.id = q.prova_id
            WHERE q.id = opcoes_questao.questao_id 
            AND p.criado_por = auth.uid()
        )
    );

-- Alunos podem ver opções de provas publicadas
CREATE POLICY "Students can view options of published provas" ON opcoes_questao
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM questoes q
            JOIN provas p ON p.id = q.prova_id
            WHERE q.id = opcoes_questao.questao_id 
            AND p.status = 'publicada'
        )
    );

-- 11. POLÍTICAS RLS PARA TENTATIVAS
-- Alunos podem gerenciar suas tentativas
CREATE POLICY "Students can manage their own attempts" ON tentativas_prova
    FOR ALL TO authenticated
    USING (aluno_id = auth.uid())
    WITH CHECK (aluno_id = auth.uid());

-- Professores podem ver tentativas de suas provas
CREATE POLICY "Teachers can view attempts of their provas" ON tentativas_prova
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM provas 
            WHERE provas.id = tentativas_prova.prova_id 
            AND provas.criado_por = auth.uid()
        )
    );

-- 12. POLÍTICAS RLS PARA RESPOSTAS
-- Alunos podem gerenciar suas respostas
CREATE POLICY "Students can manage their own answers" ON respostas_aluno
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM tentativas_prova 
            WHERE tentativas_prova.id = respostas_aluno.tentativa_id 
            AND tentativas_prova.aluno_id = auth.uid()
        )
    );

-- Professores podem ver respostas de suas provas
CREATE POLICY "Teachers can view answers of their provas" ON respostas_aluno
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM tentativas_prova t
            JOIN provas p ON p.id = t.prova_id
            WHERE t.id = respostas_aluno.tentativa_id 
            AND p.criado_por = auth.uid()
        )
    );

-- 13. DADOS DE EXEMPLO
INSERT INTO provas (titulo, descricao, materia, dificuldade, tempo_limite, tentativas_permitidas, nota_minima, status, tags, criado_por) VALUES
('Prova de Regulamentos Militares', 'Avaliação completa sobre regulamentos militares e hierarquia', 'Regulamentos', 'medio', 90, 2, 7.0, 'publicada', ARRAY['regulamentos', 'militar', 'hierarquia'], (SELECT id FROM auth.users LIMIT 1)),
('Quiz de Português - Cegalla', 'Questões sobre gramática, sintaxe e literatura brasileira', 'Português', 'facil', 60, 1, 6.0, 'publicada', ARRAY['português', 'gramática', 'literatura'], (SELECT id FROM auth.users LIMIT 1)),
('Matemática Básica', 'Operações fundamentais e resolução de problemas', 'Matemática', 'medio', 75, 2, 7.5, 'publicada', ARRAY['matemática', 'operações', 'problemas'], (SELECT id FROM auth.users LIMIT 1));

-- 14. VERIFICAÇÃO
SELECT 
    '=== SISTEMA DE PROVAS CRIADO ===' as info;

SELECT 
    'Tabelas criadas:' as tipo,
    COUNT(*) as total
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('provas', 'questoes', 'opcoes_questao', 'tentativas_prova', 'respostas_aluno');

SELECT 
    'Provas de exemplo:' as tipo,
    COUNT(*) as total
FROM provas;