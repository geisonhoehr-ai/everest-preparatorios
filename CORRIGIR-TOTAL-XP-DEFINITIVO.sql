-- ========================================
-- CORRIGIR TOTAL_XP DEFINITIVAMENTE
-- ========================================
-- Este script resolve definitivamente o problema da coluna total_xp

-- 1. VERIFICAR O PROBLEMA ATUAL
SELECT 'PROBLEMA ATUAL' as status,
       COUNT(*) as total_users,
       COUNT(total_xp) as users_com_xp,
       COUNT(*) - COUNT(total_xp) as users_sem_xp
FROM "public"."users";

-- 2. VER USUÁRIOS COM TOTAL_XP NULL
SELECT 'USUÁRIOS COM TOTAL_XP NULL' as status,
       id,
       email,
       total_xp,
       created_at
FROM "public"."users"
WHERE total_xp IS NULL
ORDER BY created_at;

-- 3. CORRIGIR VALORES NULL PARA 0 (SE A COLUNA EXISTIR)
UPDATE "public"."users"
SET total_xp = 0
WHERE total_xp IS NULL;

-- 4. SE A COLUNA NÃO EXISTIR, CRIAR COM VALOR PADRÃO
-- (Este comando será executado apenas se a coluna não existir)
DO $$
BEGIN
    -- Verificar se a coluna existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
          AND table_schema = 'public' 
          AND column_name = 'total_xp'
    ) THEN
        -- Adicionar coluna com valor padrão
        ALTER TABLE "public"."users" 
        ADD COLUMN "total_xp" int4 NOT NULL DEFAULT 0;
        
        RAISE NOTICE 'Coluna total_xp criada com valor padrão 0';
    ELSE
        RAISE NOTICE 'Coluna total_xp já existe';
    END IF;
END $$;

-- 5. VERIFICAR SE FOI CORRIGIDO
SELECT 'VERIFICAÇÃO APÓS CORREÇÃO' as status,
       COUNT(*) as total_users,
       COUNT(total_xp) as users_com_xp,
       COUNT(*) - COUNT(total_xp) as users_sem_xp
FROM "public"."users";

-- 6. VER DISTRIBUIÇÃO DE XP
SELECT 'DISTRIBUIÇÃO DE XP' as status,
       total_xp,
       COUNT(*) as total_users
FROM "public"."users"
GROUP BY total_xp
ORDER BY total_xp;

-- 7. VERIFICAR CONSTRAINT
SELECT 'VERIFICAR CONSTRAINT' as status,
       column_name,
       is_nullable,
       data_type,
       column_default
FROM information_schema.columns
WHERE table_name = 'users' 
  AND table_schema = 'public'
  AND column_name = 'total_xp';
