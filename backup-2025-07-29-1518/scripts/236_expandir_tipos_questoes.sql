-- Script para expandir os tipos de questões e adicionar campos para formatação rica

-- 1. Atualizar a tabela questoes para suportar mais tipos
ALTER TABLE questoes 
ADD COLUMN IF NOT EXISTS explicacao TEXT,
ADD COLUMN IF NOT EXISTS imagem_url TEXT,
ADD COLUMN IF NOT EXISTS tempo_estimado INTEGER DEFAULT 60;

-- 2. Atualizar a tabela opcoes_questao para suportar imagens
ALTER TABLE opcoes_questao 
ADD COLUMN IF NOT EXISTS imagem_url TEXT;

-- 3. Criar tabela para imagens das questões
CREATE TABLE IF NOT EXISTS questoes_imagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questao_id UUID REFERENCES questoes(id) ON DELETE CASCADE,
  imagem_url TEXT NOT NULL,
  ordem INTEGER DEFAULT 1,
  legenda TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela para anexos das questões
CREATE TABLE IF NOT EXISTS questoes_anexos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questao_id UUID REFERENCES questoes(id) ON DELETE CASCADE,
  arquivo_url TEXT NOT NULL,
  nome_arquivo TEXT NOT NULL,
  tipo_arquivo TEXT,
  tamanho INTEGER,
  ordem INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar tabela para feedback das questões
CREATE TABLE IF NOT EXISTS questoes_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questao_id UUID REFERENCES questoes(id) ON DELETE CASCADE,
  tipo_feedback TEXT NOT NULL, -- 'correto', 'incorreto', 'parcial'
  mensagem TEXT NOT NULL,
  pontos_bonus DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_questoes_imagens_questao_id ON questoes_imagens(questao_id);
CREATE INDEX IF NOT EXISTS idx_questoes_anexos_questao_id ON questoes_anexos(questao_id);
CREATE INDEX IF NOT EXISTS idx_questoes_feedback_questao_id ON questoes_feedback(questao_id);

-- 7. Habilitar RLS nas novas tabelas
ALTER TABLE questoes_imagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE questoes_anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE questoes_feedback ENABLE ROW LEVEL SECURITY;

-- 8. Criar políticas RLS para questoes_imagens
CREATE POLICY "Professores podem gerenciar imagens de suas questões" ON questoes_imagens
FOR ALL TO authenticated
USING (
  questao_id IN (
    SELECT q.id FROM questoes q 
    JOIN provas p ON q.prova_id = p.id 
    WHERE p.criado_por = auth.uid()
  )
);

-- 9. Criar políticas RLS para questoes_anexos
CREATE POLICY "Professores podem gerenciar anexos de suas questões" ON questoes_anexos
FOR ALL TO authenticated
USING (
  questao_id IN (
    SELECT q.id FROM questoes q 
    JOIN provas p ON q.prova_id = p.id 
    WHERE p.criado_por = auth.uid()
  )
);

-- 10. Criar políticas RLS para questoes_feedback
CREATE POLICY "Professores podem gerenciar feedback de suas questões" ON questoes_feedback
FOR ALL TO authenticated
USING (
  questao_id IN (
    SELECT q.id FROM questoes q 
    JOIN provas p ON q.prova_id = p.id 
    WHERE p.criado_por = auth.uid()
  )
);

-- 11. Criar função para calcular pontuação total de uma prova
CREATE OR REPLACE FUNCTION calcular_pontuacao_total_prova(prova_uuid UUID)
RETURNS DECIMAL(10,2) AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(pontuacao) FROM questoes WHERE prova_id = prova_uuid), 
    0
  );
END;
$$ LANGUAGE plpgsql;

-- 12. Criar função para validar se uma prova tem questões suficientes
CREATE OR REPLACE FUNCTION validar_prova_completa(prova_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  total_questoes INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_questoes 
  FROM questoes 
  WHERE prova_id = prova_uuid;
  
  RETURN total_questoes > 0;
END;
$$ LANGUAGE plpgsql;

-- 13. Criar trigger para atualizar pontuação total da prova
CREATE OR REPLACE FUNCTION atualizar_pontuacao_prova()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE provas 
  SET pontuacao_total = calcular_pontuacao_total_prova(NEW.prova_id)
  WHERE id = NEW.prova_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 14. Adicionar coluna pontuacao_total na tabela provas
ALTER TABLE provas ADD COLUMN IF NOT EXISTS pontuacao_total DECIMAL(10,2) DEFAULT 0;

-- 15. Criar trigger para atualizar pontuação quando questões são modificadas
DROP TRIGGER IF EXISTS trigger_atualizar_pontuacao_prova ON questoes;
CREATE TRIGGER trigger_atualizar_pontuacao_prova
  AFTER INSERT OR UPDATE OR DELETE ON questoes
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_pontuacao_prova();

-- 16. Inserir dados de exemplo para testar os novos tipos
INSERT INTO questoes (prova_id, tipo, enunciado, pontuacao, ordem, explicacao) 
SELECT 
  p.id,
  'multipla_escolha',
  '<p><strong>Questão de exemplo:</strong> Qual é a capital do Brasil?</p>',
  2.0,
  1,
  'A capital do Brasil é Brasília, inaugurada em 1960.'
FROM provas p 
WHERE p.titulo = 'Teste' 
LIMIT 1;

-- 17. Inserir opções para a questão de exemplo
INSERT INTO opcoes_questao (questao_id, texto, ordem, is_correta)
SELECT 
  q.id,
  'Rio de Janeiro',
  1,
  false
FROM questoes q 
JOIN provas p ON q.prova_id = p.id 
WHERE p.titulo = 'Teste' AND q.ordem = 1;

INSERT INTO opcoes_questao (questao_id, texto, ordem, is_correta)
SELECT 
  q.id,
  'São Paulo',
  2,
  false
FROM questoes q 
JOIN provas p ON q.prova_id = p.id 
WHERE p.titulo = 'Teste' AND q.ordem = 1;

INSERT INTO opcoes_questao (questao_id, texto, ordem, is_correta)
SELECT 
  q.id,
  'Brasília',
  3,
  true
FROM questoes q 
JOIN provas p ON q.prova_id = p.id 
WHERE p.titulo = 'Teste' AND q.ordem = 1;

INSERT INTO opcoes_questao (questao_id, texto, ordem, is_correta)
SELECT 
  q.id,
  'Salvador',
  4,
  false
FROM questoes q 
JOIN provas p ON q.prova_id = p.id 
WHERE p.titulo = 'Teste' AND q.ordem = 1;

-- 18. Verificar se tudo foi criado corretamente
SELECT 
  'Tabelas criadas:' as info,
  COUNT(*) as total
FROM information_schema.tables 
WHERE table_name IN ('questoes_imagens', 'questoes_anexos', 'questoes_feedback');

SELECT 
  'Funções criadas:' as info,
  COUNT(*) as total
FROM information_schema.routines 
WHERE routine_name IN ('calcular_pontuacao_total_prova', 'validar_prova_completa', 'atualizar_pontuacao_prova');

SELECT 
  'Políticas RLS:' as info,
  COUNT(*) as total
FROM pg_policies 
WHERE tablename IN ('questoes_imagens', 'questoes_anexos', 'questoes_feedback');