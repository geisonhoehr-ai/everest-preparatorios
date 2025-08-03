-- Script para criar usuários de teste
-- Execute no SQL Editor do Supabase

-- ========================================
-- PASSO 1: CRIAR USUÁRIOS NO AUTH
-- ========================================

-- Nota: Os usuários serão criados automaticamente via Supabase Auth
-- Este script apenas define os roles na tabela user_roles

-- ========================================
-- PASSO 2: INSERIR ROLES PARA OS USUÁRIOS
-- ========================================

-- Primeiro, vamos verificar se os usuários existem
SELECT 
    'VERIFICANDO USUÁRIOS EXISTENTES' as etapa,
    id,
    email,
    created_at
FROM auth.users 
WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@test.com')
ORDER BY email;

-- ========================================
-- PASSO 3: INSERIR ROLES (se os usuários existirem)
-- ========================================

-- Inserir role para aluno@teste.com (student)
INSERT INTO user_roles (user_uuid, role)
SELECT id, 'student'
FROM auth.users 
WHERE email = 'aluno@teste.com'
ON CONFLICT (user_uuid) DO UPDATE SET role = 'student';

-- Inserir role para professor@teste.com (teacher)
INSERT INTO user_roles (user_uuid, role)
SELECT id, 'teacher'
FROM auth.users 
WHERE email = 'professor@teste.com'
ON CONFLICT (user_uuid) DO UPDATE SET role = 'teacher';

-- Inserir role para admin@test.com (admin)
INSERT INTO user_roles (user_uuid, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'admin@test.com'
ON CONFLICT (user_uuid) DO UPDATE SET role = 'admin';

-- ========================================
-- PASSO 4: VERIFICAR RESULTADO
-- ========================================

-- Verificar usuários e roles criados
SELECT 
    'USUÁRIOS DE TESTE CRIADOS' as etapa,
    u.email,
    ur.role,
    u.created_at
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_uuid
WHERE u.email IN ('aluno@teste.com', 'professor@teste.com', 'admin@test.com')
ORDER BY u.email;

-- ========================================
-- PASSO 5: RESUMO
-- ========================================

SELECT 
    '📋 USUÁRIOS DE TESTE' as status,
    'aluno@teste.com - Role: student' as aluno,
    'professor@teste.com - Role: teacher' as professor,
    'admin@test.com - Role: admin' as admin,
    'Senha padrão: 123456' as senha_padrao; 