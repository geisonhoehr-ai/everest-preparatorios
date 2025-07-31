-- Script para criar tabelas de Membros e Turmas inspiradas na MemberKit
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- TABELAS DE MEMBROS
-- ========================================

-- Tabela principal de membros
CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  user_uuid UUID UNIQUE REFERENCES auth.users(id),
  nome_completo TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  cpf_cnpj TEXT,
  data_inscricao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ultima_vez_visto TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'banido', 'suspenso')),
  tipo_acesso TEXT DEFAULT 'aluno' CHECK (tipo_acesso IN ('proprietario', 'administrador', 'atendimento', 'moderador', 'aluno')),
  acesso_ilimitado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  nome_assinatura TEXT NOT NULL,
  data_inicio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  data_expiracao TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'expirada', 'cancelada', 'suspensa')),
  valor DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de cursos individuais
CREATE TABLE IF NOT EXISTS individual_courses (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  nome_curso TEXT NOT NULL,
  data_inicio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  data_expiracao TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'expirado', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- TABELAS DE TURMAS
-- ========================================

-- Tabela principal de turmas
CREATE TABLE IF NOT EXISTS classes (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  curso_id TEXT NOT NULL, -- Referência ao curso/subject
  codigo_acesso TEXT UNIQUE,
  max_alunos INTEGER DEFAULT 50,
  periodo TEXT CHECK (periodo IN ('manha', 'tarde', 'noite', 'integral')),
  ano_letivo INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_fim TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa', 'encerrada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de relacionamento membros-turmas
CREATE TABLE IF NOT EXISTS member_classes (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  data_entrada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'trancado')),
  UNIQUE(member_id, class_id)
);

-- ========================================
-- TABELAS DE CONTEÚDO PROGRAMADO
-- ========================================

-- Tabela de regras de liberação de conteúdo
CREATE TABLE IF NOT EXISTS content_rules (
  id SERIAL PRIMARY KEY,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('modulo', 'aula', 'material')),
  content_id TEXT NOT NULL, -- ID do conteúdo específico
  rule_type TEXT NOT NULL CHECK (rule_type IN (
    'acesso_livre', 
    'data_programada', 
    'dias_apos_compra', 
    'pontuacao_minima', 
    'oculto', 
    'bloqueado', 
    'curso_concluido', 
    'modulo_concluido', 
    'aula_concluida'
  )),
  data_liberacao TIMESTAMP WITH TIME ZONE,
  dias_apos_compra INTEGER,
  pontuacao_minima INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- ÍNDICES PARA OTIMIZAÇÃO
-- ========================================

CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_tipo_acesso ON members(tipo_acesso);
CREATE INDEX IF NOT EXISTS idx_subscriptions_member_id ON subscriptions(member_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_classes_curso_id ON classes(curso_id);
CREATE INDEX IF NOT EXISTS idx_classes_status ON classes(status);
CREATE INDEX IF NOT EXISTS idx_member_classes_member_id ON member_classes(member_id);
CREATE INDEX IF NOT EXISTS idx_member_classes_class_id ON member_classes(class_id);
CREATE INDEX IF NOT EXISTS idx_content_rules_class_id ON content_rules(class_id);

-- ========================================
-- HABILITAR ROW LEVEL SECURITY
-- ========================================

ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_rules ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLÍTICAS RLS BÁSICAS
-- ========================================

-- Políticas para membros (apenas admins podem ver todos)
CREATE POLICY "Admins can view all members" ON members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_uuid = auth.uid() 
      AND role IN ('admin', 'teacher')
    )
  );

-- Políticas para turmas (apenas admins podem gerenciar)
CREATE POLICY "Admins can manage classes" ON classes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_uuid = auth.uid() 
      AND role IN ('admin', 'teacher')
    )
  );

-- Políticas para relacionamentos membros-turmas
CREATE POLICY "Admins can manage member classes" ON member_classes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_uuid = auth.uid() 
      AND role IN ('admin', 'teacher')
    )
  );

-- ========================================
-- FUNÇÕES ÚTEIS
-- ========================================

-- Função para atualizar timestamp de última vez visto
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ultima_vez_visto = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar última vez visto
CREATE TRIGGER update_member_last_seen
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_last_seen();

-- Função para contar membros por status
CREATE OR REPLACE FUNCTION get_member_counts()
RETURNS TABLE (
  total BIGINT,
  ativos BIGINT,
  inativos BIGINT,
  banidos BIGINT,
  assinantes BIGINT,
  ilimitados BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'ativo') as ativos,
    COUNT(*) FILTER (WHERE status = 'inativo') as inativos,
    COUNT(*) FILTER (WHERE status = 'banido') as banidos,
    COUNT(*) FILTER (WHERE EXISTS (
      SELECT 1 FROM subscriptions s 
      WHERE s.member_id = members.id 
      AND s.status = 'ativa'
    )) as assinantes,
    COUNT(*) FILTER (WHERE acesso_ilimitado = true) as ilimitados
  FROM members;
END;
$$ LANGUAGE plpgsql; 