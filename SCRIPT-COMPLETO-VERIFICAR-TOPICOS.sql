-- =====================================================
-- SCRIPT COMPLETO PARA VERIFICAR TÓPICOS
-- =====================================================

-- 1. Ver todos os tópicos de Português
SELECT 'TÓPICOS DE PORTUGUÊS' as status, 
       t.name as topico
FROM "public"."topics" t
JOIN "public"."subjects" s ON t.subject_id = s.id
WHERE s.name = 'Português'
ORDER BY t.name;

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

-- 3. Verificar se há usuários
SELECT 'USUÁRIOS DISPONÍVEIS' as status,
       COUNT(*) as total_users
FROM "public"."users";
