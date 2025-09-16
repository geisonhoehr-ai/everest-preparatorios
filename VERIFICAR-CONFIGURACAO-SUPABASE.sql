-- SCRIPT PARA VERIFICAR CONFIGURAÇÃO DO SUPABASE
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. VERIFICAR CONFIGURAÇÕES DE AUTENTICAÇÃO
SELECT '=== CONFIGURAÇÕES DE AUTENTICAÇÃO ===' as status;

-- 2. VERIFICAR SE A CONFIRMAÇÃO DE EMAIL ESTÁ HABILITADA
SELECT '=== VERIFICANDO CONFIRMAÇÃO DE EMAIL ===' as status;
SELECT 
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'CONFIRMADO'
    ELSE 'NÃO CONFIRMADO'
  END as status,
  COUNT(*) as quantidade
FROM auth.users 
WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com')
GROUP BY 
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'CONFIRMADO'
    ELSE 'NÃO CONFIRMADO'
  END;

-- 3. VERIFICAR POLÍTICAS RLS
SELECT '=== POLÍTICAS RLS ===' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 4. VERIFICAR SE RLS ESTÁ HABILITADO
SELECT '=== STATUS RLS ===' as status;
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- 5. VERIFICAR ESTRUTURA DA TABELA
SELECT '=== ESTRUTURA DA TABELA ===' as status;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- 6. VERIFICAR DADOS FINAIS
SELECT '=== DADOS FINAIS ===' as status;
SELECT 
  u.email,
  u.email_confirmed_at,
  u.created_at,
  p.role,
  p.display_name,
  p.created_at as perfil_criado
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.user_id
WHERE u.email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com')
ORDER BY u.email;
