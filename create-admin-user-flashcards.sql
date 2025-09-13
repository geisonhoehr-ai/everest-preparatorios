-- Criar usuário admin para flashcards
-- Desabilitar RLS temporariamente
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE page_permissions DISABLE ROW LEVEL SECURITY;

-- Criar perfil de usuário admin
INSERT INTO user_profiles (id, user_id, role, display_name, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'admin', 'Admin Teste', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Criar permissão para flashcards (opcional para admin, mas vamos criar mesmo assim)
INSERT INTO page_permissions (user_id, page_name, has_access, expires_at, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', 'flashcards', true, NULL, NOW(), NOW())
ON CONFLICT (user_id, page_name) DO NOTHING;

-- Criar permissão para quiz também
INSERT INTO page_permissions (user_id, page_name, has_access, expires_at, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', 'quiz', true, NULL, NOW(), NOW())
ON CONFLICT (user_id, page_name) DO NOTHING;

-- Reabilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_permissions ENABLE ROW LEVEL SECURITY;

-- Verificar resultado
SELECT 'Usuário admin criado:' as info;
SELECT * FROM user_profiles WHERE id = '00000000-0000-0000-0000-000000000001';

SELECT 'Permissões criadas:' as info;
SELECT * FROM page_permissions WHERE user_id = '00000000-0000-0000-0000-000000000001';
