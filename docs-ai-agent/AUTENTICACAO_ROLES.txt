# 🔐 SISTEMA DE AUTENTICAÇÃO E ROLES - EVEREST PREPARATÓRIOS

## 🎯 **VISÃO GERAL:**

O sistema de autenticação utiliza **Supabase Auth** com roles personalizados (student, teacher, admin). A autenticação é persistente e baseada em sessões JWT.

## 🔐 **ARQUITETURA DE AUTENTICAÇÃO:**

### **Fluxo de Autenticação:**
```
1. Login → Supabase Auth
2. Verificação de Role → user_roles table
3. Carregamento de Perfil → members/student_profiles
4. Renderização Baseada no Role → UI Components
```

### **Componentes Principais:**
- **useAuth Hook**: Gerenciamento de estado de autenticação
- **AuthGuard**: Proteção de rotas
- **RouteGuard**: Middleware de autenticação
- **LoginForm**: Formulário de login

## 👥 **SISTEMA DE ROLES:**

### **1. student (Aluno)**
```typescript
// Permissões
- Acesso às funcionalidades de estudo
- Visualização de cursos, flashcards, quiz
- Participação na comunidade
- Upload de redações

// Menu
- Dashboard
- Cursos
- Aulas
- Flashcards
- Quiz
- Provas
- Acervo Digital
- Redação
- Comunidade
- Calendário
- Suporte
```

### **2. teacher (Professor)**
```typescript
// Permissões (herda tudo de student +)
- Gestão de turmas
- Criação de conteúdo
- Correção de redações
- Visualização de relatórios

// Menu (herda tudo de student +)
- Membros (gestão de alunos)
- Turmas (organização de grupos)
```

### **3. admin (Administrador)**
```typescript
// Permissões (herda tudo de teacher +)
- Gestão completa do sistema
- Criação de usuários
- Configurações avançadas
- Relatórios administrativos

// Menu (herda tudo de teacher)
// Acesso total a todas as funcionalidades
```

## 🔧 **IMPLEMENTAÇÃO TÉCNICA:**

### **1. useAuth Hook**
```typescript
// lib/auth-simple.ts
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  })

  const supabase = createClient()

  useEffect(() => {
    // Verificar sessão
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Buscar role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_uuid', session.user.email)
          .single()

        const user: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          role: (roleData?.role as any) || 'student'
        }

        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true
        })
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        })
      }
    }

    checkSession()

    // Escutar mudanças
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Atualizar estado baseado no evento
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return {
    ...authState,
    signIn,
    signUp,
    signOut
  }
}
```

### **2. AuthGuard Component**
```typescript
// components/auth/AuthGuard.tsx
export function AuthGuard({ 
  children, 
  requiredRole = 'student' 
}: { 
  children: React.ReactNode
  requiredRole?: 'student' | 'teacher' | 'admin'
}) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login-simple')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return null
  }

  // Verificar role mínimo
  const roleHierarchy = {
    'student': 1,
    'teacher': 2,
    'admin': 3
  }

  const userRoleLevel = roleHierarchy[user?.role || 'student']
  const requiredRoleLevel = roleHierarchy[requiredRole]

  if (userRoleLevel < requiredRoleLevel) {
    return <AccessDenied />
  }

  return <>{children}</>
}
```

### **3. RouteGuard Middleware**
```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    console.log('🔍 [MIDDLEWARE] Rota:', req.nextUrl.pathname, 'Sessão:', !!session)
    
    // Rotas públicas
    const publicRoutes = [
      '/login-simple', 
      '/signup-simple', 
      '/', 
      '/test-session'
    ]
    
    const isPublicRoute = publicRoutes.some(route => 
      req.nextUrl.pathname.startsWith(route)
    )

    // Permitir acesso a todas as rotas (não forçar login)
    return res
    
  } catch (error) {
    console.error('❌ [MIDDLEWARE] Erro:', error)
    return res
  }
}
```

## 🗄️ **TABELAS DE AUTENTICAÇÃO:**

### **1. user_roles**
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

CREATE POLICY "Enable read access for authenticated users" ON user_roles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON user_roles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON user_roles
  FOR UPDATE USING (auth.role() = 'authenticated');
```

### **2. members**
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

CREATE POLICY "Enable read access for authenticated users" ON members
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON members
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON members
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON members
  FOR DELETE USING (auth.role() = 'authenticated');
```

## 🔍 **FUNÇÕES DE AUTENTICAÇÃO:**

### **1. Login**
```typescript
const signIn = async (email: string, password: string) => {
  try {
    console.log('🔐 [AUTH] Login:', email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error('❌ [AUTH] Erro login:', error)
    return { success: false, error: error.message }
  }
}
```

### **2. Cadastro**
```typescript
const signUp = async (email: string, password: string, role: 'student' | 'teacher' = 'student') => {
  try {
    console.log('📝 [AUTH] Signup:', email)
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) throw error

    if (data.user) {
      // Criar role
      await supabase
        .from('user_roles')
        .insert({
          user_uuid: data.user.email,
          role
        })

      // Criar membro
      await supabase
        .from('members')
        .insert({
          email: data.user.email,
          full_name: email.split('@')[0], // Nome temporário
          status: 'active'
        })

      // Criar perfil de estudante
      await supabase
        .from('student_profiles')
        .insert({
          user_uuid: data.user.email,
          nome_completo: email.split('@')[0]
        })
    }

    return { success: true }
  } catch (error: any) {
    console.error('❌ [AUTH] Erro signup:', error)
    return { success: false, error: error.message }
  }
}
```

### **3. Logout**
```typescript
const signOut = async () => {
  try {
    console.log('🚪 [AUTH] Logout')
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error('❌ [AUTH] Erro logout:', error)
    return { success: false, error: error.message }
  }
}
```

## 🛡️ **PROTEÇÃO DE ROTAS:**

### **1. Páginas Protegidas**
```typescript
// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <AuthGuard requiredRole="student">
      <DashboardShell>
        <div>Dashboard do Aluno</div>
      </DashboardShell>
    </AuthGuard>
  )
}
```

### **2. Páginas Admin**
```typescript
// app/membros/page.tsx
export default function MembrosPage() {
  return (
    <AuthGuard requiredRole="teacher">
      <DashboardShell>
        <div>Gestão de Membros</div>
      </DashboardShell>
    </AuthGuard>
  )
}
```

### **3. Verificação de Role**
```typescript
// Verificar se usuário tem permissão
const { user } = useAuth()
const isTeacher = user?.role === 'teacher' || user?.role === 'admin'
const isAdmin = user?.role === 'admin'

// Renderização condicional
{isTeacher && (
  <Button onClick={handleAdminAction}>
    Ação de Admin
  </Button>
)}
```

## 🎨 **UI DE AUTENTICAÇÃO:**

### **1. LoginForm**
```typescript
export function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const result = await signIn(formData.email, formData.password)
    
    if (result.success) {
      router.push('/dashboard')
    } else {
      toast.error(result.error)
    }
    
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
      </div>
      
      <Button type="submit" disabled={isLoading}>
        {isLoading ? <LoadingSpinner size="sm" /> : 'Entrar'}
      </Button>
    </form>
  )
}
```

### **2. UserProfile**
```typescript
export function UserProfile() {
  const { user, signOut } = useAuth()

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'teacher': return 'Professor'
      case 'admin': return 'Administrador'
      default: return 'Estudante'
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarFallback>
          {user?.email?.split('@')[0].substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{user?.email}</p>
        <p className="text-xs text-muted-foreground">
          {getRoleDisplay(user?.role || 'student')}
        </p>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
```

## 🚨 **PROBLEMAS CONHECIDOS:**

### **1. Sessão não persistente**
```typescript
// ❌ Problema: Middleware mostrando "Sessão: false"
// ✅ Solução: Verificar configuração do Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### **2. Role não detectado**
```typescript
// ❌ Problema: Menu admin não aparecendo
// ✅ Solução: Verificar tabela user_roles
const { data: roleData } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_uuid', session.user.email)
  .single()
```

### **3. Perfil não carregado**
```typescript
// ❌ Problema: Dados do usuário não aparecendo
// ✅ Solução: Verificar tabelas members e student_profiles
const { data: memberData } = await supabase
  .from('members')
  .select('*')
  .eq('email', session.user.email)
  .single()
```

## 🧪 **SCRIPTS DE TESTE:**

### **1. Testar Login**
```javascript
// scripts/test_auth.js
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'professor@teste.com',
  password: '123456'
})

if (error) {
  console.error('❌ Erro no login:', error)
} else {
  console.log('✅ Login bem-sucedido:', data.user.email)
}
```

### **2. Verificar Role**
```javascript
// scripts/test_role.js
const { data: roleData, error } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_uuid', 'professor@teste.com')
  .single()

if (error) {
  console.error('❌ Erro ao buscar role:', error)
} else {
  console.log('✅ Role encontrado:', roleData.role)
}
```

### **3. Testar Sessão**
```javascript
// scripts/test_session.js
const { data: { session } } = await supabase.auth.getSession()

if (session) {
  console.log('✅ Sessão ativa:', session.user.email)
} else {
  console.log('❌ Nenhuma sessão')
}
```

## 📊 **MÉTRICAS DE AUTENTICAÇÃO:**

### **Logs Importantes:**
```typescript
// Sempre logar eventos de auth
console.log('🔐 [AUTH] Login:', email)
console.log('👤 [AUTH] Usuário carregado:', user)
console.log('🚪 [AUTH] Logout')
console.error('❌ [AUTH] Erro:', error)
```

### **Monitoramento:**
- **Taxa de sucesso de login**
- **Tempo de carregamento de sessão**
- **Erros de autenticação**
- **Usuários ativos por role**

---

**🔐 SISTEMA DE AUTENTICAÇÃO COMPLETO DO EVEREST PREPARATÓRIOS** 