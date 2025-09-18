-- =====================================================
-- ADICIONAR COLUNA TIME_LIMIT_MINUTES - VERSÃO SIMPLES
-- EVEREST PREPARATÓRIOS
-- =====================================================

-- Adicionar coluna time_limit_minutes na tabela quizzes
ALTER TABLE "public"."quizzes" 
ADD COLUMN IF NOT EXISTS "time_limit_minutes" integer;

-- Adicionar comentário explicativo
COMMENT ON COLUMN "public"."quizzes"."time_limit_minutes" IS 'Tempo limite em minutos para completar o quiz (NULL = sem limite)';

-- Verificar se a coluna foi adicionada
SELECT 
    column_name as coluna,
    data_type as tipo,
    is_nullable as nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'quizzes'
AND column_name = 'time_limit_minutes';

-- Teste: Inserir quiz com tempo limite
INSERT INTO "public"."quizzes" (topic_id, title, description, time_limit_minutes, created_by_user_id)
SELECT 
    t.id,
    'Quiz de Teste com Tempo',
    'Quiz de teste com tempo limite de 15 minutos',
    15,
    u.id
FROM "public"."topics" t
CROSS JOIN "public"."users" u
WHERE t.name = 'Gramática Básica'
AND u.email = 'admin@teste.com'
AND NOT EXISTS (
    SELECT 1 FROM "public"."quizzes" q2 
    WHERE q2.topic_id = t.id AND q2.title = 'Quiz de Teste com Tempo'
);

-- Verificar inserção
SELECT 
    'TESTE' as status,
    q.title as quiz,
    q.time_limit_minutes as tempo_limite,
    t.name as topico
FROM "public"."quizzes" q
JOIN "public"."topics" t ON q.topic_id = t.id
WHERE q.title = 'Quiz de Teste com Tempo'
LIMIT 1;

-- Mensagem de sucesso
SELECT 
    '✅' as emoji,
    'COLUNA TIME_LIMIT_MINUTES ADICIONADA COM SUCESSO!' as status;
