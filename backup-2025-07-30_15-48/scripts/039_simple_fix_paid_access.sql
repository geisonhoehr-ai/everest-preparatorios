-- Script simples para garantir acesso pago aos usuários de teste

-- Inserir ou atualizar acesso pago para ambos os usuários
INSERT INTO paid_users (email, status, created_at, updated_at) 
VALUES 
    ('aluno@teste.com', 'active', NOW(), NOW()),
    ('professor@teste.com', 'active', NOW(), NOW())
ON CONFLICT (email) 
DO UPDATE SET 
    status = 'active',
    updated_at = NOW();

-- Verificar se foram inseridos
SELECT 'VERIFICAÇÃO:' as status, email, status as user_status 
FROM paid_users 
WHERE email IN ('aluno@teste.com', 'professor@teste.com');

-- Criar ou recriar a função de verificação
CREATE OR REPLACE FUNCTION check_paid_access(user_email text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM paid_users 
        WHERE email = user_email AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql;

-- Testar a função para ambos os usuários
SELECT 
    'aluno@teste.com' as email,
    check_paid_access('aluno@teste.com') as tem_acesso;

SELECT 
    'professor@teste.com' as email,
    check_paid_access('professor@teste.com') as tem_acesso;
