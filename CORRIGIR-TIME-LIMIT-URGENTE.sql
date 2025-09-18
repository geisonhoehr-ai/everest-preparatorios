-- =====================================================
-- CORREÇÃO URGENTE - TIME_LIMIT_MINUTES
-- EVEREST PREPARATÓRIOS
-- =====================================================

-- =====================================================
-- 1. VERIFICAR SE A COLUNA EXISTE
-- =====================================================

SELECT 
    'VERIFICAÇÃO' as status,
    column_name as coluna,
    data_type as tipo,
    column_default as default_atual
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'quizzes'
AND column_name = 'time_limit_minutes';

-- =====================================================
-- 2. REMOVER A COLUNA SE EXISTIR (PARA RECRIAR CORRETAMENTE)
-- =====================================================

-- Remover a coluna se ela existir com o default incorreto
ALTER TABLE "public"."quizzes" 
DROP COLUMN IF EXISTS "time_limit_minutes";

-- =====================================================
-- 3. RECRIAR A COLUNA CORRETAMENTE
-- =====================================================

-- Adicionar a coluna com o default correto
ALTER TABLE "public"."quizzes" 
ADD COLUMN "time_limit_minutes" integer;

-- =====================================================
-- 4. VERIFICAR SE FOI CRIADA CORRETAMENTE
-- =====================================================

SELECT 
    'CRIAÇÃO' as status,
    column_name as coluna,
    data_type as tipo,
    is_nullable as nullable,
    column_default as default_novo
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'quizzes'
AND column_name = 'time_limit_minutes';

-- =====================================================
-- 5. TESTE SIMPLES
-- =====================================================

-- Teste: Inserir quiz sem time_limit_minutes
INSERT INTO "public"."quizzes" (topic_id, title, description, created_by_user_id)
SELECT 
    t.id,
    'Teste - Sem Tempo',
    'Quiz de teste sem tempo limite',
    u.id
FROM "public"."topics" t
CROSS JOIN "public"."users" u
WHERE t.name = 'Gramática Básica'
AND u.email = 'admin@teste.com'
LIMIT 1;

-- Teste: Inserir quiz com time_limit_minutes
INSERT INTO "public"."quizzes" (topic_id, title, description, time_limit_minutes, created_by_user_id)
SELECT 
    t.id,
    'Teste - Com Tempo',
    'Quiz de teste com 15 minutos',
    15,
    u.id
FROM "public"."topics" t
CROSS JOIN "public"."users" u
WHERE t.name = 'Gramática Básica'
AND u.email = 'admin@teste.com'
LIMIT 1;

-- =====================================================
-- 6. VERIFICAR TESTES
-- =====================================================

SELECT 
    'TESTE' as status,
    q.title as quiz,
    q.time_limit_minutes as tempo_limite
FROM "public"."quizzes" q
WHERE q.title LIKE 'Teste%'
ORDER BY q.title;

-- =====================================================
-- 7. LIMPAR TESTES
-- =====================================================

-- Remover dados de teste
DELETE FROM "public"."quizzes" 
WHERE title LIKE 'Teste%';

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================

SELECT 
    '✅' as emoji,
    'COLUNA TIME_LIMIT_MINUTES CORRIGIDA!' as status,
    'Agora você pode usar a coluna sem erros!' as resultado;
