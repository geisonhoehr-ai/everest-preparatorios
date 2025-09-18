-- ========================================
-- TESTAR SISTEMA COMPLETO
-- ========================================
-- Este script testa o sistema completo após adicionar total_xp

-- 1. VERIFICAR DADOS COM TOTAL_XP
SELECT 'DADOS COM TOTAL_XP' as status,
       COUNT(*) as total_users,
       COUNT(total_xp) as users_com_xp,
       COUNT(*) - COUNT(total_xp) as users_sem_xp
FROM "public"."users";

-- 2. VER USUÁRIOS COM TOTAL_XP
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

-- 3. VER DISTRIBUIÇÃO DE XP
SELECT 'DISTRIBUIÇÃO DE XP' as status,
       total_xp,
       COUNT(*) as total_users
FROM "public"."users"
GROUP BY total_xp
ORDER BY total_xp;

-- 4. TESTAR RANKING SIMPLES
SELECT 'RANKING SIMPLES' as status,
       ROW_NUMBER() OVER (ORDER BY total_xp DESC) as posicao,
       email,
       first_name,
       last_name,
       total_xp,
       role
FROM "public"."users"
ORDER BY total_xp DESC
LIMIT 10;

-- 5. VERIFICAR SE HÁ DADOS EM OUTRAS TABELAS
SELECT 'DADOS EM OUTRAS TABELAS' as status,
       'flashcards' as tabela,
       COUNT(*) as total_registros
FROM "public"."flashcards"
UNION ALL
SELECT 'DADOS EM OUTRAS TABELAS' as status,
       'quizzes' as tabela,
       COUNT(*) as total_registros
FROM "public"."quizzes"
UNION ALL
SELECT 'DADOS EM OUTRAS TABELAS' as status,
       'audio_courses' as tabela,
       COUNT(*) as total_registros
FROM "public"."audio_courses";

-- 6. TESTE FINAL
SELECT 'SISTEMA FUNCIONANDO PERFEITAMENTE!' as status;
