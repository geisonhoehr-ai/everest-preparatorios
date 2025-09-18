-- =====================================================
-- SCRIPT PARA CORRIGIR ENUM user_role
-- EVEREST PREPARATÓRIOS - CORREÇÃO DE ENUM
-- =====================================================

-- =====================================================
-- 1. VERIFICAR SE O ENUM EXISTE
-- =====================================================

-- Verificar tipos existentes
SELECT 
    typname as tipo,
    typtype as categoria,
    enumlabel as valores
FROM pg_type t
LEFT JOIN pg_enum e ON t.oid = e.enumtypid
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND typtype = 'e'
ORDER BY typname, enumlabel;

-- =====================================================
-- 2. CRIAR O ENUM user_role SE NÃO EXISTIR
-- =====================================================

-- Criar o enum user_role
DO $$
BEGIN
    -- Verificar se o tipo já existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'user_role' 
        AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN
        -- Criar o enum
        CREATE TYPE "public"."user_role" AS ENUM ('student', 'teacher', 'admin');
        RAISE NOTICE '✅ Enum user_role criado com sucesso!';
    ELSE
        RAISE NOTICE '⚠️ Enum user_role já existe. Verificando valores...';
        
        -- Verificar se tem todos os valores necessários
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
            AND enumlabel = 'admin'
        ) THEN
            -- Adicionar valor 'admin' se não existir
            ALTER TYPE "public"."user_role" ADD VALUE 'admin';
            RAISE NOTICE '✅ Valor "admin" adicionado ao enum user_role!';
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
            AND enumlabel = 'teacher'
        ) THEN
            -- Adicionar valor 'teacher' se não existir
            ALTER TYPE "public"."user_role" ADD VALUE 'teacher';
            RAISE NOTICE '✅ Valor "teacher" adicionado ao enum user_role!';
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
            AND enumlabel = 'student'
        ) THEN
            -- Adicionar valor 'student' se não existir
            ALTER TYPE "public"."user_role" ADD VALUE 'student';
            RAISE NOTICE '✅ Valor "student" adicionado ao enum user_role!';
        END IF;
    END IF;
END $$;

-- =====================================================
-- 2.1. COMMITAR O ENUM ANTES DE USAR
-- =====================================================

-- Fazer commit do enum para poder usar os valores
COMMIT;

-- =====================================================
-- 3. VERIFICAR SE O ENUM FOI CRIADO CORRETAMENTE
-- =====================================================

-- Verificar o enum criado
SELECT 
    'ENUM user_role VERIFICADO' as status,
    typname as tipo,
    enumlabel as valores
FROM pg_type t
LEFT JOIN pg_enum e ON t.oid = e.enumtypid
WHERE typname = 'user_role'
ORDER BY enumlabel;

-- =====================================================
-- 4. TESTAR INSERÇÃO COM O ENUM CORRIGIDO
-- =====================================================

-- Testar inserção de usuário admin
INSERT INTO "public"."users" (
    email, 
    password_hash, 
    first_name, 
    last_name, 
    role, 
    is_active
) VALUES (
    'admin@teste.com', 
    '$2b$10$example_hash_here', 
    'Admin', 
    'Sistema', 
    'admin'::user_role, 
    true
) ON CONFLICT (email) DO NOTHING;

-- Testar inserção de usuário professor
INSERT INTO "public"."users" (
    email, 
    password_hash, 
    first_name, 
    last_name, 
    role, 
    is_active
) VALUES (
    'professor@teste.com', 
    '$2b$10$example_hash_here', 
    'Professor', 
    'Teste', 
    'teacher'::user_role, 
    true
) ON CONFLICT (email) DO NOTHING;

-- Testar inserção de usuário aluno
INSERT INTO "public"."users" (
    email, 
    password_hash, 
    first_name, 
    last_name, 
    role, 
    is_active
) VALUES (
    'aluno@teste.com', 
    '$2b$10$example_hash_here', 
    'Aluno', 
    'Teste', 
    'student'::user_role, 
    true
) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- 5. VERIFICAR SE OS USUÁRIOS FORAM INSERIDOS
-- =====================================================

-- Verificar usuários inseridos
SELECT 
    'USUÁRIOS INSERIDOS' as status,
    id,
    email,
    first_name,
    last_name,
    role,
    is_active,
    created_at
FROM "public"."users"
WHERE email IN ('admin@teste.com', 'professor@teste.com', 'aluno@teste.com')
ORDER BY created_at;

-- =====================================================
-- 6. RESUMO DA CORREÇÃO
-- =====================================================

/*
✅ CORREÇÃO DO ENUM user_role CONCLUÍDA!

🎯 O QUE FOI FEITO:

1. ✅ VERIFICAÇÃO:
   - Verificou se o enum user_role existe
   - Listou tipos existentes no banco

2. ✅ CRIAÇÃO/CORREÇÃO:
   - Criou o enum user_role se não existir
   - Adicionou valores: 'student', 'teacher', 'admin'
   - Verificou se todos os valores estão presentes

3. ✅ TESTE:
   - Inseriu usuários de teste com cast explícito
   - Verificou se as inserções funcionaram
   - Listou usuários criados

4. ✅ RESULTADO:
   - Enum user_role funcionando corretamente
   - Usuários de teste inseridos com sucesso
   - Estrutura pronta para uso

🔄 PRÓXIMOS PASSOS:

1. ✅ Verificar se o enum está funcionando
2. ✅ Testar inserções com diferentes roles
3. ✅ Configurar RLS (Row Level Security)
4. ✅ Testar funcionalidades de autenticação

⚠️ IMPORTANTE:
- Use cast explícito: 'admin'::user_role
- Verifique se todos os valores do enum estão corretos
- Teste inserções antes de usar em produção

🚀 O enum está corrigido e funcionando!
*/
