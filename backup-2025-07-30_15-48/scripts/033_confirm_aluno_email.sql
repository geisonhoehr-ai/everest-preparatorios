-- Script para confirmar o email do usuário aluno@teste.com
-- Execute no SQL Editor do Supabase

-- 1. Verificar status atual do usuário aluno
SELECT 
    email,
    email_confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'EMAIL CONFIRMADO'
        ELSE 'EMAIL NÃO CONFIRMADO'
    END as status_email
FROM auth.users 
WHERE email = 'aluno@teste.com';

-- 2. Confirmar o email do aluno
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'aluno@teste.com'
AND email_confirmed_at IS NULL;

-- 3. Verificar se foi confirmado
SELECT 
    email,
    email_confirmed_at,
    'EMAIL CONFIRMADO COM SUCESSO' as status
FROM auth.users 
WHERE email = 'aluno@teste.com';

-- 4. Garantir que o aluno está configurado corretamente
DO $$
DECLARE
    aluno_id uuid;
BEGIN
    -- Buscar ID do aluno
    SELECT id INTO aluno_id FROM auth.users WHERE email = 'aluno@teste.com';
    
    IF aluno_id IS NOT NULL THEN
        -- Garantir que está em paid_users
        INSERT INTO paid_users (email, status) 
        VALUES ('aluno@teste.com', 'active')
        ON CONFLICT (email) DO UPDATE SET status = 'active';
        
        -- Configurar role
        INSERT INTO user_roles (user_uuid, role, first_login, profile_completed)
        VALUES (aluno_id::text, 'student', false, true)
        ON CONFLICT (user_uuid) DO UPDATE SET 
            role = 'student',
            profile_completed = true;
        
        -- Criar perfil se não existir
        INSERT INTO student_profiles (user_uuid, nome_completo, escola, ano_escolar)
        VALUES (aluno_id::text, 'Aluno Teste', 'Escola Teste', '3ano')
        ON CONFLICT (user_uuid) DO NOTHING;
            
        RAISE NOTICE '✅ Aluno configurado completamente: aluno@teste.com';
    ELSE
        RAISE NOTICE '❌ Aluno não encontrado!';
    END IF;
END $$;

-- 5. Verificação final
SELECT 
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmado,
    pu.status as acesso_pago,
    ur.role as role_usuario,
    sp.nome_completo as nome_perfil
FROM auth.users u
LEFT JOIN paid_users pu ON u.email = pu.email
LEFT JOIN user_roles ur ON u.id::text = ur.user_uuid
LEFT JOIN student_profiles sp ON u.id::text = sp.user_uuid
WHERE u.email = 'aluno@teste.com';

-- Resultado esperado
SELECT 'ALUNO_CONFIGURADO' as status, 'Tente fazer login agora com aluno@teste.com / 123456' as instrucao;
