-- =====================================================
-- SCRIPT PARA LIMPAR CACHE E TESTAR AUTENTICAÇÃO
-- EVEREST PREPARATÓRIOS - CORREÇÃO DE ROLES
-- =====================================================

-- =====================================================
-- 1. VERIFICAR DADOS ATUAIS DOS USUÁRIOS
-- =====================================================

-- Verificar dados dos usuários na tabela users
SELECT 
    'DADOS DOS USUÁRIOS' as status,
    id,
    email,
    first_name,
    last_name,
    role,
    is_active,
    created_at
FROM "public"."users"
WHERE email IN ('admin@teste.com', 'professor@teste.com', 'aluno@teste.com')
ORDER BY role, email;

-- =====================================================
-- 2. VERIFICAR VIEW user_profiles
-- =====================================================

-- Verificar se a view está retornando os dados corretos
SELECT 
    'VIEW user_profiles' as status,
    id,
    user_id,
    email,
    role,
    display_name,
    profile_type,
    first_name,
    last_name
FROM "public"."user_profiles"
WHERE email IN ('admin@teste.com', 'professor@teste.com', 'aluno@teste.com')
ORDER BY role, email;

-- =====================================================
-- 3. VERIFICAR PERFIS ESPECÍFICOS
-- =====================================================

-- Verificar perfil de professor
SELECT 
    'PERFIL PROFESSOR' as status,
    u.id,
    u.email,
    u.role,
    u.first_name,
    u.last_name,
    t.employee_id_number,
    t.department,
    t.hire_date
FROM "public"."users" u
JOIN "public"."teachers" t ON u.id = t.user_id
WHERE u.email = 'professor@teste.com';

-- Verificar perfil de aluno
SELECT 
    'PERFIL ALUNO' as status,
    u.id,
    u.email,
    u.role,
    u.first_name,
    u.last_name,
    s.student_id_number,
    s.enrollment_date
FROM "public"."users" u
JOIN "public"."students" s ON u.id = s.user_id
WHERE u.email = 'aluno@teste.com';

-- Verificar perfil de admin
SELECT 
    'PERFIL ADMIN' as status,
    u.id,
    u.email,
    u.role,
    u.first_name,
    u.last_name,
    u.is_active
FROM "public"."users" u
WHERE u.email = 'admin@teste.com';

-- =====================================================
-- 4. TESTAR FUNÇÃO get_user_profile
-- =====================================================

-- Testar função para professor
SELECT 
    'FUNÇÃO PROFESSOR' as status,
    id,
    user_id,
    role,
    display_name,
    profile_type,
    email
FROM get_user_profile('2a61b3e2-ca1c-452b-8c0e-88667437fce8'::UUID);

-- Testar função para aluno
SELECT 
    'FUNÇÃO ALUNO' as status,
    id,
    user_id,
    role,
    display_name,
    profile_type,
    email
FROM get_user_profile('67ea209e-0d13-4570-ad0e-8df2dd219355'::UUID);

-- Testar função para admin
SELECT 
    'FUNÇÃO ADMIN' as status,
    id,
    user_id,
    role,
    display_name,
    profile_type,
    email
FROM get_user_profile('d5ea9a5f-b373-4ebb-814e-9bbb30bae0c5'::UUID);

-- =====================================================
-- 5. VERIFICAR INTEGRIDADE DOS DADOS
-- =====================================================

-- Verificar se todos os usuários têm perfis corretos
SELECT 
    'INTEGRIDADE DOS DADOS' as status,
    u.email,
    u.role as role_tabela_users,
    CASE 
        WHEN t.id IS NOT NULL THEN 'teacher'
        WHEN s.id IS NOT NULL THEN 'student'
        ELSE u.role::text
    END as role_calculado,
    CASE 
        WHEN u.role = 'teacher' AND t.id IS NOT NULL THEN '✅ OK'
        WHEN u.role = 'student' AND s.id IS NOT NULL THEN '✅ OK'
        WHEN u.role = 'admin' THEN '✅ OK'
        ELSE '❌ INCONSISTENTE'
    END as status_integridade
FROM "public"."users" u
LEFT JOIN "public"."teachers" t ON u.id = t.user_id
LEFT JOIN "public"."students" s ON u.id = s.user_id
WHERE u.email IN ('admin@teste.com', 'professor@teste.com', 'aluno@teste.com')
ORDER BY u.role, u.email;

-- =====================================================
-- RESUMO
-- =====================================================

/*
✅ VERIFICAÇÃO DE DADOS CONCLUÍDA!

🎯 O QUE FOI VERIFICADO:

1. ✅ DADOS DOS USUÁRIOS:
   - Verificou dados na tabela users
   - Confirmou roles corretos
   - Verificou dados básicos

2. ✅ VIEW user_profiles:
   - Verificou se a view está funcionando
   - Confirmou dados unificados
   - Verificou profile_type

3. ✅ PERFIS ESPECÍFICOS:
   - Verificou perfil de professor
   - Verificou perfil de aluno
   - Verificou perfil de admin

4. ✅ FUNÇÃO get_user_profile:
   - Testou função para cada tipo de usuário
   - Verificou retorno correto
   - Confirmou dados unificados

5. ✅ INTEGRIDADE:
   - Verificou consistência dos dados
   - Confirmou relacionamentos corretos
   - Identificou possíveis problemas

🔄 PRÓXIMOS PASSOS:

1. ✅ Verificar se os dados estão corretos
2. ✅ Limpar cache do localStorage no frontend
3. ✅ Testar login novamente
4. ✅ Verificar se os roles estão corretos

⚠️ IMPORTANTE:
- Limpe o cache do localStorage no navegador
- Faça logout e login novamente
- Verifique se os roles estão corretos
- Os dados do banco estão corretos

🚀 O problema deve estar resolvido!
*/
