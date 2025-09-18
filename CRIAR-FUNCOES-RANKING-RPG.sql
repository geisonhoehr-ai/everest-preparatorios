-- ========================================
-- CRIAR FUNÇÕES DE RANKING RPG
-- ========================================
-- Este script cria funções para o sistema de ranking RPG

-- 1. FUNÇÃO PARA OBTER RANK ATUAL DO USUÁRIO
CREATE OR REPLACE FUNCTION get_user_current_rank(
    p_user_id uuid,
    p_category varchar DEFAULT 'general'
)
RETURNS TABLE (
    rank_id uuid,
    category varchar,
    level int4,
    title varchar,
    insignia varchar,
    blessing text,
    xp_required int4,
    user_xp int4,
    xp_to_next_rank int4
) AS $$
DECLARE
    user_total_xp int4;
BEGIN
    -- Obter XP total do usuário
    SELECT total_xp INTO user_total_xp
    FROM "public"."users"
    WHERE id = p_user_id;
    
    -- Retornar rank atual baseado no XP
    RETURN QUERY
    SELECT 
        r.id as rank_id,
        r.category,
        r.level,
        r.title,
        r.insignia,
        r.blessing,
        r.xp_required,
        user_total_xp as user_xp,
        CASE 
            WHEN r.xp_required <= user_total_xp THEN 0
            ELSE r.xp_required - user_total_xp
        END as xp_to_next_rank
    FROM "public"."rpg_ranks" r
    WHERE r.category = p_category
      AND r.xp_required <= user_total_xp
    ORDER BY r.level DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 2. FUNÇÃO PARA OBTER PRÓXIMO RANK DO USUÁRIO
CREATE OR REPLACE FUNCTION get_user_next_rank(
    p_user_id uuid,
    p_category varchar DEFAULT 'general'
)
RETURNS TABLE (
    rank_id uuid,
    category varchar,
    level int4,
    title varchar,
    insignia varchar,
    blessing text,
    xp_required int4,
    user_xp int4,
    xp_needed int4
) AS $$
DECLARE
    user_total_xp int4;
BEGIN
    -- Obter XP total do usuário
    SELECT total_xp INTO user_total_xp
    FROM "public"."users"
    WHERE id = p_user_id;
    
    -- Retornar próximo rank
    RETURN QUERY
    SELECT 
        r.id as rank_id,
        r.category,
        r.level,
        r.title,
        r.insignia,
        r.blessing,
        r.xp_required,
        user_total_xp as user_xp,
        r.xp_required - user_total_xp as xp_needed
    FROM "public"."rpg_ranks" r
    WHERE r.category = p_category
      AND r.xp_required > user_total_xp
    ORDER BY r.level ASC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 3. FUNÇÃO PARA OBTER PROGRESSO DO USUÁRIO
CREATE OR REPLACE FUNCTION get_user_rank_progress(
    p_user_id uuid,
    p_category varchar DEFAULT 'general'
)
RETURNS TABLE (
    current_rank_title varchar,
    current_rank_insignia varchar,
    current_rank_level int4,
    next_rank_title varchar,
    next_rank_insignia varchar,
    next_rank_level int4,
    user_xp int4,
    current_rank_xp int4,
    next_rank_xp int4,
    progress_percentage numeric,
    xp_to_next_rank int4
) AS $$
DECLARE
    user_total_xp int4;
    current_rank_xp int4;
    next_rank_xp int4;
BEGIN
    -- Obter XP total do usuário
    SELECT total_xp INTO user_total_xp
    FROM "public"."users"
    WHERE id = p_user_id;
    
    -- Obter XP do rank atual
    SELECT COALESCE(MAX(xp_required), 0) INTO current_rank_xp
    FROM "public"."rpg_ranks"
    WHERE category = p_category
      AND xp_required <= user_total_xp;
    
    -- Obter XP do próximo rank
    SELECT COALESCE(MIN(xp_required), current_rank_xp) INTO next_rank_xp
    FROM "public"."rpg_ranks"
    WHERE category = p_category
      AND xp_required > user_total_xp;
    
    -- Se não há próximo rank, usar o atual
    IF next_rank_xp IS NULL THEN
        next_rank_xp := current_rank_xp;
    END IF;
    
    -- Retornar progresso
    RETURN QUERY
    SELECT 
        cr.title as current_rank_title,
        cr.insignia as current_rank_insignia,
        cr.level as current_rank_level,
        nr.title as next_rank_title,
        nr.insignia as next_rank_insignia,
        nr.level as next_rank_level,
        user_total_xp as user_xp,
        current_rank_xp,
        next_rank_xp,
        CASE 
            WHEN next_rank_xp = current_rank_xp THEN 100.0
            ELSE ROUND(((user_total_xp - current_rank_xp)::numeric / (next_rank_xp - current_rank_xp)::numeric) * 100, 2)
        END as progress_percentage,
        CASE 
            WHEN next_rank_xp = current_rank_xp THEN 0
            ELSE next_rank_xp - user_total_xp
        END as xp_to_next_rank
    FROM "public"."rpg_ranks" cr
    LEFT JOIN "public"."rpg_ranks" nr ON nr.category = p_category AND nr.level = cr.level + 1
    WHERE cr.category = p_category
      AND cr.xp_required = current_rank_xp
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 4. FUNÇÃO PARA OBTER RANKING COM RANKS
CREATE OR REPLACE FUNCTION get_ranking_with_ranks(
    p_category varchar DEFAULT 'general',
    p_limit int4 DEFAULT 10
)
RETURNS TABLE (
    rank_position bigint,
    user_id uuid,
    email varchar,
    first_name varchar,
    last_name varchar,
    total_xp int4,
    rank_title varchar,
    rank_insignia varchar,
    rank_level int4
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
        r.title as rank_title,
        r.insignia as rank_insignia,
        r.level as rank_level
    FROM "public"."users" u
    LEFT JOIN "public"."rpg_ranks" r ON r.category = p_category 
        AND r.xp_required = (
            SELECT MAX(xp_required)
            FROM "public"."rpg_ranks" r2
            WHERE r2.category = p_category
              AND r2.xp_required <= u.total_xp
        )
    WHERE u.is_active = true
    ORDER BY u.total_xp DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 5. FUNÇÃO PARA OBTER ESTATÍSTICAS DE RANKING
CREATE OR REPLACE FUNCTION get_ranking_statistics()
RETURNS TABLE (
    total_users bigint,
    total_xp_distributed bigint,
    average_xp numeric,
    max_xp int4,
    min_xp int4,
    users_with_ranks bigint,
    top_rank_title varchar,
    top_rank_insignia varchar
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_users,
        SUM(u.total_xp) as total_xp_distributed,
        ROUND(AVG(u.total_xp), 2) as average_xp,
        MAX(u.total_xp) as max_xp,
        MIN(u.total_xp) as min_xp,
        COUNT(r.id) as users_with_ranks,
        r.title as top_rank_title,
        r.insignia as top_rank_insignia
    FROM "public"."users" u
    LEFT JOIN "public"."rpg_ranks" r ON r.category = 'general' 
        AND r.xp_required = (
            SELECT MAX(xp_required)
            FROM "public"."rpg_ranks" r2
            WHERE r2.category = 'general'
              AND r2.xp_required <= u.total_xp
        )
    WHERE u.is_active = true
    GROUP BY r.title, r.insignia
    ORDER BY MAX(u.total_xp) DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 6. FUNÇÃO PARA OBTER RANKS DISPONÍVEIS
CREATE OR REPLACE FUNCTION get_available_ranks(
    p_category varchar DEFAULT 'general'
)
RETURNS TABLE (
    level int4,
    title varchar,
    insignia varchar,
    blessing text,
    xp_required int4
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.level,
        r.title,
        r.insignia,
        r.blessing,
        r.xp_required
    FROM "public"."rpg_ranks" r
    WHERE r.category = p_category
    ORDER BY r.level ASC;
END;
$$ LANGUAGE plpgsql;

-- 7. VERIFICAR FUNÇÕES CRIADAS
SELECT 'FUNÇÕES DE RANKING RPG CRIADAS COM SUCESSO!' as status;
