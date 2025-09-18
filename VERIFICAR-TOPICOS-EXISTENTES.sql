-- =====================================================
-- VERIFICAR QUAIS TÓPICOS EXISTEM NO BANCO
-- =====================================================

-- 1. Verificar todos os tópicos
SELECT 'TÓPICOS EXISTENTES' as status, 
       t.name as topico,
       s.name as materia
FROM "public"."topics" t
JOIN "public"."subjects" s ON t.subject_id = s.id
ORDER BY s.name, t.name;

-- 2. Verificar tópicos específicos que o script está tentando usar
SELECT 'VERIFICAR TÓPICOS DO SCRIPT' as status,
       CASE 
           WHEN EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Acentuação Gráfica') THEN '✅ EXISTE'
           ELSE '❌ NÃO EXISTE'
       END as "Acentuação Gráfica",
       CASE 
           WHEN EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Morfologia: Classes de Palavras') THEN '✅ EXISTE'
           ELSE '❌ NÃO EXISTE'
       END as "Morfologia: Classes de Palavras",
       CASE 
           WHEN EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Sintaxe: Período Composto') THEN '✅ EXISTE'
           ELSE '❌ NÃO EXISTE'
       END as "Sintaxe: Período Composto",
       CASE 
           WHEN EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Fonetica e Fonologia') THEN '✅ EXISTE'
           ELSE '❌ NÃO EXISTE'
       END as "Fonetica e Fonologia";

-- 3. Verificar IDs dos tópicos
SELECT 'IDs DOS TÓPICOS' as status,
       t.name as topico,
       t.id as topic_id
FROM "public"."topics" t
WHERE t.name IN (
    'Acentuação Gráfica',
    'Morfologia: Classes de Palavras', 
    'Sintaxe: Período Composto',
    'Fonetica e Fonologia'
)
ORDER BY t.name;

-- 4. Verificar se há usuários
SELECT 'USUÁRIOS DISPONÍVEIS' as status,
       COUNT(*) as total_users
FROM "public"."users";

-- 5. Verificar se há matérias
SELECT 'MATÉRIAS DISPONÍVEIS' as status,
       COUNT(*) as total_subjects
FROM "public"."subjects";
