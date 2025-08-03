-- Script para criar tabelas ausentes e corrigir o sistema de login
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela user_roles se não existir
CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    user_uuid TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
    first_login BOOLEAN DEFAULT true,
    profile_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela teacher_profiles se não existir
CREATE TABLE IF NOT EXISTS teacher_profiles (
    id SERIAL PRIMARY KEY,
    user_uuid TEXT UNIQUE NOT NULL,
    nome_completo TEXT NOT NULL,
    especialidade TEXT,
    formacao TEXT,
    experiencia_anos INTEGER,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela student_profiles se não existir
CREATE TABLE IF NOT EXISTS student_profiles (
    id SERIAL PRIMARY KEY,
    user_uuid TEXT UNIQUE NOT NULL,
    nome_completo TEXT NOT NULL,
    escola TEXT,
    ano_escolar TEXT CHECK (ano_escolar IN ('1ano', '2ano', '3ano')),
    data_nascimento DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela paid_users se não existir
CREATE TABLE IF NOT EXISTS paid_users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Habilitar RLS nas tabelas
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE paid_users ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS básicas
-- Política para user_roles
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
CREATE POLICY "Users can view their own role" ON user_roles
    FOR SELECT USING (auth.uid()::text = user_uuid);

DROP POLICY IF EXISTS "Users can update their own role" ON user_roles;
CREATE POLICY "Users can update their own role" ON user_roles
    FOR ALL USING (auth.uid()::text = user_uuid);

-- Política para teacher_profiles
DROP POLICY IF EXISTS "Teachers can manage their profile" ON teacher_profiles;
CREATE POLICY "Teachers can manage their profile" ON teacher_profiles
    FOR ALL USING (auth.uid()::text = user_uuid);

-- Política para student_profiles
DROP POLICY IF EXISTS "Students can manage their profile" ON student_profiles;
CREATE POLICY "Students can manage their profile" ON student_profiles
    FOR ALL USING (auth.uid()::text = user_uuid);

-- Política para paid_users (apenas leitura para usuários autenticados)
DROP POLICY IF EXISTS "Authenticated users can view paid status" ON paid_users;
CREATE POLICY "Authenticated users can view paid status" ON paid_users
    FOR SELECT USING (auth.role() = 'authenticated');

-- 7. Verificar usuários existentes no auth.users
SELECT 'AUTH_USERS' as tabela, email, id, email_confirmed_at, created_at 
FROM auth.users 
WHERE email IN ('professor@teste.com', 'aluno@teste.com')
ORDER BY email;

-- 8. Garantir que usuários de teste existam em paid_users
INSERT INTO paid_users (email, status) VALUES 
('professor@teste.com', 'active'),
('aluno@teste.com', 'active')
ON CONFLICT (email) DO UPDATE SET 
    status = 'active',
    updated_at = NOW();

-- 9. Configurar roles para usuários existentes
DO $$
DECLARE
    professor_id uuid;
    aluno_id uuid;
BEGIN
    -- Buscar IDs dos usuários
    SELECT id INTO professor_id FROM auth.users WHERE email = 'professor@teste.com';
    SELECT id INTO aluno_id FROM auth.users WHERE email = 'aluno@teste.com';
    
    -- Configurar role de professor
    IF professor_id IS NOT NULL THEN
        INSERT INTO user_roles (user_uuid, role, first_login, profile_completed)
        VALUES (professor_id::text, 'teacher', false, true)
        ON CONFLICT (user_uuid) DO UPDATE SET 
            role = 'teacher',
            profile_completed = true,
            updated_at = NOW();
        
        -- Criar perfil de professor
        INSERT INTO teacher_profiles (user_uuid, nome_completo, especialidade, formacao)
        VALUES (professor_id::text, 'Professor Teste', 'Língua Portuguesa', 'Licenciatura em Letras')
        ON CONFLICT (user_uuid) DO UPDATE SET
            nome_completo = 'Professor Teste',
            especialidade = 'Língua Portuguesa',
            formacao = 'Licenciatura em Letras';
            
        RAISE NOTICE 'Professor configurado: professor@teste.com (ID: %)', professor_id;
    ELSE
        RAISE NOTICE 'ATENÇÃO: Usuário professor@teste.com não encontrado no auth.users - você precisa criar este usuário primeiro!';
    END IF;
    
    -- Configurar role de aluno
    IF aluno_id IS NOT NULL THEN
        INSERT INTO user_roles (user_uuid, role, first_login, profile_completed)
        VALUES (aluno_id::text, 'student', false, true)
        ON CONFLICT (user_uuid) DO UPDATE SET 
            role = 'student',
            profile_completed = true,
            updated_at = NOW();
        
        -- Criar perfil de aluno
        INSERT INTO student_profiles (user_uuid, nome_completo, escola, ano_escolar)
        VALUES (aluno_id::text, 'Aluno Teste', 'Escola Teste', '3ano')
        ON CONFLICT (user_uuid) DO UPDATE SET
            nome_completo = 'Aluno Teste',
            escola = 'Escola Teste',
            ano_escolar = '3ano';
            
        RAISE NOTICE 'Aluno configurado: aluno@teste.com (ID: %)', aluno_id;
    ELSE
        RAISE NOTICE 'ATENÇÃO: Usuário aluno@teste.com não encontrado no auth.users - você precisa criar este usuário primeiro!';
    END IF;
    
    RAISE NOTICE '✅ Script executado! Verifique os resultados abaixo.';
END $$;

-- 10. Verificar configuração final
SELECT 
    'FINAL_CHECK' as status,
    au.email,
    au.email_confirmed_at IS NOT NULL as email_confirmed,
    pu.status as paid_status,
    ur.role,
    CASE 
        WHEN ur.role = 'student' AND sp.user_uuid IS NOT NULL THEN 'student_profile_ok'
        WHEN ur.role = 'teacher' AND tp.user_uuid IS NOT NULL THEN 'teacher_profile_ok'
        ELSE 'profile_missing'
    END as profile_status
FROM auth.users au
LEFT JOIN paid_users pu ON au.email = pu.email
LEFT JOIN user_roles ur ON au.id::text = ur.user_uuid
LEFT JOIN student_profiles sp ON au.id::text = sp.user_uuid
LEFT JOIN teacher_profiles tp ON au.id::text = tp.user_uuid
WHERE au.email IN ('professor@teste.com', 'aluno@teste.com')
ORDER BY au.email;

-- 11. Mostrar todas as tabelas criadas
SELECT 'TABELAS_CRIADAS' as info, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_roles', 'teacher_profiles', 'student_profiles', 'paid_users')
ORDER BY table_name;
