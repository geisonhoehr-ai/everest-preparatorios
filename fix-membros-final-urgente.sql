-- 🚨 CORREÇÃO FINAL URGENTE - PÁGINA DE MEMBROS
-- Execute este SQL para corrigir definitivamente a página de membros

-- 1. Verificar se há usuários no auth.users
SELECT 'auth.users' as tabela, COUNT(*) as registros FROM auth.users;

-- 2. Inserir user_profiles para todos os usuários do auth.users
INSERT INTO user_profiles (user_id, role, display_name, created_at, updated_at)
SELECT 
    u.id,
    CASE 
        WHEN u.email = 'admin@teste.com' THEN 'admin'
        WHEN u.email = 'professor@teste.com' THEN 'teacher'
        WHEN u.email = 'geisonhoehr@gmail.com' THEN 'admin'
        ELSE 'student'
    END,
    COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
    u.created_at,
    u.updated_at
FROM auth.users u
WHERE u.email IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- 3. Inserir classes básicas
INSERT INTO classes (nome, descricao, curso_id, max_alunos, ano_letivo, status, created_at, updated_at)
VALUES 
    ('Turma A - Manhã', 'Turma da manhã', 1, 30, 2025, 'ativa', NOW(), NOW()),
    ('Turma B - Tarde', 'Turma da tarde', 1, 30, 2025, 'ativa', NOW(), NOW()),
    ('Turma C - Noite', 'Turma da noite', 1, 30, 2025, 'ativa', NOW(), NOW());

-- 4. Limpar e recriar student_subscriptions
DELETE FROM student_subscriptions;

INSERT INTO student_subscriptions (user_id, class_id, access_plan_id, start_date, status)
SELECT 
    up.user_id,
    (SELECT id FROM classes LIMIT 1),
    (SELECT id FROM access_plans LIMIT 1),
    CURRENT_DATE,
    'active'
FROM user_profiles up
WHERE up.role = 'student';

-- 5. Verificar resultado final
SELECT 'user_profiles' as tabela, COUNT(*) as registros FROM user_profiles
UNION ALL
SELECT 'classes' as tabela, COUNT(*) as registros FROM classes
UNION ALL
SELECT 'access_plans' as tabela, COUNT(*) as registros FROM access_plans
UNION ALL
SELECT 'student_subscriptions' as tabela, COUNT(*) as registros FROM student_subscriptions;

-- 6. Mostrar dados de exemplo
SELECT 'user_profiles sample' as info, user_id, display_name, role FROM user_profiles LIMIT 5;
SELECT 'classes sample' as info, id, nome, status FROM classes LIMIT 3;
SELECT 'subscriptions sample' as info, user_id, class_id, access_plan_id, status FROM student_subscriptions LIMIT 3;
