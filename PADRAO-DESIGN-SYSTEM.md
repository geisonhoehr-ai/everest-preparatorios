# 🎨 PADRÃO DESIGN SYSTEM - EVEREST PREPARATÓRIOS

## 📋 **VISÃO GERAL**

Este documento descreve o novo padrão de design implementado no Everest Preparatórios, baseado na análise da plataforma "Codando Sem Codar". O objetivo é criar consistência visual em todas as páginas.

## 🏗️ **ESTRUTURA IMPLEMENTADA**

### **1. Layout Padrão**
```typescript
// components/layout/standard-layout.tsx
<StandardLayout title="Título da Página" subtitle="Subtítulo opcional">
  {/* Conteúdo da página */}
</StandardLayout>
```

### **2. Sidebar Padronizada**
```typescript
// components/layout/standard-sidebar.tsx
- Categorização por seções (NAVEGAÇÃO, FERRAMENTAS, COMUNIDADE, ADMINISTRAÇÃO)
- Ícones consistentes (Lucide React)
- Sistema de roles (student, teacher, admin)
- Animações suaves (translate-x, hover effects)
```

### **3. Cards Padronizados**
```typescript
// components/ui/standard-card.tsx

// Card de Curso
<CourseCard
  title="Nome do Curso"
  subtitle="X cursos • Y aulas"
  metrics={{ completed: 3, averageProgress: 50, lessonsDone: 20 }}
  courses={[...]}
  overallProgress={50}
  onClick={() => {}}
/>

// Card de Métrica
<MetricCard
  title="Título"
  value="Valor"
  subtitle="Descrição"
  icon={<Icon />}
/>
```

## 🎯 **CARACTERÍSTICAS DO PADRÃO**

### **Design System**
- **Cores:** Sistema baseado em neutral-800 (dark), blue-600 (primary), accent orange
- **Tipografia:** Hierarquia clara com tamanhos específicos (3xl, lg, base, sm)
- **Espaçamentos:** Sistema consistente (4, 6, 8, 10, 12)
- **Bordas:** rounded-3xl para cards, rounded-lg para elementos menores

### **Componentes**
- **Sidebar:** 300px desktop, colapsável mobile
- **Cards:** Altura fixa 420px, sombras específicas
- **Progress bars:** Cor accent (#f97316)
- **Badges:** Sistema de cores para status

### **Responsividade**
- **Mobile:** Sidebar colapsável com overlay
- **Desktop:** Layout fixo com sidebar sempre visível
- **Grid:** 1 coluna mobile → 4 colunas desktop

## 🚀 **COMO USAR**

### **1. Criar Nova Página**
```typescript
// app/(authenticated)/nova-pagina/page.tsx
import { StandardLayout } from "@/components/layout/standard-layout"
import { CourseCard, MetricCard } from "@/components/ui/standard-card"

export default function NovaPagina() {
  return (
    <StandardLayout title="Nova Página" subtitle="Descrição">
      {/* Seu conteúdo aqui */}
    </StandardLayout>
  )
}
```

### **2. Usar Cards**
```typescript
// Exemplo de grid de cards
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
  {courses.map((course) => (
    <CourseCard key={course.id} {...course} />
  ))}
</div>
```

### **3. Adicionar Métricas**
```typescript
// Grid de métricas
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <MetricCard
    title="Total de Usuários"
    value="1,234"
    subtitle="Usuários cadastrados"
    icon={<Users className="h-5 w-5" />}
  />
</div>
```

## 📱 **EXEMPLO COMPLETO**

Veja a implementação completa em:
- `app/(authenticated)/dashboard-new/page.tsx` - Página de exemplo
- `components/layout/standard-layout.tsx` - Layout base
- `components/layout/standard-sidebar.tsx` - Sidebar padronizada
- `components/ui/standard-card.tsx` - Cards padronizados

## 🎨 **CORES DO SISTEMA**

```css
/* Cores principais */
--neutral-100: #f5f5f5
--neutral-200: #e5e5e5
--neutral-700: #404040
--neutral-800: #262626
--neutral-900: #171717

/* Cores de destaque */
--blue-600: #2563eb
--blue-700: #1d4ed8
--accent: #f97316
--green-400: #34d399
--green-700: #047857
```

## 📐 **ESPAÇAMENTOS**

```css
/* Sistema de espaçamento */
--spacing-4: 1rem    /* 16px */
--spacing-6: 1.5rem  /* 24px */
--spacing-8: 2rem    /* 32px */
--spacing-10: 2.5rem /* 40px */
--spacing-12: 3rem   /* 48px */
```

## 🔄 **PRÓXIMOS PASSOS**

1. ✅ **Implementado:**
   - Layout padrão
   - Sidebar padronizada
   - Cards de curso e métricas
   - Sistema de cores
   - Responsividade

2. 🔄 **Em andamento:**
   - Aplicar padrão nas páginas existentes
   - Criar componentes adicionais conforme necessário

3. 📋 **Futuro:**
   - Sistema de temas aprimorado
   - Animações mais elaboradas
   - Componentes de formulário padronizados

## 🎯 **BENEFÍCIOS**

- **Consistência:** Todas as páginas seguem o mesmo padrão visual
- **Produtividade:** Componentes reutilizáveis aceleram desenvolvimento
- **Manutenibilidade:** Mudanças centralizadas afetam todo o sistema
- **UX:** Interface familiar e intuitiva para usuários
- **Responsividade:** Funciona perfeitamente em todos os dispositivos

---

**Nota:** Este padrão foi baseado na análise detalhada da plataforma "Codando Sem Codar" e implementado usando as bibliotecas já existentes no projeto (Shadcn/ui, Lucide React, Tailwind CSS).
