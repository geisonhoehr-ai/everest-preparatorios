-- Script para diagnosticar problemas de persistência de sessão
-- Execute no SQL Editor do Supabase

-- ========================================
-- PASSO 1: VERIFICAR USUÁRIOS E ROLES
-- ========================================

-- Verificar usuários e seus roles
SELECT 
    'USUÁRIOS E ROLES' as etapa,
    u.email,
    ur.role,
    u.created_at,
    u.last_sign_in_at,
    CASE 
        WHEN u.last_sign_in_at > NOW() - INTERVAL '1 hour' THEN '✅ ATIVO (última hora)'
        WHEN u.last_sign_in_at > NOW() - INTERVAL '24 hours' THEN '🟡 ATIVO (últimas 24h)'
        ELSE '❌ INATIVO'
    END as status_atividade
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_uuid
ORDER BY u.last_sign_in_at DESC;

-- ========================================
-- PASSO 2: VERIFICAR FUNÇÕES DE AUTENTICAÇÃO
-- ========================================

-- Verificar se as funções de auth estão funcionando
SELECT 
    'FUNÇÕES AUTH' as etapa,
    routine_name,
    routine_type,
    'Verificar se está funcionando' as status
FROM information_schema.routines 
WHERE routine_name IN ('is_admin', 'is_teacher', 'get_user_role', 'handle_new_user')
ORDER BY routine_name;

-- ========================================
-- PASSO 3: VERIFICAR POLÍTICAS RLS
-- ========================================

-- Verificar políticas RLS para user_roles
SELECT 
    'POLÍTICAS RLS USER_ROLES' as etapa,
    policyname,
    permissive,
    roles,
    cmd,
    'Verificar se permite acesso' as status
FROM pg_policies 
WHERE tablename = 'user_roles'
ORDER BY policyname;

-- ========================================
-- PASSO 4: TESTE DE CONEXÃO
-- ========================================

-- Testar se conseguimos acessar user_roles
SELECT 
    'TESTE DE CONEXÃO' as etapa,
    'user_roles acessível' as status,
    COUNT(*) as total_registros,
    'Se > 0, a tabela está acessível' as resultado
FROM user_roles;

-- ========================================
-- PASSO 5: VERIFICAR USUÁRIOS DE TESTE
-- ========================================

-- Verificar especificamente os usuários de teste
SELECT 
    'USUÁRIOS DE TESTE' as etapa,
    u.email,
    ur.role,
    CASE 
        WHEN ur.role = 'admin' THEN '✅ ADMIN - Vê Membros e Turmas'
        WHEN ur.role = 'teacher' THEN '✅ PROFESSOR - Vê Membros e Turmas'
        WHEN ur.role = 'student' THEN '❌ ESTUDANTE - Não vê Membros e Turmas'
        ELSE '❓ SEM ROLE - Não vê Membros e Turmas'
    END as status
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_uuid
WHERE u.email IN ('aluno@teste.com', 'professor@teste.com', 'admin@test.com')
ORDER BY u.email;

-- ========================================
-- PASSO 6: CONFIGURAÇÕES DE AUTH
-- ========================================

-- Verificar configurações de autenticação
SELECT 
    'CONFIGURAÇÕES AUTH' as etapa,
    'Verifique no painel do Supabase:' as instrucao,
    '1. Authentication > Settings > Sessions' as passo1,
    '2. Configure "JWT Expiry" para 30 dias' as passo2,
    '3. Configure "Refresh Token Rotation" para 30 dias' as passo3,
    '4. Configure "Session Timeout" para 30 dias' as passo4;

-- ========================================
-- PASSO 7: DIAGNÓSTICO DE PERSISTÊNCIA
-- ========================================

SELECT 
    '🔧 DIAGNÓSTICO DE PERSISTÊNCIA' as status,
    'Problemas possíveis:' as problema1,
    '1. Cookies não estão sendo salvos' as causa1,
    '2. Sessão expira muito rápido' as causa2,
    '3. Middleware interfere na sessão' as causa3,
    '4. Cliente Supabase não está configurado corretamente' as causa4,
    '5. RLS está bloqueando acesso' as causa5,
    'Soluções:' as solucao1,
    '1. Configurar timeouts no Supabase' as solucao2,
    '2. Verificar cookies no navegador' as solucao3,
    '3. Testar sem middleware' as solucao4,
    '4. Verificar console do navegador' as solucao5; 