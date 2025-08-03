-- Script para configurar timeouts de sessão mais longos
-- Execute no SQL Editor do Supabase

-- ========================================
-- PASSO 1: VERIFICAR FUNÇÕES DE AUTENTICAÇÃO
-- ========================================

-- Verificar se as funções de auth estão funcionando
SELECT 
    'FUNÇÕES AUTH' as etapa,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN ('is_admin', 'is_teacher', 'get_user_role')
ORDER BY routine_name;

-- ========================================
-- PASSO 2: TESTAR CONEXÃO DE AUTENTICAÇÃO
-- ========================================

-- Verificar se a tabela user_roles está acessível
SELECT 
    'TESTE USER_ROLES' as etapa,
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE role = 'student') as students,
    COUNT(*) FILTER (WHERE role = 'teacher') as teachers,
    COUNT(*) FILTER (WHERE role = 'admin') as admins
FROM user_roles;

-- ========================================
-- PASSO 3: VERIFICAR POLÍTICAS RLS
-- ========================================

-- Verificar políticas RLS para user_roles
SELECT 
    'POLÍTICAS RLS USER_ROLES' as etapa,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'user_roles'
ORDER BY policyname;

-- ========================================
-- PASSO 4: VERIFICAR USUÁRIOS DE TESTE
-- ========================================

-- Verificar se os usuários de teste existem
SELECT 
    'USUÁRIOS DE TESTE' as etapa,
    u.email,
    ur.role,
    u.created_at
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_uuid
WHERE u.email IN ('aluno@teste.com', 'professor@teste.com', 'admin@test.com')
ORDER BY u.email;

-- ========================================
-- PASSO 5: RESUMO E RECOMENDAÇÕES
-- ========================================

SELECT 
    '🔧 CONFIGURAÇÕES DE SESSÃO' as status,
    'Para resolver o problema de timeout:' as instrucao1,
    '1. Vá no painel do Supabase' as instrucao2,
    '2. Authentication > Settings > Advanced Settings' as instrucao3,
    '3. Aumente "JWT Expiry" para 30 dias' as instrucao4,
    '4. Aumente "Refresh Token Rotation" para 30 dias' as instrucao5,
    '5. Salve as configurações' as instrucao6; 