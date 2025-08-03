-- Script para testar o sistema de autenticação
-- Verificar se os usuários de teste estão funcionando corretamente

-- 1. Verificar usuários na tabela auth.users
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  email_confirmed_at
FROM auth.users 
WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com')
ORDER BY email;

-- 2. Verificar roles dos usuários
SELECT 
  ur.user_uuid,
  ur.role,
  ur.first_login,
  ur.profile_completed,
  u.email
FROM user_roles ur
JOIN auth.users u ON ur.user_uuid = u.id
WHERE u.email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com')
ORDER BY u.email;

-- 3. Verificar perfis dos usuários
-- Perfis de alunos
SELECT 
  sp.user_uuid,
  sp.nome_completo,
  sp.data_nascimento,
  sp.telefone,
  sp.escola,
  sp.serie,
  u.email
FROM student_profiles sp
JOIN auth.users u ON sp.user_uuid = u.id
WHERE u.email IN ('aluno@teste.com')
ORDER BY u.email;

-- Perfis de professores
SELECT 
  tp.user_uuid,
  tp.nome_completo,
  tp.data_nascimento,
  tp.telefone,
  tp.especialidade,
  tp.bio,
  u.email
FROM teacher_profiles tp
JOIN auth.users u ON tp.user_uuid = u.id
WHERE u.email IN ('professor@teste.com')
ORDER BY u.email;

-- 4. Verificar acesso pago
SELECT 
  pu.user_uuid,
  pu.email,
  pu.data_inscricao,
  pu.status,
  u.email as auth_email
FROM paid_users pu
JOIN auth.users u ON pu.user_uuid = u.id
WHERE u.email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com')
ORDER BY u.email;

-- 5. Teste de inserção de novo usuário (se necessário)
-- INSERT INTO user_roles (user_uuid, role, first_login, profile_completed)
-- VALUES ('test-uuid', 'student', true, false)
-- ON CONFLICT (user_uuid) DO NOTHING;

-- 6. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('user_roles', 'student_profiles', 'teacher_profiles', 'paid_users')
ORDER BY tablename, policyname;

-- 7. Contar total de registros em cada tabela
SELECT 
  'auth.users' as tabela,
  COUNT(*) as total
FROM auth.users
UNION ALL
SELECT 
  'user_roles' as tabela,
  COUNT(*) as total
FROM user_roles
UNION ALL
SELECT 
  'student_profiles' as tabela,
  COUNT(*) as total
FROM student_profiles
UNION ALL
SELECT 
  'teacher_profiles' as tabela,
  COUNT(*) as total
FROM teacher_profiles
UNION ALL
SELECT 
  'paid_users' as tabela,
  COUNT(*) as total
FROM paid_users
ORDER BY tabela; 