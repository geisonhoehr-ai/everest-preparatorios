-- Script para criar usuários estudantes na tabela users
-- Este script contorna as políticas RLS usando privilégios administrativos

-- Inserir usuários de teste para estudantes
INSERT INTO users (
    email,
    password_hash,
    first_name,
    last_name,
    role,
    is_active,
    created_at,
    updated_at
) VALUES 
(
    'aluno1@teste.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- senha: 123456
    'João',
    'Silva',
    'student',
    true,
    NOW(),
    NOW()
),
(
    'aluno2@teste.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- senha: 123456
    'Maria',
    'Santos',
    'student',
    true,
    NOW(),
    NOW()
),
(
    'aluno3@teste.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- senha: 123456
    'Pedro',
    'Oliveira',
    'student',
    true,
    NOW(),
    NOW()
),
(
    'aluno4@teste.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- senha: 123456
    'Ana',
    'Costa',
    'student',
    true,
    NOW(),
    NOW()
),
(
    'aluno5@teste.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- senha: 123456
    'Carlos',
    'Ferreira',
    'student',
    true,
    NOW(),
    NOW()
);

-- Verificar se os usuários foram criados
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    is_active,
    created_at
FROM users 
WHERE role = 'student'
ORDER BY created_at DESC;
