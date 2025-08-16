DO $$
DECLARE
    aluno_email TEXT := 'aluno@teste.com';
    aluno_password TEXT := '123456';
    professor_email TEXT := 'professor@teste.com';
    professor_password TEXT := '123456';

    aluno_uuid UUID;
    professor_uuid UUID;

    -- Variáveis para verificar existência de colunas
    col_exists_nome_completo BOOLEAN;
    col_exists_grade BOOLEAN;
    col_exists_school BOOLEAN;
    col_exists_subject BOOLEAN;

    -- Função auxiliar para verificar se uma coluna existe
    FUNCTION column_exists(p_table_name TEXT, p_column_name TEXT)
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
    FUNCTION column_type(p_table_name TEXT, p_column_name TEXT)
    RETURNS TEXT LANGUAGE plpgsql AS $$
    BEGIN
        RETURN (
            SELECT data_type
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = p_table_name
              AND column_name = p_column_name
        );
    END;
    $$;

BEGIN
    RAISE NOTICE 'Iniciando script de correção e configuração de usuários de teste...';

    -- Desabilitar RLS temporariamente e remover políticas para permitir alteração de tipo
    RAISE NOTICE 'Desabilitando RLS e removendo políticas para student_profiles...';
    ALTER TABLE public.student_profiles DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Students can manage their profile" ON public.student_profiles;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.student_profiles;
    DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.student_profiles;
    DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.student_profiles;
    DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.student_profiles;

    RAISE NOTICE 'Desabilitando RLS e removendo políticas para teacher_profiles...';
    ALTER TABLE public.teacher_profiles DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Teachers can manage their profile" ON public.teacher_profiles;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.teacher_profiles;
    DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.teacher_profiles;
    DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.teacher_profiles;
    DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.teacher_profiles;

    RAISE NOTICE 'Desabilitando RLS e removendo políticas para user_roles...';
    ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Enable read access for all users on user_roles" ON public.user_roles;
    DROP POLICY IF EXISTS "Enable insert for authenticated users on user_roles" ON public.user_roles;
    DROP POLICY IF EXISTS "Enable update for authenticated users on user_roles" ON public.user_roles;
    DROP POLICY IF EXISTS "Enable delete for authenticated users on user_roles" ON public.user_roles;

    -- Corrigir tipo da coluna user_uuid para UUID se for TEXT
    IF column_type('student_profiles', 'user_uuid') = 'text' THEN
        RAISE NOTICE 'Convertendo student_profiles.user_uuid de TEXT para UUID...';
        ALTER TABLE public.student_profiles ALTER COLUMN user_uuid TYPE UUID USING (user_uuid::uuid);
    END IF;

    IF column_type('teacher_profiles', 'user_uuid') = 'text' THEN
        RAISE NOTICE 'Convertendo teacher_profiles.user_uuid de TEXT para UUID...';
        ALTER TABLE public.teacher_profiles ALTER COLUMN user_uuid TYPE UUID USING (user_uuid::uuid);
    END IF;

    IF column_type('user_roles', 'user_uuid') = 'text' THEN
        RAISE NOTICE 'Convertendo user_roles.user_uuid de TEXT para UUID...';
        ALTER TABLE public.user_roles ALTER COLUMN user_uuid TYPE UUID USING (user_uuid::uuid);
    END IF;

    -- Adicionar colunas ausentes às tabelas de perfil se não existirem
    RAISE NOTICE 'Verificando e adicionando colunas ausentes aos perfis...';

    -- student_profiles
    SELECT column_exists('student_profiles', 'nome_completo') INTO col_exists_nome_completo;
    IF NOT col_exists_nome_completo THEN
        RAISE NOTICE 'Adicionando coluna nome_completo à student_profiles...';
        ALTER TABLE public.student_profiles ADD COLUMN nome_completo TEXT NOT NULL DEFAULT 'Nome do Aluno';
    END IF;
    SELECT column_exists('student_profiles', 'grade') INTO col_exists_grade;
    IF NOT col_exists_grade THEN
        RAISE NOTICE 'Adicionando coluna grade à student_profiles...';
        ALTER TABLE public.student_profiles ADD COLUMN grade TEXT;
    END IF;
    SELECT column_exists('student_profiles', 'school') INTO col_exists_school;
    IF NOT col_exists_school THEN
        RAISE NOTICE 'Adicionando coluna school à student_profiles...';
        ALTER TABLE public.student_profiles ADD COLUMN school TEXT;
    END IF;
    SELECT column_exists('student_profiles', 'subject') INTO col_exists_subject;
    IF NOT col_exists_subject THEN
        RAISE NOTICE 'Adicionando coluna subject à student_profiles...';
        ALTER TABLE public.student_profiles ADD COLUMN subject TEXT;
    END IF;

    -- teacher_profiles
    SELECT column_exists('teacher_profiles', 'nome_completo') INTO col_exists_nome_completo;
    IF NOT col_exists_nome_completo THEN
        RAISE NOTICE 'Adicionando coluna nome_completo à teacher_profiles...';
        ALTER TABLE public.teacher_profiles ADD COLUMN nome_completo TEXT NOT NULL DEFAULT 'Nome do Professor';
    END IF;
    SELECT column_exists('teacher_profiles', 'grade') INTO col_exists_grade;
    IF NOT col_exists_grade THEN
        RAISE NOTICE 'Adicionando coluna grade à teacher_profiles...';
        ALTER TABLE public.teacher_profiles ADD COLUMN grade TEXT;
    END IF;
    SELECT column_exists('teacher_profiles', 'school') INTO col_exists_school;
    IF NOT col_exists_school THEN
        RAISE NOTICE 'Adicionando coluna school à teacher_profiles...';
        ALTER TABLE public.teacher_profiles ADD COLUMN school TEXT;
    END IF;
    SELECT column_exists('teacher_profiles', 'subject') INTO col_exists_subject;
    IF NOT col_exists_subject THEN
        RAISE NOTICE 'Adicionando coluna subject à teacher_profiles...';
        ALTER TABLE public.teacher_profiles ADD COLUMN subject TEXT;
    END IF;

    -- Remover usuários de teste existentes para evitar conflitos
    RAISE NOTICE 'Removendo usuários de teste existentes (aluno@teste.com, professor@teste.com)...';
    DELETE FROM auth.users WHERE email = aluno_email;
    DELETE FROM auth.users WHERE email = professor_email;

    -- Inserir usuário de teste Aluno
    RAISE NOTICE 'Inserindo usuário Aluno...';
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
        gen_random_uuid(), -- Gerar UUID explicitamente
        '00000000-0000-0000-0000-000000000000', -- instance_id (pode ser padrão)
        'authenticated',
        'authenticated',
        aluno_email,
        crypt(aluno_password, gen_salt('bf', 6)), -- Senha criptografada
        NOW(), -- Email confirmado
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Aluno Teste", "user_name":"aluno_teste"}',
        NOW(),
        NOW()
    ) RETURNING id INTO aluno_uuid;
    RAISE NOTICE 'UUID do Aluno: %', aluno_uuid;

    -- Inserir usuário de teste Professor
    RAISE NOTICE 'Inserindo usuário Professor...';
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
        gen_random_uuid(), -- Gerar UUID explicitamente
        '00000000-0000-0000-0000-000000000000', -- instance_id (pode ser padrão)
        'authenticated',
        'authenticated',
        professor_email,
        crypt(professor_password, gen_salt('bf', 6)), -- Senha criptografada
        NOW(), -- Email confirmado
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Professor Teste", "user_name":"professor_teste"}',
        NOW(),
        NOW()
    ) RETURNING id INTO professor_uuid;
    RAISE NOTICE 'UUID do Professor: %', professor_uuid;

    -- Inserir ou atualizar perfis e roles
    RAISE NOTICE 'Inserindo/Atualizando perfis e roles...';

    -- Aluno
    INSERT INTO public.student_profiles (user_uuid, nome_completo, grade, school, subject)
    VALUES (aluno_uuid, 'Aluno Teste', '10º Ano', 'Escola Teste', 'Matemática')
    ON CONFLICT (user_uuid) DO UPDATE SET
        nome_completo = EXCLUDED.nome_completo,
        grade = EXCLUDED.grade,
        school = EXCLUDED.school,
        subject = EXCLUDED.subject;

    INSERT INTO public.user_roles (user_uuid, role)
    VALUES (aluno_uuid, 'aluno')
    ON CONFLICT (user_uuid) DO UPDATE SET role = EXCLUDED.role;

    -- Professor
    INSERT INTO public.teacher_profiles (user_uuid, nome_completo, grade, school, subject)
    VALUES (professor_uuid, 'Professor Teste', 'Ensino Médio', 'Universidade Teste', 'Português')
    ON CONFLICT (user_uuid) DO UPDATE SET
        nome_completo = EXCLUDED.nome_completo,
        grade = EXCLUDED.grade,
        school = EXCLUDED.school,
        subject = EXCLUDED.subject;

    INSERT INTO public.user_roles (user_uuid, role)
    VALUES (professor_uuid, 'professor')
    ON CONFLICT (user_uuid) DO UPDATE SET role = EXCLUDED.role;

    -- Reabilitar RLS e recriar políticas
    RAISE NOTICE 'Reabilitando RLS e recriando políticas para student_profiles...';
    ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Students can manage their profile" ON public.student_profiles
    FOR ALL USING (auth.uid() = user_uuid) WITH CHECK (auth.uid() = user_uuid);

    RAISE NOTICE 'Reabilitando RLS e recriando políticas para teacher_profiles...';
    ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Teachers can manage their profile" ON public.teacher_profiles
    FOR ALL USING (auth.uid() = user_uuid) WITH CHECK (auth.uid() = user_uuid);

    RAISE NOTICE 'Reabilitando RLS e recriando políticas para user_roles...';
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Enable read access for all users on user_roles" ON public.user_roles FOR SELECT USING (true);
    CREATE POLICY "Enable insert for authenticated users on user_roles" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_uuid);
    CREATE POLICY "Enable update for authenticated users on user_roles" ON public.user_roles FOR UPDATE USING (auth.uid() = user_uuid);
    CREATE POLICY "Enable delete for authenticated users on user_roles" ON public.user_roles FOR DELETE USING (auth.uid() = user_uuid);

    RAISE NOTICE 'Script de correção e configuração de usuários de teste concluído com sucesso.';

END $$;
