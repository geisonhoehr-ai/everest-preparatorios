-- Script para corrigir a função column_exists, adicionar TODAS as colunas
-- necessárias às tabelas de perfil se estiverem faltando, e garantir que
-- roles e perfis de usuários de teste estejam corretos.

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

-- 1. Adicionar colunas à student_profiles se não existirem
DO $$ BEGIN
    IF NOT column_exists('student_profiles', 'nome_completo') THEN
        ALTER TABLE student_profiles ADD COLUMN nome_completo TEXT NOT NULL DEFAULT 'Nome Completo Padrão';
        RAISE NOTICE 'Coluna nome_completo adicionada à student_profiles.';
    END IF;
    IF NOT column_exists('student_profiles', 'grade') THEN
        ALTER TABLE student_profiles ADD COLUMN grade TEXT;
        RAISE NOTICE 'Coluna grade adicionada à student_profiles.';
    END IF;
    IF NOT column_exists('student_profiles', 'school') THEN
        ALTER TABLE student_profiles ADD COLUMN school TEXT;
        RAISE NOTICE 'Coluna school adicionada à student_profiles.';
    END IF;
END $$;

-- 2. Adicionar colunas à teacher_profiles se não existirem
DO $$ BEGIN
    IF NOT column_exists('teacher_profiles', 'nome_completo') THEN
        ALTER TABLE teacher_profiles ADD COLUMN nome_completo TEXT NOT NULL DEFAULT 'Nome Completo Padrão';
        RAISE NOTICE 'Coluna nome_completo adicionada à teacher_profiles.';
    END IF;
    IF NOT column_exists('teacher_profiles', 'subject') THEN
        ALTER TABLE teacher_profiles ADD COLUMN subject TEXT;
        RAISE NOTICE 'Coluna subject adicionada à teacher_profiles.';
    END IF;
    IF NOT column_exists('teacher_profiles', 'school') THEN
        ALTER TABLE teacher_profiles ADD COLUMN school TEXT;
        RAISE NOTICE 'Coluna school adicionada à teacher_profiles.';
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

-- 5. Garantir que os perfis de estudante e professor existam (usando 'nome_completo', 'grade', 'school', 'subject')
-- Para aluno@teste.com (student_profiles)
INSERT INTO student_profiles (user_uuid, nome_completo, grade, school, created_at, updated_at)
SELECT id::uuid, 'Aluno Teste', '3º Ano', 'Escola Teste', NOW(), NOW()
FROM auth.users 
WHERE email = 'aluno@teste.com'
ON CONFLICT (user_uuid) DO UPDATE SET 
    nome_completo = 'Aluno Teste',
    grade = '3º Ano',
    school = 'Escola Teste',
    updated_at = NOW();

-- Para professor@teste.com (teacher_profiles)
INSERT INTO teacher_profiles (user_uuid, nome_completo, subject, school, created_at, updated_at)
SELECT id::uuid, 'Professor Teste', 'Português', 'Escola Teste', NOW(), NOW()
FROM auth.users 
WHERE email = 'professor@teste.com'
ON CONFLICT (user_uuid) DO UPDATE SET 
    nome_completo = 'Professor Teste',
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
    sp.nome_completo as nome_aluno,
    sp.grade as serie_aluno,
    sp.school as escola_aluno,
    tp.nome_completo as nome_professor,
    tp.subject as materia_professor,
    tp.school as escola_professor,
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
