# 🚀 GUIA FINAL CORRIGIDO - Everest = Poker 360

## ❌ **Problema Identificado:**
Existe um trigger no Supabase que tenta inserir na tabela `user_roles` que não existe mais.

## ✅ **Solução Final:**

### **PASSO 1: Remover Triggers Conflitantes**
1. **Execute** `REMOVER-TRIGGERS-CONFLITANTES.sql` no SQL Editor do Supabase
2. **Aguarde** a confirmação de sucesso

### **PASSO 2: Criar Usuários Direto**
1. **Execute** `CRIAR-USUARIOS-DIRETO.sql` no SQL Editor do Supabase
2. **Aguarde** a confirmação de sucesso

### **PASSO 3: Testar o Sistema**
1. **Execute** `npm run dev`
2. **Acesse** `http://localhost:3000/login`
3. **Teste os logins:**
   - `aluno@teste.com` / `123456`
   - `admin@teste.com` / `123456`
   - `professor@teste.com` / `123456`

---

## 📋 **Scripts Finais:**

1. **`REMOVER-TRIGGERS-CONFLITANTES.sql`** - Remove triggers conflitantes
2. **`CRIAR-USUARIOS-DIRETO.sql`** - Cria usuários sem triggers
3. **`test-login.js`** - Testa sistema

---

## 🎯 **O Que Será Criado:**

### **Usuários de Teste:**
- `aluno@teste.com` / `123456` (role: student)
- `admin@teste.com` / `123456` (role: admin)  
- `professor@teste.com` / `123456` (role: teacher)

### **Estrutura Final:**
- ✅ Tabela `user_profiles` (igual ao Poker 360)
- ✅ Políticas RLS corretas
- ✅ Usuários confirmados
- ✅ Perfis criados automaticamente

---

## 🚀 **Execute os Scripts:**

1. **Primeiro:** `REMOVER-TRIGGERS-CONFLITANTES.sql`
2. **Segundo:** `CRIAR-USUARIOS-DIRETO.sql`
3. **Terceiro:** Teste o sistema

**Agora deve funcionar perfeitamente!** 🎉
