-- ========================================
-- CRIAR TABELA RPG_RANKS
-- ========================================
-- Este script cria a tabela rpg_ranks se ela não existir

-- 1. VERIFICAR SE A TABELA EXISTE
SELECT 'VERIFICAR TABELA RPG_RANKS' as status,
       CASE 
           WHEN EXISTS (
               SELECT 1 
               FROM information_schema.tables 
               WHERE table_name = 'rpg_ranks' 
                 AND table_schema = 'public'
           ) THEN 'EXISTE'
           ELSE 'NÃO EXISTE'
       END as status_tabela;

-- 2. CRIAR TABELA RPG_RANKS SE NÃO EXISTIR
CREATE TABLE IF NOT EXISTS "public"."rpg_ranks" (
    "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    "category" varchar NOT NULL,
    "level" int4 NOT NULL,
    "title" varchar NOT NULL,
    "insignia" varchar,
    "blessing" text,
    "xp_required" int4 NOT NULL DEFAULT 0,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now()
);

-- 3. CRIAR ÍNDICES PARA PERFORMANCE
CREATE UNIQUE INDEX IF NOT EXISTS "rpg_ranks_category_level_idx" ON "public"."rpg_ranks" USING btree ("category", "level");
CREATE INDEX IF NOT EXISTS "rpg_ranks_category_idx" ON "public"."rpg_ranks" USING btree ("category");
CREATE INDEX IF NOT EXISTS "rpg_ranks_xp_required_idx" ON "public"."rpg_ranks" USING btree ("xp_required");

-- 4. ADICIONAR COMENTÁRIOS
COMMENT ON TABLE "public"."rpg_ranks" IS 'Define os diferentes ranks de RPG que os usuários podem alcançar com base na experiência';
COMMENT ON COLUMN "public"."rpg_ranks"."category" IS 'Categoria do rank (e.g., general, flashcard, quiz)';
COMMENT ON COLUMN "public"."rpg_ranks"."level" IS 'Nível do rank dentro da categoria';
COMMENT ON COLUMN "public"."rpg_ranks"."title" IS 'Nome do rank';
COMMENT ON COLUMN "public"."rpg_ranks"."insignia" IS 'Emoji ou símbolo visual do rank';
COMMENT ON COLUMN "public"."rpg_ranks"."blessing" IS 'Mensagem inspiradora associada ao rank';
COMMENT ON COLUMN "public"."rpg_ranks"."xp_required" IS 'Pontos de experiência necessários para este rank';

-- 5. VERIFICAR SE FOI CRIADA
SELECT 'TABELA RPG_RANKS CRIADA COM SUCESSO!' as status;
