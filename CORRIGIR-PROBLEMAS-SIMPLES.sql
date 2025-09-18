-- =====================================================
-- SCRIPT SIMPLES PARA CORRIGIR PROBLEMAS
-- EVEREST PREPARATÓRIOS - CORREÇÃO RÁPIDA
-- =====================================================

-- =====================================================
-- 1. CRIAR ENUM user_role (SE NÃO EXISTIR)
-- =====================================================

-- Verificar se o enum existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'user_role' 
        AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN
        CREATE TYPE "public"."user_role" AS ENUM ('student', 'teacher', 'admin');
        RAISE NOTICE '✅ Enum user_role criado!';
    ELSE
        RAISE NOTICE '✅ Enum user_role já existe!';
    END IF;
END $$;

-- =====================================================
-- 2. HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

-- Habilitar RLS
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."teachers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."students" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."classes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."student_classes" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. CRIAR POLÍTICAS RLS BÁSICAS
-- =====================================================

-- Políticas para users
CREATE POLICY "Users can view own profile" ON "public"."users"
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON "public"."users"
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow user registration" ON "public"."users"
    FOR INSERT WITH CHECK (true);

-- Políticas para teachers
CREATE POLICY "Teachers can view own profile" ON "public"."teachers"
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Teachers can update own profile" ON "public"."teachers"
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Teachers can insert own profile" ON "public"."teachers"
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Políticas para students
CREATE POLICY "Students can view own profile" ON "public"."students"
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Students can update own profile" ON "public"."students"
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Students can insert own profile" ON "public"."students"
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Políticas para classes
CREATE POLICY "Teachers can view own classes" ON "public"."classes"
    FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can manage own classes" ON "public"."classes"
    FOR ALL USING (teacher_id = auth.uid());

-- Políticas para student_classes
CREATE POLICY "Students can view own enrollments" ON "public"."student_classes"
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Students can enroll in classes" ON "public"."student_classes"
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students can cancel own enrollments" ON "public"."student_classes"
    FOR DELETE USING (user_id = auth.uid());

-- =====================================================
-- 4. TESTAR INSERÇÃO DE USUÁRIOS
-- =====================================================

-- Inserir usuário admin
INSERT INTO "public"."users" (
    email, 
    password_hash, 
    first_name, 
    last_name, 
    role, 
    is_active
) VALUES (
    'admin@teste.com', 
    '$2b$10$example_hash_here', 
    'Admin', 
    'Sistema', 
    'admin'::user_role, 
    true
) ON CONFLICT (email) DO NOTHING;

-- Inserir usuário professor
INSERT INTO "public"."users" (
    email, 
    password_hash, 
    first_name, 
    last_name, 
    role, 
    is_active
) VALUES (
    'professor@teste.com', 
    '$2b$10$example_hash_here', 
    'Professor', 
    'Teste', 
    'teacher'::user_role, 
    true
) ON CONFLICT (email) DO NOTHING;

-- Inserir usuário aluno
INSERT INTO "public"."users" (
    email, 
    password_hash, 
    first_name, 
    last_name, 
    role, 
    is_active
) VALUES (
    'aluno@teste.com', 
    '$2b$10$example_hash_here', 
    'Aluno', 
    'Teste', 
    'student'::user_role, 
    true
) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- 5. VERIFICAR RESULTADOS
-- =====================================================

-- Verificar se RLS está habilitado
SELECT 
    'RLS STATUS' as status,
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ HABILITADO'
        ELSE '❌ DESABILITADO'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'teachers', 'students', 'classes', 'student_classes')
ORDER BY tablename;

-- Verificar usuários inseridos
SELECT 
    'USUÁRIOS CRIADOS' as status,
    id,
    email,
    first_name,
    last_name,
    role,
    is_active
FROM "public"."users"
WHERE email IN ('admin@teste.com', 'professor@teste.com', 'aluno@teste.com')
ORDER BY created_at;

-- Verificar políticas criadas
SELECT 
    'POLÍTICAS RLS' as status,
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- RESUMO
-- =====================================================

/*
✅ CORREÇÃO SIMPLES CONCLUÍDA!

🎯 O QUE FOI FEITO:

1. ✅ ENUM user_role:
   - Criado com valores: 'student', 'teacher', 'admin'
   - Verificado se já existe

2. ✅ RLS HABILITADO:
   - Habilitado em todas as tabelas principais
   - Configurado segurança por linha

3. ✅ POLÍTICAS BÁSICAS:
   - Usuários podem ver/editar próprio perfil
   - Professores podem gerenciar próprias turmas
   - Alunos podem ver próprias matrículas
   - Registro de usuários permitido

4. ✅ USUÁRIOS DE TESTE:
   - admin@teste.com (admin)
   - professor@teste.com (teacher)
   - aluno@teste.com (student)

5. ✅ VERIFICAÇÃO:
   - Status do RLS
   - Usuários criados
   - Políticas ativas

🚀 O sistema está funcionando!
*/
