-- ========================================
-- SOLUÇÃO ALTERNATIVA PARA TOTAL_XP
-- ========================================
-- Este script resolve o problema de forma alternativa

-- OPÇÃO 1: REMOVER A COLUNA E RECRIAR
-- (Execute apenas se a primeira opção não funcionar)

-- 1. Verificar se a coluna existe
SELECT 'VERIFICAR COLUNA TOTAL_XP' as status,
       CASE 
           WHEN EXISTS (
               SELECT 1 
               FROM information_schema.columns 
               WHERE table_name = 'users' 
                 AND table_schema = 'public' 
                 AND column_name = 'total_xp'
           ) THEN 'EXISTE'
           ELSE 'NÃO EXISTE'
       END as status_coluna;

-- 2. Se a coluna existir, remover e recriar
DO $$
BEGIN
    -- Verificar se a coluna existe
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
          AND table_schema = 'public' 
          AND column_name = 'total_xp'
    ) THEN
        -- Remover a coluna
        ALTER TABLE "public"."users" DROP COLUMN IF EXISTS "total_xp";
        RAISE NOTICE 'Coluna total_xp removida';
        
        -- Recriar a coluna com valor padrão
        ALTER TABLE "public"."users" 
        ADD COLUMN "total_xp" int4 NOT NULL DEFAULT 0;
        RAISE NOTICE 'Coluna total_xp recriada com valor padrão 0';
    ELSE
        -- Criar a coluna se não existir
        ALTER TABLE "public"."users" 
        ADD COLUMN "total_xp" int4 NOT NULL DEFAULT 0;
        RAISE NOTICE 'Coluna total_xp criada com valor padrão 0';
    END IF;
END $$;

-- 3. Verificar resultado
SELECT 'VERIFICAÇÃO FINAL' as status,
       COUNT(*) as total_users,
       COUNT(total_xp) as users_com_xp,
       COUNT(*) - COUNT(total_xp) as users_sem_xp
FROM "public"."users";

-- 4. Ver distribuição de XP
SELECT 'DISTRIBUIÇÃO DE XP' as status,
       total_xp,
       COUNT(*) as total_users
FROM "public"."users"
GROUP BY total_xp
ORDER BY total_xp;

-- 5. Verificar constraint
SELECT 'VERIFICAR CONSTRAINT FINAL' as status,
       column_name,
       is_nullable,
       data_type,
       column_default
FROM information_schema.columns
WHERE table_name = 'users' 
  AND table_schema = 'public'
  AND column_name = 'total_xp';
