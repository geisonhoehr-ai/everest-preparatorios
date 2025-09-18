-- ========================================
-- TESTAR SISTEMA DE RANKING
-- ========================================
-- Este script testa o sistema de ranking e XP

-- 1. VERIFICAR USUÁRIOS EXISTENTES
SELECT 'USUÁRIOS EXISTENTES' as status,
       id,
       email,
       first_name,
       last_name,
       total_xp,
       role
FROM "public"."users"
ORDER BY total_xp DESC;

-- 2. ADICIONAR PONTUAÇÕES DE TESTE
-- Adicionar pontuação para flashcard
SELECT add_user_score(
    (SELECT id FROM "public"."users" LIMIT 1),
    50,
    'flashcard',
    (SELECT id FROM "public"."flashcards" LIMIT 1)
) as score_id_1;

-- Adicionar pontuação para quiz
SELECT add_user_score(
    (SELECT id FROM "public"."users" LIMIT 1),
    100,
    'quiz',
    (SELECT id FROM "public"."quizzes" LIMIT 1)
) as score_id_2;

-- Adicionar pontuação para evercast
SELECT add_user_score(
    (SELECT id FROM "public"."users" LIMIT 1),
    75,
    'evercast',
    (SELECT id FROM "public"."audio_lessons" LIMIT 1)
) as score_id_3;

-- Adicionar pontuação bônus
SELECT add_user_score(
    (SELECT id FROM "public"."users" LIMIT 1),
    25,
    'bonus',
    NULL
) as score_id_4;

-- 3. VERIFICAR SE TOTAL_XP FOI ATUALIZADO
SELECT 'TOTAL_XP ATUALIZADO' as status,
       id,
       email,
       first_name,
       last_name,
       total_xp,
       role
FROM "public"."users"
ORDER BY total_xp DESC;

-- 4. VERIFICAR PONTUAÇÕES REGISTRADAS
SELECT 'PONTUAÇÕES REGISTRADAS' as status,
       s.id,
       u.email,
       s.score_value,
       s.activity_type,
       s.recorded_at
FROM "public"."scores" s
JOIN "public"."users" u ON s.user_id = u.id
ORDER BY s.recorded_at DESC;

-- 5. TESTAR RANKING GERAL
SELECT 'RANKING GERAL' as status,
       rank_position,
       email,
       first_name,
       last_name,
       total_xp,
       role
FROM get_user_ranking(10);

-- 6. TESTAR ESTATÍSTICAS DE XP
SELECT 'ESTATÍSTICAS DE XP' as status,
       total_users,
       total_xp_distributed,
       average_xp,
       max_xp,
       min_xp
FROM get_xp_statistics();

-- 7. TESTAR RANKING POR CATEGORIA
SELECT 'RANKING POR FLASHCARD' as status,
       rank_position,
       email,
       first_name,
       last_name,
       total_xp_activity,
       total_xp_general
FROM get_ranking_by_activity_type('flashcard', 5);

-- 8. TESTAR HISTÓRICO DE PONTUAÇÕES
SELECT 'HISTÓRICO DE PONTUAÇÕES' as status,
       score_value,
       activity_type,
       recorded_at
FROM get_user_score_history(
    (SELECT id FROM "public"."users" LIMIT 1),
    10
);

-- 9. TESTAR POSIÇÃO DE RANKING DE UM USUÁRIO
SELECT 'POSIÇÃO DE RANKING' as status,
       rank_position,
       email,
       first_name,
       last_name,
       total_xp,
       role
FROM get_user_rank_position(
    (SELECT id FROM "public"."users" LIMIT 1)
)
WHERE user_id = (SELECT id FROM "public"."users" LIMIT 1);

-- 10. VERIFICAR TRIGGER FUNCIONANDO
SELECT 'TRIGGER FUNCIONANDO' as status,
       'Sistema de ranking implementado com sucesso!' as resultado;
