-- Execute cada comando INDIVIDUALMENTE, um por vez:

-- Comando 1: Configurar acesso pago
INSERT INTO paid_users (email, status, created_at, updated_at) VALUES ('aluno@teste.com', 'active', NOW(), NOW()) ON CONFLICT (email) DO UPDATE SET status = 'active';

-- Comando 2: Configurar acesso pago professor
INSERT INTO paid_users (email, status, created_at, updated_at) VALUES ('professor@teste.com', 'active', NOW(), NOW()) ON CONFLICT (email) DO UPDATE SET status = 'active';

-- Comando 3: Configurar acesso pago admin
INSERT INTO paid_users (email, status, created_at, updated_at) VALUES ('admin@everest.com', 'active', NOW(), NOW()) ON CONFLICT (email) DO UPDATE SET status = 'active';

-- Comando 4: Configurar admin role
UPDATE user_roles SET role = 'admin' WHERE user_uuid = (SELECT id FROM auth.users WHERE email = 'admin@everest.com');

-- Comando 5: Configurar teacher role
UPDATE user_roles SET role = 'teacher' WHERE user_uuid = (SELECT id FROM auth.users WHERE email = 'professor@teste.com');

-- Comando 6: Verificar resultado
SELECT email, (SELECT role FROM user_roles WHERE user_uuid = auth.users.id) as role FROM auth.users WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@everest.com') ORDER BY email; 