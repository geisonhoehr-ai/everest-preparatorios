-- Script seguro para corrigir políticas RLS sem perder dados

-- 1. Verificar estrutura atual da tabela user_roles
DO $$
BEGIN
    -- Verificar se a tabela existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        RAISE NOTICE 'Tabela user_roles já existe. Verificando estrutura...';
        
        -- Verificar se tem a coluna 'role' (não 'roles')
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'user_roles' AND column_name = 'role') THEN
            RAISE NOTICE 'Adicionando coluna role...';
            ALTER TABLE public.user_roles ADD COLUMN role text;
        END IF;
        
        -- Verificar constraint CHECK
        IF NOT EXISTS (SELECT FROM information_schema.check_constraints 
                      WHERE constraint_name LIKE '%role%' AND table_name = 'user_roles') THEN
            RAISE NOTICE 'Adicionando constraint CHECK para role...';
            ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check 
            CHECK (role IN ('student', 'teacher', 'admin'));
        END IF;
        
    ELSE
        RAISE NOTICE 'Criando tabela user_roles...';
        -- Criar tabela se não existir
        CREATE TABLE public.user_roles (
            id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            user_uuid uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            role text NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
            first_login boolean DEFAULT true,
            profile_completed boolean DEFAULT false,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now(),
            UNIQUE(user_uuid)  -- Um usuário = um role apenas
        );
    END IF;
END $$;

-- 2. Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Allow insert own role" ON public.user_roles;
DROP POLICY IF EXISTS "Allow update own role" ON public.user_roles;
DROP POLICY IF EXISTS "Allow select own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;

-- 4. Criar políticas corretas
CREATE POLICY "Allow insert own role" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (user_uuid = auth.uid());

CREATE POLICY "Allow update own role" 
ON public.user_roles 
FOR UPDATE 
USING (user_uuid = auth.uid());

CREATE POLICY "Allow select own role" 
ON public.user_roles 
FOR SELECT 
USING (user_uuid = auth.uid());

-- 5. Criar índice se não existir
CREATE INDEX IF NOT EXISTS idx_user_roles_user_uuid ON public.user_roles(user_uuid);

-- 6. Corrigir tabelas de perfil
-- student_profiles
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow upsert own student profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Students can manage own profile" ON public.student_profiles;

CREATE POLICY "Allow upsert own student profile"
ON public.student_profiles
FOR ALL
USING (user_uuid = auth.uid())
WITH CHECK (user_uuid = auth.uid());

-- teacher_profiles  
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow upsert own teacher profile" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Teachers can manage own profile" ON public.teacher_profiles;

CREATE POLICY "Allow upsert own teacher profile"
ON public.teacher_profiles
FOR ALL
USING (user_uuid = auth.uid())
WITH CHECK (user_uuid = auth.uid());

-- 7. Verificar se usuários de teste têm roles
DO $$
DECLARE
    test_user_id uuid;
BEGIN
    -- Professor de teste
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'professor@teste.com';
    IF test_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_uuid, role, first_login, profile_completed)
        VALUES (test_user_id, 'teacher', false, true)
        ON CONFLICT (user_uuid) DO UPDATE SET 
            role = 'teacher', 
            profile_completed = true;
        
        INSERT INTO public.teacher_profiles (user_uuid, nome_completo, especialidade)
        VALUES (test_user_id, 'Professor Teste', 'Português')
        ON CONFLICT (user_uuid) DO NOTHING;
        
        RAISE NOTICE 'Role de professor configurado para professor@teste.com';
    END IF;
    
    -- Aluno de teste
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'aluno@teste.com';
    IF test_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_uuid, role, first_login, profile_completed)
        VALUES (test_user_id, 'student', false, true)
        ON CONFLICT (user_uuid) DO UPDATE SET 
            role = 'student', 
            profile_completed = true;
        
        INSERT INTO public.student_profiles (user_uuid, nome_completo, escola)
        VALUES (test_user_id, 'Aluno Teste', 'Escola Teste')
        ON CONFLICT (user_uuid) DO NOTHING;
        
        RAISE NOTICE 'Role de aluno configurado para aluno@teste.com';
    END IF;
END $$;

-- 8. Garantir que usuários de teste estão em paid_users
INSERT INTO public.paid_users (email, status) VALUES 
('professor@teste.com', 'active'),
('aluno@teste.com', 'active'),
('teste@aluno.com', 'active'),
('teste@professor.com', 'active'),
('admin@everest.com', 'active')
ON CONFLICT (email) DO UPDATE SET status = 'active';

RAISE NOTICE '✅ Script executado com sucesso! Políticas RLS configuradas.';
