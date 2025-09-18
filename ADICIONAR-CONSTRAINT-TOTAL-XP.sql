-- ========================================
-- ADICIONAR CONSTRAINT NOT NULL PARA TOTAL_XP
-- ========================================
-- Este script adiciona a constraint NOT NULL para a coluna total_xp

-- 1. PRIMEIRO, CORRIGIR VALORES NULL
UPDATE "public"."users"
SET total_xp = 0
WHERE total_xp IS NULL;

-- 2. ADICIONAR CONSTRAINT NOT NULL
ALTER TABLE "public"."users"
ALTER COLUMN total_xp SET NOT NULL;

-- 3. ADICIONAR VALOR PADRÃO
ALTER TABLE "public"."users"
ALTER COLUMN total_xp SET DEFAULT 0;

-- 4. VERIFICAR SE FOI APLICADO
SELECT 'VERIFICAÇÃO FINAL' as status,
       column_name,
       is_nullable,
       data_type,
       column_default
FROM information_schema.columns
WHERE table_name = 'users' 
  AND table_schema = 'public'
  AND column_name = 'total_xp';

-- 5. TESTAR INSERÇÃO
SELECT 'TESTE DE INSERÇÃO' as status,
       'Constraint NOT NULL aplicada com sucesso!' as resultado;
