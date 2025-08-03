-- Script para criar usuários de teste no Supabase Auth
-- ATENÇÃO: Execute este script no SQL Editor do Supabase

-- Função para criar usuários de teste (senha padrão: 123456)
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
    user_id UUID;
BEGIN
    -- Loop através dos emails de teste
    FOREACH user_email IN ARRAY test_users
    LOOP
        -- Verificar se o usuário já existe
        SELECT id INTO user_id 
        FROM auth.users 
        WHERE email = user_email;
        
        -- Se não existir, criar o usuário
        IF user_id IS NULL THEN
            -- Inserir usuário no auth.users
            INSERT INTO auth.users (
                instance_id,
                id,
                aud,
                role,
                email,
                encrypted_password,
                email_confirmed_at,
                recovery_sent_at,
                last_sign_in_at,
                raw_app_meta_data,
                raw_user_meta_data,
                created_at,
                updated_at,
                confirmation_token,
                email_change,
                email_change_token_new,
                recovery_token
            ) VALUES (
                '00000000-0000-0000-0000-000000000000',
                gen_random_uuid(),
                'authenticated',
                'authenticated',
                user_email,
                crypt('123456', gen_salt('bf')), -- Senha: 123456
                NOW(),
                NOW(),
                NOW(),
                '{"provider":"email","providers":["email"]}',
                '{}',
                NOW(),
                NOW(),
                '',
                '',
                '',
                ''
            );
            
            RAISE NOTICE 'Usuário criado: % (senha: 123456)', user_email;
        ELSE
            RAISE NOTICE 'Usuário já existe: %', user_email;
        END IF;
    END LOOP;
END $$;

-- Verificar usuários criados
SELECT 
    email,
    email_confirmed_at IS NOT NULL as email_confirmed,
    created_at
FROM auth.users 
WHERE email IN (
    'aluno@teste.com',
    'professor@teste.com', 
    'admin@everest.com',
    'teste@aluno.com',
    'teste@professor.com'
)
ORDER BY email;

-- Mostrar resumo
SELECT 'USUARIOS_TESTE_CRIADOS' as status, 'Senha padrão: 123456' as info;
