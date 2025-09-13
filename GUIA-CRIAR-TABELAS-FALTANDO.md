# 🔧 Guia: Criar Tabelas Faltando

## ❌ **Problema Identificado**

O SQL anterior não foi executado completamente. Apenas a tabela `access_plans` foi criada.

### 📊 **Status Atual das Tabelas**

✅ **Tabelas que existem:**
- `access_plans` - OK
- `user_profiles` - OK  
- `classes` - OK
- `subjects` - OK

❌ **Tabelas que faltam:**
- `student_subscriptions` - NÃO EXISTE
- `temporary_passwords` - NÃO EXISTE

## 🛠️ **Solução**

Execute o SQL para criar apenas as tabelas que faltam:

### 🚀 **Como Executar**

1. **Abra o Supabase Dashboard**
2. **Vá para SQL Editor**
3. **Copie o conteúdo do arquivo `create-missing-tables.sql`**
4. **Cole no SQL Editor**
5. **Execute o SQL**

### 📝 **Arquivo a Executar**

Execute o arquivo: **`create-missing-tables.sql`**

Este arquivo contém:
- ✅ Criação da tabela `student_subscriptions`
- ✅ Criação da tabela `temporary_passwords`
- ✅ Adição de colunas em `user_profiles`
- ✅ Criação de índices para performance
- ✅ Configuração de RLS (Row Level Security)
- ✅ Criação de políticas RLS básicas

### 🔧 **Após Executar o SQL**

Depois de executar o SQL no Supabase, execute novamente:

```bash
node create-test-data-simple.js
```

### 📊 **O que o Script Vai Fazer**

Após criar as tabelas, o script vai:
1. ✅ Criar usuários de teste (admin, teacher, students)
2. ✅ Criar planos de acesso
3. ✅ Criar assinaturas de estudantes
4. ✅ Configurar permissões de páginas
5. ✅ Permitir testar a página de membros

## 🎯 **Resultado Esperado**

Após executar o SQL:

✅ **Tabela `student_subscriptions`** criada  
✅ **Tabela `temporary_passwords`** criada  
✅ **Colunas adicionadas** em `user_profiles`  
✅ **Índices criados** para performance  
✅ **RLS configurado** para segurança  
✅ **Sistema pronto** para dados de teste  

**Execute o SQL `create-missing-tables.sql` no Supabase Dashboard!** 🎯
