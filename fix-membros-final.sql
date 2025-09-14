-- 🚨 CORREÇÃO FINAL - PÁGINA DE MEMBROS
-- Execute este SQL para corrigir definitivamente a página de membros

-- 1. Verificar e corrigir estrutura da tabela user_profiles
-- Adicionar coluna email se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'email') THEN
        ALTER TABLE user_profiles ADD COLUMN email VARCHAR(255);
    END IF;
END $$;

-- 2. Inserir user_profiles para todos os usuários do auth.users
INSERT INTO user_profiles (user_id, role, display_name, email, created_at, updated_at)
SELECT 
    u.id,
    CASE 
        WHEN u.email = 'admin@teste.com' THEN 'admin'
        WHEN u.email = 'professor@teste.com' THEN 'teacher'
        ELSE 'student'
    END,
    COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
    u.email,
    u.created_at,
    u.updated_at
FROM auth.users u
WHERE u.id NOT IN (SELECT user_id FROM user_profiles WHERE user_id IS NOT NULL)
AND u.email IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- 3. Inserir classes básicas se não existirem
INSERT INTO classes (nome, descricao, curso_id, max_alunos, ano_letivo, status, created_at, updated_at)
VALUES 
    ('Turma A - Manhã', 'Turma da manhã', 1, 30, 2025, 'ativa', NOW(), NOW()),
    ('Turma B - Tarde', 'Turma da tarde', 1, 30, 2025, 'ativa', NOW(), NOW()),
    ('Turma C - Noite', 'Turma da noite', 1, 30, 2025, 'ativa', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 4. Corrigir student_subscriptions para usar IDs corretos
-- Primeiro, vamos limpar as subscriptions existentes
DELETE FROM student_subscriptions;

-- Inserir subscriptions corretas
INSERT INTO student_subscriptions (user_id, class_id, access_plan_id, start_date, status)
SELECT 
    up.user_id,
    (SELECT id FROM classes LIMIT 1),
    (SELECT id FROM access_plans LIMIT 1),
    CURRENT_DATE,
    'active'
FROM user_profiles up
WHERE up.role = 'student'
ON CONFLICT DO NOTHING;

-- 5. Verificar resultado final
SELECT 'user_profiles' as tabela, COUNT(*) as registros FROM user_profiles
UNION ALL
SELECT 'classes' as tabela, COUNT(*) as registros FROM classes
UNION ALL
SELECT 'access_plans' as tabela, COUNT(*) as registros FROM access_plans
UNION ALL
SELECT 'student_subscriptions' as tabela, COUNT(*) as registros FROM student_subscriptions
UNION ALL
SELECT 'page_permissions' as tabela, COUNT(*) as registros FROM page_permissions;

-- 6. Mostrar alguns dados de exemplo
SELECT 'user_profiles sample' as info, user_id, display_name, role, email FROM user_profiles LIMIT 3;
SELECT 'classes sample' as info, id, nome, status FROM classes LIMIT 3;
SELECT 'subscriptions sample' as info, user_id, class_id, access_plan_id, status FROM student_subscriptions LIMIT 3;
