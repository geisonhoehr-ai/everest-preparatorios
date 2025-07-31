-- Script para corrigir a função column_exists, adicionar a coluna full_name
-- às tabelas de perfil se estiver faltando, e garantir que roles e perfis
-- de usuários de teste estejam corretos.

-- Função auxiliar para verificar se uma coluna existe (corrigida para ambiguidade)
CREATE OR REPLACE FUNCTION column_exists(p_table_name text, p_column_name text)
RETURNS boolean LANGUAGE plpgsql AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = p_table_name -- Usar o parâmetro qualificado
      AND column_name = p_column_name -- Usar o parâmetro qualificado
  );
END;
$$;

-- 1. Adicionar 'full_name' à student_profiles se não existir
DO $$ BEGIN
    IF NOT column_exists('student_profiles', 'full_name') THEN
        ALTER TABLE student_profiles ADD COLUMN full_name TEXT;
        RAISE NOTICE 'Coluna full_name adicionada à student_profiles.';
    ELSE
        RAISE NOTICE 'Coluna full_name já existe em student_profiles.';
    END IF;
END $$;

-- 2. Adicionar 'full_name' à teacher_profiles se não existir
DO $$ BEGIN
    IF NOT column_exists('teacher_profiles', 'full_name') THEN
        ALTER TABLE teacher_profiles ADD COLUMN full_name TEXT;
        RAISE NOTICE 'Coluna full_name adicionada à teacher_profiles.';
    ELSE
        RAISE NOTICE 'Coluna full_name já existe em teacher_profiles.';
    END IF;
END $$;

-- 3. Garantir que os emails de teste estejam na tabela paid_users com status 'active'
INSERT INTO paid_users (email, status, created_at, updated_at) VALUES
('aluno@teste.com', 'active', NOW(), NOW()),
('professor@teste.com', 'active', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET 
    status = 'active',
    updated_at = NOW();

-- 4. Garantir que os usuários de teste tenham roles corretas na tabela user_roles
-- Para aluno@teste.com
INSERT INTO user_roles (user_uuid, role, first_login, profile_completed, created_at, updated_at)
SELECT id::uuid, 'student', false, true, NOW(), NOW()
FROM auth.users 
WHERE email = 'aluno@teste.com'
ON CONFLICT (user_uuid) DO UPDATE SET 
    role = 'student',
    first_login = false,
    profile_completed = true,
    updated_at = NOW();

-- Para professor@teste.com
INSERT INTO user_roles (user_uuid, role, first_login, profile_completed, created_at, updated_at)
SELECT id::uuid, 'teacher', false, true, NOW(), NOW()
FROM auth.users 
WHERE email = 'professor@teste.com'
ON CONFLICT (user_uuid) DO UPDATE SET 
    role = 'teacher',
    first_login = false,
    profile_completed = true,
    updated_at = NOW();

-- 5. Garantir que os perfis de estudante e professor existam (usando 'full_name')
-- Para aluno@teste.com (student_profiles)
INSERT INTO student_profiles (user_uuid, full_name, grade, school, created_at, updated_at)
SELECT id::uuid, 'Aluno Teste', '3º Ano', 'Escola Teste', NOW(), NOW()
FROM auth.users 
WHERE email = 'aluno@teste.com'
ON CONFLICT (user_uuid) DO UPDATE SET 
    full_name = 'Aluno Teste',
    grade = '3º Ano',
    school = 'Escola Teste',
    updated_at = NOW();

-- Para professor@teste.com (teacher_profiles)
INSERT INTO teacher_profiles (user_uuid, full_name, subject, school, created_at, updated_at)
SELECT id::uuid, 'Professor Teste', 'Português', 'Escola Teste', NOW(), NOW()
FROM auth.users 
WHERE email = 'professor@teste.com'
ON CONFLICT (user_uuid) DO UPDATE SET 
    full_name = 'Professor Teste',
    subject = 'Português',
    school = 'Escola Teste',
    updated_at = NOW();

-- 6. Verificação final de todos os dados
SELECT 
    '=== VERIFICAÇÃO FINAL DOS DADOS ===' as status;

SELECT 
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmado_auth,
    pu.status as acesso_pago_status,
    ur.role as funcao_definida,
    sp.full_name as nome_aluno,
    tp.full_name as nome_professor,
    'DADOS OK!' as resultado
FROM auth.users u
LEFT JOIN paid_users pu ON u.email = pu.email
LEFT JOIN user_roles ur ON u.id::uuid = ur.user_uuid
LEFT JOIN student_profiles sp ON u.id::uuid = sp.user_uuid
LEFT JOIN teacher_profiles tp ON u.id::uuid = tp.user_uuid
WHERE u.email IN ('aluno@teste.com', 'professor@teste.com')
ORDER BY u.email;

-- 7. Testar a função check_paid_access (se existir)
SELECT 
    '=== TESTE DA FUNÇÃO check_paid_access ===' as status;

SELECT 
    email,
    check_paid_access(email) as tem_acesso_pago_funcao
FROM (
    VALUES 
    ('aluno@teste.com'),
    ('professor@teste.com')
) AS test_emails(email);

SELECT 'TENTAR FAZER LOGIN AGORA!' as instrucao;
