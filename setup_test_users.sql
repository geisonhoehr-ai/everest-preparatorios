-- Script para configurar usuários de teste
-- IMPORTANTE: Execute este script no Supabase SQL Editor
-- Primeiro, você precisa criar os usuários no Supabase Auth

-- 1. Verificar se a tabela user_roles existe e tem dados
SELECT 'user_roles' as tabela, COUNT(*) as total FROM user_roles;

-- 2. Verificar usuários existentes no auth.users
SELECT id, email, created_at FROM auth.users ORDER BY created_at;

-- 3. Inserir usuários de teste (substitua os IDs pelos reais dos usuários)
-- Para encontrar o ID correto, execute primeiro o SELECT acima
-- Depois substitua os valores abaixo pelos IDs reais

-- Exemplo (substitua pelos IDs reais):
-- INSERT INTO user_roles (user_uuid, role, created_at) 
-- VALUES 
--   ('ID_DO_ALUNO_AQUI', 'student', NOW()),
--   ('ID_DO_GEISON_AQUI', 'admin', NOW())
-- ON CONFLICT (user_uuid) DO UPDATE SET 
--   role = EXCLUDED.role,
--   updated_at = NOW();

-- 4. Verificar os dados inseridos
SELECT * FROM user_roles ORDER BY created_at;

-- 5. Verificar se há outros usuários na tabela
SELECT user_uuid, role, created_at FROM user_roles;
