# 🔐 FLUXO DE AUTENTICAÇÃO COMPLETO - EVEREST PREPARATÓRIOS

## 📋 **RESUMO EXECUTIVO**

Este documento descreve **todo o fluxo de autenticação** do projeto Everest Preparatórios para que você possa criar um banco de dados novo do zero.

---

## 🏗️ **1. ESTRUTURA DO BANCO DE DADOS**

### **1.1 Configuração do Supabase**
```typescript
// Variáveis de ambiente necessárias
NEXT_PUBLIC_SUPABASE_URL=https://wruvehhfzkvmfyhxzmwo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **1.2 Estrutura de Tabelas (RECOMENDADA)**

#### **Opção A: Estrutura Unificada (RECOMENDADA)**
```sql
-- Tabela principal unificada
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student')),
    display_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
```

#### **Opção B: Estrutura Completa (ALTERNATIVA)**
```sql
-- Tabela de roles
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_uuid TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    first_login BOOLEAN DEFAULT true,
    profile_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de perfis unificada
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_uuid TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    progress INTEGER DEFAULT 0,
    ranking INTEGER DEFAULT 0,
    total_flashcards INTEGER DEFAULT 0,
    completed_flashcards INTEGER DEFAULT 0,
    total_quizzes INTEGER DEFAULT 0,
    completed_quizzes INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_study_time INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    first_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelas específicas por role
CREATE TABLE student_profiles (
    id SERIAL PRIMARY KEY,
    user_uuid TEXT UNIQUE NOT NULL,
    nome_completo TEXT,
    escola TEXT,
    ano_escolar TEXT,
    objetivo TEXT,
    data_nascimento DATE,
    -- ... outros campos específicos de estudante
);

CREATE TABLE teacher_profiles (
    id SERIAL PRIMARY KEY,
    user_uuid TEXT UNIQUE NOT NULL,
    nome_completo TEXT NOT NULL,
    especialidade TEXT,
    formacao TEXT,
    experiencia_anos INTEGER,
    bio TEXT,
    -- ... outros campos específicos de professor
);
```

---

## 🔄 **2. FLUXO DE AUTENTICAÇÃO**

### **2.1 Arquivos Principais**

#### **A. Context de Autenticação (`context/auth-context.tsx`)**
```typescript
interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

interface UserProfile {
  id: string
  user_id: string
  role: 'admin' | 'teacher' | 'student'
  display_name?: string
  created_at: string
}
```

#### **B. Página de Login (`app/login/page.tsx`)**
```typescript
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)
  setError("")

  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError("Credenciais inválidas. Verifique seu email e senha.")
      return
    }

    if (data.user) {
      // Redirecionar baseado no role do usuário
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .single()

      if (profile?.role === 'admin') {
        router.push("/dashboard")
      } else {
        router.push("/dashboard")
      }
    }
  } catch (error) {
    setError("Erro inesperado. Tente novamente.")
  } finally {
    setIsLoading(false)
  }
}
```

### **2.2 Fluxo Completo**

#### **Passo 1: Inicialização**
1. **AuthProvider** é carregado na aplicação
2. Verifica sessão existente com `supabase.auth.getSession()`
3. Se há sessão, busca perfil do usuário
4. Se não há perfil, cria um padrão

#### **Passo 2: Login**
1. Usuário insere email/senha
2. `supabase.auth.signInWithPassword()` autentica
3. Busca perfil na tabela `user_profiles`
4. Redireciona baseado no role

#### **Passo 3: Criação de Perfil**
```typescript
const createDefaultProfile = async (userId: string) => {
  // Determinar role baseado no email
  let role: 'admin' | 'teacher' | 'student' = 'student'
  if (user.email === 'admin@teste.com') {
    role = 'admin'
  } else if (user.email === 'professor@teste.com') {
    role = 'teacher'
  } else if (user.email === 'aluno@teste.com') {
    role = 'student'
  }
  
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      user_id: userId,
      role: role,
      display_name: user?.email?.split('@')[0] || 'Usuário'
    })
    .select()
    .single()
}
```

#### **Passo 4: Verificação de Acesso**
```typescript
export function useRequireAuth(requiredRole?: 'admin' | 'teacher' | 'student') {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
      return
    }

    if (!isLoading && user && requiredRole && profile?.role !== requiredRole) {
      router.push('/dashboard')
    }
  }, [user, profile, isLoading, requiredRole, router])

  return { user, profile, isLoading }
}
```

---

## 🛡️ **3. POLÍTICAS RLS (ROW LEVEL SECURITY)**

### **3.1 Políticas para user_profiles (Estrutura Unificada)**
```sql
-- Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "users_can_read_own_profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "authenticated_users_can_insert_profiles" ON user_profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### **3.2 Políticas para Estrutura Completa**
```sql
-- user_roles
CREATE POLICY "Users can view their own role" ON user_roles
    FOR SELECT USING (user_uuid = auth.uid()::text);

CREATE POLICY "Users can update their own role" ON user_roles
    FOR UPDATE USING (user_uuid = auth.uid()::text);

CREATE POLICY "Enable insert for authenticated users" ON user_roles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (user_uuid = auth.uid()::text);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (user_uuid = auth.uid()::text);

CREATE POLICY "Enable insert for authenticated users" ON user_profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

---

## 🔧 **4. CONFIGURAÇÃO DOS CLIENTES SUPABASE**

### **4.1 Cliente do Navegador (`lib/supabase/client.ts`)**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hnhzindsfuqnaxosujay.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
```

### **4.2 Cliente do Servidor (`lib/supabaseServer.ts`)**
```typescript
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabaseAdmin = supabaseUrl && supabaseServiceKey ? 
  createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }) : null
```

---

## 📝 **5. SCRIPTS SQL PARA CRIAÇÃO**

### **5.1 Script Completo (Estrutura Unificada)**
```sql
-- =====================================================
-- SCRIPT COMPLETO DE AUTENTICAÇÃO - ESTRUTURA UNIFICADA
-- =====================================================

-- 1. CRIAR TABELA user_profiles
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student')),
    display_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 2. CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- 3. HABILITAR RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS
CREATE POLICY "users_can_read_own_profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "authenticated_users_can_insert_profiles" ON user_profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. CRIAR TRIGGER
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profiles_updated_at();

-- 6. INSERIR USUÁRIOS DE TESTE
INSERT INTO user_profiles (user_id, role, display_name) VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin', 'Admin'),
    ('00000000-0000-0000-0000-000000000002', 'teacher', 'Professor'),
    ('00000000-0000-0000-0000-000000000003', 'student', 'Aluno');
```

### **5.2 Script Completo (Estrutura Completa)**
```sql
-- =====================================================
-- SCRIPT COMPLETO DE AUTENTICAÇÃO - ESTRUTURA COMPLETA
-- =====================================================

-- 1. CRIAR TABELA user_roles
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_uuid TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    first_login BOOLEAN DEFAULT true,
    profile_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CRIAR TABELA user_profiles
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_uuid TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    progress INTEGER DEFAULT 0,
    ranking INTEGER DEFAULT 0,
    total_flashcards INTEGER DEFAULT 0,
    completed_flashcards INTEGER DEFAULT 0,
    total_quizzes INTEGER DEFAULT 0,
    completed_quizzes INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_study_time INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    first_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CRIAR TABELAS ESPECÍFICAS
CREATE TABLE student_profiles (
    id SERIAL PRIMARY KEY,
    user_uuid TEXT UNIQUE NOT NULL,
    nome_completo TEXT,
    escola TEXT,
    ano_escolar TEXT,
    objetivo TEXT,
    data_nascimento DATE,
    total_flashcards INTEGER DEFAULT 0,
    completed_flashcards INTEGER DEFAULT 0,
    total_quizzes INTEGER DEFAULT 0,
    completed_quizzes INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_study_time INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    first_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE teacher_profiles (
    id SERIAL PRIMARY KEY,
    user_uuid TEXT UNIQUE NOT NULL,
    nome_completo TEXT NOT NULL,
    especialidade TEXT,
    formacao TEXT,
    experiencia_anos INTEGER,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;

-- 5. CRIAR POLÍTICAS RLS
-- user_roles
CREATE POLICY "Users can view their own role" ON user_roles
    FOR SELECT USING (user_uuid = auth.uid()::text);

CREATE POLICY "Users can update their own role" ON user_roles
    FOR UPDATE USING (user_uuid = auth.uid()::text);

CREATE POLICY "Enable insert for authenticated users" ON user_roles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (user_uuid = auth.uid()::text);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (user_uuid = auth.uid()::text);

CREATE POLICY "Enable insert for authenticated users" ON user_profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- student_profiles
CREATE POLICY "Students can view their own profile" ON student_profiles
    FOR SELECT USING (user_uuid = auth.uid()::text);

CREATE POLICY "Students can update their own profile" ON student_profiles
    FOR UPDATE USING (user_uuid = auth.uid()::text);

CREATE POLICY "Enable insert for authenticated users" ON student_profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- teacher_profiles
CREATE POLICY "Teachers can view their own profile" ON teacher_profiles
    FOR SELECT USING (user_uuid = auth.uid()::text);

CREATE POLICY "Teachers can update their own profile" ON teacher_profiles
    FOR UPDATE USING (user_uuid = auth.uid()::text);

CREATE POLICY "Enable insert for authenticated users" ON teacher_profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 6. CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_user_roles_user_uuid ON user_roles(user_uuid);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_uuid ON user_profiles(user_uuid);
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_uuid ON student_profiles(user_uuid);
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_user_uuid ON teacher_profiles(user_uuid);

-- 7. CRIAR FUNÇÃO PARA ATUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. CRIAR TRIGGERS
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_profiles_updated_at
    BEFORE UPDATE ON student_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_profiles_updated_at
    BEFORE UPDATE ON teacher_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 🚀 **6. PASSOS PARA CRIAR BANCO NOVO**

### **6.1 Preparação**
1. **Criar novo projeto no Supabase**
2. **Configurar variáveis de ambiente**
3. **Escolher estrutura (Unificada ou Completa)**

### **6.2 Execução**
1. **Executar script SQL escolhido**
2. **Verificar criação das tabelas**
3. **Testar políticas RLS**
4. **Criar usuários de teste**

### **6.3 Teste**
1. **Testar login com usuários criados**
2. **Verificar redirecionamento por role**
3. **Testar criação automática de perfis**
4. **Verificar políticas de acesso**

---

## 📊 **7. USUÁRIOS DE TESTE RECOMENDADOS**

### **7.1 Para Estrutura Unificada**
```sql
-- Criar usuários no Supabase Auth primeiro, depois:
INSERT INTO user_profiles (user_id, role, display_name) VALUES
    ('[UUID_DO_ADMIN]', 'admin', 'Admin'),
    ('[UUID_DO_PROFESSOR]', 'teacher', 'Professor'),
    ('[UUID_DO_ALUNO]', 'student', 'Aluno');
```

### **7.2 Para Estrutura Completa**
```sql
-- Criar usuários no Supabase Auth primeiro, depois:
INSERT INTO user_roles (user_uuid, role) VALUES
    ('[UUID_DO_ADMIN]', 'admin'),
    ('[UUID_DO_PROFESSOR]', 'teacher'),
    ('[UUID_DO_ALUNO]', 'student');

INSERT INTO user_profiles (user_uuid, email, name, role) VALUES
    ('[UUID_DO_ADMIN]', 'admin@teste.com', 'Admin', 'admin'),
    ('[UUID_DO_PROFESSOR]', 'professor@teste.com', 'Professor', 'teacher'),
    ('[UUID_DO_ALUNO]', 'aluno@teste.com', 'Aluno', 'student');
```

---

## ⚠️ **8. CONSIDERAÇÕES IMPORTANTES**

### **8.1 Estrutura Recomendada**
- **Use a Estrutura Unificada** para simplicidade
- **Use a Estrutura Completa** se precisar de campos específicos por role

### **8.2 Compatibilidade**
- O código atual funciona com **ambas as estruturas**
- A estrutura unificada é mais simples e eficiente
- A estrutura completa oferece mais flexibilidade

### **8.3 Migração**
- Se já tem dados, use os scripts de migração
- Se é banco novo, use os scripts de criação
- Sempre teste em ambiente de desenvolvimento primeiro

---

## 🎯 **9. RESUMO EXECUTIVO**

### **Para criar um banco novo:**

1. **Escolha a estrutura** (Unificada ou Completa)
2. **Execute o script SQL** correspondente
3. **Configure as variáveis de ambiente**
4. **Crie usuários de teste**
5. **Teste o fluxo completo**

### **Estrutura recomendada:**
- **Estrutura Unificada** para a maioria dos casos
- **Tabela única `user_profiles`** com role
- **Políticas RLS simples** e eficientes
- **Compatível com o código atual**

---

**✅ Com este documento, você tem tudo que precisa para criar um banco de dados novo do zero!**
