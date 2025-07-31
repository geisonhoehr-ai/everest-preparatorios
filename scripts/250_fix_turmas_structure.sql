-- Script para corrigir a estrutura da tabela turmas
-- Torna o sistema mais flexível com turmas opcionais

-- ========================================
-- 1. VERIFICAR ESTRUTURA ATUAL DA TABELA TURMAS
-- ========================================

-- Verificar se a tabela turmas existe
SELECT 
  'Tabela turmas existe:' as info,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'turmas'
  ) as turmas_existe;

-- Verificar estrutura atual da tabela turmas
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'turmas'
ORDER BY ordinal_position;

-- ========================================
-- 2. CORRIGIR ESTRUTURA DA TABELA TURMAS
-- ========================================

-- Adicionar colunas que podem estar faltando
DO $$
BEGIN
  -- Adicionar codigo_acesso se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'turmas' 
    AND column_name = 'codigo_acesso'
  ) THEN
    ALTER TABLE turmas ADD COLUMN codigo_acesso TEXT UNIQUE;
    RAISE NOTICE 'Coluna codigo_acesso adicionada à tabela turmas';
  ELSE
    RAISE NOTICE 'Coluna codigo_acesso já existe na tabela turmas';
  END IF;

  -- Adicionar max_alunos se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'turmas' 
    AND column_name = 'max_alunos'
  ) THEN
    ALTER TABLE turmas ADD COLUMN max_alunos INTEGER DEFAULT 50;
    RAISE NOTICE 'Coluna max_alunos adicionada à tabela turmas';
  ELSE
    RAISE NOTICE 'Coluna max_alunos já existe na tabela turmas';
  END IF;

  -- Adicionar periodo se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'turmas' 
    AND column_name = 'periodo'
  ) THEN
    ALTER TABLE turmas ADD COLUMN periodo TEXT;
    RAISE NOTICE 'Coluna periodo adicionada à tabela turmas';
  ELSE
    RAISE NOTICE 'Coluna periodo já existe na tabela turmas';
  END IF;

  -- Adicionar ano_letivo se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'turmas' 
    AND column_name = 'ano_letivo'
  ) THEN
    ALTER TABLE turmas ADD COLUMN ano_letivo INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);
    RAISE NOTICE 'Coluna ano_letivo adicionada à tabela turmas';
  ELSE
    RAISE NOTICE 'Coluna ano_letivo já existe na tabela turmas';
  END IF;
END $$;

-- ========================================
-- 3. CORRIGIR ESTRUTURA DA TABELA REDACOES
-- ========================================

-- Verificar se turma_id existe em redacoes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'redacoes' 
    AND column_name = 'turma_id'
  ) THEN
    ALTER TABLE redacoes ADD COLUMN turma_id TEXT;
    RAISE NOTICE 'Coluna turma_id adicionada à tabela redacoes';
  ELSE
    RAISE NOTICE 'Coluna turma_id já existe na tabela redacoes';
  END IF;
END $$;

-- ========================================
-- 4. CRIAR FUNÇÃO PARA GERAR CÓDIGO DE ACESSO
-- ========================================

-- Função para gerar código de acesso da turma
CREATE OR REPLACE FUNCTION generate_turma_code() RETURNS TEXT AS $$
BEGIN
  RETURN UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 5. CRIAR DADOS DE TESTE FLEXÍVEIS
-- ========================================

-- Inserir turmas de teste com estrutura correta
INSERT INTO turmas (id, nome, descricao, professor_uuid, codigo_acesso, periodo, ativa, max_alunos, ano_letivo) VALUES 
('turma-teste-1', 'Turma de Teste 1', 'Turma para testes do sistema - Manhã', '00000000-0000-0000-0000-000000000001', 'TESTE001', 'Manhã', true, 30, 2024),
('turma-teste-2', 'Turma de Teste 2', 'Turma para testes do sistema - Tarde', '00000000-0000-0000-0000-000000000001', 'TESTE002', 'Tarde', true, 25, 2024),
('turma-teste-3', 'Turma de Teste 3', 'Turma para testes do sistema - Noite', '00000000-0000-0000-0000-000000000001', 'TESTE003', 'Noite', true, 35, 2024)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  codigo_acesso = EXCLUDED.codigo_acesso,
  periodo = EXCLUDED.periodo,
  max_alunos = EXCLUDED.max_alunos,
  ano_letivo = EXCLUDED.ano_letivo;

-- Atualizar turmas existentes sem código de acesso
UPDATE turmas 
SET codigo_acesso = generate_turma_code() 
WHERE codigo_acesso IS NULL;

-- ========================================
-- 6. VERIFICAÇÃO FINAL
-- ========================================

-- Verificar estrutura final da tabela turmas
SELECT 
  'Estrutura final da tabela turmas:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'turmas'
ORDER BY ordinal_position;

-- Verificar dados de teste criados
SELECT 
  'Dados de teste criados:' as info,
  COUNT(*) as total_turmas,
  COUNT(CASE WHEN codigo_acesso IS NOT NULL THEN 1 END) as turmas_com_codigo
FROM turmas 
WHERE id LIKE 'turma-teste-%';

-- Verificar se redacoes tem turma_id
SELECT 
  'Redações com turma_id:' as info,
  COUNT(*) as total_redacoes,
  COUNT(CASE WHEN turma_id IS NOT NULL THEN 1 END) as redacoes_com_turma,
  COUNT(CASE WHEN turma_id IS NULL THEN 1 END) as redacoes_sem_turma
FROM redacoes;

-- ========================================
-- 7. EXPLICAÇÃO DO SISTEMA FLEXÍVEL
-- ========================================

/*
SISTEMA FLEXÍVEL IMPLEMENTADO:

✅ Turmas são OPCIONAIS
✅ Alunos podem usar a plataforma sem estar em turma
✅ Redações podem ser enviadas sem turma específica
✅ Professores podem criar turmas para organização
✅ Sistema funciona tanto para uso individual quanto em grupo

VANTAGENS:
- Mais flexível para diferentes tipos de uso
- Não força estrutura rígida
- Permite crescimento gradual
- Suporta tanto cursinhos quanto uso individual
*/ 