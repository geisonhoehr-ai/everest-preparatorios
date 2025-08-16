-- Script para corrigir a função column_exists, garantir que as colunas user_uuid
-- nas tabelas de perfil sejam UUID, adicionar TODAS as colunas necessárias
-- às tabelas de perfil se estiverem faltando, e garantir que roles e perfis
-- de usuários de teste estejam corretos.

-- Função auxiliar para verificar se uma coluna existe (corrigida para ambiguidade)
CREATE OR REPLACE FUNCTION column_exists(p_table_name TEXT, p_column_name TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = p_table_name
      AND column_name = p_column_name
  );
END;
$$;

-- Função auxiliar para verificar o tipo de uma coluna
CREATE OR REPLACE FUNCTION get_column_type(p_table_name TEXT, p_column_name TEXT)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
    col_type TEXT;
BEGIN
    SELECT data_type INTO col_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = p_table_name
      AND column_name = p_column_name;
    RETURN col_type;
END;
$$;

DO $$
DECLARE
    aluno_uuid UUID;
    professor_uuid UUID;
    aluno_email TEXT := 'aluno@teste.com';
    professor_email TEXT := 'professor@teste.com';
    aluno_password TEXT := '123456';
    professor_password TEXT := '123456';
    fk_name TEXT;
BEGIN
    RAISE NOTICE '--- Iniciando configuração de usuários de teste e correção de esquema ---';

    -- 0. Corrigir tipo da coluna user_uuid para UUID em tabelas de perfil se for TEXT
    RAISE NOTICE '0. Verificando e corrigindo tipos de user_uuid para UUID...';

    FOR fk_name IN (SELECT constraint_name FROM information_schema.table_constraints WHERE table_schema = 'public' AND table_name = 'student_profiles' AND constraint_type = 'FOREIGN KEY' AND constraint_name LIKE '%user_uuid%') LOOP
        EXECUTE 'ALTER TABLE public.student_profiles DROP CONSTRAINT ' || quote_ident(fk_name);
        RAISE NOTICE '   FK % de student_profiles removida.', fk_name;
    END LOOP;
    IF get_column_type('student_profiles', 'user_uuid') = 'text' THEN
        EXECUTE 'ALTER TABLE public.student_profiles ALTER COLUMN user_uuid TYPE UUID USING (user_uuid::uuid)';
        RAISE NOTICE '   Coluna student_profiles.user_uuid convertida para UUID.';
    END IF;
    EXECUTE 'ALTER TABLE public.student_profiles ADD CONSTRAINT student_profiles_user_uuid_fkey FOREIGN KEY (user_uuid) REFERENCES auth.users(id) ON DELETE CASCADE';
    RAISE NOTICE '   FK student_profiles_user_uuid_fkey recriada.';

    FOR fk_name IN (SELECT constraint_name FROM information_schema.table_constraints WHERE table_schema = 'public' AND table_name = 'teacher_profiles' AND constraint_type = 'FOREIGN KEY' AND constraint_name LIKE '%user_uuid%') LOOP
        EXECUTE 'ALTER TABLE public.teacher_profiles DROP CONSTRAINT ' || quote_ident(fk_name);
        RAISE NOTICE '   FK % de teacher_profiles removida.', fk_name;
    END LOOP;
    IF get_column_type('teacher_profiles', 'user_uuid') = 'text' THEN
        EXECUTE 'ALTER TABLE public.teacher_profiles ALTER COLUMN user_uuid TYPE UUID USING (user_uuid::uuid)';
        RAISE NOTICE '   Coluna teacher_profiles.user_uuid convertida para UUID.';
    END IF;
    EXECUTE 'ALTER TABLE public.teacher_profiles ADD CONSTRAINT teacher_profiles_user_uuid_fkey FOREIGN KEY (user_uuid) REFERENCES auth.users(id) ON DELETE CASCADE';
    RAISE NOTICE '   FK teacher_profiles_user_uuid_fkey recriada.';

    FOR fk_name IN (SELECT constraint_name FROM information_schema.table_constraints WHERE table_schema = 'public' AND table_name = 'user_roles' AND constraint_type = 'FOREIGN KEY' AND constraint_name LIKE '%user_uuid%') LOOP
        EXECUTE 'ALTER TABLE public.user_roles DROP CONSTRAINT ' || quote_ident(fk_name);
        RAISE NOTICE '   FK % de user_roles removida.', fk_name;
    END LOOP;
    IF get_column_type('user_roles', 'user_uuid') = 'text' THEN
        EXECUTE 'ALTER TABLE public.user_roles ALTER COLUMN user_uuid TYPE UUID USING (user_uuid::uuid)';
        RAISE NOTICE '   Coluna user_roles.user_uuid convertida para UUID.';
    END IF;
    EXECUTE 'ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_uuid_fkey FOREIGN KEY (user_uuid) REFERENCES auth.users(id) ON DELETE CASCADE';
    RAISE NOTICE '   FK user_roles_user_uuid_fkey recriada.';

    -- 1. Limpar dados existentes para os emails de teste
    RAISE NOTICE '1. Limpando dados existentes para % e %...', aluno_email, professor_email;

    -- Obter UUIDs dos usuários existentes, se houver
    SELECT id INTO aluno_uuid FROM auth.users WHERE email = aluno_email;
    SELECT id INTO professor_uuid FROM auth.users WHERE email = professor_email;

    IF aluno_uuid IS NOT NULL THEN
        DELETE FROM public.student_profiles WHERE user_uuid = aluno_uuid;
        DELETE FROM public.user_roles WHERE user_uuid = aluno_uuid;
        DELETE FROM public.paid_users WHERE email = aluno_email;
        DELETE FROM auth.users WHERE id = aluno_uuid;
        RAISE NOTICE '   Dados antigos do aluno removidos.';
    END IF;

    IF professor_uuid IS NOT NULL THEN
        DELETE FROM public.teacher_profiles WHERE user_uuid = professor_uuid;
        DELETE FROM public.user_roles WHERE user_uuid = professor_uuid;
        DELETE FROM public.paid_users WHERE email = professor_email;
        DELETE FROM auth.users WHERE id = professor_uuid;
        RAISE NOTICE '   Dados antigos do professor removidos.';
    END IF;

    -- 2. Criar usuários no auth.users (Supabase Auth)
    RAISE NOTICE '2. Criando usuários de teste no auth.users...';

    -- Criar Aluno
    INSERT INTO auth.users (instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
        '00000000-0000-0000-0000-000000000000', -- instance_id (pode ser padrão)
        'authenticated',
        'authenticated',
        aluno_email,
        crypt(aluno_password, gen_salt('bf', 6)), -- Senha criptografada
        NOW(), -- Email confirmado
        '{"provider":"email","providers":["email"]}',
        '{}',
        NOW(),
        NOW()
    ) RETURNING id INTO aluno_uuid;
    RAISE NOTICE '   Aluno criado: % (UUID: %)', aluno_email, aluno_uuid;

    -- Criar Professor
    INSERT INTO auth.users (instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        professor_email,
        crypt(professor_password, gen_salt('bf', 6)),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{}',
        NOW(),
        NOW()
    ) RETURNING id INTO professor_uuid;
    RAISE NOTICE '   Professor criado: % (UUID: %)', professor_email, professor_uuid;

    -- 3. Garantir que as colunas de perfil existam
    RAISE NOTICE '3. Verificando e adicionando colunas de perfil (nome_completo, grade, school, subject)...';

    IF NOT column_exists('student_profiles', 'nome_completo') THEN
        ALTER TABLE public.student_profiles ADD COLUMN nome_completo TEXT DEFAULT 'Nome Aluno Teste' NOT NULL;
        RAISE NOTICE '   Coluna nome_completo adicionada a student_profiles.';
    END IF;
    IF NOT column_exists('student_profiles', 'grade') THEN
        ALTER TABLE public.student_profiles ADD COLUMN grade TEXT;
        RAISE NOTICE '   Coluna grade adicionada a student_profiles.';
    END IF;
    IF NOT column_exists('student_profiles', 'school') THEN
        ALTER TABLE public.student_profiles ADD COLUMN school TEXT;
        RAISE NOTICE '   Coluna school adicionada a student_profiles.';
    END IF;

    IF NOT column_exists('teacher_profiles', 'nome_completo') THEN
        ALTER TABLE public.teacher_profiles ADD COLUMN nome_completo TEXT DEFAULT 'Nome Professor Teste' NOT NULL;
        RAISE NOTICE '   Coluna nome_completo adicionada a teacher_profiles.';
    END IF;
    IF NOT column_exists('teacher_profiles', 'subject') THEN
        ALTER TABLE public.teacher_profiles ADD COLUMN subject TEXT;
        RAISE NOTICE '   Coluna subject adicionada a teacher_profiles.';
    END IF;

    -- 4. Inserir/Atualizar acesso pago na tabela paid_users
    RAISE NOTICE '4. Inserindo/Atualizando acesso pago na tabela paid_users...';
    INSERT INTO public.paid_users (email, status, created_at, updated_at)
    VALUES (aluno_email, 'active', NOW(), NOW())
    ON CONFLICT (email) DO UPDATE SET status = 'active', updated_at = NOW();
    RAISE NOTICE '   Acesso pago para aluno@teste.com garantido.';

    INSERT INTO public.paid_users (email, status, created_at, updated_at)
    VALUES (professor_email, 'active', NOW(), NOW())
    ON CONFLICT (email) DO UPDATE SET status = 'active', updated_at = NOW();
    RAISE NOTICE '   Acesso pago para professor@teste.com garantido.';

    -- 5. Inserir/Atualizar roles na tabela user_roles
    RAISE NOTICE '5. Inserindo/Atualizando roles na tabela user_roles...';
    INSERT INTO public.user_roles (user_uuid, role, first_login, profile_completed, created_at, updated_at)
    VALUES (aluno_uuid, 'student', FALSE, TRUE, NOW(), NOW())
    ON CONFLICT (user_uuid) DO UPDATE SET role = 'student', first_login = FALSE, profile_completed = TRUE, updated_at = NOW();
    RAISE NOTICE '   Role de aluno para % garantida.', aluno_email;

    INSERT INTO public.user_roles (user_uuid, role, first_login, profile_completed, created_at, updated_at)
    VALUES (professor_uuid, 'teacher', FALSE, TRUE, NOW(), NOW())
    ON CONFLICT (user_uuid) DO UPDATE SET role = 'teacher', first_login = FALSE, profile_completed = TRUE, updated_at = NOW();
    RAISE NOTICE '   Role de professor para % garantida.', professor_email;

    -- 6. Inserir/Atualizar perfis específicos
    RAISE NOTICE '6. Inserindo/Atualizando perfis específicos...';
    INSERT INTO public.student_profiles (user_uuid, nome_completo, grade, school, created_at, updated_at)
    VALUES (aluno_uuid, 'Aluno Teste', '3º Ano', 'Escola Teste', NOW(), NOW())
    ON CONFLICT (user_uuid) DO UPDATE SET nome_completo = 'Aluno Teste', grade = '3º Ano', school = 'Escola Teste', updated_at = NOW();
    RAISE NOTICE '   Perfil de aluno para % garantido.', aluno_email;

    INSERT INTO public.teacher_profiles (user_uuid, nome_completo, subject, created_at, updated_at)
    VALUES (professor_uuid, 'Professor Teste', 'Português', NOW(), NOW())
    ON CONFLICT (user_uuid) DO UPDATE SET nome_completo = 'Professor Teste', subject = 'Português', updated_at = NOW();
    RAISE NOTICE '   Perfil de professor para % garantido.', professor_email;

    RAISE NOTICE '--- Verificação Final ---';
    RAISE NOTICE 'Verificando auth.users:';
    PERFORM id, email, email_confirmed_at, last_sign_in_at FROM auth.users WHERE email IN (aluno_email, professor_email);

    RAISE NOTICE 'Verificando paid_users:';
    PERFORM email, status FROM public.paid_users WHERE email IN (aluno_email, professor_email);

    RAISE NOTICE 'Verificando user_roles:';
    PERFORM user_uuid, role FROM public.user_roles WHERE user_uuid IN (aluno_uuid, professor_uuid);

    RAISE NOTICE 'Verificando student_profiles:';
    PERFORM user_uuid, nome_completo, grade, school FROM public.student_profiles WHERE user_uuid = aluno_uuid;

    RAISE NOTICE 'Verificando teacher_profiles:';
    PERFORM user_uuid, nome_completo, subject FROM public.teacher_profiles WHERE user_uuid = professor_uuid;

    RAISE NOTICE '--- Configuração de usuários de teste CONCLUÍDA. PRONTO! ---';

END $$;
