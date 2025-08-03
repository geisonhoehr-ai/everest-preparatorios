# 🏗️ ESTRUTURA DO PROJETO EVEREST PREPARATÓRIOS

## 📁 **ESTRUTURA DE DIRETÓRIOS:**

```
everest-preparatorios/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Grupo de rotas de autenticação
│   ├── api/                      # API Routes
│   │   ├── avaliacoes-redacao/   # API de correção de redação
│   │   ├── memberkit-webhook/    # Webhook do MemberKit
│   │   └── pandavideo/          # Integração com PandaVideo
│   ├── dashboard/                # Dashboard principal
│   ├── cursos/                   # Página de cursos
│   ├── flashcards/               # Sistema de flashcards
│   ├── quiz/                     # Sistema de quiz
│   ├── provas/                   # Simulados
│   ├── redacao/                  # Sistema de redação
│   ├── membros/                  # Gestão de membros (admin)
│   ├── turmas/                   # Gestão de turmas (admin)
│   ├── community/                # Fórum da comunidade
│   ├── calendario/               # Calendário de eventos
│   ├── suporte/                  # Sistema de suporte
│   ├── login-simple/             # Página de login
│   ├── signup-simple/            # Página de cadastro
│   └── globals.css               # Estilos globais
├── components/                    # Componentes React
│   ├── ui/                       # Componentes Shadcn/ui
│   ├── auth/                     # Componentes de autenticação
│   ├── community/                # Componentes da comunidade
│   └── dashboard-shell.tsx       # Layout principal
├── lib/                          # Utilitários e configurações
│   ├── supabase/                 # Cliente Supabase
│   ├── auth-simple.ts            # Hook de autenticação
│   ├── utils.ts                  # Funções utilitárias
│   └── student-progress.ts       # Lógica de progresso
├── hooks/                        # Custom hooks
├── public/                       # Arquivos estáticos
├── scripts/                      # Scripts SQL e Node.js
├── styles/                       # Estilos adicionais
└── docs-ai-agent/               # Documentação para IA
```

## 🎯 **ARQUITETURA TÉCNICA:**

### **Frontend (Next.js 15):**
- **App Router**: Sistema de roteamento baseado em arquivos
- **Server Components**: Renderização no servidor
- **Client Components**: Interatividade no cliente
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Framework de estilos

### **Backend (Supabase):**
- **PostgreSQL**: Banco de dados principal
- **Auth**: Sistema de autenticação
- **Storage**: Armazenamento de arquivos
- **Real-time**: Atualizações em tempo real
- **RLS**: Row Level Security

### **UI/UX:**
- **Shadcn/ui**: Componentes base
- **Lucide Icons**: Ícones
- **Responsive Design**: Mobile-first
- **Dark/Light Mode**: Tema dinâmico

## 📋 **PÁGINAS PRINCIPAIS:**

### **1. Dashboard (`/dashboard`)**
- Visão geral do progresso do aluno
- Estatísticas de estudo
- Próximas atividades
- Acesso rápido às funcionalidades

### **2. Cursos (`/cursos`)**
- Catálogo de cursos preparatórios
- Filtros por categoria
- Sistema de busca
- Progresso por curso

### **3. Flashcards (`/flashcards`)**
- Sistema de memorização
- Categorias de flashcards
- Progresso de estudo
- Estatísticas de acerto

### **4. Quiz (`/quiz`)**
- Testes interativos
- Múltipla escolha
- Correção automática
- Histórico de tentativas

### **5. Provas (`/provas`)**
- Simulados completos
- Cronômetro
- Correção detalhada
- Relatórios de performance

### **6. Redação (`/redacao`)**
- Sistema de correção
- Upload de redações
- Feedback detalhado
- Histórico de correções

### **7. Membros (`/membros`) - ADMIN**
- Gestão de usuários
- Import/export de dados
- Filtros avançados
- Ações em lote

### **8. Turmas (`/turmas`) - ADMIN**
- Organização de grupos
- Atribuição de professores
- Controle de acesso
- Relatórios de turma

### **9. Comunidade (`/community`)**
- Fórum de discussão
- Posts e comentários
- Sistema de likes
- Moderação de conteúdo

### **10. Calendário (`/calendario`)**
- Eventos da plataforma
- Cronograma de estudos
- Lembretes personalizados
- Integração com Google Calendar

## 🔧 **COMPONENTES PRINCIPAIS:**

### **Layout e Navegação:**
- `DashboardShell`: Layout principal com sidebar
- `SidebarNav`: Navegação lateral
- `ThemeIcons`: Controle de tema
- `MobileMenu`: Menu mobile

### **Autenticação:**
- `AuthGuard`: Proteção de rotas
- `RouteGuard`: Middleware de autenticação
- `useAuth`: Hook de autenticação
- `LoginForm`: Formulário de login

### **UI Components:**
- `Button`: Botões padronizados
- `Card`: Cards de conteúdo
- `Table`: Tabelas responsivas
- `Dialog`: Modais e popups
- `Form`: Formulários
- `Avatar`: Avatares de usuário

### **Funcionalidades Específicas:**
- `FlashcardCard`: Card de flashcard
- `QuizQuestion`: Questão de quiz
- `ProgressBar`: Barra de progresso
- `MemberTable`: Tabela de membros
- `CommunityPost`: Post da comunidade

## 🗄️ **ESTRUTURA DE DADOS:**

### **Tabelas Principais:**
1. **users** (Supabase Auth)
2. **user_roles** - Roles dos usuários
3. **members** - Dados dos membros
4. **student_profiles** - Perfis de estudantes
5. **courses** - Cursos disponíveis
6. **flashcards** - Sistema de flashcards
7. **quiz_questions** - Questões de quiz
8. **provas** - Simulados
9. **redacoes** - Sistema de redação
10. **community_posts** - Posts da comunidade

### **Relacionamentos:**
- `users` ↔ `user_roles` (1:1)
- `users` ↔ `members` (1:1)
- `users` ↔ `student_profiles` (1:1)
- `courses` ↔ `flashcards` (1:N)
- `courses` ↔ `quiz_questions` (1:N)

## 🚀 **SISTEMA DE AUTENTICAÇÃO:**

### **Roles:**
- **student**: Aluno da plataforma
- **teacher**: Professor/Instrutor
- **admin**: Administrador do sistema

### **Permissões:**
- **student**: Acesso às funcionalidades de estudo
- **teacher**: + Gestão de turmas e conteúdo
- **admin**: + Gestão completa do sistema

### **Fluxo de Auth:**
1. Login via Supabase Auth
2. Verificação de role na tabela `user_roles`
3. Carregamento de dados do perfil
4. Renderização baseada no role

## 📱 **RESPONSIVIDADE:**

### **Breakpoints:**
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### **Adaptações:**
- Sidebar colapsável em mobile
- Menu hambúrguer para mobile
- Tabelas com scroll horizontal
- Cards empilhados em mobile

## 🎨 **SISTEMA DE DESIGN:**

### **Cores:**
- **Primary**: Orange (#f97316)
- **Secondary**: Blue (#3b82f6)
- **Success**: Green (#22c55e)
- **Warning**: Yellow (#eab308)
- **Error**: Red (#ef4444)

### **Tipografia:**
- **Heading**: Inter (Bold)
- **Body**: Inter (Regular)
- **Monospace**: JetBrains Mono

### **Espaçamento:**
- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)

## 🔍 **PADRÕES DE CÓDIGO:**

### **Nomenclatura:**
- **Arquivos**: kebab-case (`user-profile.tsx`)
- **Componentes**: PascalCase (`UserProfile`)
- **Funções**: camelCase (`getUserData`)
- **Constantes**: UPPER_SNAKE_CASE (`API_URL`)

### **Organização:**
- **Um componente por arquivo**
- **Hooks no início do componente**
- **Funções auxiliares no final**
- **Types/Interfaces separados**

### **Imports:**
```typescript
// React e Next.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Componentes UI
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// Utilitários
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-simple'

// Ícones
import { User, Settings, LogOut } from 'lucide-react'
```

## 🧪 **TESTES E DEBUG:**

### **Logs Padrão:**
```typescript
console.log('🔍 [COMPONENTE] Ação:', data)
console.error('❌ [COMPONENTE] Erro:', error)
console.warn('⚠️ [COMPONENTE] Aviso:', warning)
```

### **Scripts de Teste:**
- `scripts/test_auth.js`: Teste de autenticação
- `scripts/test_database.js`: Teste de banco
- `scripts/test_ui.js`: Teste de componentes

## 📊 **MONITORAMENTO:**

### **Métricas Importantes:**
- **Performance**: Tempo de carregamento
- **Erros**: Rate de erros
- **Usuários**: Usuários ativos
- **Engajamento**: Tempo na plataforma

### **Ferramentas:**
- **Vercel Analytics**: Métricas de performance
- **Supabase Dashboard**: Métricas de banco
- **Console Logs**: Debug em desenvolvimento

---

**🏗️ ESTRUTURA COMPLETA DO PROJETO EVEREST PREPARATÓRIOS** 