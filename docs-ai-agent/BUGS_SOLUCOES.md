# 🐛 BUGS E SOLUÇÕES - EVEREST PREPARATÓRIOS

## 🎯 **VISÃO GERAL:**

Este documento registra todos os bugs encontrados, suas causas, soluções implementadas e status atual. Serve como referência para o Agente de IA resolver problemas similares.

## 🚨 **BUGS CRÍTICOS RESOLVIDOS:**

### **1. Erro ao Inserir Membro**
```typescript
// ❌ ERRO ORIGINAL
Error: ❌ [MEMBROS] Erro ao inserir membro: {}

// 🔍 CAUSA
- Tabela `members` com schema incorreto
- Coluna `full_name` não existia
- RLS policies não configuradas

// ✅ SOLUÇÃO
- Recriar tabela com schema correto
- Adicionar todas as colunas necessárias
- Configurar RLS policies

// 📝 SCRIPT DE CORREÇÃO
-- scripts/246_fix_members_table_structure.sql
DROP TABLE IF EXISTS members;
CREATE TABLE members (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  cpf_cnpj TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE
);

-- RLS Policies
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON members
  FOR SELECT USING (auth.role() = 'authenticated');
-- ... outras políticas
```

### **2. Erro ao Definir Role**
```typescript
// ❌ ERRO ORIGINAL
Error: ❌ [MEMBROS] Erro ao definir role: {}

// 🔍 CAUSA
- Tabela `user_roles` com `user_uuid` como UUID
- Aplicação tentando inserir email (TEXT)
- Incompatibilidade de tipos

// ✅ SOLUÇÃO
- Alterar `user_uuid` para TEXT
- Atualizar todas as queries
- Manter consistência com email

// 📝 SCRIPT DE CORREÇÃO
-- scripts/251_fix_user_roles_table.sql
ALTER TABLE user_roles ALTER COLUMN user_uuid TYPE TEXT;
-- Configurar RLS policies
```

### **3. Erro ao Criar Perfil Inicial**
```typescript
// ❌ ERRO ORIGINAL
Error: Erro ao criar perfil inicial: {}

// 🔍 CAUSA
- Tabela `student_profiles` com `user_uuid` como UUID
- Mesmo problema de incompatibilidade de tipos
- RLS não configurado

// ✅ SOLUÇÃO
- Alterar `user_uuid` para TEXT
- Configurar RLS policies
- Garantir inserção automática

// 📝 SCRIPT DE CORREÇÃO
-- scripts/254_fix_student_profiles_table.sql
ALTER TABLE student_profiles ALTER COLUMN user_uuid TYPE TEXT;
-- Configurar RLS policies
```

### **4. Menu Admin Não Aparecendo**
```typescript
// ❌ ERRO ORIGINAL
- Menu admin não aparecendo para professores
- Perfil mostrando "Estudante" para professores
- Sessão não persistente

// 🔍 CAUSA
- Middleware mostrando "Sessão: false"
- useAuth hook não detectando role corretamente
- Sidebar não renderizando menu correto

// ✅ SOLUÇÃO
- Corrigir middleware para detectar sessão
- Melhorar useAuth hook
- Atualizar SidebarNav com logs de debug

// 📝 CÓDIGO CORRIGIDO
// lib/auth-simple.ts
const { data: roleData } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_uuid', session.user.email)  // Usar email, não ID
  .single()

// components/sidebar-nav.tsx
console.log('🔍 [SIDEBAR] User:', user)
console.log('👨‍🏫 [SIDEBAR] Mostrando menu de professor/admin')
```

## 🔧 **BUGS DE PERFORMANCE:**

### **1. Carregamento Lento de Páginas**
```typescript
// ❌ PROBLEMA
- Páginas demorando para carregar
- Queries não otimizadas
- Bundle size grande

// ✅ SOLUÇÕES
- Implementar lazy loading
- Otimizar queries com índices
- Code splitting por rota
- Implementar cache

// 📝 IMPLEMENTAÇÃO
// Lazy loading de componentes
const LazyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />
})

// Otimizar queries
const { data } = await supabase
  .from('members')
  .select('id, email, full_name, status')  // Selecionar apenas campos necessários
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .limit(50)
```

### **2. Memory Leaks**
```typescript
// ❌ PROBLEMA
- Componentes não limpando listeners
- useEffect sem cleanup
- Event listeners acumulando

// ✅ SOLUÇÕES
- Sempre limpar listeners no useEffect
- Usar AbortController para requests
- Implementar cleanup functions

// 📝 IMPLEMENTAÇÃO
useEffect(() => {
  const controller = new AbortController()
  
  const fetchData = async () => {
    try {
      const response = await fetch('/api/data', {
        signal: controller.signal
      })
      // Processar dados
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Erro:', error)
      }
    }
  }
  
  fetchData()
  
  return () => {
    controller.abort()
  }
}, [])
```

## 🎨 **BUGS DE UI/UX:**

### **1. Componentes Não Responsivos**
```typescript
// ❌ PROBLEMA
- Layout quebrado em mobile
- Tabelas com overflow
- Sidebar não adaptável

// ✅ SOLUÇÕES
- Implementar mobile-first design
- Usar classes responsivas do Tailwind
- Testar em diferentes breakpoints

// 📝 IMPLEMENTAÇÃO
// Tabela responsiva
<div className="overflow-x-auto">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="hidden md:table-cell">Nome</TableHead>
        <TableHead>Email</TableHead>
        <TableHead className="hidden lg:table-cell">Status</TableHead>
      </TableRow>
    </TableHeader>
  </Table>
</div>

// Sidebar responsiva
<div className={cn(
  "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-300 md:hidden",
  mobileOpen ? "translate-x-0" : "-translate-x-full"
)}>
```

### **2. Estados de Loading Ausentes**
```typescript
// ❌ PROBLEMA
- Componentes sem loading state
- Interface travada durante carregamento
- UX ruim

// ✅ SOLUÇÕES
- Sempre implementar loading states
- Usar skeletons ou spinners
- Feedback visual para ações

// 📝 IMPLEMENTAÇÃO
export function MyComponent() {
  const { data, isLoading, error } = useQuery()
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <span className="ml-2">Carregando...</span>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-destructive">Erro ao carregar dados</p>
        <Button onClick={() => refetch()}>Tentar novamente</Button>
      </div>
    )
  }
  
  return <div>{/* Conteúdo */}</div>
}
```

## 🗄️ **BUGS DE BANCO DE DADOS:**

### **1. RLS Policies Quebradas**
```sql
-- ❌ PROBLEMA
-- Políticas RLS não configuradas
-- Acesso negado a dados

-- ✅ SOLUÇÃO
-- Configurar políticas para todas as tabelas
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON table_name
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON table_name
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### **2. Relacionamentos Quebrados**
```sql
-- ❌ PROBLEMA
-- Foreign keys com tipos incompatíveis
-- Queries falhando

-- ✅ SOLUÇÃO
-- Verificar e corrigir tipos de dados
-- Garantir consistência entre tabelas

-- Exemplo: user_uuid como TEXT em todas as tabelas
ALTER TABLE user_roles ALTER COLUMN user_uuid TYPE TEXT;
ALTER TABLE members ALTER COLUMN email TYPE TEXT;
ALTER TABLE student_profiles ALTER COLUMN user_uuid TYPE TEXT;
```

## 🔍 **BUGS DE AUTENTICAÇÃO:**

### **1. Sessão Não Persistente**
```typescript
// ❌ PROBLEMA
// Middleware mostrando "Sessão: false"
// Usuário sendo deslogado

// ✅ SOLUÇÃO
// Verificar configuração do Supabase
// Implementar refresh token
// Melhorar middleware

// 📝 IMPLEMENTAÇÃO
// middleware.ts
export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    console.log('🔍 [MIDDLEWARE] Rota:', req.nextUrl.pathname, 'Sessão:', !!session)
    
    // Permitir acesso a todas as rotas (não forçar login)
    return res
    
  } catch (error) {
    console.error('❌ [MIDDLEWARE] Erro:', error)
    return res
  }
}
```

### **2. Role Não Detectado**
```typescript
// ❌ PROBLEMA
// Menu admin não aparecendo
// Role não sendo carregado

// ✅ SOLUÇÃO
// Verificar tabela user_roles
// Usar email em vez de UUID
// Adicionar logs de debug

// 📝 IMPLEMENTAÇÃO
// lib/auth-simple.ts
const { data: roleData, error: roleError } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_uuid', session.user.email)  // Usar email
  .single()

if (roleError) {
  console.warn('⚠️ [AUTH] Erro ao buscar role:', roleError)
}
```

## 🧪 **SCRIPTS DE DIAGNÓSTICO:**

### **1. Verificar Estrutura do Banco**
```javascript
// scripts/verify_database.js
const { data: tables } = await supabase
  .from('information_schema.tables')
  .select('table_name')
  .eq('table_schema', 'public')

console.log('📋 Tabelas encontradas:', tables)
```

### **2. Testar Autenticação**
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

### **3. Verificar Role**
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

## 📊 **MÉTRICAS DE BUGS:**

### **Logs Importantes:**
```typescript
// Sempre logar erros com contexto
console.error('❌ [COMPONENTE] Erro:', error)
console.warn('⚠️ [COMPONENTE] Aviso:', warning)
console.log('🔍 [COMPONENTE] Debug:', data)
```

### **Monitoramento:**
- **Taxa de erro por componente**
- **Tempo de resolução de bugs**
- **Bugs recorrentes**
- **Performance impact**

## 🚀 **PREVENÇÃO DE BUGS:**

### **1. Padrões de Código**
```typescript
// Sempre usar TypeScript
interface User {
  id: string
  email: string
  role: 'student' | 'teacher' | 'admin'
}

// Sempre tratar erros
try {
  const result = await apiCall()
  return { success: true, data: result }
} catch (error) {
  console.error('Erro:', error)
  return { success: false, error: error.message }
}
```

### **2. Testes Automatizados**
```typescript
// Testar componentes
test('renders correctly', () => {
  render(<MyComponent />)
  expect(screen.getByText('Texto')).toBeInTheDocument()
})

// Testar funções
test('handles error correctly', () => {
  const result = handleError(new Error('Test error'))
  expect(result.success).toBe(false)
})
```

### **3. Code Review**
- **Verificar tipos TypeScript**
- **Testar responsividade**
- **Validar acessibilidade**
- **Verificar performance**

## 📝 **CHECKLIST DE RESOLUÇÃO:**

### **Ao Encontrar um Bug:**
1. **Reproduzir** o problema
2. **Identificar** a causa raiz
3. **Implementar** a solução
4. **Testar** a correção
5. **Documentar** a solução
6. **Prevenir** recorrência

### **Ao Implementar Solução:**
1. **Verificar** compatibilidade
2. **Testar** em diferentes cenários
3. **Adicionar** logs de debug
4. **Atualizar** documentação
5. **Criar** script de teste

---

**🐛 DOCUMENTAÇÃO COMPLETA DE BUGS E SOLUÇÕES DO EVEREST PREPARATÓRIOS** 