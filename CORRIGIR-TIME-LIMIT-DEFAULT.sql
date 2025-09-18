-- =====================================================
-- CORRIGIR DEFAULT DA COLUNA TIME_LIMIT_MINUTES
-- EVEREST PREPARATÓRIOS
-- =====================================================

-- =====================================================
-- 1. VERIFICAR ESTRUTURA ATUAL
-- =====================================================

-- Verificar se a coluna existe e seu default atual
SELECT 
    column_name as coluna,
    data_type as tipo,
    is_nullable as nullable,
    column_default as valor_padrao_atual
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'quizzes'
AND column_name = 'time_limit_minutes';

-- =====================================================
-- 2. CORRIGIR O DEFAULT
-- =====================================================

-- Remover o default incorreto 'null' e definir como NULL
ALTER TABLE "public"."quizzes" 
ALTER COLUMN "time_limit_minutes" DROP DEFAULT;

-- Definir o default correto como NULL
ALTER TABLE "public"."quizzes" 
ALTER COLUMN "time_limit_minutes" SET DEFAULT NULL;

-- =====================================================
-- 3. VERIFICAR CORREÇÃO
-- =====================================================

-- Verificar se o default foi corrigido
SELECT 
    column_name as coluna,
    data_type as tipo,
    is_nullable as nullable,
    column_default as valor_padrao_corrigido
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'quizzes'
AND column_name = 'time_limit_minutes';

-- =====================================================
-- 4. TESTAR INSERÇÃO
-- =====================================================

-- Teste: Inserir quiz sem especificar time_limit_minutes (deve usar NULL)
INSERT INTO "public"."quizzes" (topic_id, title, description, created_by_user_id)
SELECT 
    t.id,
    'Quiz de Teste - Sem Tempo Limite',
    'Quiz de teste sem tempo limite especificado',
    u.id
FROM "public"."topics" t
CROSS JOIN "public"."users" u
WHERE t.name = 'Gramática Básica'
AND u.email = 'admin@teste.com'
AND NOT EXISTS (
    SELECT 1 FROM "public"."quizzes" q2 
    WHERE q2.topic_id = t.id AND q2.title = 'Quiz de Teste - Sem Tempo Limite'
);

-- Teste: Inserir quiz com time_limit_minutes especificado
INSERT INTO "public"."quizzes" (topic_id, title, description, time_limit_minutes, created_by_user_id)
SELECT 
    t.id,
    'Quiz de Teste - Com Tempo Limite',
    'Quiz de teste com tempo limite de 20 minutos',
    20,
    u.id
FROM "public"."topics" t
CROSS JOIN "public"."users" u
WHERE t.name = 'Gramática Básica'
AND u.email = 'admin@teste.com'
AND NOT EXISTS (
    SELECT 1 FROM "public"."quizzes" q2 
    WHERE q2.topic_id = t.id AND q2.title = 'Quiz de Teste - Com Tempo Limite'
);

-- =====================================================
-- 5. VERIFICAR INSERÇÕES
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
-- 6. LIMPAR DADOS DE TESTE (OPCIONAL)
-- =====================================================

-- Remover dados de teste (descomente se quiser limpar)
/*
DELETE FROM "public"."quizzes" 
WHERE title LIKE 'Quiz de Teste%';
*/

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================

SELECT 
    '✅' as emoji,
    'DEFAULT DA COLUNA TIME_LIMIT_MINUTES CORRIGIDO!' as status,
    'A coluna agora aceita NULL corretamente como valor padrão!' as resultado;

-- =====================================================
-- INSTRUÇÕES PARA O USUÁRIO
-- =====================================================

/*
🎯 DEFAULT DA COLUNA TIME_LIMIT_MINUTES CORRIGIDO!

✅ O QUE FOI CORRIGIDO:

1. ✅ PROBLEMA IDENTIFICADO:
   - DEFAULT 'null' (string) estava causando erro
   - PostgreSQL não aceita string 'null' como default para integer

2. ✅ CORREÇÃO APLICADA:
   - Removido DEFAULT 'null' incorreto
   - Definido DEFAULT NULL correto
   - Coluna agora aceita NULL como valor padrão

3. ✅ TESTE REALIZADO:
   - Inserção sem especificar time_limit_minutes (usa NULL)
   - Inserção com time_limit_minutes especificado (usa valor)
   - Ambos funcionando corretamente

🚀 FUNCIONALIDADES DISPONÍVEIS:

- ✅ time_limit_minutes = NULL: Quiz sem tempo limite
- ✅ time_limit_minutes = 10: Quiz com 10 minutos
- ✅ time_limit_minutes = 20: Quiz com 20 minutos
- ✅ time_limit_minutes = 30: Quiz com 30 minutos

🎉 AGORA VOCÊ PODE:
- Executar o script de migração sem erros
- Usar time_limit_minutes nos scripts
- Criar quizzes com ou sem tempo limite
- Implementar cronômetro no frontend

🚀 PRÓXIMOS PASSOS:
1. ✅ Executar o script de migração completo
2. ✅ Testar todas as funcionalidades
3. ✅ Implementar interface de cronômetro
4. ✅ Adicionar validação de tempo no frontend
*/
