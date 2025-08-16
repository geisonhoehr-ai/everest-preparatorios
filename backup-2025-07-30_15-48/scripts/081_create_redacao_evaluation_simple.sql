-- Script simplificado para criar as tabelas de avaliação de redação
-- Baseado no método de correção atual do usuário

-- Primeiro, vamos verificar se as tabelas já existem e removê-las se necessário
DROP TABLE IF EXISTS erros_identificados CASCADE;
DROP TABLE IF EXISTS avaliacoes_redacao CASCADE;
DROP TABLE IF EXISTS templates_feedback CASCADE;

-- Tabela de avaliações de redação (baseada na folha atual)
CREATE TABLE avaliacoes_redacao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  redacao_id INTEGER NOT NULL,
  professor_id TEXT NOT NULL,
  
  -- PARTE 1: Expressão (0,200 por erro)
  erros_pontuacao INTEGER DEFAULT 0,
  erros_ortografia INTEGER DEFAULT 0,
  erros_caligrafia INTEGER DEFAULT 0,
  erros_vocabulario INTEGER DEFAULT 0,
  erros_acentuacao INTEGER DEFAULT 0,
  erros_morfosintaxe INTEGER DEFAULT 0,
  total_erros_expressao INTEGER DEFAULT 0,
  desconto_expressao DECIMAL(4,3) DEFAULT 0,
  
  -- PARTE 2: Estrutura (0,500 por erro)
  -- Introdução
  tema_ok BOOLEAN DEFAULT false,
  tese_ok BOOLEAN DEFAULT false,
  desfecho_ok BOOLEAN DEFAULT false,
  coesao_tema_tese BOOLEAN DEFAULT false,
  coesao_tese_desfecho BOOLEAN DEFAULT false,
  
  -- Desenvolvimento 1
  dev1_arg1_ok BOOLEAN DEFAULT false,
  dev1_informatividade_ok BOOLEAN DEFAULT false,
  dev1_desfecho_ok BOOLEAN DEFAULT false,
  dev1_coesao_ok BOOLEAN DEFAULT false,
  
  -- Desenvolvimento 2
  dev2_arg2_ok BOOLEAN DEFAULT false,
  dev2_informatividade_ok BOOLEAN DEFAULT false,
  dev2_desfecho_ok BOOLEAN DEFAULT false,
  dev2_coesao_ok BOOLEAN DEFAULT false,
  
  -- Conclusão
  conclusao_retomada_ok BOOLEAN DEFAULT false,
  conclusao_proposta_ok BOOLEAN DEFAULT false,
  conclusao_resultado_ok BOOLEAN DEFAULT false,
  conclusao_coesao_ok BOOLEAN DEFAULT false,
  
  total_erros_estrutura INTEGER DEFAULT 0,
  desconto_estrutura DECIMAL(4,3) DEFAULT 0,
  
  -- PARTE 3: Conteúdo (até 4,5)
  tese_completa BOOLEAN DEFAULT false,
  modalizador_presente BOOLEAN DEFAULT false,
  tangenciamento BOOLEAN DEFAULT false,
  tese_neutra BOOLEAN DEFAULT false,
  desconto_pertinencia DECIMAL(4,3) DEFAULT 0,
  
  arg1_coerente BOOLEAN DEFAULT false,
  arg1_justifica_tese BOOLEAN DEFAULT false,
  arg2_coerente BOOLEAN DEFAULT false,
  arg2_justifica_tese BOOLEAN DEFAULT false,
  desconto_argumentacao DECIMAL(4,3) DEFAULT 0,
  
  informatividade_intro BOOLEAN DEFAULT false,
  informatividade_dev1 BOOLEAN DEFAULT false,
  informatividade_dev2 BOOLEAN DEFAULT false,
  desconto_informatividade DECIMAL(4,3) DEFAULT 0,
  
  -- Cálculo final
  nota_final DECIMAL(4,3) DEFAULT 0,
  
  -- Feedback do professor
  feedback_geral TEXT,
  sugestoes_melhoria TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela para erros específicos identificados no texto
CREATE TABLE erros_identificados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  avaliacao_id UUID NOT NULL,
  paragrafo INTEGER NOT NULL,
  linha INTEGER,
  tipo_erro TEXT NOT NULL, -- 'expressao', 'estrutura', 'conteudo'
  categoria TEXT NOT NULL, -- 'ortografia', 'pontuacao', 'coesao', etc.
  trecho_erro TEXT,
  correcao_sugerida TEXT,
  explicacao TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de templates de feedback (para padronizar)
CREATE TABLE templates_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria TEXT NOT NULL, -- 'expressao', 'estrutura', 'conteudo'
  subcategoria TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  sugestao TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Agora adicionar as foreign keys
ALTER TABLE avaliacoes_redacao 
ADD CONSTRAINT fk_avaliacoes_redacao_id 
FOREIGN KEY (redacao_id) REFERENCES redacoes(id) ON DELETE CASCADE;

ALTER TABLE avaliacoes_redacao 
ADD CONSTRAINT fk_avaliacoes_professor_id 
FOREIGN KEY (professor_id) REFERENCES user_roles(user_uuid) ON DELETE CASCADE;

ALTER TABLE erros_identificados 
ADD CONSTRAINT fk_erros_avaliacao_id 
FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes_redacao(id) ON DELETE CASCADE;

-- Índices para melhor performance
CREATE INDEX idx_avaliacoes_redacao_id ON avaliacoes_redacao(redacao_id);
CREATE INDEX idx_avaliacoes_professor_id ON avaliacoes_redacao(professor_id);
CREATE INDEX idx_erros_avaliacao_id ON erros_identificados(avaliacao_id);
CREATE INDEX idx_templates_categoria ON templates_feedback(categoria);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_avaliacoes_redacao_updated_at 
    BEFORE UPDATE ON avaliacoes_redacao 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para calcular automaticamente os totais
CREATE OR REPLACE FUNCTION calcular_totais_avaliacao()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcular total de erros de expressão
    NEW.total_erros_expressao = 
        NEW.erros_pontuacao + 
        NEW.erros_ortografia + 
        NEW.erros_caligrafia + 
        NEW.erros_vocabulario + 
        NEW.erros_acentuacao + 
        NEW.erros_morfosintaxe;
    
    -- Calcular desconto de expressão (0,200 por erro)
    NEW.desconto_expressao = NEW.total_erros_expressao * 0.2;
    
    -- Calcular total de erros de estrutura
    NEW.total_erros_estrutura = 
        CASE WHEN NOT NEW.tema_ok THEN 1 ELSE 0 END +
        CASE WHEN NOT NEW.tese_ok THEN 1 ELSE 0 END +
        CASE WHEN NOT NEW.desfecho_ok THEN 1 ELSE 0 END +
        CASE WHEN NOT NEW.coesao_tema_tese THEN 1 ELSE 0 END +
        CASE WHEN NOT NEW.coesao_tese_desfecho THEN 1 ELSE 0 END +
        CASE WHEN NOT NEW.dev1_arg1_ok THEN 1 ELSE 0 END +
        CASE WHEN NOT NEW.dev1_informatividade_ok THEN 1 ELSE 0 END +
        CASE WHEN NOT NEW.dev1_desfecho_ok THEN 1 ELSE 0 END +
        CASE WHEN NOT NEW.dev1_coesao_ok THEN 1 ELSE 0 END +
        CASE WHEN NOT NEW.dev2_arg2_ok THEN 1 ELSE 0 END +
        CASE WHEN NOT NEW.dev2_informatividade_ok THEN 1 ELSE 0 END +
        CASE WHEN NOT NEW.dev2_desfecho_ok THEN 1 ELSE 0 END +
        CASE WHEN NOT NEW.dev2_coesao_ok THEN 1 ELSE 0 END +
        CASE WHEN NOT NEW.conclusao_retomada_ok THEN 1 ELSE 0 END +
        CASE WHEN NOT NEW.conclusao_proposta_ok THEN 1 ELSE 0 END +
        CASE WHEN NOT NEW.conclusao_resultado_ok THEN 1 ELSE 0 END +
        CASE WHEN NOT NEW.conclusao_coesao_ok THEN 1 ELSE 0 END;
    
    -- Calcular desconto de estrutura (0,500 por erro)
    NEW.desconto_estrutura = NEW.total_erros_estrutura * 0.5;
    
    -- Calcular desconto de pertinência (até 1,5)
    NEW.desconto_pertinencia = 
        CASE WHEN NOT NEW.tese_completa THEN 0.5 ELSE 0 END +
        CASE WHEN NOT NEW.modalizador_presente THEN 0.5 ELSE 0 END +
        CASE WHEN NEW.tangenciamento THEN 0.5 ELSE 0 END;
    
    -- Calcular desconto de argumentação (até 1,5)
    NEW.desconto_argumentacao = 
        CASE WHEN NOT NEW.arg1_coerente THEN 0.5 ELSE 0 END +
        CASE WHEN NOT NEW.arg2_coerente THEN 0.5 ELSE 0 END +
        CASE WHEN NOT NEW.arg1_justifica_tese THEN 0.25 ELSE 0 END +
        CASE WHEN NOT NEW.arg2_justifica_tese THEN 0.25 ELSE 0 END;
    
    -- Calcular desconto de informatividade (até 1,5)
    NEW.desconto_informatividade = 
        CASE WHEN NOT NEW.informatividade_intro THEN 0.5 ELSE 0 END +
        CASE WHEN NOT NEW.informatividade_dev1 THEN 0.5 ELSE 0 END +
        CASE WHEN NOT NEW.informatividade_dev2 THEN 0.5 ELSE 0 END;
    
    -- Calcular nota final
    NEW.nota_final = 10 - NEW.desconto_expressao - NEW.desconto_estrutura - 
                     NEW.desconto_pertinencia - NEW.desconto_argumentacao - NEW.desconto_informatividade;
    
    -- Garantir que a nota não seja negativa
    IF NEW.nota_final < 0 THEN
        NEW.nota_final = 0;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcular_totais_avaliacao
    BEFORE INSERT OR UPDATE ON avaliacoes_redacao
    FOR EACH ROW EXECUTE FUNCTION calcular_totais_avaliacao();

-- Trigger para notificar quando redação é corrigida
CREATE OR REPLACE FUNCTION notify_redacao_corrigida()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.nota_final IS NOT NULL AND OLD.nota_final IS NULL THEN
    INSERT INTO notificacoes (user_uuid, tipo, titulo, mensagem, redacao_id)
    VALUES (
      (SELECT user_uuid FROM redacoes WHERE id = NEW.redacao_id),
      'redacao_corrigida',
      'Redação Corrigida! 📝',
      'Sua redação foi corrigida. Nota: ' || NEW.nota_final,
      NEW.redacao_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_redacao_corrigida
  AFTER UPDATE ON avaliacoes_redacao
  FOR EACH ROW
  EXECUTE FUNCTION notify_redacao_corrigida();

-- Inserir alguns templates de feedback padrão
INSERT INTO templates_feedback (categoria, subcategoria, titulo, descricao, sugestao) VALUES
('expressao', 'ortografia', 'Erros de Ortografia', 'Verificar grafia correta das palavras', 'Revisar dicionário para palavras duvidosas'),
('expressao', 'pontuacao', 'Erros de Pontuação', 'Verificar uso correto de vírgulas, pontos, etc.', 'Estudar regras de pontuação'),
('estrutura', 'introducao', 'Problemas na Introdução', 'Falta tema, tese ou desfecho', 'Seguir modelo: Tema + Tese + Argumentos'),
('estrutura', 'desenvolvimento', 'Problemas no Desenvolvimento', 'Falta argumentação ou informatividade', 'Usar exemplos, dados, alusões históricas'),
('conteudo', 'pertinencia', 'Tangenciamento', 'Texto não aborda adequadamente o tema', 'Focar no tema proposto'),
('conteudo', 'argumentacao', 'Argumentação Fraca', 'Argumentos não justificam a tese', 'Usar exemplos concretos e dados');

-- Comentários para documentação
COMMENT ON TABLE avaliacoes_redacao IS 'Tabela para armazenar avaliações detalhadas de redações seguindo o método CIAAR';
COMMENT ON TABLE erros_identificados IS 'Tabela para registrar erros específicos encontrados no texto';
COMMENT ON TABLE templates_feedback IS 'Tabela com templates de feedback para padronizar correções';

-- Verificar se as tabelas foram criadas corretamente
SELECT 
    table_name, 
    column_count 
FROM (
    SELECT 'avaliacoes_redacao' as table_name, COUNT(*) as column_count FROM information_schema.columns WHERE table_name = 'avaliacoes_redacao'
    UNION ALL
    SELECT 'erros_identificados' as table_name, COUNT(*) as column_count FROM information_schema.columns WHERE table_name = 'erros_identificados'
    UNION ALL
    SELECT 'templates_feedback' as table_name, COUNT(*) as column_count FROM information_schema.columns WHERE table_name = 'templates_feedback'
) t; 