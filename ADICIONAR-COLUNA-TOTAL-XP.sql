-- ========================================
-- ADICIONAR COLUNA TOTAL_XP NA TABELA USERS
-- ========================================
-- Este script adiciona a coluna total_xp na tabela users

-- 1. VERIFICAR SE A COLUNA TOTAL_XP JÁ EXISTE
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

-- 2. ADICIONAR COLUNA TOTAL_XP SE NÃO EXISTIR
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
        
        RAISE NOTICE 'Coluna total_xp adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna total_xp já existe!';
    END IF;
END $$;

-- 3. VERIFICAR SE FOI ADICIONADA
SELECT 'VERIFICAR COLUNA ADICIONADA' as status,
       column_name,
       data_type,
       is_nullable,
       column_default
FROM information_schema.columns
WHERE table_name = 'users' 
  AND table_schema = 'public'
  AND column_name = 'total_xp';

-- 4. VERIFICAR DADOS APÓS ADIÇÃO
SELECT 'DADOS APÓS ADIÇÃO' as status,
       COUNT(*) as total_users,
       COUNT(total_xp) as users_com_xp,
       COUNT(*) - COUNT(total_xp) as users_sem_xp
FROM "public"."users";

-- 5. VER PRIMEIROS USUÁRIOS COM TOTAL_XP
SELECT 'USUÁRIOS COM TOTAL_XP' as status,
       id,
       email,
       first_name,
       last_name,
       total_xp,
       role
FROM "public"."users"
ORDER BY created_at
LIMIT 5;
