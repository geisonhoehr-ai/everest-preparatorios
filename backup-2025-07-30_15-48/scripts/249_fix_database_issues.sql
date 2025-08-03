-- Script para corrigir problemas identificados no banco de dados
-- 1. Problema de relacionamento entre redacoes e turmas
-- 2. Verificar estrutura da tabela profiles
-- 3. Corrigir erros de TypeScript

-- ========================================
-- 1. VERIFICAR ESTRUTURA ATUAL DAS TABELAS
-- ========================================

-- Verificar se a tabela turmas existe
SELECT 
  'Tabela turmas existe:' as info,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'turmas'
  ) as turmas_existe;

-- Verificar estrutura da tabela redacoes
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'redacoes'
ORDER BY ordinal_position;

-- Verificar estrutura da tabela turmas
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'turmas'
ORDER BY ordinal_position;

-- Verificar estrutura da tabela profiles
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ========================================
-- 2. CORRIGIR PROBLEMA DE RELACIONAMENTO
-- ========================================

-- Verificar se há foreign key entre redacoes e turmas
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'redacoes'
  AND ccu.table_name = 'turmas';

-- Se não houver foreign key, criar uma
-- Primeiro, verificar se a coluna turma_id existe em redacoes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'redacoes' 
    AND column_name = 'turma_id'
  ) THEN
    -- Adicionar coluna turma_id se não existir
    ALTER TABLE redacoes ADD COLUMN turma_id TEXT;
    RAISE NOTICE 'Coluna turma_id adicionada à tabela redacoes';
  ELSE
    RAISE NOTICE 'Coluna turma_id já existe na tabela redacoes';
  END IF;
END $$;

-- Criar foreign key se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_schema = 'public' 
    AND table_name = 'redacoes' 
    AND constraint_type = 'FOREIGN KEY'
    AND constraint_name LIKE '%turma_id%'
  ) THEN
    -- Criar foreign key
    ALTER TABLE redacoes 
    ADD CONSTRAINT fk_redacoes_turma_id 
    FOREIGN KEY (turma_id) REFERENCES turmas(id);
    RAISE NOTICE 'Foreign key criada entre redacoes.turma_id e turmas.id';
  ELSE
    RAISE NOTICE 'Foreign key já existe entre redacoes e turmas';
  END IF;
END $$;

-- ========================================
-- 3. CORRIGIR ESTRUTURA DA TABELA PROFILES
-- ========================================

-- Verificar se a coluna avatar_url existe na tabela profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'avatar_url'
  ) THEN
    -- Adicionar coluna avatar_url se não existir
    ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    RAISE NOTICE 'Coluna avatar_url adicionada à tabela profiles';
  ELSE
    RAISE NOTICE 'Coluna avatar_url já existe na tabela profiles';
  END IF;
END $$;

-- Verificar se a coluna full_name existe na tabela profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'full_name'
  ) THEN
    -- Adicionar coluna full_name se não existir
    ALTER TABLE profiles ADD COLUMN full_name TEXT;
    RAISE NOTICE 'Coluna full_name adicionada à tabela profiles';
  ELSE
    RAISE NOTICE 'Coluna full_name já existe na tabela profiles';
  END IF;
END $$;

-- ========================================
-- 4. CRIAR DADOS DE TESTE PARA TURMAS
-- ========================================

-- Inserir turmas de teste se não existirem
INSERT INTO turmas (id, nome, descricao, professor_uuid, codigo_acesso, periodo, ativa) VALUES 
('turma-teste-1', 'Turma de Teste 1', 'Turma para testes do sistema', '00000000-0000-0000-0000-000000000001', 'TESTE001', 'Manhã', true),
('turma-teste-2', 'Turma de Teste 2', 'Turma para testes do sistema', '00000000-0000-0000-0000-000000000001', 'TESTE002', 'Tarde', true)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 5. VERIFICAÇÃO FINAL
-- ========================================

-- Verificar relacionamentos corrigidos
SELECT 
  'Relacionamentos corrigidos:' as info,
  COUNT(*) as total_foreign_keys
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
  AND table_name = 'redacoes' 
  AND constraint_type = 'FOREIGN KEY';

-- Verificar estrutura final da tabela profiles
SELECT 
  'Estrutura final da tabela profiles:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Verificar dados de teste
SELECT 
  'Dados de teste criados:' as info,
  COUNT(*) as total_turmas
FROM turmas 
WHERE id LIKE 'turma-teste-%';

-- Verificar se há redações com turma_id válido
SELECT 
  'Redações com turma válida:' as info,
  COUNT(*) as total_redacoes_com_turma
FROM redacoes r
JOIN turmas t ON r.turma_id = t.id; 