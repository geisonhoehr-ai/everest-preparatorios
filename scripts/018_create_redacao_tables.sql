-- Tabela para armazenar as redações dos alunos
CREATE TABLE IF NOT EXISTS redacoes (
  id SERIAL PRIMARY KEY,
  user_uuid UUID NOT NULL,
  titulo TEXT NOT NULL,
  tema TEXT NOT NULL,
  tipo_redacao TEXT NOT NULL DEFAULT 'dissertativa', -- dissertativa, narrativa, descritiva
  conteudo TEXT, -- Texto da redação se digitada
  arquivo_url TEXT, -- URL do arquivo se enviado como imagem/PDF
  arquivo_nome TEXT, -- Nome original do arquivo
  status TEXT NOT NULL DEFAULT 'pendente', -- pendente, em_correcao, corrigida, revisada
  nota_final NUMERIC(4,2), -- Nota de 0 a 1000 (padrão ENEM)
  feedback_professor TEXT, -- Feedback escrito do professor
  feedback_audio_url TEXT, -- URL do áudio de feedback
  correcao_ia TEXT, -- Correção automática da IA
  nota_ia NUMERIC(4,2), -- Nota dada pela IA
  professor_uuid UUID, -- Professor responsável pela correção
  turma_id TEXT, -- Identificador da turma
  data_envio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  data_correcao TIMESTAMP WITH TIME ZONE,
  data_revisao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para critérios de avaliação detalhados
CREATE TABLE IF NOT EXISTS criterios_avaliacao (
  id SERIAL PRIMARY KEY,
  redacao_id INTEGER NOT NULL REFERENCES redacoes(id) ON DELETE CASCADE,
  criterio TEXT NOT NULL, -- competencia_1, competencia_2, etc.
  nota NUMERIC(4,2) NOT NULL, -- Nota específica do critério
  feedback TEXT, -- Feedback específico do critério
  corrigido_por TEXT NOT NULL DEFAULT 'ia', -- ia, professor
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para templates/modelos de redação
CREATE TABLE IF NOT EXISTS templates_redacao (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL, -- enem, vestibular, concurso
  descricao TEXT,
  arquivo_url TEXT NOT NULL, -- URL do template PDF
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para temas de redação
CREATE TABLE IF NOT EXISTS temas_redacao (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tipo_prova TEXT NOT NULL, -- enem, fuvest, etc.
  ano INTEGER,
  dificuldade TEXT DEFAULT 'medio', -- facil, medio, dificil
  tags TEXT[], -- Array de tags para categorização
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para notificações
CREATE TABLE IF NOT EXISTS notificacoes (
  id SERIAL PRIMARY KEY,
  user_uuid UUID NOT NULL,
  tipo TEXT NOT NULL, -- redacao_corrigida, nova_redacao, feedback_disponivel
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  redacao_id INTEGER REFERENCES redacoes(id),
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para configurações de turma
CREATE TABLE IF NOT EXISTS turmas (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  professor_uuid UUID NOT NULL,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para relacionar alunos com turmas
CREATE TABLE IF NOT EXISTS alunos_turmas (
  user_uuid UUID NOT NULL,
  turma_id TEXT NOT NULL REFERENCES turmas(id),
  data_entrada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_uuid, turma_id)
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_redacoes_user_uuid ON redacoes (user_uuid);
CREATE INDEX IF NOT EXISTS idx_redacoes_status ON redacoes (status);
CREATE INDEX IF NOT EXISTS idx_redacoes_professor ON redacoes (professor_uuid);
CREATE INDEX IF NOT EXISTS idx_redacoes_turma ON redacoes (turma_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_user ON notificacoes (user_uuid, lida);
CREATE INDEX IF NOT EXISTS idx_criterios_redacao ON criterios_avaliacao (redacao_id);
