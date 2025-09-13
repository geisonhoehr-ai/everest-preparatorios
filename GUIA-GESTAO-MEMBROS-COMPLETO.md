# 👥 Sistema de Gestão de Membros - Guia Completo

## 🎯 **Visão Geral**

O sistema de gestão de membros permite que professores e administradores criem, gerenciem e controlem o acesso de alunos ao sistema. Os alunos **NÃO podem se cadastrar sozinhos** - apenas professores e administradores podem criar perfis de alunos.

## 🗄️ **Estrutura do Banco de Dados**

### **Tabelas Criadas:**

1. **`classes`** - Turmas/classes para organizar alunos
2. **`access_plans`** - Planos de acesso com diferentes durações e funcionalidades
3. **`page_permissions`** - Permissões específicas de acesso por página
4. **`student_subscriptions`** - Assinaturas ativas dos alunos
5. **`temporary_passwords`** - Senhas provisórias para novos usuários

### **Campos Adicionados à `user_profiles`:**
- `class_id` - ID da turma do aluno
- `subscription_id` - ID da assinatura ativa
- `access_expires_at` - Data de expiração do acesso
- `must_change_password` - Se deve trocar senha no próximo login
- `created_by` - Quem criou o perfil

## 🚀 **Como Executar o Sistema**

### **1. Executar Script SQL**
```sql
-- Execute o arquivo: create-members-management-tables.sql
-- Este script cria todas as tabelas e dados iniciais
```

### **2. Acessar a Página de Gestão**
- **URL**: `/membros`
- **Acesso**: Apenas professores e administradores
- **Menu**: Aparece no sidebar para professores/admins

## 📋 **Funcionalidades Implementadas**

### **✅ Gestão Completa de Membros**
- **Criar novos alunos** com e-mail e senha provisória
- **Editar informações** de alunos existentes
- **Deletar membros** (remove do sistema completamente)
- **Buscar e filtrar** membros por nome, e-mail ou turma

### **✅ Sistema de Turmas**
- **Criar turmas** (EAOF 2026 - Turma A, B, C)
- **Atribuir alunos** a turmas específicas
- **Filtrar membros** por turma
- **Calendário específico** por turma (futuro)

### **✅ Planos de Acesso Flexíveis**
- **Básico - Quiz**: Apenas página de Quiz (6 meses)
- **Básico - Flashcards**: Apenas página de Flashcards (6 meses)
- **Básico - Evercast**: Apenas página de Evercast (6 meses)
- **Completo 6 meses**: Todas as páginas (6 meses)
- **Completo 1 ano**: Todas as páginas (1 ano)
- **Premium 2 anos**: Todas as páginas (2 anos)

### **✅ Controle de Permissões por Página**
- **Quiz**: Acesso à página de quiz
- **Flashcards**: Acesso à página de flashcards
- **Evercast**: Acesso à página de evercast
- **Calendário**: Acesso à página de calendário
- **Permissões granulares** por aluno

### **✅ Sistema de Senhas Provisórias**
- **Geração automática** de senhas seguras
- **Expiração em 7 dias**
- **Obrigação de troca** no primeiro login
- **Histórico de senhas** provisórias

### **✅ Controle de Acesso Temporal**
- **Data de início** e **data de expiração**
- **Verificação automática** de acesso expirado
- **Renovação de assinaturas**

## 🎨 **Interface da Página de Gestão**

### **Header**
- **Título**: "Gestão de Membros"
- **Botão**: "Novo Membro" (abre modal de criação)

### **Filtros**
- **Busca**: Por nome ou e-mail
- **Filtro por turma**: Dropdown com todas as turmas

### **Tabela de Membros**
- **Nome**: Nome completo do aluno
- **E-mail**: E-mail de login
- **Turma**: Turma atribuída
- **Plano**: Plano de acesso ativo
- **Expira em**: Data de expiração do acesso
- **Status**: Ativo/Expirado + Trocar Senha
- **Ações**: Editar, Gerar Senha, Deletar

### **Modal de Criação/Edição**
- **Dados pessoais**: Nome e e-mail
- **Turma**: Seleção de turma
- **Plano de acesso**: Seleção de plano
- **Datas**: Início e expiração
- **Permissões**: Checkboxes para cada página

## 🔐 **Sistema de Permissões**

### **Como Funciona:**
1. **Professores/Admins**: Acesso total a todas as páginas
2. **Alunos**: Acesso baseado em permissões específicas
3. **Verificação automática**: A cada acesso à página
4. **Expiração**: Acesso negado após data de expiração

### **Componente PagePermissionGuard:**
- **Verifica permissões** antes de renderizar páginas
- **Mostra tela de acesso negado** se não tiver permissão
- **Carregamento** durante verificação
- **Integrado** em Quiz, Flashcards, Evercast e Calendário

## 📊 **Planos de Acesso Disponíveis**

| Plano | Duração | Preço | Quiz | Flashcards | Evercast | Calendário |
|-------|---------|-------|------|------------|----------|------------|
| Básico - Quiz | 6 meses | R$ 99,90 | ✅ | ❌ | ❌ | ❌ |
| Básico - Flashcards | 6 meses | R$ 99,90 | ❌ | ✅ | ❌ | ❌ |
| Básico - Evercast | 6 meses | R$ 149,90 | ❌ | ❌ | ✅ | ❌ |
| Completo 6 meses | 6 meses | R$ 299,90 | ✅ | ✅ | ✅ | ✅ |
| Completo 1 ano | 12 meses | R$ 499,90 | ✅ | ✅ | ✅ | ✅ |
| Premium 2 anos | 24 meses | R$ 799,90 | ✅ | ✅ | ✅ | ✅ |

## 🎯 **Casos de Uso Práticos**

### **Cenário 1: Venda de Acesso Apenas ao Quiz**
1. Criar novo membro
2. Selecionar plano "Básico - Quiz"
3. Definir data de expiração (6 meses)
4. Aluno terá acesso apenas à página de Quiz

### **Cenário 2: Acesso Completo por 1 Ano**
1. Criar novo membro
2. Selecionar plano "Completo 1 ano"
3. Definir data de expiração (1 ano)
4. Aluno terá acesso a todas as páginas

### **Cenário 3: Acesso Personalizado**
1. Criar novo membro
2. Selecionar plano base
3. Ajustar permissões manualmente
4. Definir datas personalizadas

### **Cenário 4: Renovação de Acesso**
1. Editar membro existente
2. Alterar data de expiração
3. Atualizar permissões se necessário
4. Salvar alterações

## 🔧 **Funcionalidades Técnicas**

### **Server Actions Implementadas:**
- `getAllMembers()` - Lista todos os membros
- `getAllClasses()` - Lista todas as turmas
- `getAllAccessPlans()` - Lista todos os planos
- `createMember()` - Cria novo membro
- `updateMember()` - Atualiza membro existente
- `deleteMember()` - Remove membro do sistema
- `createTemporaryPassword()` - Gera senha provisória
- `getMemberPagePermissions()` - Obtém permissões do membro

### **API Routes:**
- `/api/check-page-access` - Verifica permissão de acesso

### **Componentes:**
- `PagePermissionGuard` - Guard de permissões
- Página `/membros` - Interface de gestão

## 🚨 **Segurança e Validações**

### **Controle de Acesso:**
- **Apenas professores/admins** podem gerenciar membros
- **Verificação de permissões** em todas as operações
- **RLS (Row Level Security)** no banco de dados
- **Validação de dados** em todas as operações

### **Senhas Provisórias:**
- **Geração segura** com 8 caracteres
- **Expiração automática** em 7 dias
- **Obrigação de troca** no primeiro login
- **Histórico de senhas** para auditoria

## 📱 **Responsividade**

- ✅ **Mobile**: Interface adaptada para celulares
- ✅ **Tablet**: Layout otimizado para tablets
- ✅ **Desktop**: Experiência completa em computadores
- ✅ **Touch**: Controles otimizados para toque

## 🎉 **Benefícios do Sistema**

1. **Controle Total**: Professores controlam quem tem acesso
2. **Flexibilidade**: Planos personalizáveis por aluno
3. **Segurança**: Alunos não podem se cadastrar sozinhos
4. **Organização**: Turmas para melhor gestão
5. **Monetização**: Diferentes planos de acesso
6. **Auditoria**: Histórico completo de ações
7. **Escalabilidade**: Sistema preparado para crescimento

## ⚠️ **Observações Importantes**

- **Alunos NÃO podem se cadastrar** - apenas professores/admins
- **Senhas provisórias** expiram em 7 dias
- **Acesso expira** automaticamente na data definida
- **Permissões são verificadas** a cada acesso à página
- **Deletar membro** remove completamente do sistema
- **Backup recomendado** antes de operações em massa

## 🚀 **Próximos Passos Sugeridos**

1. **Integração com pagamentos** para renovação automática
2. **Relatórios de uso** por aluno
3. **Notificações** de expiração de acesso
4. **Calendário específico** por turma
5. **Sistema de convites** por e-mail
6. **Dashboard de métricas** de uso

---

**Sistema implementado e pronto para uso!** 🎉

**Agora você tem controle total sobre quem acessa o sistema e quais páginas cada aluno pode ver.**
