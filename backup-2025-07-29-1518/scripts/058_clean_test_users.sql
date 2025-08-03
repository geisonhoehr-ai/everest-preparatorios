INSERT INTO paid_users (email, status, created_at, updated_at)
VALUES 
    ('aluno@teste.com', 'active', NOW(), NOW()),
    ('professor@teste.com', 'active', NOW(), NOW()),
    ('admin@everest.com', 'active', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET status = 'active';

UPDATE user_roles 
SET role = 'admin' 
WHERE user_uuid::text IN (
    SELECT id::text FROM auth.users WHERE email = 'admin@everest.com'
);

UPDATE user_roles 
SET role = 'teacher'
WHERE user_uuid::text IN (
    SELECT id::text FROM auth.users WHERE email = 'professor@teste.com'
);

SELECT 
    email,
    (SELECT role FROM user_roles WHERE user_uuid::text = auth.users.id::text) as role,
    (SELECT status FROM paid_users WHERE email = auth.users.email) as paid_status
FROM auth.users 
WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@everest.com')
ORDER BY email; 