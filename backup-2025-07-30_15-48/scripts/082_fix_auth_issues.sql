-- Script para corrigir problemas de autenticação
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- VERIFICAÇÃO E CORREÇÃO DE TABELAS
-- ========================================

-- 1. Verificar se a tabela user_roles existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        CREATE TABLE user_roles (
            user_uuid UUID PRIMARY KEY,
            role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
            first_login BOOLEAN DEFAULT true,
            profile_completed BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        RAISE NOTICE 'Tabela user_roles criada';
    ELSE
        RAISE NOTICE 'Tabela user_roles já existe';
    END IF;
END $$;

-- 2. Verificar se a tabela subjects existe e corrigir se necessário
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subjects') THEN
        CREATE TABLE subjects (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        RAISE NOTICE 'Tabela subjects criada';
    ELSE
        -- Verificar se a coluna id é do tipo correto
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'subjects' 
            AND column_name = 'id' 
            AND data_type = 'text'
        ) THEN
            -- Se id é text, alterar para serial
            ALTER TABLE subjects ALTER COLUMN id TYPE INTEGER USING id::INTEGER;
            ALTER TABLE subjects ALTER COLUMN id SET DEFAULT nextval('subjects_id_seq');
            RAISE NOTICE 'Coluna id da tabela subjects alterada para INTEGER';
        END IF;
    END IF;
END $$;

-- 3. Verificar se a tabela topics existe e corrigir se necessário
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'topics') THEN
        CREATE TABLE topics (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            subject_id INTEGER REFERENCES subjects(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        RAISE NOTICE 'Tabela topics criada';
    ELSE
        -- Verificar se subject_id é do tipo correto
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'topics' 
            AND column_name = 'subject_id' 
            AND data_type = 'text'
        ) THEN
            -- Se subject_id é text, alterar para integer
            ALTER TABLE topics ALTER COLUMN subject_id TYPE INTEGER USING subject_id::INTEGER;
            RAISE NOTICE 'Coluna subject_id da tabela topics alterada para INTEGER';
        END IF;
    END IF;
END $$;

-- ========================================
-- HABILITAR ROW LEVEL SECURITY
-- ========================================

-- Habilitar RLS nas tabelas principais
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLÍTICAS RLS BÁSICAS
-- ========================================

-- Política para user_roles (usuário pode ver apenas seu próprio role)
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_uuid);

-- Política para subjects (todos podem ver)
DROP POLICY IF EXISTS "Anyone can view subjects" ON subjects;
CREATE POLICY "Anyone can view subjects" ON subjects
  FOR SELECT USING (true);

-- Política para topics (todos podem ver)
DROP POLICY IF EXISTS "Anyone can view topics" ON topics;
CREATE POLICY "Anyone can view topics" ON topics
  FOR SELECT USING (true);

-- ========================================
-- INSERIR DADOS DE TESTE SE NECESSÁRIO
-- ========================================

-- Limpar dados existentes para evitar conflitos
DELETE FROM topics;
DELETE FROM subjects;

-- Inserir subjects com IDs numéricos
INSERT INTO subjects (id, name) 
VALUES 
  (1, 'Português'),
  (2, 'Regulamentos')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Inserir topics com subject_id numérico
INSERT INTO topics (id, name, subject_id) 
VALUES 
  -- Português (subject_id = 1)
  (1, 'Gramática Básica', 1),
  (2, 'Interpretação de Texto', 1),
  (3, 'Redação', 1),
  (4, 'Literatura', 1),
  (5, 'Ortografia', 1),
  (6, 'Pontuação', 1),
  (7, 'Morfologia', 1),
  (8, 'Sintaxe', 1),
  (9, 'Semântica', 1),
  (10, 'Estilística', 1),
  -- Regulamentos (subject_id = 2)
  (11, 'Leis Básicas', 2),
  (12, 'Decretos', 2),
  (13, 'Portarias', 2),
  (14, 'Resoluções', 2),
  (15, 'Instruções Normativas', 2),
  (16, 'Regimentos Internos', 2),
  (17, 'Códigos de Conduta', 2),
  (18, 'Normas Técnicas', 2),
  (19, 'Procedimentos', 2),
  (20, 'Diretrizes', 2)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  subject_id = EXCLUDED.subject_id;

-- ========================================
-- FUNÇÕES ÚTEIS
-- ========================================

-- Função para criar role automaticamente para novos usuários
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_roles (user_uuid, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT (user_uuid) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar role automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

-- Verificar se tudo está funcionando
SELECT 
  'user_roles' as tabela,
  COUNT(*) as registros
FROM user_roles
UNION ALL
SELECT 
  'subjects' as tabela,
  COUNT(*) as registros
FROM subjects
UNION ALL
SELECT 
  'topics' as tabela,
  COUNT(*) as registros
FROM topics;

-- Verificar dados inseridos
SELECT 'subjects' as tabela, id, name FROM subjects
UNION ALL
SELECT 'topics' as tabela, id::text, name FROM topics LIMIT 5;

-- Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('user_roles', 'subjects', 'topics')
ORDER BY tablename, policyname; 