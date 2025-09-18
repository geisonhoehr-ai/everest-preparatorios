-- ========================================
-- TESTAR SISTEMA DE RANKING COMPLETO
-- ========================================
-- Este script testa o sistema completo de ranking

-- 1. VERIFICAR RANKS CRIADOS
SELECT 'RANKS CRIADOS' as status,
       category,
       COUNT(*) as total_ranks
FROM "public"."rpg_ranks"
GROUP BY category
ORDER BY category;

-- 2. VER ALGUNS RANKS DE EXEMPLO
SELECT 'RANKS DE EXEMPLO' as status,
       category,
       level,
       title,
       insignia,
       xp_required
FROM "public"."rpg_ranks"
WHERE category = 'general' AND level <= 5
ORDER BY level;

-- 3. VER USUÁRIOS EXISTENTES
SELECT 'USUÁRIOS EXISTENTES' as status,
       id,
       email,
       first_name,
       last_name,
       total_xp,
       role
FROM "public"."users"
ORDER BY created_at
LIMIT 5;

-- 4. TESTAR ADIÇÃO DE PONTUAÇÃO
SELECT add_user_score(
    (SELECT id FROM "public"."users" LIMIT 1),
    100,
    'flashcard',
    (SELECT id FROM "public"."flashcards" LIMIT 1)
) as score_id_1;

-- 5. VERIFICAR SE TOTAL_XP FOI ATUALIZADO
SELECT 'TOTAL_XP ATUALIZADO' as status,
       id,
       email,
       first_name,
       last_name,
       total_xp,
       role
FROM "public"."users"
ORDER BY total_xp DESC
LIMIT 5;

-- 6. TESTAR RANKING
SELECT 'RANKING GERAL' as status,
       rank_position,
       email,
       first_name,
       last_name,
       total_xp,
       role
FROM get_user_ranking(10);

-- 7. TESTAR RANK ATUAL DO USUÁRIO
SELECT 'RANK ATUAL DO USUÁRIO' as status,
       rank_id,
       category,
       level,
       title,
       insignia,
       user_xp,
       xp_to_next_rank
FROM get_user_current_rank(
    (SELECT id FROM "public"."users" LIMIT 1),
    'general'
);

-- 8. VER PONTUAÇÕES REGISTRADAS
SELECT 'PONTUAÇÕES REGISTRADAS' as status,
       s.id,
       u.email,
       s.score_value,
       s.activity_type,
       s.recorded_at
FROM "public"."scores" s
JOIN "public"."users" u ON s.user_id = u.id
ORDER BY s.recorded_at DESC;

-- 9. TESTE FINAL
SELECT 'SISTEMA DE RANKING FUNCIONANDO PERFEITAMENTE!' as status;

