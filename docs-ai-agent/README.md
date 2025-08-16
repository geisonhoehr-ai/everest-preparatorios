# 🤖 DOCUMENTAÇÃO PARA AGENTE DE IA - EVEREST PREPARATÓRIOS

## 🎯 **OBJETIVO:**

Esta pasta contém toda a documentação necessária para treinar um Agente de IA que ajudará no desenvolvimento da plataforma Everest Preparatórios, focando na resolução de bugs e melhorias.

## 📁 **ARQUIVOS DISPONÍVEIS:**

### **1. PROMPT_AGENTE_IA.md** (Arquivo Principal)
- **Descrição**: Prompt completo para o Agente de IA
- **Conteúdo**: Missão, contexto, metodologia, padrões de código
- **Uso**: Copiar este conteúdo para treinar o agente

### **2. ESTRUTURA_PROJETO.md**
- **Descrição**: Arquitetura e organização do projeto
- **Conteúdo**: Estrutura de diretórios, tecnologias, componentes
- **Tamanho**: ~15KB

### **3. BANCO_DADOS_SCHEMA.md**
- **Descrição**: Schema completo do banco de dados
- **Conteúdo**: Tabelas, relacionamentos, RLS, queries
- **Tamanho**: ~25KB

### **4. COMPONENTES_UI.md**
- **Descrição**: Sistema de design e componentes
- **Conteúdo**: Shadcn/ui, responsividade, padrões
- **Tamanho**: ~20KB

### **5. AUTENTICACAO_ROLES.md**
- **Descrição**: Sistema de autenticação e permissões
- **Conteúdo**: Supabase Auth, roles, proteção de rotas
- **Tamanho**: ~18KB

### **6. BUGS_SOLUCOES.md**
- **Descrição**: Histórico de bugs e soluções
- **Conteúdo**: Problemas conhecidos, correções, prevenção
- **Tamanho**: ~22KB

## 🚀 **COMO USAR:**

### **1. Para Treinar o Agente:**
```markdown
1. Copie o conteúdo de PROMPT_AGENTE_IA.md
2. Cole no prompt de treinamento do agente
3. Adicione os 5 arquivos de documentação como contexto
4. Configure o agente para responder em português brasileiro
```

### **2. Para Consulta Rápida:**
```markdown
- ESTRUTURA_PROJETO.md → Arquitetura e organização
- BANCO_DADOS_SCHEMA.md → Problemas de banco de dados
- COMPONENTES_UI.md → Problemas de interface
- AUTENTICACAO_ROLES.md → Problemas de autenticação
- BUGS_SOLUCOES.md → Histórico de soluções
```

### **3. Para Implementar Soluções:**
```markdown
1. Identifique o tipo de problema
2. Consulte o arquivo relevante
3. Use os exemplos de código fornecidos
4. Siga os padrões estabelecidos
5. Teste a solução implementada
```

## 🎯 **ÁREAS DE FOCO:**

### **Autenticação e Sessão:**
- Login/logout não funcionando
- Sessão não persistente
- Roles não detectados
- Menu admin não aparecendo

### **Banco de Dados:**
- Erros de RLS (Row Level Security)
- Problemas de schema (UUID vs TEXT)
- Queries com erro
- Relacionamentos quebrados

### **UI/UX:**
- Componentes não responsivos
- Estilos quebrados
- Estados de loading
- Navegação mobile

### **Performance:**
- Carregamento lento
- Memory leaks
- Otimizações de queries
- Bundle size

### **Funcionalidades:**
- Server Actions com erro
- API routes quebradas
- Upload de arquivos
- Real-time features

## 🔧 **PADRÕES DE CÓDIGO:**

### **TypeScript:**
```typescript
// Sempre tipar interfaces
interface User {
  id: string
  email: string
  role: 'student' | 'teacher' | 'admin'
}

// Usar async/await
const handleSubmit = async (data: FormData) => {
  try {
    const result = await supabase.from('table').insert(data)
    return { success: true, data: result }
  } catch (error) {
    console.error('Erro:', error)
    return { success: false, error }
  }
}
```

### **React Components:**
```typescript
// Componentes funcionais com hooks
export function MyComponent() {
  const { user, isLoading } = useAuth()
  const [state, setState] = useState()
  
  if (isLoading) return <LoadingSpinner />
  
  return (
    <div className="p-4">
      <h1>Componente</h1>
    </div>
  )
}
```

### **Logs e Debug:**
```typescript
// Sempre adicionar logs informativos
console.log('🔍 [COMPONENTE] Ação:', data)
console.error('❌ [COMPONENTE] Erro:', error)
console.warn('⚠️ [COMPONENTE] Aviso:', warning)
```

## 🚨 **PROBLEMAS CRÍTICOS CONHECIDOS:**

### **1. Autenticação:**
- Middleware mostrando "Sessão: false"
- Menu admin não aparecendo para professores
- Perfil não persistente entre navegações

### **2. Banco de Dados:**
- Tabelas com `user_uuid` como UUID mas usando email
- RLS policies não configuradas
- Relacionamentos quebrados entre tabelas

### **3. Performance:**
- Carregamento lento de páginas
- Queries não otimizadas
- Bundle size grande

## 📊 **MÉTRICAS IMPORTANTES:**

### **Logs Esperados:**
```typescript
// Autenticação
[AUTH] Sessão encontrada: professor@teste.com
[AUTH] Usuário carregado: {email: 'professor@teste.com', role: 'teacher'}

// Sidebar
[SIDEBAR] User: {email: 'professor@teste.com', role: 'teacher'}
[SIDEBAR] Mostrando menu de professor/admin

// Middleware
[MIDDLEWARE] Rota: /dashboard Sessão: true
[MIDDLEWARE] Acesso permitido
```

### **Resultados Esperados:**
- ✅ Menu admin aparecendo (Membros, Turmas)
- ✅ Perfil mostrando "Professor"
- ✅ Sessão persistente entre navegações
- ✅ Logs confirmando autenticação

## 🧪 **SCRIPTS DE TESTE:**

### **Testar Perfil Persistente:**
```bash
node scripts/262_test_persistent_profile.js
```

### **Verificar Banco de Dados:**
```bash
node scripts/verify_database.js
```

### **Testar Autenticação:**
```bash
node scripts/test_auth.js
```

## 📞 **COMUNICAÇÃO COM O AGENTE:**

### **Ao Reportar um Bug:**
1. **Descreva** o problema específico
2. **Forneça** logs de erro
3. **Mencione** o contexto (página, ação)
4. **Especifique** o comportamento esperado

### **Ao Solicitar Melhorias:**
1. **Explique** o objetivo
2. **Mencione** a escala (700 usuários)
3. **Considere** a responsividade
4. **Mantenha** consistência do design

## 🎯 **OBJETIVO FINAL:**

O Agente de IA deve **garantir que a plataforma Everest Preparatórios funcione perfeitamente para os 700 alunos**, resolvendo bugs rapidamente, mantendo a qualidade do código e documentando todas as soluções para referência futura.

---

**🤖 DOCUMENTAÇÃO COMPLETA PARA AGENTE DE IA DO EVEREST PREPARATÓRIOS** 