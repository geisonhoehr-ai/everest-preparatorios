-- Script específico para forçar o acesso do aluno

-- Primeiro, vamos ver o que está na tabela paid_users
SELECT 'ANTES:' as status, email, status as user_status FROM paid_users WHERE email = 'aluno@teste.com';

-- Forçar inserção do aluno
INSERT INTO paid_users (email, status, created_at, updated_at) 
VALUES ('aluno@teste.com', 'active', NOW(), NOW())
ON CONFLICT (email) 
DO UPDATE SET 
    status = 'active',
    updated_at = NOW();

-- Verificar depois
SELECT 'DEPOIS:' as status, email, status as user_status FROM paid_users WHERE email = 'aluno@teste.com';

-- Testar a função
SELECT 
    'TESTE FINAL:' as status,
    'aluno@teste.com' as email,
    check_paid_access('aluno@teste.com') as tem_acesso;

-- Se a função não existir, vamos criá-la
CREATE OR REPLACE FUNCTION check_paid_access(user_email text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM paid_users 
        WHERE email = user_email AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql;

-- Testar novamente
SELECT 
    'TESTE COM FUNÇÃO RECRIADA:' as status,
    'aluno@teste.com' as email,
    check_paid_access('aluno@teste.com') as tem_acesso;
