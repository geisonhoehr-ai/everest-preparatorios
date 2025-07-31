-- Script para corrigir a tabela subscriptions
-- Execute no SQL Editor do Supabase

-- ========================================
-- PASSO 1: VERIFICAR ESTRUTURA ATUAL
-- ========================================

-- Verificar estrutura atual da tabela subscriptions
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;

-- ========================================
-- PASSO 2: ADICIONAR COLUNAS FALTANTES
-- ========================================

-- Adicionar coluna expiration_date se não existir
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS expiration_date TIMESTAMP WITH TIME ZONE;

-- Adicionar coluna course_name se não existir
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS course_name TEXT;

-- Adicionar coluna class_name se não existir
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS class_name TEXT;

-- Adicionar coluna progress se não existir
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;

-- Adicionar coluna enrollment_date se não existir
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Adicionar coluna created_by se não existir
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- ========================================
-- PASSO 3: MIGRAR DADOS EXISTENTES
-- ========================================

-- Migrar data_expiracao para expiration_date se existir
UPDATE subscriptions 
SET expiration_date = data_expiracao 
WHERE data_expiracao IS NOT NULL AND expiration_date IS NULL;

-- Migrar nome_assinatura para course_name se existir
UPDATE subscriptions 
SET course_name = nome_assinatura 
WHERE nome_assinatura IS NOT NULL AND course_name IS NULL;

-- Migrar data_inicio para enrollment_date se existir
UPDATE subscriptions 
SET enrollment_date = data_inicio 
WHERE data_inicio IS NOT NULL AND enrollment_date IS NULL;

-- ========================================
-- PASSO 4: ATUALIZAR CONSTRAINTS
-- ========================================

-- Atualizar constraint de status para usar valores em inglês
ALTER TABLE subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE subscriptions 
ADD CONSTRAINT subscriptions_status_check 
CHECK (status IN ('active', 'inactive', 'expired'));

-- ========================================
-- PASSO 5: VERIFICAR RESULTADO
-- ========================================

-- Verificar estrutura final
SELECT 
    'ESTRUTURA FINAL' as etapa,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;

-- Verificar dados
SELECT 
    'DADOS' as etapa,
    COUNT(*) as total_subscriptions,
    COUNT(expiration_date) as com_expiration_date,
    COUNT(course_name) as com_course_name,
    COUNT(class_name) as com_class_name
FROM subscriptions;

-- ========================================
-- PASSO 6: RESUMO
-- ========================================

SELECT 
    '✅ TABELA SUBSCRIPTIONS CORRIGIDA!' as status,
    'Colunas adicionadas: expiration_date, course_name, class_name, progress, enrollment_date, created_by' as colunas_adicionadas,
    'Dados migrados de data_expiracao para expiration_date' as migracao_dados,
    'Constraint de status atualizada para valores em inglês' as constraint_atualizada; 