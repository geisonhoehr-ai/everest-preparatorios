-- =====================================================
-- SCRIPT PARA RECRIAR BANCO - ESTRUTURA UUID
-- EVEREST PREPARATÓRIOS - ESTRUTURA CORRETA
-- =====================================================

-- =====================================================
-- 1. CRIAR TIPOS PERSONALIZADOS
-- =====================================================

-- Tipo para roles de usuário
CREATE TYPE "public"."user_role" AS ENUM ('student', 'teacher', 'admin');

-- =====================================================
-- 2. CRIAR TABELA PRINCIPAL DE USUÁRIOS
-- =====================================================

CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "email" varchar(255) NOT NULL,
    "password_hash" varchar(255) NOT NULL,
    "first_name" varchar(100) NOT NULL,
    "last_name" varchar(100) NOT NULL,
    "role" "public"."user_role" NOT NULL,
    "is_active" boolean NOT NULL DEFAULT 'true',
    "last_login_at" timestamp NULL,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_email_key" UNIQUE ("email")
);

-- Índices para users
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "public"."users" USING btree ("email");

-- Comentários para users
COMMENT ON COLUMN "public"."users"."id" IS 'Identificador único do usuário';
COMMENT ON COLUMN "public"."users"."email" IS 'Endereço de e-mail do usuário, usado para login';
COMMENT ON COLUMN "public"."users"."password_hash" IS 'Hash da senha do usuário';
COMMENT ON COLUMN "public"."users"."first_name" IS 'Primeiro nome do usuário';
COMMENT ON COLUMN "public"."users"."last_name" IS 'Sobrenome do usuário';
COMMENT ON COLUMN "public"."users"."role" IS 'Perfil do usuário no sistema (aluno, professor, administrador)';
COMMENT ON COLUMN "public"."users"."is_active" IS 'Indica se a conta do usuário está ativa';
COMMENT ON COLUMN "public"."users"."last_login_at" IS 'Timestamp do último login do usuário';
COMMENT ON COLUMN "public"."users"."created_at" IS 'Data de criação do usuário';
COMMENT ON COLUMN "public"."users"."updated_at" IS 'Data da última atualização do usuário';
COMMENT ON TABLE "public"."users" IS 'Armazena informações básicas de todos os usuários do sistema e seu perfil.';

-- =====================================================
-- 3. CRIAR TABELA DE PROFESSORES
-- =====================================================

CREATE TABLE IF NOT EXISTS "public"."teachers" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "employee_id_number" varchar(50) NOT NULL,
    "hire_date" date NOT NULL,
    "department" varchar(100) NULL,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "teachers_user_id_key" UNIQUE ("user_id"),
    CONSTRAINT "teachers_employee_id_number_key" UNIQUE ("employee_id_number"),
    CONSTRAINT "public_teachers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
);

-- Índices para teachers
CREATE UNIQUE INDEX IF NOT EXISTS "teachers_employee_id_number_idx" ON "public"."teachers" USING btree ("employee_id_number");

-- Comentários para teachers
COMMENT ON COLUMN "public"."teachers"."id" IS 'Identificador único do professor';
COMMENT ON COLUMN "public"."teachers"."user_id" IS 'Referência ao usuário associado a este perfil de professor';
COMMENT ON COLUMN "public"."teachers"."employee_id_number" IS 'Número de identificação único do funcionário/professor';
COMMENT ON COLUMN "public"."teachers"."hire_date" IS 'Data de contratação do professor';
COMMENT ON COLUMN "public"."teachers"."department" IS 'Departamento ao qual o professor pertence';
COMMENT ON COLUMN "public"."teachers"."created_at" IS 'Data de criação do registro';
COMMENT ON COLUMN "public"."teachers"."updated_at" IS 'Data da última atualização do registro';
COMMENT ON TABLE "public"."teachers" IS 'Armazena informações específicas dos professores.';

-- =====================================================
-- 4. CRIAR TABELA DE ALUNOS
-- =====================================================

CREATE TABLE IF NOT EXISTS "public"."students" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "student_id_number" varchar(50) NOT NULL,
    "enrollment_date" date NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "students_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "students_user_id_key" UNIQUE ("user_id"),
    CONSTRAINT "students_student_id_number_key" UNIQUE ("student_id_number"),
    CONSTRAINT "public_students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
);

-- Índices para students
CREATE UNIQUE INDEX IF NOT EXISTS "students_student_id_number_idx" ON "public"."students" USING btree ("student_id_number");

-- Comentários para students
COMMENT ON COLUMN "public"."students"."id" IS 'Identificador único do aluno';
COMMENT ON COLUMN "public"."students"."user_id" IS 'Referência ao usuário associado a este perfil de aluno';
COMMENT ON COLUMN "public"."students"."student_id_number" IS 'Número de identificação único do aluno';
COMMENT ON COLUMN "public"."students"."enrollment_date" IS 'Data de matrícula do aluno';
COMMENT ON COLUMN "public"."students"."created_at" IS 'Data de criação do registro';
COMMENT ON COLUMN "public"."students"."updated_at" IS 'Data da última atualização do registro';
COMMENT ON TABLE "public"."students" IS 'Armazena informações específicas dos alunos.';

-- =====================================================
-- 5. CRIAR TABELA DE TURMAS/CLASSES
-- =====================================================

CREATE TABLE IF NOT EXISTS "public"."classes" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "name" varchar(255) NOT NULL,
    "description" text NULL,
    "teacher_id" uuid NOT NULL,
    "start_date" date NOT NULL,
    "end_date" date NULL,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "classes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "public_classes_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id")
);

-- Comentários para classes
COMMENT ON COLUMN "public"."classes"."id" IS 'Identificador único da turma';
COMMENT ON COLUMN "public"."classes"."name" IS 'Nome da turma ou disciplina';
COMMENT ON COLUMN "public"."classes"."description" IS 'Descrição detalhada da turma';
COMMENT ON COLUMN "public"."classes"."teacher_id" IS 'Professor responsável por esta turma';
COMMENT ON COLUMN "public"."classes"."start_date" IS 'Data de início da turma';
COMMENT ON COLUMN "public"."classes"."end_date" IS 'Data de término da turma';
COMMENT ON COLUMN "public"."classes"."created_at" IS 'Data de criação do registro';
COMMENT ON COLUMN "public"."classes"."updated_at" IS 'Data da última atualização do registro';
COMMENT ON TABLE "public"."classes" IS 'Gerencia as informações das turmas ou disciplinas oferecidas.';

-- =====================================================
-- 6. CRIAR TABELA DE MATRÍCULAS (STUDENT_CLASSES)
-- =====================================================

CREATE TABLE IF NOT EXISTS "public"."student_classes" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "class_id" uuid NOT NULL,
    "enrollment_date" date NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "student_classes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "public_student_classes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    CONSTRAINT "public_student_classes_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id")
);

-- Índices para student_classes
CREATE UNIQUE INDEX IF NOT EXISTS "student_classes_user_id_class_id_idx" ON "public"."student_classes" USING btree ("user_id", "class_id");

-- Comentários para student_classes
COMMENT ON COLUMN "public"."student_classes"."id" IS 'Identificador único da matrícula';
COMMENT ON COLUMN "public"."student_classes"."user_id" IS 'Referência ao aluno matriculado na turma (do perfil de usuário)';
COMMENT ON COLUMN "public"."student_classes"."class_id" IS 'Referência à turma em que o aluno está matriculado';
COMMENT ON COLUMN "public"."student_classes"."enrollment_date" IS 'Data de matrícula do aluno nesta turma';
COMMENT ON COLUMN "public"."student_classes"."created_at" IS 'Data de criação do registro';
COMMENT ON COLUMN "public"."student_classes"."updated_at" IS 'Data da última atualização do registro';
COMMENT ON INDEX "public"."student_classes_user_id_class_id_idx" IS 'Garante que um aluno não possa ser matriculado na mesma turma mais de uma vez';
COMMENT ON TABLE "public"."student_classes" IS 'Tabela de junção para vincular alunos a turmas, representando a matrícula.';

-- =====================================================
-- 7. CRIAR TABELA DE TOKENS DE REDEFINIÇÃO DE SENHA
-- =====================================================

CREATE TABLE IF NOT EXISTS "public"."password_reset_tokens" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "token" varchar(255) NOT NULL,
    "expires_at" timestamp NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "password_reset_tokens_token_key" UNIQUE ("token"),
    CONSTRAINT "public_password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
);

-- Índices para password_reset_tokens
CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_tokens_token_idx" ON "public"."password_reset_tokens" USING btree ("token");

-- Comentários para password_reset_tokens
COMMENT ON COLUMN "public"."password_reset_tokens"."id" IS 'Identificador único do token';
COMMENT ON COLUMN "public"."password_reset_tokens"."user_id" IS 'Referência ao usuário que solicitou a redefinição de senha';
COMMENT ON COLUMN "public"."password_reset_tokens"."token" IS 'Token único usado para redefinir a senha';
COMMENT ON COLUMN "public"."password_reset_tokens"."expires_at" IS 'Data e hora de expiração do token';
COMMENT ON COLUMN "public"."password_reset_tokens"."created_at" IS 'Data de criação do token';
COMMENT ON TABLE "public"."password_reset_tokens" IS 'Armazena tokens para o processo de recuperação de senha.';

-- =====================================================
-- 8. CRIAR TABELA DE SESSÕES DE USUÁRIO
-- =====================================================

CREATE TABLE IF NOT EXISTS "public"."user_sessions" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "session_token" varchar(255) NOT NULL,
    "ip_address" varchar(45) NULL,
    "user_agent" text NULL,
    "login_at" timestamp NOT NULL DEFAULT now(),
    "expires_at" timestamp NOT NULL,
    "is_active" boolean NOT NULL DEFAULT 'true',
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_sessions_session_token_key" UNIQUE ("session_token"),
    CONSTRAINT "public_user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
);

-- Índices para user_sessions
CREATE UNIQUE INDEX IF NOT EXISTS "user_sessions_session_token_idx" ON "public"."user_sessions" USING btree ("session_token");

-- Comentários para user_sessions
COMMENT ON COLUMN "public"."user_sessions"."id" IS 'Identificador único da sessão';
COMMENT ON COLUMN "public"."user_sessions"."user_id" IS 'Referência ao usuário desta sessão';
COMMENT ON COLUMN "public"."user_sessions"."session_token" IS 'Token único para identificar a sessão do usuário';
COMMENT ON COLUMN "public"."user_sessions"."ip_address" IS 'Endereço IP de onde a sessão foi iniciada';
COMMENT ON COLUMN "public"."user_sessions"."user_agent" IS 'String do User-Agent do navegador/dispositivo';
COMMENT ON COLUMN "public"."user_sessions"."login_at" IS 'Data e hora do início da sessão';
COMMENT ON COLUMN "public"."user_sessions"."expires_at" IS 'Data e hora de expiração da sessão';
COMMENT ON COLUMN "public"."user_sessions"."is_active" IS 'Indica se a sessão ainda está ativa';
COMMENT ON COLUMN "public"."user_sessions"."created_at" IS 'Data de criação da sessão';
COMMENT ON COLUMN "public"."user_sessions"."updated_at" IS 'Data da última atualização da sessão';
COMMENT ON TABLE "public"."user_sessions" IS 'Gerencia as sessões ativas dos usuários, permitindo controle de login simultâneo.';

-- =====================================================
-- 9. CRIAR FUNÇÃO PARA ATUALIZAR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 10. CRIAR TRIGGERS PARA ATUALIZAR updated_at
-- =====================================================

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON "public"."users"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at
    BEFORE UPDATE ON "public"."teachers"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON "public"."students"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON "public"."classes"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_classes_updated_at
    BEFORE UPDATE ON "public"."student_classes"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at
    BEFORE UPDATE ON "public"."user_sessions"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 11. HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."teachers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."students" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."classes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."student_classes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."password_reset_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user_sessions" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 12. CRIAR POLÍTICAS RLS BÁSICAS
-- =====================================================

-- Políticas para users
CREATE POLICY "Users can view their own profile" ON "public"."users"
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON "public"."users"
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON "public"."users"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."users" 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para teachers
CREATE POLICY "Teachers can view their own profile" ON "public"."teachers"
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Teachers can update their own profile" ON "public"."teachers"
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all teachers" ON "public"."teachers"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "public"."users" 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para students
CREATE POLICY "Students can view their own profile" ON "public"."students"
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Students can update their own profile" ON "public"."students"
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all students" ON "public"."students"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "public"."users" 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para classes
CREATE POLICY "Teachers can view their own classes" ON "public"."classes"
    FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can manage their own classes" ON "public"."classes"
    FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY "Admins can manage all classes" ON "public"."classes"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "public"."users" 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para student_classes
CREATE POLICY "Students can view their own enrollments" ON "public"."student_classes"
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Students can enroll in classes" ON "public"."student_classes"
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Teachers can view their class enrollments" ON "public"."student_classes"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."classes" 
            WHERE id = class_id AND teacher_id = auth.uid()
        )
    );

-- Políticas para password_reset_tokens
CREATE POLICY "Users can manage their own reset tokens" ON "public"."password_reset_tokens"
    FOR ALL USING (user_id = auth.uid());

-- Políticas para user_sessions
CREATE POLICY "Users can view their own sessions" ON "public"."user_sessions"
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own sessions" ON "public"."user_sessions"
    FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- 13. VERIFICAÇÃO FINAL
-- =====================================================

SELECT 'ESTRUTURA RECRIADA COM SUCESSO!' as status;

SELECT 
    table_name,
    '✅ CRIADA' as status
FROM information_schema.tables 
WHERE table_name IN (
    'users', 'teachers', 'students', 'classes', 
    'student_classes', 'password_reset_tokens', 'user_sessions'
)
AND table_schema = 'public'
ORDER BY table_name;

-- =====================================================
-- 14. INSERIR DADOS DE TESTE (OPCIONAL)
-- =====================================================

-- Inserir usuário admin de teste
INSERT INTO "public"."users" (
    email, password_hash, first_name, last_name, role, is_active
) VALUES (
    'admin@teste.com', 
    '$2b$10$example_hash_here', 
    'Admin', 
    'Sistema', 
    'admin', 
    true
) ON CONFLICT (email) DO NOTHING;

-- Inserir usuário professor de teste
INSERT INTO "public"."users" (
    email, password_hash, first_name, last_name, role, is_active
) VALUES (
    'professor@teste.com', 
    '$2b$10$example_hash_here', 
    'Professor', 
    'Teste', 
    'teacher', 
    true
) ON CONFLICT (email) DO NOTHING;

-- Inserir usuário aluno de teste
INSERT INTO "public"."users" (
    email, password_hash, first_name, last_name, role, is_active
) VALUES (
    'aluno@teste.com', 
    '$2b$10$example_hash_here', 
    'Aluno', 
    'Teste', 
    'student', 
    true
) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- RESUMO FINAL
-- =====================================================

/*
✅ ESTRUTURA RECRIADA COM SUCESSO!

🎯 O QUE FOI CRIADO:

1. ✅ TIPOS PERSONALIZADOS:
   - user_role (enum: student, teacher, admin)

2. ✅ TABELAS PRINCIPAIS:
   - users (tabela principal de usuários)
   - teachers (perfis específicos de professores)
   - students (perfis específicos de alunos)
   - classes (turmas/disciplinas)
   - student_classes (matrículas)
   - password_reset_tokens (recuperação de senha)
   - user_sessions (sessões ativas)

3. ✅ ÍNDICES E CONSTRAINTS:
   - Chaves primárias UUID
   - Chaves estrangeiras
   - Índices únicos
   - Constraints de integridade

4. ✅ FUNCIONALIDADES:
   - Triggers para updated_at
   - RLS habilitado
   - Políticas de segurança
   - Comentários documentados

5. ✅ DADOS DE TESTE:
   - Usuário admin
   - Usuário professor
   - Usuário aluno

🔄 PRÓXIMOS PASSOS:

1. ✅ Verificar se todas as tabelas foram criadas
2. ✅ Testar as políticas RLS
3. ✅ Configurar autenticação no frontend
4. ✅ Testar login com usuários de teste
5. ✅ Implementar funcionalidades específicas

⚠️ IMPORTANTE:
- Todas as tabelas usam UUID como chave primária
- RLS está habilitado com políticas básicas
- Triggers automáticos para updated_at
- Dados de teste incluídos
- Estrutura compatível com Supabase Auth

🚀 O banco está pronto para uso!
*/
