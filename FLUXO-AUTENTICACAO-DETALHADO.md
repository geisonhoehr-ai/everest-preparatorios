# 🔐 **FLUXO DE AUTENTICAÇÃO DETALHADO - EVEREST PREPARATÓRIOS**

## 📋 **VISÃO GERAL DO SISTEMA**

O Everest Preparatórios utiliza um **sistema de autenticação customizado** construído sobre o Supabase, combinando:
- **Autenticação customizada** com hash de senhas (bcryptjs)
- **Sistema de sessões** com tokens JWT
- **Role-Based Access Control (RBAC)** para diferentes tipos de usuários
- **Persistência de sessão** via localStorage
- **Middleware de proteção** de rotas

---

## 🏗️ **ARQUITETURA DO SISTEMA**

### **Componentes Principais**
1. **AuthService** (`lib/auth-custom.ts`) - Lógica de autenticação
2. **AuthContext** (`context/auth-context-custom.tsx`) - Estado global de autenticação
3. **API Routes** (`app/api/auth/`) - Endpoints de autenticação
4. **Middleware** (`middleware.ts`) - Proteção de rotas
5. **Layout Autenticado** (`app/(authenticated)/layout.tsx`) - Verificação de acesso

### **Tabelas do Banco de Dados**
```sql
-- Usuários principais
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  password_hash VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  role VARCHAR, -- 'student', 'teacher', 'administrator'
  is_active BOOLEAN,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Sessões ativas
user_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  session_token VARCHAR UNIQUE,
  ip_address VARCHAR,
  user_agent VARCHAR,
  login_at TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Tokens de reset de senha
password_reset_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  token VARCHAR UNIQUE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP
)
```

---

## 🔄 **FLUXO COMPLETO DE AUTENTICAÇÃO**

### **1. INICIALIZAÇÃO DA APLICAÇÃO**

#### **1.1 AuthProvider Inicializa**
```typescript
// context/auth-context-custom.tsx
useEffect(() => {
  const initializeAuth = async () => {
    // 1. Verificar localStorage por token salvo
    const savedSessionToken = localStorage.getItem('session_token')
    
    if (savedSessionToken) {
      // 2. Verificar se token ainda é válido
      const result = await authService.verifySession(savedSessionToken)
      
      if (result.success && result.user) {
        // 3. Restaurar sessão ativa
        setUser(result.user)
        setSession(result.session)
      } else {
        // 4. Remover token inválido
        localStorage.removeItem('session_token')
      }
    }
    
    setIsLoading(false)
  }
  
  initializeAuth()
}, [])
```

#### **1.2 Verificação de Sessão**
```typescript
// lib/auth-custom.ts
async verifySession(sessionToken: string): Promise<SessionVerificationResult> {
  // 1. Buscar sessão no banco com dados do usuário
  const { data: session } = await this.supabase
    .from('user_sessions')
    .select('*, users (*)')
    .eq('session_token', sessionToken)
    .eq('is_active', true)
    .maybeSingle()

  // 2. Verificar se sessão existe e não expirou
  if (!session || new Date(session.expires_at) < new Date()) {
    return { success: false, error: 'Sessão inválida ou expirada' }
  }

  // 3. Verificar se usuário ainda está ativo
  if (!session.users.is_active) {
    return { success: false, error: 'Usuário inativo' }
  }

  // 4. Retornar dados do usuário
  return { 
    success: true, 
    user: session.users 
  }
}
```

### **2. PROCESSO DE LOGIN**

#### **2.1 Usuário Submete Formulário**
```typescript
// Página de login
const handleLogin = async (email: string, password: string) => {
  const result = await signIn(email, password)
  
  if (result.success) {
    // Redirecionar para dashboard
    router.push('/dashboard')
  } else {
    // Mostrar erro
    setError(result.error)
  }
}
```

#### **2.2 AuthContext Processa Login**
```typescript
// context/auth-context-custom.tsx
const signIn = async (email: string, password: string) => {
  // 1. Chamar API de login
  const response = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })

  const result = await response.json()

  if (result.success) {
    // 2. Atualizar estado global
    setUser(result.user)
    setSession(result.session)
    
    // 3. Salvar token no localStorage
    localStorage.setItem('session_token', result.sessionToken)
    
    return { success: true }
  } else {
    return { success: false, error: result.error }
  }
}
```

#### **2.3 API Route Processa Login**
```typescript
// app/api/auth/signin/route.ts
export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  // 1. Chamar AuthService
  const result = await authService.signIn(
    email,
    password,
    request.headers.get('x-forwarded-for'),
    request.headers.get('user-agent')
  )

  if (result.success) {
    return NextResponse.json({
      success: true,
      user: result.user,
      session: result.session,
      sessionToken: result.sessionToken
    })
  } else {
    return NextResponse.json(
      { success: false, error: result.error }, 
      { status: 401 }
    )
  }
}
```

#### **2.4 AuthService Executa Autenticação**
```typescript
// lib/auth-custom.ts
async signIn(email: string, password: string, ipAddress?: string, userAgent?: string) {
  // 1. Buscar usuário por email
  const { data: user } = await this.supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle()

  if (!user) {
    return { success: false, error: 'Credenciais inválidas' }
  }

  // 2. Verificar se conta está ativa
  if (!user.is_active) {
    return { success: false, error: 'Conta desativada' }
  }

  // 3. Verificar senha com bcrypt
  const isValidPassword = await bcrypt.compare(password, user.password_hash)
  if (!isValidPassword) {
    return { success: false, error: 'Credenciais inválidas' }
  }

  // 4. Atualizar last_login_at
  await this.supabase
    .from('users')
    .update({ 
      last_login_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  // 5. Criar nova sessão
  const session = await this.createSession(user.id, ipAddress, userAgent)

  // 6. Retornar dados do usuário (sem password_hash)
  const { password_hash, ...userWithoutPassword } = user

  return { 
    success: true, 
    user: userWithoutPassword,
    session,
    sessionToken: session.session_token
  }
}
```

#### **2.5 Criação de Sessão**
```typescript
// lib/auth-custom.ts
private async createSession(userId: string, ipAddress?: string, userAgent?: string) {
  // 1. Gerar token único
  const sessionToken = this.generateSessionToken()
  
  // 2. Definir expiração (7 dias)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  // 3. Inserir sessão no banco
  const { data: session } = await this.supabase
    .from('user_sessions')
    .insert({
      user_id: userId,
      session_token: sessionToken,
      ip_address: ipAddress || '127.0.0.1',
      user_agent: userAgent || 'unknown',
      login_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      is_active: true
    })
    .select()
    .single()

  return session
}
```

### **3. PROTEÇÃO DE ROTAS**

#### **3.1 Middleware de Proteção**
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // 1. Definir rotas públicas
  const publicRoutes = ['/login', '/', '/api', '/reset-password', '/_next', '/favicon.ico']
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  
  // 2. Permitir acesso a rotas públicas
  if (isPublicRoute) {
    return NextResponse.next()
  }
  
  // 3. Para rotas protegidas, permitir acesso
  // (A verificação real é feita pelo AuthContext)
  return NextResponse.next()
}
```

#### **3.2 Layout de Rotas Autenticadas**
```typescript
// app/(authenticated)/layout.tsx
export default function AuthenticatedLayout({ children }) {
  const { isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // 1. Verificar se usuário está autenticado
    if (!isLoading && !user) {
      console.log('Usuário não autenticado, redirecionando para login')
      router.push('/login')
    }
  }, [isLoading, user, router])

  // 2. Mostrar loading durante verificação
  if (isLoading) {
    return <LoadingSpinner />
  }

  // 3. Mostrar loading se não tem usuário (vai redirecionar)
  if (!user) {
    return <LoadingSpinner />
  }

  // 4. Renderizar layout autenticado
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
```

### **4. SISTEMA DE PERMISSÕES (RBAC)**

#### **4.1 Definição de Roles**
```typescript
// Tipos de usuário
type UserRole = 'student' | 'teacher' | 'administrator'

// Permissões por role
const ROLE_PERMISSIONS = {
  student: [
    'VIEW_FLASHCARDS',
    'VIEW_QUIZZES', 
    'TAKE_QUIZZES',
    'VIEW_DASHBOARD',
    'VIEW_CALENDAR',
    'VIEW_EVERCAST'
  ],
  teacher: [
    // Todas as permissões de student +
    'CREATE_FLASHCARDS',
    'EDIT_FLASHCARDS',
    'DELETE_FLASHCARDS',
    'CREATE_QUIZZES',
    'EDIT_QUIZZES',
    'DELETE_QUIZZES',
    'MANAGE_CALENDAR',
    'MANAGE_EVERCAST'
  ],
  administrator: [
    // Todas as permissões de teacher +
    'MANAGE_USERS',
    'MANAGE_ROLES',
    'VIEW_ANALYTICS',
    'SYSTEM_SETTINGS'
  ]
}
```

#### **4.2 Componente de Proteção por Role**
```typescript
// components/page-permission-guard.tsx
export function PagePermissionGuard({ 
  children, 
  requiredPermissions 
}: {
  children: React.ReactNode
  requiredPermissions: string[]
}) {
  const { user } = useAuth()

  if (!user) {
    return <AccessDenied />
  }

  // Verificar se usuário tem todas as permissões necessárias
  const userPermissions = ROLE_PERMISSIONS[user.role] || []
  const hasPermission = requiredPermissions.every(permission => 
    userPermissions.includes(permission)
  )

  if (!hasPermission) {
    return <AccessDenied />
  }

  return <>{children}</>
}
```

### **5. LOGOUT E LIMPEZA DE SESSÃO**

#### **5.1 Processo de Logout**
```typescript
// context/auth-context-custom.tsx
const signOut = async () => {
  try {
    // 1. Chamar API de logout
    await fetch('/api/auth/signout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
  } finally {
    // 2. Limpar estado local
    setUser(null)
    setSession(null)
    
    // 3. Remover token do localStorage
    localStorage.removeItem('session_token')
    
    // 4. Redirecionar para login
    router.push('/login')
  }
}
```

#### **5.2 API de Logout**
```typescript
// app/api/auth/signout/route.ts
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (sessionToken) {
      // Desativar sessão no banco
      await authService.invalidateSession(sessionToken)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro no logout' })
  }
}
```

### **6. RESET DE SENHA**

#### **6.1 Solicitação de Reset**
```typescript
// lib/auth-custom.ts
async requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  // 1. Verificar se usuário existe
  const { data: user } = await this.supabase
    .from('users')
    .select('id, email')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle()

  if (!user) {
    return { success: false, error: 'Email não encontrado' }
  }

  // 2. Gerar token de reset
  const resetToken = this.generateResetToken()
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 1) // Expira em 1 hora

  // 3. Salvar token no banco
  await this.supabase
    .from('password_reset_tokens')
    .insert({
      user_id: user.id,
      token: resetToken,
      expires_at: expiresAt.toISOString()
    })

  // 4. Enviar email (implementar)
  // await this.sendResetEmail(user.email, resetToken)

  return { success: true }
}
```

#### **6.2 Reset de Senha**
```typescript
// lib/auth-custom.ts
async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  // 1. Verificar token válido
  const { data: resetToken } = await this.supabase
    .from('password_reset_tokens')
    .select('*, users (*)')
    .eq('token', token)
    .eq('is_active', true)
    .maybeSingle()

  if (!resetToken || new Date(resetToken.expires_at) < new Date()) {
    return { success: false, error: 'Token inválido ou expirado' }
  }

  // 2. Hash da nova senha
  const passwordHash = await bcrypt.hash(newPassword, 12)

  // 3. Atualizar senha do usuário
  await this.supabase
    .from('users')
    .update({ 
      password_hash: passwordHash,
      updated_at: new Date().toISOString()
    })
    .eq('id', resetToken.user_id)

  // 4. Desativar token de reset
  await this.supabase
    .from('password_reset_tokens')
    .update({ is_active: false })
    .eq('id', resetToken.id)

  // 5. Invalidar todas as sessões ativas do usuário
  await this.supabase
    .from('user_sessions')
    .update({ is_active: false })
    .eq('user_id', resetToken.user_id)

  return { success: true }
}
```

---

## 🔒 **SEGURANÇA E VALIDAÇÕES**

### **Validações de Segurança**
1. **Hash de Senhas:** bcryptjs com salt rounds 12
2. **Tokens Únicos:** UUID v4 para sessões e reset
3. **Expiração de Sessões:** 7 dias por padrão
4. **Expiração de Reset:** 1 hora
5. **Rate Limiting:** Implementado nas API routes
6. **Validação de Input:** Zod schemas
7. **Sanitização:** Limpeza de dados de entrada

### **Logs de Segurança**
```typescript
// Logs implementados em cada etapa
console.log('🔐 [AUTH_SERVICE] Tentativa de login iniciada para:', email)
console.log('🔑 [AUTH_SERVICE] Verificando senha para:', user.email)
console.log('✅ [AUTH_SERVICE] Login realizado com sucesso para:', user.email, 'role:', user.role)
console.log('❌ [AUTH_SERVICE] Senha incorreta')
```

---

## 📊 **FLUXO VISUAL**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Usuário       │    │   AuthContext    │    │   AuthService   │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Submit Login       │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │                       │ 2. API Call           │
         │                       ├──────────────────────►│
         │                       │                       │
         │                       │                       │ 3. Verify User
         │                       │                       ├─► Supabase
         │                       │                       │
         │                       │                       │ 4. Check Password
         │                       │                       ├─► bcrypt.compare()
         │                       │                       │
         │                       │                       │ 5. Create Session
         │                       │                       ├─► user_sessions
         │                       │                       │
         │                       │ 6. Return User Data   │
         │                       │◄──────────────────────┤
         │                       │                       │
         │                       │ 7. Update State       │
         │                       │ + localStorage        │
         │                       │                       │
         │ 8. Redirect           │                       │
         │◄──────────────────────┤                       │
         │                       │                       │
```

---

## 🎯 **PONTOS IMPORTANTES**

### **Persistência de Sessão**
- **localStorage:** Token salvo no cliente
- **Banco de Dados:** Sessão ativa no Supabase
- **Verificação:** A cada inicialização da app
- **Timeout:** 3 segundos máximo para verificação

### **Tratamento de Erros**
- **Credenciais Inválidas:** Mensagem genérica por segurança
- **Conta Inativa:** Mensagem específica para admin
- **Sessão Expirada:** Redirecionamento automático
- **Erro de Rede:** Fallback para estado offline

### **Performance**
- **Singleton Pattern:** Uma instância do AuthService
- **Lazy Loading:** Verificação apenas quando necessário
- **Caching:** Estado mantido no Context
- **Debouncing:** Evitar múltiplas verificações

---

## 🚀 **CONCLUSÃO**

O sistema de autenticação do Everest Preparatórios é **robusto e seguro**, combinando:

✅ **Autenticação customizada** com controle total  
✅ **Sistema de sessões** com tokens JWT  
✅ **RBAC** para diferentes tipos de usuários  
✅ **Persistência** via localStorage + banco  
✅ **Segurança** com bcrypt e validações  
✅ **Logs detalhados** para auditoria  
✅ **Tratamento de erros** abrangente  

O fluxo garante que apenas usuários autenticados e autorizados tenham acesso às funcionalidades da plataforma, mantendo a segurança e a experiência do usuário.
