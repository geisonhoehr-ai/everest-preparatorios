# 🚨 Guia: Corrigir Flashcards - Problema de Permissões

## ❌ **Problema Identificado**

Os botões dos flashcards não funcionam porque:

1. **Não há usuários na tabela `user_profiles`**
2. **Não há permissões na tabela `page_permissions`**
3. **O `PagePermissionGuard` está bloqueando o acesso**

## 🛠️ **Solução**

### **Passo 1: Executar SQL no Supabase Dashboard**

1. **Abra o Supabase Dashboard**
2. **Vá para SQL Editor**
3. **Copie TODO o conteúdo do arquivo `create-test-user-flashcards.sql`**
4. **Cole no SQL Editor**
5. **Execute**

### **Passo 2: Verificar se funcionou**

Após executar o SQL, você deve ver:
- ✅ **Usuário criado** na tabela `user_profiles`
- ✅ **Permissão criada** na tabela `page_permissions`

### **Passo 3: Testar os flashcards**

1. **Acesse a página de flashcards**
2. **Abra o Console do navegador** (F12 → Console)
3. **Tente clicar nos botões** dos flashcards
4. **Verifique os logs** no console

## 📋 **Conteúdo do SQL**

```sql
-- Criar usuário de teste para flashcards
-- Desabilitar RLS temporariamente
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE page_permissions DISABLE ROW LEVEL SECURITY;

-- Criar perfil de usuário de teste
INSERT INTO user_profiles (id, user_id, role, display_name, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'student', 'Aluno Teste', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Criar permissão para flashcards
INSERT INTO page_permissions (user_id, page_name, has_access, expires_at, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', 'flashcards', true, NULL, NOW(), NOW())
ON CONFLICT (user_id, page_name) DO NOTHING;

-- Reabilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_permissions ENABLE ROW LEVEL SECURITY;

-- Verificar resultado
SELECT 'Usuário criado:' as info;
SELECT * FROM user_profiles WHERE id = '00000000-0000-0000-0000-000000000001';

SELECT 'Permissão criada:' as info;
SELECT * FROM page_permissions WHERE user_id = '00000000-0000-0000-0000-000000000001';
```

## 🎯 **O que este SQL faz**

- ✅ **Cria um usuário de teste** na tabela `user_profiles`
- ✅ **Cria permissão para flashcards** na tabela `page_permissions`
- ✅ **Desabilita/reabilita RLS** temporariamente
- ✅ **Verifica se funcionou**

## 🚀 **Resultado Esperado**

Após executar o SQL, os flashcards devem funcionar:

1. **Botões respondem** aos cliques
2. **Logs aparecem** no console
3. **Seletor de quantidade** funciona
4. **Estudo inicia** corretamente

## ⚠️ **Importante**

- **Execute o arquivo `.sql`**, não o arquivo `.md`
- **Copie TODO o conteúdo** do SQL
- **Execute no Supabase Dashboard**

**Execute o arquivo `create-test-user-flashcards.sql` no Supabase Dashboard!** 🎯
