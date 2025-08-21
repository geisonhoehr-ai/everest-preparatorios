# 🎨 Bibliotecas UI do Projeto Everest

Este projeto agora utiliza uma combinação de bibliotecas UI modernas para criar interfaces ricas e interativas.

## 📚 Bibliotecas Utilizadas

### 1. **Shadcn/ui** (Base)
- **Status**: ✅ Configurado e funcionando
- **Componentes**: Cards, botões, inputs, etc.
- **Localização**: `@/components/ui`
- **Configuração**: `components.json`

### 2. **Aceternity UI** (Efeitos Visuais)
- **Status**: ✅ Instalado e configurado
- **Componentes**: Sparkles, backgrounds animados
- **Localização**: `@/components/aceternity`
- **Dependências**: `framer-motion`

### 3. **Magic UI** (Interatividade 3D)
- **Status**: ✅ Instalado e configurado
- **Componentes**: MagicCard, efeitos 3D
- **Localização**: `@/components/magicui`
- **Dependências**: `framer-motion`

### 4. **Tailwind CSS** (Estilização)
- **Status**: ✅ Configurado e funcionando
- **Configuração**: `tailwind.config.ts`
- **Animações**: `tailwindcss-animate`

## 🚀 Como Usar

### Importando Componentes

```tsx
// Aceternity UI
import { Sparkles } from "@/components/aceternity";

// Magic UI
import { MagicCard } from "@/components/magicui";

// Shadcn/ui (existente)
import { Card, Button } from "@/components/ui";
```

### Exemplo de Uso

```tsx
// Card com efeito Sparkles
<div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
  <Sparkles
    background="#ffffff"
    minSize={0.5}
    maxSize={1.5}
    speed={0.5}
    particleCount={20}
  />
  <div className="absolute inset-0 flex items-center justify-center">
    <p className="text-white">Conteúdo</p>
  </div>
</div>

// Card mágico 3D
<MagicCard className="bg-gradient-to-br from-blue-50 to-indigo-100">
  <h4>Título</h4>
  <p>Conteúdo com efeitos 3D</p>
</MagicCard>
```

## 🎯 Casos de Uso Recomendados

### **Aceternity UI**
- ✅ Backgrounds animados
- ✅ Efeitos de partículas
- ✅ Animações de entrada
- ✅ Efeitos de hover sutis

### **Magic UI**
- ✅ Cards interativos
- ✅ Efeitos 3D
- ✅ Animações de mouse
- ✅ Transições suaves

### **Shadcn/ui**
- ✅ Componentes base
- ✅ Formulários
- ✅ Layouts
- ✅ Acessibilidade

## 🔧 Configuração

### Instalação
```bash
npm install aceternity-ui magicui-cli framer-motion --legacy-peer-deps
```

### Estrutura de Arquivos
```
components/
├── ui/                    # Shadcn/ui
├── aceternity/           # Aceternity UI
│   ├── sparkles.tsx
│   └── index.ts
├── magicui/              # Magic UI
│   ├── magic-card.tsx
│   └── index.ts
└── ui-examples.tsx       # Exemplos de uso
```

## ⚠️ Considerações de Performance

### **Otimizações Recomendadas**
1. **Lazy Loading**: Carregar componentes pesados sob demanda
2. **Debounce**: Limitar animações de mouse
3. **Reduced Motion**: Respeitar preferências de acessibilidade
4. **Bundle Splitting**: Separar bibliotecas em chunks

### **Monitoramento**
- Use React DevTools para verificar re-renders
- Monitore bundle size com `npm run build`
- Teste em dispositivos móveis

## 🎨 Personalização

### Cores e Temas
```tsx
// Personalizar Sparkles
<Sparkles
  background="#3b82f6"    // Cor das partículas
  speed={0.5}             // Velocidade
  particleCount={20}      // Quantidade
/>

// Personalizar MagicCard
<MagicCard className="bg-gradient-to-br from-blue-50 to-indigo-100">
  {/* Conteúdo personalizado */}
</MagicCard>
```

### Animações Customizadas
```tsx
// Usar Framer Motion diretamente
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Conteúdo animado
</motion.div>
```

## 🧪 Testando

### Página de Exemplos
Acesse `/ui-examples` para ver todos os componentes em ação.

### Desenvolvimento
```bash
npm run dev
# Acesse http://localhost:3000/ui-examples
```

## 📖 Recursos Adicionais

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Aceternity UI](https://ui.aceternity.com/)
- [Magic UI](https://www.magicui.design/)

## 🤝 Contribuição

Para adicionar novos componentes:
1. Crie o arquivo em `components/aceternity/` ou `components/magicui/`
2. Adicione ao arquivo `index.ts` correspondente
3. Crie exemplo em `ui-examples.tsx`
4. Atualize este README

---

**Nota**: Estas bibliotecas são complementares ao Shadcn/ui existente. Use-as para adicionar interatividade e efeitos visuais, mantendo a base sólida do Shadcn/ui.
