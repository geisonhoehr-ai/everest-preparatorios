-- =====================================================
-- ADICIONAR COLUNA TIME_LIMIT_MINUTES NA TABELA QUIZZES
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

-- Adicionar coluna time_limit_minutes
ALTER TABLE "public"."quizzes" 
ADD COLUMN IF NOT EXISTS "time_limit_minutes" integer;

-- =====================================================
-- 3. COMENTÁRIO DA COLUNA
-- =====================================================

-- Adicionar comentário explicativo
COMMENT ON COLUMN "public"."quizzes"."time_limit_minutes" IS 'Tempo limite em minutos para completar o quiz (NULL = sem limite)';

-- =====================================================
-- 4. VERIFICAR ESTRUTURA APÓS ADIÇÃO
-- =====================================================

-- Verificar se a coluna foi adicionada
SELECT 
    'ESTRUTURA APÓS ADIÇÃO' as status,
    column_name as coluna,
    data_type as tipo,
    is_nullable as nullable,
    column_default as valor_padrao
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'quizzes'
ORDER BY ordinal_position;

-- =====================================================
-- 5. TESTAR INSERÇÃO COM TIME_LIMIT_MINUTES
-- =====================================================

-- Inserir quiz de teste com time_limit_minutes
INSERT INTO "public"."quizzes" (topic_id, title, description, time_limit_minutes, created_by_user_id)
SELECT 
    t.id,
    'Quiz de Gramática Básica - Teste',
    'Teste seus conhecimentos em gramática com tempo limite',
    15,
    u.id
FROM "public"."topics" t
CROSS JOIN "public"."users" u
WHERE t.name = 'Gramática Básica'
AND u.email = 'admin@teste.com'
AND NOT EXISTS (
    SELECT 1 FROM "public"."quizzes" q2 
    WHERE q2.topic_id = t.id AND q2.title = 'Quiz de Gramática Básica - Teste'
);

-- =====================================================
-- 6. VERIFICAR INSERÇÃO
-- =====================================================

-- Verificar se o quiz foi inserido com time_limit_minutes
SELECT 
    'TESTE INSERÇÃO' as status,
    q.title as quiz,
    q.description as descricao,
    q.time_limit_minutes as tempo_limite_minutos,
    t.name as topico
FROM "public"."quizzes" q
JOIN "public"."topics" t ON q.topic_id = t.id
WHERE q.title = 'Quiz de Gramática Básica - Teste'
LIMIT 1;

-- =====================================================
-- 7. ATUALIZAR QUIZZES EXISTENTES (OPCIONAL)
-- =====================================================

-- Atualizar quizzes existentes com tempo limite padrão (opcional)
UPDATE "public"."quizzes" 
SET time_limit_minutes = 10
WHERE time_limit_minutes IS NULL
AND title LIKE '%Gramática%';

-- =====================================================
-- 8. VERIFICAR ATUALIZAÇÃO
-- =====================================================

-- Verificar quizzes atualizados
SELECT 
    'QUIZZES ATUALIZADOS' as status,
    q.title as quiz,
    q.time_limit_minutes as tempo_limite_minutos,
    t.name as topico
FROM "public"."quizzes" q
JOIN "public"."topics" t ON q.topic_id = t.id
WHERE q.time_limit_minutes IS NOT NULL
ORDER BY q.title;

-- =====================================================
-- 9. RESUMO FINAL
-- =====================================================

-- Contar quizzes com e sem tempo limite
SELECT 
    'RESUMO' as status,
    CASE 
        WHEN time_limit_minutes IS NULL THEN 'Sem tempo limite'
        ELSE 'Com tempo limite'
    END as tipo,
    COUNT(*) as quantidade
FROM "public"."quizzes"
GROUP BY 
    CASE 
        WHEN time_limit_minutes IS NULL THEN 'Sem tempo limite'
        ELSE 'Com tempo limite'
    END
ORDER BY tipo;

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================

SELECT 
    '✅' as emoji,
    'COLUNA TIME_LIMIT_MINUTES ADICIONADA COM SUCESSO!' as status,
    'A tabela quizzes agora suporta tempo limite para os quizzes!' as resultado;

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
   - Valor padrão NULL (sem limite)
   - Comentário explicativo

3. ✅ TESTE:
   - Inserção de quiz com tempo limite
   - Verificação da funcionalidade

4. ✅ ATUALIZAÇÃO:
   - Quizzes existentes atualizados (opcional)
   - Tempo limite padrão de 10 minutos

5. ✅ VERIFICAÇÃO:
   - Estrutura final da tabela
   - Resumo de quizzes com/sem tempo limite

🚀 FUNCIONALIDADES DISPONÍVEIS:

- ✅ time_limit_minutes = NULL: Quiz sem tempo limite
- ✅ time_limit_minutes = 10: Quiz com 10 minutos de limite
- ✅ time_limit_minutes = 15: Quiz com 15 minutos de limite
- ✅ time_limit_minutes = 30: Quiz com 30 minutos de limite

🎉 AGORA VOCÊ PODE:
- Criar quizzes com tempo limite
- Controlar a duração dos quizzes
- Implementar cronômetro no frontend
- Adicionar avisos de tempo restante

🚀 PRÓXIMOS PASSOS:
1. ✅ Atualizar o script de teste
2. ✅ Implementar cronômetro no frontend
3. ✅ Adicionar validação de tempo
4. ✅ Criar mais quizzes com tempo limite
*/
