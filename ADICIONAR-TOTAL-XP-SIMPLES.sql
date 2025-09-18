-- ========================================
-- ADICIONAR COLUNA TOTAL_XP SIMPLES
-- ========================================
-- Este script adiciona a coluna total_xp de forma simples

-- 1. ADICIONAR COLUNA TOTAL_XP
ALTER TABLE "public"."users" 
ADD COLUMN "total_xp" int4 NOT NULL DEFAULT 0;

-- 2. VERIFICAR SE FOI ADICIONADA
SELECT 'COLUNA TOTAL_XP ADICIONADA!' as status;

-- 3. VER ESTRUTURA DA TABELA
SELECT 'ESTRUTURA DA TABELA USERS' as status,
       column_name,
       data_type,
       is_nullable,
       column_default
FROM information_schema.columns
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
