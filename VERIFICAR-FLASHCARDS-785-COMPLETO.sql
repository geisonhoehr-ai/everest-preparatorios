-- =====================================================
-- SCRIPT PARA VERIFICAR SE TODOS OS 785 FLASHCARDS FORAM CRIADOS
-- =====================================================

-- 1. Verificar total de flashcards
SELECT 'TOTAL DE FLASHCARDS' as status, COUNT(*) as total FROM "public"."flashcards";

-- 2. Verificar distribuição por tópico
SELECT 'DISTRIBUIÇÃO POR TÓPICO' as status, 
       t.name as topico, 
       COUNT(f.id) as total_flashcards
FROM "public"."topics" t
LEFT JOIN "public"."flashcards" f ON t.id = f.topic_id
WHERE t.subject_id = (SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1)
GROUP BY t.id, t.name
ORDER BY total_flashcards DESC;

-- 3. Verificar distribuição por dificuldade
SELECT 'DISTRIBUIÇÃO POR DIFICULDADE' as status,
       difficulty,
       COUNT(*) as total_flashcards
FROM "public"."flashcards"
GROUP BY difficulty
ORDER BY difficulty;

-- 4. Verificar se todos os tópicos têm flashcards
SELECT 'TÓPICOS SEM FLASHCARDS' as status,
       t.name as topico
FROM "public"."topics" t
LEFT JOIN "public"."flashcards" f ON t.id = f.topic_id
WHERE t.subject_id = (SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1)
AND f.id IS NULL
ORDER BY t.name;

-- 5. Verificar flashcards por tópico com exemplos
SELECT 'EXEMPLOS DE FLASHCARDS POR TÓPICO' as status,
       t.name as topico,
       f.question,
       f.answer,
       f.difficulty
FROM "public"."topics" t
JOIN "public"."flashcards" f ON t.id = f.topic_id
WHERE t.subject_id = (SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1)
ORDER BY t.name, f.difficulty
LIMIT 20;

-- 6. Verificar se há flashcards duplicados
SELECT 'FLASHCARDS DUPLICADOS' as status,
       question,
       COUNT(*) as total_duplicados
FROM "public"."flashcards"
GROUP BY question
HAVING COUNT(*) > 1
ORDER BY total_duplicados DESC;

-- 7. Verificar estrutura das tabelas
SELECT 'ESTRUTURA DA TABELA FLASHCARDS' as status,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns
WHERE table_name = 'flashcards' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. Verificar se RLS está habilitado
SELECT 'RLS STATUS' as status,
       schemaname,
       tablename,
       rowsecurity
FROM pg_tables
WHERE tablename IN ('flashcards', 'topics', 'subjects')
AND schemaname = 'public';

-- 9. Verificar políticas RLS
SELECT 'POLÍTICAS RLS' as status,
       schemaname,
       tablename,
       policyname,
       permissive,
       roles,
       cmd,
       qual
FROM pg_policies
WHERE tablename IN ('flashcards', 'topics', 'subjects')
AND schemaname = 'public';

-- 10. Verificar usuários que criaram flashcards
SELECT 'USUÁRIOS QUE CRIARAM FLASHCARDS' as status,
       u.email,
       u.role,
       COUNT(f.id) as total_flashcards_criados
FROM "public"."users" u
LEFT JOIN "public"."flashcards" f ON u.id = f.created_by_user_id
GROUP BY u.id, u.email, u.role
ORDER BY total_flashcards_criados DESC;

-- 11. Verificar se há problemas de integridade
SELECT 'PROBLEMAS DE INTEGRIDADE' as status,
       'Flashcards sem tópico' as problema,
       COUNT(*) as total
FROM "public"."flashcards" f
LEFT JOIN "public"."topics" t ON f.topic_id = t.id
WHERE t.id IS NULL

UNION ALL

SELECT 'PROBLEMAS DE INTEGRIDADE' as status,
       'Flashcards sem usuário criador' as problema,
       COUNT(*) as total
FROM "public"."flashcards" f
LEFT JOIN "public"."users" u ON f.created_by_user_id = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 'PROBLEMAS DE INTEGRIDADE' as status,
       'Tópicos sem matéria' as problema,
       COUNT(*) as total
FROM "public"."topics" t
LEFT JOIN "public"."subjects" s ON t.subject_id = s.id
WHERE s.id IS NULL;

-- 12. Verificar performance das consultas
SELECT 'PERFORMANCE - FLASHCARDS POR TÓPICO' as status,
       t.name as topico,
       COUNT(f.id) as total_flashcards,
       AVG(f.difficulty) as dificuldade_media
FROM "public"."topics" t
LEFT JOIN "public"."flashcards" f ON t.id = f.topic_id
WHERE t.subject_id = (SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1)
GROUP BY t.id, t.name
ORDER BY total_flashcards DESC;

-- 13. Verificar se o objetivo de 785 flashcards foi atingido
SELECT 
    CASE 
        WHEN COUNT(*) >= 785 THEN '✅ OBJETIVO ATINGIDO!'
        ELSE '❌ OBJETIVO NÃO ATINGIDO'
    END as status,
    COUNT(*) as total_atual,
    785 as total_esperado,
    (785 - COUNT(*)) as faltando
FROM "public"."flashcards";

-- 14. Resumo final
SELECT 'RESUMO FINAL' as status,
       'Total de flashcards' as metrica,
       COUNT(*)::text as valor
FROM "public"."flashcards"

UNION ALL

SELECT 'RESUMO FINAL' as status,
       'Total de tópicos' as metrica,
       COUNT(*)::text as valor
FROM "public"."topics"
WHERE subject_id = (SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1)

UNION ALL

SELECT 'RESUMO FINAL' as status,
       'Total de matérias' as metrica,
       COUNT(*)::text as valor
FROM "public"."subjects"

UNION ALL

SELECT 'RESUMO FINAL' as status,
       'Dificuldade média' as metrica,
       ROUND(AVG(difficulty), 2)::text as valor
FROM "public"."flashcards";

-- =====================================================
-- RESUMO
-- =====================================================

/*
✅ VERIFICAÇÃO COMPLETA DOS FLASHCARDS!

🎯 VERIFICAÇÕES REALIZADAS:

1. ✅ TOTAL DE FLASHCARDS
2. ✅ DISTRIBUIÇÃO POR TÓPICO
3. ✅ DISTRIBUIÇÃO POR DIFICULDADE
4. ✅ TÓPICOS SEM FLASHCARDS
5. ✅ EXEMPLOS DE FLASHCARDS
6. ✅ FLASHCARDS DUPLICADOS
7. ✅ ESTRUTURA DAS TABELAS
8. ✅ STATUS DO RLS
9. ✅ POLÍTICAS RLS
10. ✅ USUÁRIOS CRIADORES
11. ✅ PROBLEMAS DE INTEGRIDADE
12. ✅ PERFORMANCE
13. ✅ OBJETIVO DE 785 FLASHCARDS
14. ✅ RESUMO FINAL

🚀 Execute este script para verificar se todos os 785 flashcards foram criados!
*/
