# 🚀 GUIA CORRIGIDO - Transformação Everest = Poker 360

## ❌ **Problema Identificado:**
O erro `ON CONFLICT` não funciona na tabela `auth.users` do Supabase.

## ✅ **Solução Corrigida:**

### **PASSO 1: Executar Script de Estrutura**
1. **Abra** o Supabase Dashboard → SQL Editor
2. **Execute** o script `TRANSFORMAR-EVEREST-SIMPLES.sql`
3. **Aguarde** a confirmação de sucesso

### **PASSO 2: Executar Script de Usuários**
1. **Execute** o script `CRIAR-USUARIOS-FINAIS.sql`
2. **Aguarde** a confirmação de sucesso

### **PASSO 3: Testar o Sistema**
1. **Execute** `npm run dev`
2. **Acesse** `http://localhost:3000/login`
3. **Teste os logins:**
   - `aluno@teste.com` / `123456`
   - `admin@teste.com` / `123456`
   - `professor@teste.com` / `123456`

---

## 📋 **Scripts Corrigidos:**

1. **`TRANSFORMAR-EVEREST-SIMPLES.sql`** - Cria estrutura (sem ON CONFLICT)
2. **`CRIAR-USUARIOS-FINAIS.sql`** - Cria usuários (sem ON CONFLICT)
3. **`test-login.js`** - Testa sistema

---

## 🎯 **O Que Será Criado:**

### **Estrutura (Igual ao Poker 360):**
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student')),
    display_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
```

### **Usuários de Teste:**
- **aluno@teste.com** / 123456 (role: student)
- **admin@teste.com** / 123456 (role: admin)
- **professor@teste.com** / 123456 (role: teacher)

---

## 🚀 **Execute os Scripts:**

1. **Primeiro:** `TRANSFORMAR-EVEREST-SIMPLES.sql`
2. **Segundo:** `CRIAR-USUARIOS-FINAIS.sql`
3. **Terceiro:** Teste o sistema

**Agora deve funcionar sem erros!** 🎉
