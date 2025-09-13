# 👥 Guia Atualizado: Página de Membros

## 🎯 **Status Atual**

✅ **Tabela `user_profiles` existe** mas está vazia  
✅ **Página de membros implementada** completamente  
❌ **Tabelas auxiliares** ainda precisam ser criadas  
❌ **Dados de teste** precisam ser criados  

## 🛠️ **Solução Simplificada**

### **Passo 1: Criar Tabelas Auxiliares**

Execute este SQL no **Supabase Dashboard > SQL Editor**:

```sql
-- 1. Criar tabela access_plans
CREATE TABLE IF NOT EXISTS access_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_months INTEGER NOT NULL,
  price DECIMAL(10,2),
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela student_subscriptions
CREATE TABLE IF NOT EXISTS student_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_plan_id UUID REFERENCES access_plans(id),
  class_id UUID REFERENCES classes(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela temporary_passwords
CREATE TABLE IF NOT EXISTS temporary_passwords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  temporary_password VARCHAR(255) NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE
);

-- 4. Habilitar RLS
ALTER TABLE access_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE temporary_passwords ENABLE ROW LEVEL SECURITY;

-- 5. Políticas básicas
CREATE POLICY "Teachers and admins can manage access_plans" ON access_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers and admins can manage subscriptions" ON student_subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers and admins can manage passwords" ON temporary_passwords
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );
```

### **Passo 2: Criar Dados de Teste**

Execute o script que criei:
```bash
node create-essential-data-for-membros.js
```

Este script irá criar:
- ✅ **3 turmas** de exemplo
- ✅ **2 planos de acesso** (Básico e Completo)
- ✅ **5 usuários** de teste (1 admin, 1 teacher, 3 students)
- ✅ **Permissões** automáticas baseadas nos planos
- ✅ **Subscriptions** para os alunos

### **Passo 3: Testar a Página**

1. **Faça login** como admin ou teacher:
   - **admin@everest.com** (senha: admin123)
   - **professor@everest.com** (senha: prof123)

2. **Acesse `/membros`**

3. **Verifique** se os usuários aparecem na lista

4. **Teste** as funcionalidades:
   - ✅ **Criar novo membro**
   - ✅ **Editar membro existente**
   - ✅ **Alterar permissões**
   - ✅ **Gerar senha provisória**
   - ✅ **Deletar membro**

## 📊 **Dados de Teste Criados**

### **Usuários de Teste**
| Email | Senha | Role | Turma | Plano |
|-------|-------|------|-------|-------|
| admin@everest.com | admin123 | Admin | - | - |
| professor@everest.com | prof123 | Teacher | - | - |
| aluno1@everest.com | aluno123 | Student | Turma A | Completo |
| aluno2@everest.com | aluno123 | Student | Turma B | Básico |
| aluno3@everest.com | aluno123 | Student | Turma C | Completo |

### **Turmas Criadas**
- **Turma A - Manhã** (30 alunos)
- **Turma B - Tarde** (25 alunos)
- **Turma C - Noite** (20 alunos)

### **Planos de Acesso**
- **Plano Básico** (6 meses, R$ 99,90) - Quiz + Flashcards
- **Plano Completo** (12 meses, R$ 199,90) - Todas as páginas

## 🎨 **Funcionalidades da Página de Membros**

### **Interface Principal**
- **Lista de membros** com informações completas
- **Filtros** por turma e busca por nome/email
- **Status** dos membros (ativo, expirado, trocar senha)
- **Ações** para cada membro (editar, senha, deletar)

### **Modal de Criação**
- **Dados pessoais** (nome, email)
- **Turma** e **plano de acesso**
- **Datas** de início e expiração
- **Permissões** por página (Quiz, Flashcards, Evercast, Calendário)

### **Modal de Edição**
- **Mesmas opções** do modal de criação
- **Permissões atuais** carregadas automaticamente
- **Atualização** em tempo real

### **Sistema de Permissões**
- **Controle granular** por página
- **Baseado em planos** de acesso
- **Atualização** automática das permissões

## 🔧 **Como Funciona o Sistema**

### **Fluxo de Dados**
1. **Página de membros** busca dados via `getAllMembers()`
2. **getAllMembers()** faz JOIN entre:
   - `user_profiles` (dados básicos)
   - `classes` (turmas)
   - `student_subscriptions` (assinaturas)
   - `access_plans` (planos)
3. **Interface** exibe os dados em tabela organizada
4. **Ações** (CRUD) atualizam as tabelas correspondentes

### **Sistema de Permissões**
1. **Aluno tenta acessar** página restrita
2. **PagePermissionGuard** verifica:
   - É admin/teacher? → ✅ Acesso liberado
   - É student? → Verifica `page_permissions`
3. **Se tem permissão** → ✅ Acesso liberado
4. **Se não tem permissão** → ❌ Acesso negado

## 📝 **Arquivos Relacionados**

- **`app/(authenticated)/membros/page.tsx`** - Interface principal
- **`app/server-actions.ts`** - Funções de backend
- **`create-essential-data-for-membros.js`** - Script de criação de dados
- **`GUIA-PAGINA-MEMBROS-ATUALIZADO.md`** - Este guia

## 🎯 **Resultado Final**

Após executar os passos acima:

1. ✅ **Tabelas auxiliares** criadas
2. ✅ **Dados de teste** criados
3. ✅ **Página de membros** funcionando completamente
4. ✅ **CRUD completo** operacional
5. ✅ **Sistema de permissões** funcionando
6. ✅ **Interface** mostrando todos os usuários

## 🚀 **Próximos Passos**

1. **Execute o SQL** para criar as tabelas auxiliares
2. **Execute o script** para criar dados de teste
3. **Teste a página** de membros
4. **Verifique** se tudo está funcionando
5. **Use a interface** para gerenciar usuários reais

A página de membros está **100% implementada** e pronta para uso! 🎉
