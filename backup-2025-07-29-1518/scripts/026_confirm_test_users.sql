-- Script para confirmar emails dos usuários de teste
-- Execute no SQL Editor do Supabase

-- 1. Verificar status atual dos usuários
SELECT 
    email,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'CONFIRMADO'
        ELSE 'NÃO CONFIRMADO'
    END as status
FROM auth.users 
WHERE email IN (
    'aluno@teste.com',
    'professor@teste.com', 
    'admin@everest.com',
    'teste@aluno.com',
    'teste@professor.com'
);

-- 2. Confirmar emails de todos os usuários de teste
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email IN (
    'aluno@teste.com',
    'professor@teste.com', 
    'admin@everest.com',
    'teste@aluno.com',
    'teste@professor.com'
)
AND email_confirmed_at IS NULL;

-- 3. Verificar se foram confirmados
SELECT 
    email,
    email_confirmed_at,
    'CONFIRMADO' as status
FROM auth.users 
WHERE email IN (
    'aluno@teste.com',
    'professor@teste.com', 
    'admin@everest.com',
    'teste@aluno.com',
    'teste@professor.com'
);

-- 4. Criar usuários se não existirem E confirmar emails
DO $$
DECLARE
    test_users TEXT[] := ARRAY[
        'aluno@teste.com',
        'professor@teste.com', 
        'admin@everest.com',
        'teste@aluno.com',
        'teste@professor.com'
    ];
    user_email TEXT;
    user_exists BOOLEAN;
BEGIN
    FOREACH user_email IN ARRAY test_users
    LOOP
        -- Verificar se usuário existe
        SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = user_email) INTO user_exists;
        
        IF NOT user_exists THEN
            -- Criar usuário com email já confirmado
            INSERT INTO auth.users (
                instance_id,
                id,
                aud,
                role,
                email,
                encrypted_password,
                email_confirmed_at, -- JÁ CONFIRMADO
                created_at,
                updated_at,
                raw_app_meta_data,
                raw_user_meta_data
            ) VALUES (
                '00000000-0000-0000-0000-000000000000',
                gen_random_uuid(),
                'authenticated',
                'authenticated',
                user_email,
                crypt('123456', gen_salt('bf')),
                NOW(), -- EMAIL JÁ CONFIRMADO
                NOW(),
                NOW(),
                '{"provider":"email","providers":["email"]}',
                '{}'
            );
            
            RAISE NOTICE 'Usuário criado e confirmado: %', user_email;
        ELSE
            -- Confirmar email se não estiver confirmado
            UPDATE auth.users 
            SET email_confirmed_at = NOW(), updated_at = NOW()
            WHERE email = user_email AND email_confirmed_at IS NULL;
            
            RAISE NOTICE 'Email confirmado para: %', user_email;
        END IF;
    END LOOP;
END $$;

-- 5. Resultado final
SELECT 
    'SETUP_COMPLETO' as status,
    'Todos os emails foram confirmados. Senha: 123456' as info;
