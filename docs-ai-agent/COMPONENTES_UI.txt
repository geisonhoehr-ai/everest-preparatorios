# 🎨 COMPONENTES UI - EVEREST PREPARATÓRIOS

## 🎯 **VISÃO GERAL:**

O sistema de design utiliza **Shadcn/ui** como base, com **Tailwind CSS** para estilização e **Lucide Icons** para ícones. Todos os componentes seguem padrões consistentes e são responsivos.

## 🎨 **SISTEMA DE DESIGN:**

### **Cores:**
```css
/* Cores primárias */
--primary: #f97316 (Orange)
--primary-foreground: #ffffff
--secondary: #3b82f6 (Blue)
--secondary-foreground: #ffffff

/* Estados */
--success: #22c55e (Green)
--warning: #eab308 (Yellow)
--error: #ef4444 (Red)

/* Neutros */
--background: #ffffff
--foreground: #0f172a
--muted: #f1f5f9
--muted-foreground: #64748b
--border: #e2e8f0
--input: #ffffff
--ring: #f97316
```

### **Tipografia:**
```css
/* Fontes */
--font-sans: 'Inter', sans-serif
--font-mono: 'JetBrains Mono', monospace

/* Tamanhos */
--text-xs: 0.75rem (12px)
--text-sm: 0.875rem (14px)
--text-base: 1rem (16px)
--text-lg: 1.125rem (18px)
--text-xl: 1.25rem (20px)
--text-2xl: 1.5rem (24px)
--text-3xl: 1.875rem (30px)
```

### **Espaçamento:**
```css
/* Spacing */
--space-1: 0.25rem (4px)
--space-2: 0.5rem (8px)
--space-3: 0.75rem (12px)
--space-4: 1rem (16px)
--space-6: 1.5rem (24px)
--space-8: 2rem (32px)
--space-12: 3rem (48px)
--space-16: 4rem (64px)
```

## 📱 **COMPONENTES BASE:**

### **1. Button**
```typescript
import { Button } from "@/components/ui/button"

// Variantes
<Button variant="default">Padrão</Button>
<Button variant="destructive">Destrutivo</Button>
<Button variant="outline">Contorno</Button>
<Button variant="secondary">Secundário</Button>
<Button variant="ghost">Fantasma</Button>
<Button variant="link">Link</Button>

// Tamanhos
<Button size="default">Padrão</Button>
<Button size="sm">Pequeno</Button>
<Button size="lg">Grande</Button>
<Button size="icon">Ícone</Button>

// Estados
<Button disabled>Desabilitado</Button>
<Button loading>Carregando</Button>
```

### **2. Card**
```typescript
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
    <CardDescription>Descrição do card</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Conteúdo do card</p>
  </CardContent>
  <CardFooter>
    <Button>Ação</Button>
  </CardFooter>
</Card>
```

### **3. Input**
```typescript
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="seu@email.com"
    required
  />
</div>
```

### **4. Table**
```typescript
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nome</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>João Silva</TableCell>
      <TableCell>joao@email.com</TableCell>
      <TableCell>Ativo</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### **5. Dialog**
```typescript
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir Modal</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título do Modal</DialogTitle>
      <DialogDescription>Descrição do modal</DialogDescription>
    </DialogHeader>
    <div>Conteúdo do modal</div>
    <DialogFooter>
      <Button variant="outline">Cancelar</Button>
      <Button>Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### **6. Avatar**
```typescript
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

<Avatar>
  <AvatarImage src="/user.jpg" alt="Usuário" />
  <AvatarFallback>JS</AvatarFallback>
</Avatar>
```

### **7. Badge**
```typescript
import { Badge } from "@/components/ui/badge"

<Badge variant="default">Padrão</Badge>
<Badge variant="secondary">Secundário</Badge>
<Badge variant="destructive">Destrutivo</Badge>
<Badge variant="outline">Contorno</Badge>
```

## 🔧 **COMPONENTES ESPECÍFICOS:**

### **1. DashboardShell**
```typescript
// Layout principal com sidebar
export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <SidebarNav />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### **2. SidebarNav**
```typescript
// Navegação lateral responsiva
export function SidebarNav({ collapsed = false }) {
  const { user } = useAuth()
  const role = user?.role || 'student'
  
  const menuItems = getMenuItems(role)
  
  return (
    <nav className="flex flex-col space-y-1">
      {menuItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <item.icon className="h-4 w-4" />
          {!collapsed && <span>{item.title}</span>}
        </Link>
      ))}
    </nav>
  )
}
```

### **3. ProgressBar**
```typescript
// Barra de progresso
export function ProgressBar({ 
  value, 
  max = 100, 
  className = "" 
}: { 
  value: number
  max?: number
  className?: string 
}) {
  const percentage = (value / max) * 100
  
  return (
    <div className={cn("w-full bg-muted rounded-full h-2", className)}>
      <div 
        className="bg-primary h-2 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
```

### **4. LoadingSpinner**
```typescript
// Spinner de carregamento
export function LoadingSpinner({ size = "default" }: { size?: "sm" | "default" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-8 w-8",
    lg: "h-12 w-12"
  }
  
  return (
    <div className={cn("animate-spin rounded-full border-b-2 border-primary", sizeClasses[size])} />
  )
}
```

### **5. ErrorBoundary**
```typescript
// Tratamento de erros
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)
  
  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Algo deu errado</h2>
          <p className="text-muted-foreground">Tente recarregar a página</p>
          <Button onClick={() => window.location.reload()}>
            Recarregar
          </Button>
        </div>
      </div>
    )
  }
  
  return children
}
```

## 📱 **RESPONSIVIDADE:**

### **Breakpoints:**
```css
/* Mobile First */
.sm: 640px   /* Small devices */
.md: 768px   /* Medium devices */
.lg: 1024px  /* Large devices */
.xl: 1280px  /* Extra large devices */
.2xl: 1536px /* 2X large devices */
```

### **Classes Responsivas:**
```typescript
// Exemplo de componente responsivo
<div className="
  grid 
  grid-cols-1 
  sm:grid-cols-2 
  md:grid-cols-3 
  lg:grid-cols-4 
  gap-4
">
  {/* Cards responsivos */}
</div>

// Sidebar responsiva
<div className="
  fixed 
  inset-y-0 
  left-0 
  z-50 
  w-64 
  bg-background 
  border-r 
  transform 
  transition-transform 
  duration-300 
  md:hidden
  ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
">
  {/* Menu mobile */}
</div>
```

## 🎨 **TEMA DINÂMICO:**

### **ThemeProvider**
```typescript
// Provedor de tema
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}
```

### **ThemeIcons**
```typescript
// Ícones de tema
export function ThemeIcons({ collapsed = false }) {
  const { theme, setTheme } = useTheme()
  
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        {theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    </div>
  )
}
```

## 🔍 **PADRÕES DE USO:**

### **1. Estados de Loading:**
```typescript
// Sempre mostrar loading state
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

### **2. Formulários:**
```typescript
// Sempre usar labels e validação
export function MyForm() {
  const [formData, setFormData] = useState({})
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>
      
      <Button type="submit">Enviar</Button>
    </form>
  )
}
```

### **3. Tabelas Responsivas:**
```typescript
// Sempre usar scroll horizontal em mobile
<div className="overflow-x-auto">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="hidden md:table-cell">Nome</TableHead>
        <TableHead>Email</TableHead>
        <TableHead className="hidden lg:table-cell">Status</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {/* Dados */}
    </TableBody>
  </Table>
</div>
```

## 🚨 **PROBLEMAS COMUNS:**

### **1. Componente não responsivo:**
```typescript
// ❌ Errado
<div className="w-64">Conteúdo fixo</div>

// ✅ Correto
<div className="w-full md:w-64">Conteúdo responsivo</div>
```

### **2. Loading state ausente:**
```typescript
// ❌ Errado
const { data } = useQuery()
return <div>{data}</div>

// ✅ Correto
const { data, isLoading } = useQuery()
if (isLoading) return <LoadingSpinner />
return <div>{data}</div>
```

### **3. Acessibilidade:**
```typescript
// ❌ Errado
<button onClick={handleClick}>Clique</button>

// ✅ Correto
<Button 
  onClick={handleClick}
  aria-label="Descrição da ação"
  disabled={isLoading}
>
  {isLoading ? <LoadingSpinner size="sm" /> : "Clique"}
</Button>
```

## 🧪 **TESTES DE COMPONENTES:**

### **Teste de Renderização:**
```typescript
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

test('renders button with text', () => {
  render(<Button>Clique aqui</Button>)
  expect(screen.getByText('Clique aqui')).toBeInTheDocument()
})
```

### **Teste de Interação:**
```typescript
import { fireEvent } from '@testing-library/react'

test('calls onClick when clicked', () => {
  const handleClick = jest.fn()
  render(<Button onClick={handleClick}>Clique</Button>)
  
  fireEvent.click(screen.getByText('Clique'))
  expect(handleClick).toHaveBeenCalled()
})
```

---

**🎨 SISTEMA DE DESIGN COMPLETO DO EVEREST PREPARATÓRIOS** 