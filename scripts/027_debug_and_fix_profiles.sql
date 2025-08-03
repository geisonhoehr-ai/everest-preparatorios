-- Script para debugar e corrigir sistema de perfis
-- Execute no SQL Editor do Supabase

-- 1. Verificar se as tabelas de perfil existem
SELECT 
    table_name,
    CASE WHEN table_name IS NOT NULL THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END as status
FROM information_schema.tables 
WHERE table_name IN ('user_roles', 'student_profiles', 'teacher_profiles', 'paid_users')
AND table_schema = 'public';

-- 2. Verificar estrutura das tabelas
SELECT 'user_roles' as tabela, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_roles' AND table_schema = 'public'
UNION ALL
SELECT 'student_profiles' as tabela, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'student_profiles' AND table_schema = 'public'
UNION ALL
SELECT 'teacher_profiles' as tabela, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'teacher_profiles' AND table_schema = 'public';

-- 3. Recriar tabelas se necessário
CREATE TABLE IF NOT EXISTS user_roles (
    user_uuid UUID PRIMARY KEY,
    role TEXT NOT NULL DEFAULT 'student',
    first_login BOOLEAN DEFAULT true,
    profile_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_profiles (
    user_uuid UUID PRIMARY KEY REFERENCES user_roles(user_uuid),
    nome_completo TEXT NOT NULL DEFAULT 'Aluno',
    escola TEXT DEFAULT 'Não informado',
    ano_escolar TEXT,
    objetivo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teacher_profiles (
    user_uuid UUID PRIMARY KEY REFERENCES user_roles(user_uuid),
    nome_completo TEXT NOT NULL DEFAULT 'Professor',
    especialidade TEXT DEFAULT 'Geral',
    bio TEXT,
    experiencia_anos INTEGER,
    formacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Garantir que paid_users existe
CREATE TABLE IF NOT EXISTS paid_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Inserir emails de teste em paid_users
INSERT INTO paid_users (email, status) VALUES 
('aluno@teste.com', 'active'),
('professor@teste.com', 'active'), 
('admin@everest.com', 'active'),
('teste@aluno.com', 'active'),
('teste@professor.com', 'active'),
('geisonhoehrai@gmail.com', 'active')
ON CONFLICT (email) DO UPDATE SET 
    status = EXCLUDED.status,
    updated_at = CURRENT_TIMESTAMP;

-- 6. Criar perfis para usuários de teste
DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- Para cada usuário de teste, criar role e perfil
    FOR user_record IN 
        SELECT id, email FROM auth.users 
        WHERE email IN ('professor@teste.com', 'aluno@teste.com', 'teste@professor.com', 'teste@aluno.com')
    LOOP
        -- Inserir role baseado no email
        INSERT INTO user_roles (user_uuid, role, first_login, profile_completed)
        VALUES (
            user_record.id,
            CASE 
                WHEN user_record.email LIKE '%professor%' THEN 'teacher'
                ELSE 'student'
            END,
            false,
            true
        )
        ON CONFLICT (user_uuid) DO UPDATE SET
            role = EXCLUDED.role,
            profile_completed = true,
            updated_at = CURRENT_TIMESTAMP;
        
        -- Criar perfil específico
        IF user_record.email LIKE '%professor%' THEN
            INSERT INTO teacher_profiles (user_uuid, nome_completo, especialidade)
            VALUES (user_record.id, 'Professor Teste', 'Língua Portuguesa')
            ON CONFLICT (user_uuid) DO UPDATE SET
                nome_completo = EXCLUDED.nome_completo,
                especialidade = EXCLUDED.especialidade,
                updated_at = CURRENT_TIMESTAMP;
        ELSE
            INSERT INTO student_profiles (user_uuid, nome_completo, escola)
            VALUES (user_record.id, 'Aluno Teste', 'Escola Teste')
            ON CONFLICT (user_uuid) DO UPDATE SET
                nome_completo = EXCLUDED.nome_completo,
                escola = EXCLUDED.escola,
                updated_at = CURRENT_TIMESTAMP;
        END IF;
        
        RAISE NOTICE 'Perfil criado para: % (role: %)', 
            user_record.email, 
            CASE WHEN user_record.email LIKE '%professor%' THEN 'teacher' ELSE 'student' END;
    END LOOP;
END $$;

-- 7. Verificar resultado final
SELECT 
    au.email,
    ur.role,
    ur.profile_completed,
    CASE 
        WHEN sp.user_uuid IS NOT NULL THEN 'STUDENT_PROFILE'
        WHEN tp.user_uuid IS NOT NULL THEN 'TEACHER_PROFILE'
        ELSE 'NO_PROFILE'
    END as profile_type,
    CASE 
        WHEN pu.email IS NOT NULL THEN 'HAS_PAID_ACCESS'
        ELSE 'NO_PAID_ACCESS'
    END as paid_status
FROM auth.users au
LEFT JOIN user_roles ur ON au.id = ur.user_uuid
LEFT JOIN student_profiles sp ON au.id = sp.user_uuid
LEFT JOIN teacher_profiles tp ON au.id = tp.user_uuid
LEFT JOIN paid_users pu ON au.email = pu.email
WHERE au.email LIKE '%teste.com'
ORDER BY au.email;

-- 8. Função de debug completa
CREATE OR REPLACE FUNCTION debug_user_complete_v2(user_email TEXT)
RETURNS TABLE(
    step TEXT,
    status TEXT,
    details TEXT
) AS $$
DECLARE
    user_uuid_var UUID;
BEGIN
    -- Buscar UUID do usuário
    SELECT au.id INTO user_uuid_var
    FROM auth.users au 
    WHERE au.email = user_email;
    
    RETURN QUERY SELECT 
        'auth_user'::TEXT,
        CASE WHEN user_uuid_var IS NOT NULL THEN 'EXISTS' ELSE 'NOT_FOUND' END::TEXT,
        COALESCE(user_uuid_var::TEXT, 'N/A')::TEXT;
    
    RETURN QUERY SELECT 
        'paid_access'::TEXT,
        CASE WHEN EXISTS(SELECT 1 FROM paid_users WHERE email = user_email AND status = 'active') 
             THEN 'ALLOWED' ELSE 'DENIED' END::TEXT,
        COALESCE((SELECT status FROM paid_users WHERE email = user_email), 'NOT_IN_PAID_USERS')::TEXT;
    
    RETURN QUERY SELECT 
        'user_role'::TEXT,
        COALESCE((SELECT role FROM user_roles WHERE user_uuid = user_uuid_var), 'NO_ROLE')::TEXT,
        CASE WHEN EXISTS(SELECT 1 FROM user_roles WHERE user_uuid = user_uuid_var) 
             THEN 'ROLE_EXISTS' ELSE 'NO_ROLE_RECORD' END::TEXT;
    
    RETURN QUERY SELECT 
        'profiles'::TEXT,
        CASE 
            WHEN EXISTS(SELECT 1 FROM student_profiles WHERE user_uuid = user_uuid_var) THEN 'STUDENT_PROFILE'
            WHEN EXISTS(SELECT 1 FROM teacher_profiles WHERE user_uuid = user_uuid_var) THEN 'TEACHER_PROFILE'
            ELSE 'NO_PROFILE'
        END::TEXT,
        'Profile check completed'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Testar função de debug
SELECT * FROM debug_user_complete_v2('professor@teste.com');

-- 10. Resultado final
SELECT 'SETUP_COMPLETO' as status, 'Tente fazer login novamente!' as message;
