-- Script para verificar se há dados de alunos aprovados no banco de dados

-- 1. Verificar todas as tabelas que podem conter dados de alunos
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name LIKE '%aluno%' 
OR table_name LIKE '%user%' 
OR table_name LIKE '%profile%'
ORDER BY table_name, ordinal_position;

-- 2. Verificar se há dados na tabela student_profiles
SELECT 
    'student_profiles' as tabela,
    COUNT(*) as total_registros,
    COUNT(nome_completo) as nomes_preenchidos
FROM student_profiles;

-- 3. Verificar dados de alunos com nomes
SELECT 
    nome_completo,
    grade,
    school,
    subject,
    created_at
FROM student_profiles 
WHERE nome_completo IS NOT NULL 
AND nome_completo != 'Nome do Aluno'
ORDER BY created_at DESC
LIMIT 20;

-- 4. Verificar se há alguma tabela específica para alunos aprovados
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%aprovado%' 
     OR table_name LIKE '%sucesso%' 
     OR table_name LIKE '%case%'
     OR table_name LIKE '%venda%')
ORDER BY table_name;

-- 5. Verificar dados de usuários com roles
SELECT 
    u.email,
    ur.role,
    sp.nome_completo as nome_aluno,
    sp.grade,
    sp.school,
    sp.subject
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_uuid
LEFT JOIN student_profiles sp ON u.id = sp.user_uuid
WHERE ur.role = 'student'
AND sp.nome_completo IS NOT NULL
AND sp.nome_completo != 'Nome do Aluno'
ORDER BY sp.created_at DESC; 