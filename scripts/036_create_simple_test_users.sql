-- Script para criar usuários de teste funcionais de forma simples

-- Limpar dados existentes dos usuários de teste
DELETE FROM student_profiles WHERE user_uuid IN (
    SELECT id FROM auth.users WHERE email IN ('aluno@teste.com', 'professor@teste.com')
);

DELETE FROM teacher_profiles WHERE user_uuid IN (
    SELECT id FROM auth.users WHERE email IN ('aluno@teste.com', 'professor@teste.com')
);

DELETE FROM user_roles WHERE user_uuid IN (
    SELECT id FROM auth.users WHERE email IN ('aluno@teste.com', 'professor@teste.com')
);

DELETE FROM paid_users WHERE email IN ('aluno@teste.com', 'professor@teste.com');

-- Garantir acesso pago para ambos
INSERT INTO paid_users (email, status, created_at, updated_at) VALUES
('aluno@teste.com', 'active', NOW(), NOW()),
('professor@teste.com', 'active', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET status = 'active', updated_at = NOW();

-- Configurar roles para os usuários existentes
DO $$
DECLARE
    aluno_uuid UUID;
    professor_uuid UUID;
BEGIN
    -- Buscar UUIDs dos usuários
    SELECT id INTO aluno_uuid FROM auth.users WHERE email = 'aluno@teste.com';
    SELECT id INTO professor_uuid FROM auth.users WHERE email = 'professor@teste.com';
    
    -- Configurar aluno
    IF aluno_uuid IS NOT NULL THEN
        INSERT INTO user_roles (user_uuid, role, first_login, profile_completed, created_at, updated_at)
        VALUES (aluno_uuid, 'student', false, true, NOW(), NOW())
        ON CONFLICT (user_uuid) DO UPDATE SET 
            role = 'student', first_login = false, profile_completed = true, updated_at = NOW();
        
        INSERT INTO student_profiles (user_uuid, name, grade, school, created_at, updated_at)
        VALUES (aluno_uuid, 'Aluno Teste', '3º Ano', 'Escola Teste', NOW(), NOW())
        ON CONFLICT (user_uuid) DO UPDATE SET updated_at = NOW();
        
        RAISE NOTICE 'Aluno configurado: %', aluno_uuid;
    END IF;
    
    -- Configurar professor
    IF professor_uuid IS NOT NULL THEN
        INSERT INTO user_roles (user_uuid, role, first_login, profile_completed, created_at, updated_at)
        VALUES (professor_uuid, 'teacher', false, true, NOW(), NOW())
        ON CONFLICT (user_uuid) DO UPDATE SET 
            role = 'teacher', first_login = false, profile_completed = true, updated_at = NOW();
        
        INSERT INTO teacher_profiles (user_uuid, name, subject, school, created_at, updated_at)
        VALUES (professor_uuid, 'Professor Teste', 'Português', 'Escola Teste', NOW(), NOW())
        ON CONFLICT (user_uuid) DO UPDATE SET updated_at = NOW();
        
        RAISE NOTICE 'Professor configurado: %', professor_uuid;
    END IF;
END $$;

-- Verificar configuração final
SELECT 
    'USUÁRIOS DE TESTE CONFIGURADOS!' as status,
    'aluno@teste.com / 123456 (Aluno)' as credencial_1,
    'professor@teste.com / 123456 (Professor)' as credencial_2;

-- Mostrar status final
SELECT 
    u.email,
    u.email_confirmed_at IS NOT NULL as email_ok,
    pu.status as paid_status,
    ur.role as user_role,
    CASE 
        WHEN ur.role = 'student' THEN sp.name
        WHEN ur.role = 'teacher' THEN tp.name
        ELSE 'N/A'
    END as profile_name
FROM auth.users u
LEFT JOIN paid_users pu ON u.email = pu.email
LEFT JOIN user_roles ur ON u.id = ur.user_uuid
LEFT JOIN student_profiles sp ON u.id = sp.user_uuid AND ur.role = 'student'
LEFT JOIN teacher_profiles tp ON u.id = tp.user_uuid AND ur.role = 'teacher'
WHERE u.email IN ('aluno@teste.com', 'professor@teste.com')
ORDER BY u.email;
