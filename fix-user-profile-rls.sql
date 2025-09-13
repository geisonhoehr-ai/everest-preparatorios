-- Corrigir problema de RLS na tabela user_profiles
-- Desabilitar RLS temporariamente
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Verificar se há usuários na tabela auth.users
-- (Isso não funcionará diretamente, mas vamos tentar criar um perfil)

-- Criar perfil de usuário admin padrão
INSERT INTO user_profiles (id, user_id, role, display_name, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'admin', 'Admin Teste', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Reabilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Verificar resultado
SELECT 'Perfil criado:' as info;
SELECT * FROM user_profiles WHERE id = '00000000-0000-0000-0000-000000000001';
