-- ========================================
-- IMPLEMENTAR SISTEMA DE RANKING COMPLETO
-- ========================================
-- Este script implementa o sistema completo de ranking e XP

-- 1. CRIAR TABELA DE PONTUAÇÕES (SCORES)
CREATE TABLE IF NOT EXISTS "public"."scores" (
    "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "score_value" int4 NOT NULL,
    "activity_type" varchar NOT NULL, -- 'flashcard', 'quiz', 'evercast', 'bonus'
    "activity_id" uuid, -- ID da atividade específica
    "recorded_at" timestamp NOT NULL DEFAULT now(),
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now()
);

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS "scores_user_id_idx" ON "public"."scores" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "scores_activity_type_idx" ON "public"."scores" USING btree ("activity_type");
CREATE INDEX IF NOT EXISTS "scores_recorded_at_idx" ON "public"."scores" USING btree ("recorded_at");

-- 3. CRIAR FUNÇÃO PARA ATUALIZAR TOTAL_XP
CREATE OR REPLACE FUNCTION update_user_total_xp()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar total_xp do usuário
    UPDATE "public"."users"
    SET total_xp = total_xp + NEW.score_value,
        updated_at = now()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. CRIAR TRIGGER PARA ATUALIZAR TOTAL_XP AUTOMATICAMENTE
DROP TRIGGER IF EXISTS trigger_update_total_xp ON "public"."scores";
CREATE TRIGGER trigger_update_total_xp
    AFTER INSERT ON "public"."scores"
    FOR EACH ROW
    EXECUTE FUNCTION update_user_total_xp();

-- 5. CRIAR FUNÇÃO PARA ADICIONAR PONTUAÇÃO
CREATE OR REPLACE FUNCTION add_user_score(
    p_user_id uuid,
    p_score_value int4,
    p_activity_type varchar,
    p_activity_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
    new_score_id uuid;
BEGIN
    -- Inserir nova pontuação
    INSERT INTO "public"."scores" (
        user_id,
        score_value,
        activity_type,
        activity_id
    ) VALUES (
        p_user_id,
        p_score_value,
        p_activity_type,
        p_activity_id
    ) RETURNING id INTO new_score_id;
    
    RETURN new_score_id;
END;
$$ LANGUAGE plpgsql;

-- 6. CRIAR FUNÇÃO PARA OBTER RANKING
CREATE OR REPLACE FUNCTION get_user_ranking(
    p_limit int4 DEFAULT 10
)
RETURNS TABLE (
    rank_position bigint,
    user_id uuid,
    email varchar,
    first_name varchar,
    last_name varchar,
    total_xp int4,
    role user_role
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY u.total_xp DESC) as rank_position,
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.total_xp,
        u.role
    FROM "public"."users" u
    WHERE u.is_active = true
    ORDER BY u.total_xp DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 7. CRIAR FUNÇÃO PARA OBTER RANKING DE UM USUÁRIO ESPECÍFICO
CREATE OR REPLACE FUNCTION get_user_rank_position(p_user_id uuid)
RETURNS TABLE (
    rank_position bigint,
    user_id uuid,
    email varchar,
    first_name varchar,
    last_name varchar,
    total_xp int4,
    role user_role
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY u.total_xp DESC) as rank_position,
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.total_xp,
        u.role
    FROM "public"."users" u
    WHERE u.is_active = true
    ORDER BY u.total_xp DESC;
END;
$$ LANGUAGE plpgsql;

-- 8. CRIAR FUNÇÃO PARA OBTER ESTATÍSTICAS DE XP
CREATE OR REPLACE FUNCTION get_xp_statistics()
RETURNS TABLE (
    total_users bigint,
    total_xp_distributed bigint,
    average_xp numeric,
    max_xp int4,
    min_xp int4
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_users,
        SUM(u.total_xp) as total_xp_distributed,
        ROUND(AVG(u.total_xp), 2) as average_xp,
        MAX(u.total_xp) as max_xp,
        MIN(u.total_xp) as min_xp
    FROM "public"."users" u
    WHERE u.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- 9. CRIAR FUNÇÃO PARA OBTER HISTÓRICO DE PONTUAÇÕES
CREATE OR REPLACE FUNCTION get_user_score_history(
    p_user_id uuid,
    p_limit int4 DEFAULT 20
)
RETURNS TABLE (
    id uuid,
    score_value int4,
    activity_type varchar,
    activity_id uuid,
    recorded_at timestamp
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.score_value,
        s.activity_type,
        s.activity_id,
        s.recorded_at
    FROM "public"."scores" s
    WHERE s.user_id = p_user_id
    ORDER BY s.recorded_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 10. CRIAR FUNÇÃO PARA OBTER RANKING POR CATEGORIA
CREATE OR REPLACE FUNCTION get_ranking_by_activity_type(
    p_activity_type varchar,
    p_limit int4 DEFAULT 10
)
RETURNS TABLE (
    rank_position bigint,
    user_id uuid,
    email varchar,
    first_name varchar,
    last_name varchar,
    total_xp_activity bigint,
    total_xp_general int4
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY SUM(s.score_value) DESC) as rank_position,
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        SUM(s.score_value) as total_xp_activity,
        u.total_xp as total_xp_general
    FROM "public"."users" u
    JOIN "public"."scores" s ON u.id = s.user_id
    WHERE s.activity_type = p_activity_type
      AND u.is_active = true
    GROUP BY u.id, u.email, u.first_name, u.last_name, u.total_xp
    ORDER BY SUM(s.score_value) DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 11. ADICIONAR COMENTÁRIOS
COMMENT ON TABLE "public"."scores" IS 'Armazena as pontuações individuais obtidas pelos usuários em diferentes atividades';
COMMENT ON COLUMN "public"."scores"."user_id" IS 'Referência ao usuário que obteve a pontuação';
COMMENT ON COLUMN "public"."scores"."score_value" IS 'Valor da pontuação obtida';
COMMENT ON COLUMN "public"."scores"."activity_type" IS 'Tipo de atividade: flashcard, quiz, evercast, bonus';
COMMENT ON COLUMN "public"."scores"."activity_id" IS 'ID da atividade específica (opcional)';
COMMENT ON COLUMN "public"."scores"."recorded_at" IS 'Data e hora em que a pontuação foi registrada';

-- 12. TESTAR O SISTEMA
SELECT 'SISTEMA DE RANKING CRIADO COM SUCESSO!' as status;
