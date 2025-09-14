-- 🚨 CORREÇÃO SIMPLES - PÁGINA DE MEMBROS
-- Execute este SQL para corrigir a página de membros

-- 1. Criar tabela student_subscriptions
CREATE TABLE IF NOT EXISTS student_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    class_id INTEGER,
    access_plan_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela page_permissions
CREATE TABLE IF NOT EXISTS page_permissions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    page_name VARCHAR(100) NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    granted_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, page_name)
);

-- 3. Inserir classes básicas
INSERT INTO classes (nome, descricao, curso_id, max_alunos, ano_letivo, status, created_at, updated_at)
VALUES 
    ('Turma A - Manhã', 'Turma da manhã', 1, 30, 2025, 'ativa', NOW(), NOW()),
    ('Turma B - Tarde', 'Turma da tarde', 1, 30, 2025, 'ativa', NOW(), NOW()),
    ('Turma C - Noite', 'Turma da noite', 1, 30, 2025, 'ativa', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 4. Inserir user_profiles para usuários existentes
INSERT INTO user_profiles (user_id, role, display_name, created_at, updated_at)
SELECT 
    u.id,
    'student',
    COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
    u.created_at,
    u.updated_at
FROM auth.users u
WHERE u.id NOT IN (SELECT user_id FROM user_profiles WHERE user_id IS NOT NULL)
AND u.email IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- 5. Inserir subscriptions básicas
INSERT INTO student_subscriptions (user_id, class_id, access_plan_id, start_date, status)
SELECT 
    up.user_id,
    (SELECT id FROM classes LIMIT 1),
    (SELECT id FROM access_plans LIMIT 1),
    CURRENT_DATE,
    'active'
FROM user_profiles up
WHERE up.role = 'student'
AND up.user_id NOT IN (SELECT user_id FROM student_subscriptions WHERE user_id IS NOT NULL)
ON CONFLICT DO NOTHING;

-- 6. Habilitar RLS
ALTER TABLE student_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_permissions ENABLE ROW LEVEL SECURITY;

-- 7. Políticas RLS básicas
DROP POLICY IF EXISTS "student_subscriptions_select_policy" ON student_subscriptions;
CREATE POLICY "student_subscriptions_select_policy" ON student_subscriptions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "student_subscriptions_insert_policy" ON student_subscriptions;
CREATE POLICY "student_subscriptions_insert_policy" ON student_subscriptions
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "page_permissions_select_policy" ON page_permissions;
CREATE POLICY "page_permissions_select_policy" ON page_permissions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "page_permissions_insert_policy" ON page_permissions;
CREATE POLICY "page_permissions_insert_policy" ON page_permissions
    FOR INSERT WITH CHECK (true);

-- 8. Verificar resultado
SELECT 'user_profiles' as tabela, COUNT(*) as registros FROM user_profiles
UNION ALL
SELECT 'classes' as tabela, COUNT(*) as registros FROM classes
UNION ALL
SELECT 'access_plans' as tabela, COUNT(*) as registros FROM access_plans
UNION ALL
SELECT 'student_subscriptions' as tabela, COUNT(*) as registros FROM student_subscriptions
UNION ALL
SELECT 'page_permissions' as tabela, COUNT(*) as registros FROM page_permissions;
