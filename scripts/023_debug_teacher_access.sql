-- Script para debug e correção do acesso de professores
-- Executar no SQL Editor do Supabase

-- 1. Verificar e recriar tabela paid_users se necessário
DROP TABLE IF EXISTS paid_users CASCADE;
CREATE TABLE paid_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Inserir usuários de teste
INSERT INTO paid_users (email, status) VALUES 
('teste@professor.com', 'active'),
('teste@aluno.com', 'active'),
('admin@teste.com', 'active'),
('professor@exemplo.com', 'active'),
('aluno@exemplo.com', 'active')
ON CONFLICT (email) DO UPDATE SET 
    status = EXCLUDED.status,
    updated_at = NOW();

-- 3. Verificar estrutura da tabela user_roles
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_roles';

-- 4. Verificar dados existentes
SELECT 
    ur.user_uuid,
    ur.role,
    ur.first_login,
    ur.profile_completed,
    au.email
FROM user_roles ur
LEFT JOIN auth.users au ON ur.user_uuid = au.id::text
ORDER BY ur.created_at DESC
LIMIT 10;

-- 5. Função de debug completa
CREATE OR REPLACE FUNCTION debug_user_complete(user_email TEXT)
RETURNS TABLE(
    step TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- Verificar se usuário existe no auth
    RETURN QUERY
    SELECT 
        'auth_user'::TEXT,
        CASE WHEN EXISTS(SELECT 1 FROM auth.users WHERE email = user_email) 
             THEN 'EXISTS' ELSE 'NOT_FOUND' END::TEXT,
        COALESCE((SELECT id::TEXT FROM auth.users WHERE email = user_email), 'N/A')::TEXT;
    
    -- Verificar paid_users
    RETURN QUERY
    SELECT 
        'paid_user'::TEXT,
        CASE WHEN EXISTS(SELECT 1 FROM paid_users WHERE email = user_email) 
             THEN 'EXISTS' ELSE 'NOT_FOUND' END::TEXT,
        COALESCE((SELECT status FROM paid_users WHERE email = user_email), 'N/A')::TEXT;
    
    -- Verificar user_roles
    RETURN QUERY
    SELECT 
        'user_role'::TEXT,
        CASE WHEN EXISTS(
            SELECT 1 FROM user_roles ur 
            JOIN auth.users au ON ur.user_uuid = au.id::text 
            WHERE au.email = user_email
        ) THEN 'EXISTS' ELSE 'NOT_FOUND' END::TEXT,
        COALESCE((
            SELECT ur.role FROM user_roles ur 
            JOIN auth.users au ON ur.user_uuid = au.id::text 
            WHERE au.email = user_email
        ), 'N/A')::TEXT;
    
    -- Verificar perfis
    RETURN QUERY
    SELECT 
        'student_profile'::TEXT,
        CASE WHEN EXISTS(
            SELECT 1 FROM student_profiles sp 
            JOIN auth.users au ON sp.user_uuid = au.id::text 
            WHERE au.email = user_email
        ) THEN 'EXISTS' ELSE 'NOT_FOUND' END::TEXT,
        COALESCE((
            SELECT sp.nome_completo FROM student_profiles sp 
            JOIN auth.users au ON sp.user_uuid = au.id::text 
            WHERE au.email = user_email
        ), 'N/A')::TEXT;
    
    RETURN QUERY
    SELECT 
        'teacher_profile'::TEXT,
        CASE WHEN EXISTS(
            SELECT 1 FROM teacher_profiles tp 
            JOIN auth.users au ON tp.user_uuid = au.id::text 
            WHERE au.email = user_email
        ) THEN 'EXISTS' ELSE 'NOT_FOUND' END::TEXT,
        COALESCE((
            SELECT tp.nome_completo FROM teacher_profiles tp 
            JOIN auth.users au ON tp.user_uuid = au.id::text 
            WHERE au.email = user_email
        ), 'N/A')::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 6. Limpar dados inconsistentes (opcional)
-- DELETE FROM user_roles WHERE user_uuid NOT IN (SELECT id::text FROM auth.users);

-- 7. Verificar tabelas relacionadas
SELECT 'turmas' as tabela, COUNT(*) as total FROM turmas;
SELECT 'redacoes' as tabela, COUNT(*) as total FROM redacoes;
SELECT 'student_profiles' as tabela, COUNT(*) as total FROM student_profiles;
SELECT 'teacher_profiles' as tabela, COUNT(*) as total FROM teacher_profiles;

-- 8. Criar alguns dados de exemplo se não existirem
INSERT INTO turmas (id, nome, codigo_acesso, periodo, ativa, professor_uuid) VALUES 
('turma-2024-a', 'Turma 2024 A', 'TURMA2024A', '2024.1', true, '00000000-0000-0000-0000-000000000000'),
('turma-2024-b', 'Turma 2024 B', 'TURMA2024B', '2024.1', true, '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- 9. Mensagem final
SELECT 'SETUP_COMPLETE' as status, 'Execute: SELECT * FROM debug_user_complete(''seu-email@aqui.com'');' as next_step;
