-- ========================================
-- CORRIGIR ESTRUTURA DA TABELA QUIZ_QUESTIONS
-- ========================================

-- 1. Verificar se a coluna topic_id existe
SELECT 'VERIFICANDO COLUNA TOPIC_ID' as status,
       CASE 
           WHEN EXISTS (
               SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'quiz_questions' 
               AND table_schema = 'public'
               AND column_name = 'topic_id'
           ) THEN 'COLUNA TOPIC_ID EXISTE'
           ELSE 'COLUNA TOPIC_ID NÃO EXISTE'
       END as resultado;

-- 2. Se a coluna não existir, adicionar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quiz_questions' 
        AND table_schema = 'public'
        AND column_name = 'topic_id'
    ) THEN
        ALTER TABLE "public"."quiz_questions" 
        ADD COLUMN "topic_id" UUID REFERENCES "public"."topics"("id");
        
        RAISE NOTICE 'Coluna topic_id adicionada à tabela quiz_questions';
    ELSE
        RAISE NOTICE 'Coluna topic_id já existe na tabela quiz_questions';
    END IF;
END $$;

-- 3. Verificar estrutura final
SELECT 'ESTRUTURA FINAL DA TABELA QUIZ_QUESTIONS' as status,
       column_name,
       data_type,
       is_nullable,
       column_default
FROM information_schema.columns 
WHERE table_name = 'quiz_questions' 
AND table_schema = 'public'
ORDER BY ordinal_position;
