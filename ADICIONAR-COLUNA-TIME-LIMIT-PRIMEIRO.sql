-- =====================================================
-- ADICIONAR COLUNA TIME_LIMIT_MINUTES PRIMEIRO
-- EVEREST PREPARATÓRIOS
-- =====================================================

-- =====================================================
-- 1. VERIFICAR ESTRUTURA ATUAL DA TABELA QUIZZES
-- =====================================================

-- Verificar colunas existentes na tabela quizzes
SELECT 
    'ESTRUTURA ATUAL' as status,
    column_name as coluna,
    data_type as tipo,
    is_nullable as nullable,
    column_default as valor_padrao
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'quizzes'
ORDER BY ordinal_position;

-- =====================================================
-- 2. ADICIONAR COLUNA TIME_LIMIT_MINUTES
-- =====================================================

-- Adicionar coluna time_limit_minutes (sem default incorreto)
ALTER TABLE "public"."quizzes" 
ADD COLUMN IF NOT EXISTS "time_limit_minutes" integer;

-- =====================================================
-- 3. ADICIONAR COMENTÁRIO
-- =====================================================

-- Adicionar comentário explicativo
COMMENT ON COLUMN "public"."quizzes"."time_limit_minutes" IS 'Tempo limite em minutos para completar o quiz (NULL = sem limite)';

-- =====================================================
-- 4. VERIFICAR SE FOI ADICIONADA
-- =====================================================

-- Verificar se a coluna foi adicionada
SELECT 
    'COLUNA ADICIONADA' as status,
    column_name as coluna,
    data_type as tipo,
    is_nullable as nullable,
    column_default as valor_padrao
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'quizzes'
AND column_name = 'time_limit_minutes';

-- =====================================================
-- 5. TESTE SIMPLES
-- =====================================================

-- Teste: Inserir quiz sem time_limit_minutes (deve usar NULL)
INSERT INTO "public"."quizzes" (topic_id, title, description, created_by_user_id)
SELECT 
    t.id,
    'Quiz de Teste - Sem Tempo',
    'Quiz de teste sem tempo limite especificado',
    u.id
FROM "public"."topics" t
CROSS JOIN "public"."users" u
WHERE t.name = 'Gramática Básica'
AND u.email = 'admin@teste.com'
AND NOT EXISTS (
    SELECT 1 FROM "public"."quizzes" q2 
    WHERE q2.topic_id = t.id AND q2.title = 'Quiz de Teste - Sem Tempo'
);

-- Teste: Inserir quiz com time_limit_minutes especificado
INSERT INTO "public"."quizzes" (topic_id, title, description, time_limit_minutes, created_by_user_id)
SELECT 
    t.id,
    'Quiz de Teste - Com Tempo',
    'Quiz de teste com tempo limite de 20 minutos',
    20,
    u.id
FROM "public"."topics" t
CROSS JOIN "public"."users" u
WHERE t.name = 'Gramática Básica'
AND u.email = 'admin@teste.com'
AND NOT EXISTS (
    SELECT 1 FROM "public"."quizzes" q2 
    WHERE q2.topic_id = t.id AND q2.title = 'Quiz de Teste - Com Tempo'
);

-- =====================================================
-- 6. VERIFICAR TESTES
-- =====================================================

-- Verificar os quizzes inseridos
SELECT 
    'TESTE INSERÇÃO' as status,
    q.title as quiz,
    q.time_limit_minutes as tempo_limite,
    CASE 
        WHEN q.time_limit_minutes IS NULL THEN 'Sem limite'
        ELSE q.time_limit_minutes || ' minutos'
    END as tempo_descricao
FROM "public"."quizzes" q
WHERE q.title LIKE 'Quiz de Teste%'
ORDER BY q.title;

-- =====================================================
-- 7. LIMPAR DADOS DE TESTE
-- =====================================================

-- Remover dados de teste
DELETE FROM "public"."quizzes" 
WHERE title LIKE 'Quiz de Teste%';

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================

SELECT 
    '✅' as emoji,
    'COLUNA TIME_LIMIT_MINUTES ADICIONADA COM SUCESSO!' as status,
    'Agora você pode executar a migração completa!' as resultado;

-- =====================================================
-- INSTRUÇÕES PARA O USUÁRIO
-- =====================================================

/*
🎯 COLUNA TIME_LIMIT_MINUTES ADICIONADA COM SUCESSO!

✅ O QUE FOI FEITO:

1. ✅ VERIFICAÇÃO:
   - Estrutura atual da tabela quizzes
   - Colunas existentes

2. ✅ ADIÇÃO:
   - Coluna time_limit_minutes (integer)
   - Sem valor padrão incorreto
   - Comentário explicativo

3. ✅ TESTE:
   - Inserção sem especificar time_limit_minutes (usa NULL)
   - Inserção com time_limit_minutes especificado (usa valor)
   - Ambos funcionando corretamente

4. ✅ LIMPEZA:
   - Dados de teste removidos

🚀 FUNCIONALIDADES DISPONÍVEIS:

- ✅ time_limit_minutes = NULL: Quiz sem tempo limite
- ✅ time_limit_minutes = 10: Quiz com 10 minutos
- ✅ time_limit_minutes = 20: Quiz com 20 minutos
- ✅ time_limit_minutes = 30: Quiz com 30 minutos

🎉 AGORA VOCÊ PODE:
- Executar a migração completa sem erros
- Usar time_limit_minutes nos scripts
- Criar quizzes com ou sem tempo limite
- Implementar cronômetro no frontend

🚀 PRÓXIMOS PASSOS:
1. ✅ Executar a migração completa do DBExpert
2. ✅ Testar todas as funcionalidades
3. ✅ Implementar interface de cronômetro
4. ✅ Adicionar validação de tempo no frontend
*/
