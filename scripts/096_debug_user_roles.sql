-- Script para debug da tabela user_roles
-- Execute este script no SQL Editor do Supabase para verificar se a tabela existe

-- 1. Verificar se a tabela user_roles existe
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE tablename = 'user_roles';

-- 2. Se existir, verificar a estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_roles'
ORDER BY ordinal_position;

-- 3. Verificar se há dados na tabela
SELECT COUNT(*) as total_usuarios FROM user_roles;

-- 4. Verificar alguns registros de exemplo
SELECT * FROM user_roles LIMIT 5;

-- 5. Verificar se há usuários com role 'teacher'
SELECT 
  user_uuid,
  role,
  created_at
FROM user_roles 
WHERE role = 'teacher';

-- 6. Verificar todas as tabelas relacionadas a usuários
SELECT 
  schemaname,
  tablename
FROM pg_tables 
WHERE tablename LIKE '%user%' 
   OR tablename LIKE '%role%'
   OR tablename LIKE '%auth%'
ORDER BY tablename;

-- 7. Verificar tabela auth.users (usuários do Supabase)
SELECT 
  id,
  email,
  created_at,
  updated_at
FROM auth.users 
LIMIT 5;

-- 8. Se a tabela user_roles não existir, criar uma básica
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_roles') THEN
    CREATE TABLE user_roles (
      id SERIAL PRIMARY KEY,
      user_uuid TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'student',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Criar índice para busca rápida
    CREATE INDEX idx_user_roles_user_uuid ON user_roles(user_uuid);
    CREATE INDEX idx_user_roles_role ON user_roles(role);
    
    -- Habilitar RLS
    ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
    
    -- Política básica (permitir que usuários vejam seus próprios roles)
    CREATE POLICY "Users can view own role" ON user_roles
      FOR SELECT USING (auth.uid()::text = user_uuid);
    
    RAISE NOTICE '✅ Tabela user_roles criada com sucesso!';
  ELSE
    RAISE NOTICE 'ℹ️ Tabela user_roles já existe';
  END IF;
END $$;

-- 9. Verificar novamente se a tabela foi criada
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE tablename = 'user_roles';

-- 10. Inserir um usuário de teste com role 'teacher' se não existir
INSERT INTO user_roles (user_uuid, role)
SELECT 'tiago@everest.com', 'teacher'
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles WHERE user_uuid = 'tiago@everest.com'
);

-- 11. Verificar o usuário inserido
SELECT * FROM user_roles WHERE user_uuid = 'tiago@everest.com';

-- 12. Mostrar resumo final
SELECT 
  'RESUMO' as tipo,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN role = 'teacher' THEN 1 END) as professores,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN role = 'student' THEN 1 END) as estudantes
FROM user_roles;
