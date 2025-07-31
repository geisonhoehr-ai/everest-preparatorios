-- Tabela para definir roles dos usuários
CREATE TABLE IF NOT EXISTS user_roles (
  user_uuid UUID PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'student', -- student, teacher, admin
  first_login BOOLEAN DEFAULT true, -- Para mostrar tela de seleção no primeiro acesso
  profile_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para perfil de professores
CREATE TABLE IF NOT EXISTS teacher_profiles (
  user_uuid UUID PRIMARY KEY REFERENCES user_roles(user_uuid),
  nome_completo TEXT NOT NULL,
  especialidade TEXT, -- Português, Redação, etc.
  bio TEXT,
  experiencia_anos INTEGER,
  formacao TEXT,
  certificacoes TEXT[],
  foto_url TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para perfil de alunos (expandida)
CREATE TABLE IF NOT EXISTS student_profiles (
  user_uuid UUID PRIMARY KEY REFERENCES user_roles(user_uuid),
  nome_completo TEXT NOT NULL,
  ano_escolar TEXT, -- 1º ano, 2º ano, 3º ano, cursinho
  objetivo TEXT, -- ENEM, vestibular, concurso
  escola TEXT,
  foto_url TEXT,
  data_nascimento DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Atualizar tabela de turmas para incluir mais informações
ALTER TABLE turmas ADD COLUMN IF NOT EXISTS codigo_acesso TEXT UNIQUE;
ALTER TABLE turmas ADD COLUMN IF NOT EXISTS max_alunos INTEGER DEFAULT 50;
ALTER TABLE turmas ADD COLUMN IF NOT EXISTS periodo TEXT; -- manhã, tarde, noite
ALTER TABLE turmas ADD COLUMN IF NOT EXISTS ano_letivo INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Tabela para convites de turma
CREATE TABLE IF NOT EXISTS convites_turma (
  id SERIAL PRIMARY KEY,
  turma_id TEXT NOT NULL REFERENCES turmas(id),
  codigo_convite TEXT UNIQUE NOT NULL,
  criado_por UUID NOT NULL,
  usado_por UUID,
  usado_em TIMESTAMP WITH TIME ZONE,
  expira_em TIMESTAMP WITH TIME ZONE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Função para gerar código de acesso da turma
CREATE OR REPLACE FUNCTION generate_turma_code() RETURNS TEXT AS $$
BEGIN
  RETURN UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- Atualizar turmas existentes com código de acesso
UPDATE turmas SET codigo_acesso = generate_turma_code() WHERE codigo_acesso IS NULL;

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles (role);
CREATE INDEX IF NOT EXISTS idx_convites_codigo ON convites_turma (codigo_convite);
CREATE INDEX IF NOT EXISTS idx_redacoes_turma_status ON redacoes (turma_id, status);
