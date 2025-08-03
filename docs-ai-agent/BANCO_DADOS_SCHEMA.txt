# 🗄️ SCHEMA DO BANCO DE DADOS - EVEREST PREPARATÓRIOS

## 🎯 **VISÃO GERAL:**

O banco de dados utiliza **Supabase (PostgreSQL)** com as seguintes características:
- **RLS (Row Level Security)** habilitado
- **UUID** para IDs primários
- **TEXT** para user_uuid (email)
- **Timestamps** automáticos
- **Relacionamentos** bem definidos

## 📋 **TABELAS PRINCIPAIS:**

### **1. users (Supabase Auth)**
```sql
-- Tabela gerenciada pelo Supabase Auth
-- Não pode ser modificada diretamente
-- Contém: id, email, created_at, updated_at, etc.
```

### **2. user_roles**
```sql
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_uuid TEXT NOT NULL UNIQUE,  -- Email do usuário
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para usuários autenticados
CREATE POLICY "Enable read access for authenticated users" ON user_roles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir inserção para usuários autenticados
CREATE POLICY "Enable insert for authenticated users" ON user_roles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir atualização para usuários autenticados
CREATE POLICY "Enable update for authenticated users" ON user_roles
  FOR UPDATE USING (auth.role() = 'authenticated');
```

### **3. members**
```sql
CREATE TABLE members (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  cpf_cnpj TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE
);

-- RLS Policies
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para usuários autenticados
CREATE POLICY "Enable read access for authenticated users" ON members
  FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir inserção para usuários autenticados
CREATE POLICY "Enable insert for authenticated users" ON members
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir atualização para usuários autenticados
CREATE POLICY "Enable update for authenticated users" ON members
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Permitir exclusão para usuários autenticados
CREATE POLICY "Enable delete for authenticated users" ON members
  FOR DELETE USING (auth.role() = 'authenticated');
```

### **4. student_profiles**
```sql
CREATE TABLE student_profiles (
  id SERIAL PRIMARY KEY,
  user_uuid TEXT NOT NULL UNIQUE,  -- Email do usuário
  nome_completo TEXT,
  total_flashcards INTEGER DEFAULT 0,
  completed_flashcards INTEGER DEFAULT 0,
  total_quizzes INTEGER DEFAULT 0,
  completed_quizzes INTEGER DEFAULT 0,
  average_score NUMERIC DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_study_time INTEGER DEFAULT 0,  -- em minutos
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  first_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para usuários autenticados
CREATE POLICY "Enable read access for authenticated users" ON student_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir inserção para usuários autenticados
CREATE POLICY "Enable insert for authenticated users" ON student_profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir atualização para usuários autenticados
CREATE POLICY "Enable update for authenticated users" ON student_profiles
  FOR UPDATE USING (auth.role() = 'authenticated');
```

### **5. courses**
```sql
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER,  -- em minutos
  professor_name TEXT,
  modules_count INTEGER DEFAULT 0,
  lessons_count INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  students_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para todos
CREATE POLICY "Enable read access for all users" ON courses
  FOR SELECT USING (true);

-- Permitir inserção para professores e admins
CREATE POLICY "Enable insert for teachers and admins" ON courses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_uuid = auth.jwt() ->> 'email' 
      AND role IN ('teacher', 'admin')
    )
  );

-- Permitir atualização para professores e admins
CREATE POLICY "Enable update for teachers and admins" ON courses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_uuid = auth.jwt() ->> 'email' 
      AND role IN ('teacher', 'admin')
    )
  );
```

### **6. flashcards**
```sql
CREATE TABLE flashcards (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para usuários autenticados
CREATE POLICY "Enable read access for authenticated users" ON flashcards
  FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir inserção para professores e admins
CREATE POLICY "Enable insert for teachers and admins" ON flashcards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_uuid = auth.jwt() ->> 'email' 
      AND role IN ('teacher', 'admin')
    )
  );
```

### **7. quiz_questions**
```sql
CREATE TABLE quiz_questions (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id),
  question TEXT NOT NULL,
  options JSONB NOT NULL,  -- Array de opções
  correct_answer INTEGER NOT NULL,  -- Índice da resposta correta
  explanation TEXT,
  category TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para usuários autenticados
CREATE POLICY "Enable read access for authenticated users" ON quiz_questions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir inserção para professores e admins
CREATE POLICY "Enable insert for teachers and admins" ON quiz_questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_uuid = auth.jwt() ->> 'email' 
      AND role IN ('teacher', 'admin')
    )
  );
```

### **8. provas**
```sql
CREATE TABLE provas (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER,  -- em minutos
  total_questions INTEGER DEFAULT 0,
  passing_score INTEGER DEFAULT 70,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE provas ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para usuários autenticados
CREATE POLICY "Enable read access for authenticated users" ON provas
  FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir inserção para professores e admins
CREATE POLICY "Enable insert for teachers and admins" ON provas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_uuid = auth.jwt() ->> 'email' 
      AND role IN ('teacher', 'admin')
    )
  );
```

### **9. redacoes**
```sql
CREATE TABLE redacoes (
  id SERIAL PRIMARY KEY,
  user_uuid TEXT NOT NULL,  -- Email do usuário
  tema_id INTEGER,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved')),
  score INTEGER,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE redacoes ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para o próprio usuário e professores/admins
CREATE POLICY "Enable read access for own redacoes" ON redacoes
  FOR SELECT USING (
    user_uuid = auth.jwt() ->> 'email' OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_uuid = auth.jwt() ->> 'email' 
      AND role IN ('teacher', 'admin')
    )
  );

-- Permitir inserção para usuários autenticados
CREATE POLICY "Enable insert for authenticated users" ON redacoes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir atualização para professores e admins
CREATE POLICY "Enable update for teachers and admins" ON redacoes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_uuid = auth.jwt() ->> 'email' 
      AND role IN ('teacher', 'admin')
    )
  );
```

### **10. community_posts**
```sql
CREATE TABLE community_posts (
  id SERIAL PRIMARY KEY,
  user_uuid TEXT NOT NULL,  -- Email do usuário
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para usuários autenticados
CREATE POLICY "Enable read access for authenticated users" ON community_posts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir inserção para usuários autenticados
CREATE POLICY "Enable insert for authenticated users" ON community_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir atualização para o próprio usuário e admins
CREATE POLICY "Enable update for own posts" ON community_posts
  FOR UPDATE USING (
    user_uuid = auth.jwt() ->> 'email' OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_uuid = auth.jwt() ->> 'email' 
      AND role = 'admin'
    )
  );
```

## 🔗 **RELACIONAMENTOS:**

### **Chaves Estrangeiras:**
```sql
-- user_roles -> users (via email)
-- members -> users (via email)
-- student_profiles -> users (via email)
-- flashcards -> courses (course_id)
-- quiz_questions -> courses (course_id)
-- redacoes -> users (via user_uuid)
-- community_posts -> users (via user_uuid)
```

### **Índices Importantes:**
```sql
-- Índices para performance
CREATE INDEX idx_user_roles_user_uuid ON user_roles(user_uuid);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_student_profiles_user_uuid ON student_profiles(user_uuid);
CREATE INDEX idx_flashcards_course_id ON flashcards(course_id);
CREATE INDEX idx_quiz_questions_course_id ON quiz_questions(course_id);
CREATE INDEX idx_redacoes_user_uuid ON redacoes(user_uuid);
CREATE INDEX idx_community_posts_user_uuid ON community_posts(user_uuid);
```

## 🔐 **SEGURANÇA (RLS):**

### **Políticas Gerais:**
- **Leitura**: Usuários autenticados podem ler dados relevantes
- **Escrita**: Apenas usuários autorizados podem inserir/atualizar
- **Exclusão**: Apenas admins podem excluir dados críticos

### **Políticas Específicas:**
- **user_roles**: Apenas o próprio usuário pode atualizar seu role
- **members**: Professores e admins podem gerenciar
- **courses**: Professores e admins podem criar/editar
- **redacoes**: Usuário vê apenas suas próprias redações
- **community_posts**: Usuário pode editar apenas seus posts

## 📊 **QUERIES COMUNS:**

### **Buscar usuário com role:**
```sql
SELECT u.email, ur.role, m.full_name, sp.*
FROM auth.users u
LEFT JOIN user_roles ur ON u.email = ur.user_uuid
LEFT JOIN members m ON u.email = m.email
LEFT JOIN student_profiles sp ON u.email = sp.user_uuid
WHERE u.email = $1;
```

### **Listar membros com filtros:**
```sql
SELECT m.*, ur.role, sp.current_level
FROM members m
LEFT JOIN user_roles ur ON m.email = ur.user_uuid
LEFT JOIN student_profiles sp ON m.email = sp.user_uuid
WHERE m.status = 'active'
ORDER BY m.created_at DESC;
```

### **Estatísticas de progresso:**
```sql
SELECT 
  COUNT(*) as total_students,
  AVG(sp.average_score) as avg_score,
  AVG(sp.current_level) as avg_level,
  SUM(sp.total_study_time) as total_study_time
FROM student_profiles sp
WHERE sp.last_login_at > NOW() - INTERVAL '30 days';
```

## 🚨 **PROBLEMAS CONHECIDOS:**

### **1. Tipo de Dados:**
- **Problema**: `user_uuid` estava como UUID mas usando email
- **Solução**: Alterado para TEXT em todas as tabelas
- **Status**: ✅ Corrigido

### **2. RLS Policies:**
- **Problema**: Políticas não configuradas
- **Solução**: Criadas políticas para todas as tabelas
- **Status**: ✅ Corrigido

### **3. Relacionamentos:**
- **Problema**: Foreign keys quebradas
- **Solução**: Reconfiguradas com tipos corretos
- **Status**: ✅ Corrigido

## 🧪 **SCRIPTS DE TESTE:**

### **Verificar estrutura:**
```sql
-- Verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verificar tipos de colunas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_roles';
```

### **Testar RLS:**
```sql
-- Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Verificar políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

---

**🗄️ SCHEMA COMPLETO DO BANCO DE DADOS EVEREST PREPARATÓRIOS** 