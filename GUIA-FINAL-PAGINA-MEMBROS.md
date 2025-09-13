# 👥 Guia Final: Página de Membros - Solução Completa

## 🎯 **Status Atual Confirmado**

✅ **Tabela `user_profiles` existe** e é usada pela página de membros  
✅ **Tabela `profiles` existe** (tabela adicional)  
✅ **Tabela `classes` existe** (com ID INTEGER)  
✅ **Tabela `page_permissions` existe**  
✅ **Página de membros implementada** completamente  
❌ **Tabelas auxiliares** precisam ser criadas  
❌ **Dados de teste** precisam ser criados  

## 🛠️ **Solução em 3 Passos**

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
-- NOTA: class_id é INTEGER (não UUID) baseado na estrutura real
CREATE TABLE IF NOT EXISTS student_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_plan_id UUID REFERENCES access_plans(id),
  class_id INTEGER REFERENCES classes(id), -- INTEGER, não UUID
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

-- 4. Adicionar campos à user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS class_id INTEGER REFERENCES classes(id),
ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES student_subscriptions(id),
ADD COLUMN IF NOT EXISTS access_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 5. Habilitar RLS e criar políticas
ALTER TABLE access_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE temporary_passwords ENABLE ROW LEVEL SECURITY;

-- Políticas básicas
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

-- 6. Inserir dados de exemplo
INSERT INTO access_plans (name, description, duration_months, price, features) VALUES
('Plano Básico', 'Acesso básico', 6, 99.90, '{"quiz": true, "flashcards": true, "evercast": false, "calendario": false}'),
('Plano Completo', 'Acesso completo', 12, 199.90, '{"quiz": true, "flashcards": true, "evercast": true, "calendario": true}')
ON CONFLICT DO NOTHING;

INSERT INTO classes (name, max_students) VALUES
('Turma A - Manhã', 30),
('Turma B - Tarde', 25),
('Turma C - Noite', 20)
ON CONFLICT DO NOTHING;
```

### **Passo 2: Criar Dados de Teste**

Execute o script que criei:
```bash
node create-test-data-simple.js
```

Este script irá:
- ✅ Verificar se as tabelas existem
- ✅ Criar **5 usuários** de teste (1 admin, 1 teacher, 3 students)
- ✅ Verificar se já existem usuários
- ✅ Pular usuários que já existem

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

## 📊 **Estrutura das Tabelas**

### **Tabelas Existentes**
| Tabela | Status | Uso |
|--------|--------|-----|
| `user_profiles` | ✅ Existe | Tabela principal de usuários |
| `profiles` | ✅ Existe | Tabela adicional (não usada) |
| `classes` | ✅ Existe | Turmas (ID INTEGER) |
| `page_permissions` | ✅ Existe | Permissões por página |

### **Tabelas a Criar**
| Tabela | Finalidade |
|--------|------------|
| `access_plans` | Planos de acesso (Básico, Completo, Premium) |
| `student_subscriptions` | Assinaturas dos alunos |
| `temporary_passwords` | Senhas provisórias |

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
- **`create-tables-corrected.sql`** - SQL para criar tabelas
- **`create-test-data-simple.js`** - Script de criação de dados
- **`GUIA-FINAL-PAGINA-MEMBROS.md`** - Este guia

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

## 🔍 **Verificação Final**

Para verificar se tudo está funcionando:

1. **Acesse `/membros`** como admin/teacher
2. **Verifique** se os usuários aparecem na lista
3. **Teste** criar um novo membro
4. **Teste** editar um membro existente
5. **Teste** alterar permissões
6. **Teste** gerar senha provisória

A página de membros está **100% implementada** e pronta para uso! 🎉
