-- Script para verificar dados de alunos no banco de dados

-- 1. Verificar se há dados reais de alunos (não apenas de teste)
SELECT 
    'Dados de Alunos Reais' as tipo,
    COUNT(*) as total,
    COUNT(CASE WHEN nome_completo != 'Nome do Aluno' AND nome_completo != 'Aluno Teste' THEN 1 END) as nomes_reais
FROM student_profiles;

-- 2. Listar todos os alunos com nomes reais
SELECT 
    nome_completo,
    grade,
    school,
    subject,
    created_at
FROM student_profiles 
WHERE nome_completo IS NOT NULL 
AND nome_completo NOT IN ('Nome do Aluno', 'Aluno Teste', 'Aluno de Teste')
ORDER BY created_at DESC;

-- 3. Verificar se há dados de usuários com emails reais
SELECT 
    u.email,
    ur.role,
    sp.nome_completo
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_uuid
LEFT JOIN student_profiles sp ON u.id = sp.user_uuid
WHERE ur.role = 'student'
AND u.email NOT LIKE '%teste%'
AND u.email NOT LIKE '%@teste%'
ORDER BY u.created_at DESC;

-- 4. Verificar se há alguma tabela com dados de vendas ou alunos aprovados
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%venda%' 
     OR table_name LIKE '%aprovado%' 
     OR table_name LIKE '%sucesso%'
     OR table_name LIKE '%cliente%'
     OR table_name LIKE '%customer%')
ORDER BY table_name; 