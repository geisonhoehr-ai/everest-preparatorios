-- Script para corrigir controle de acesso pago
-- Executar no SQL Editor do Supabase

-- 1. Recriar tabela paid_users com estrutura correta
DROP TABLE IF EXISTS paid_users CASCADE;
CREATE TABLE paid_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Inserir apenas alguns emails de teste (simular usuários pagos)
INSERT INTO paid_users (email, status) VALUES 
('aluno@teste.com', 'active'),
('professor@teste.com', 'active'),
('admin@everest.com', 'active'),
('teste@aluno.com', 'active'),
('teste@professor.com', 'active')
ON CONFLICT (email) DO UPDATE SET 
    status = EXCLUDED.status,
    updated_at = NOW();

-- 3. Função para verificar se usuário tem acesso pago
CREATE OR REPLACE FUNCTION check_paid_access(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM paid_users 
        WHERE email = user_email 
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Função de debug para verificar status do usuário
CREATE OR REPLACE FUNCTION debug_user_access(user_email TEXT)
RETURNS TABLE(
    check_type TEXT,
    result TEXT,
    details TEXT
) AS $$
DECLARE
    user_uuid_var UUID;
BEGIN
    -- Buscar UUID do usuário
    SELECT au.id INTO user_uuid_var
    FROM auth.users au 
    WHERE au.email = user_email;
    
    -- Verificar se existe no auth
    RETURN QUERY SELECT 
        'auth_user'::TEXT,
        CASE WHEN user_uuid_var IS NOT NULL THEN 'EXISTS' ELSE 'NOT_FOUND' END::TEXT,
        COALESCE(user_uuid_var::TEXT, 'N/A')::TEXT;
    
    -- Verificar se tem acesso pago
    RETURN QUERY SELECT 
        'paid_access'::TEXT,
        CASE WHEN check_paid_access(user_email) THEN 'ALLOWED' ELSE 'DENIED' END::TEXT,
        COALESCE((SELECT status FROM paid_users WHERE email = user_email), 'NOT_IN_PAID_USERS')::TEXT;
    
    -- Verificar role
    RETURN QUERY SELECT 
        'user_role'::TEXT,
        COALESCE((SELECT role FROM user_roles WHERE user_uuid = user_uuid_var::TEXT), 'NO_ROLE')::TEXT,
        CASE WHEN EXISTS(SELECT 1 FROM user_roles WHERE user_uuid = user_uuid_var::TEXT) 
             THEN 'ROLE_EXISTS' ELSE 'NO_ROLE_RECORD' END::TEXT;
    
    -- Verificar perfis
    RETURN QUERY SELECT 
        'profiles'::TEXT,
        CASE 
            WHEN EXISTS(SELECT 1 FROM student_profiles WHERE user_uuid = user_uuid_var::TEXT) THEN 'STUDENT_PROFILE'
            WHEN EXISTS(SELECT 1 FROM teacher_profiles WHERE user_uuid = user_uuid_var::TEXT) THEN 'TEACHER_PROFILE'
            ELSE 'NO_PROFILE'
        END::TEXT,
        'Profile check completed'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Limpar dados de usuários não pagos (opcional - cuidado em produção)
-- DELETE FROM user_roles WHERE user_uuid::TEXT IN (
--     SELECT au.id::TEXT FROM auth.users au 
--     WHERE au.email NOT IN (SELECT email FROM paid_users)
-- );

-- 6. Verificar estrutura final
SELECT 'PAID_USERS_COUNT' as info, COUNT(*) as value FROM paid_users;
SELECT 'SAMPLE_CHECK' as info, check_paid_access('aluno@teste.com') as value;

-- 7. Mostrar emails com acesso
SELECT 'EMAILS_WITH_ACCESS' as info, email as value FROM paid_users WHERE status = 'active';
