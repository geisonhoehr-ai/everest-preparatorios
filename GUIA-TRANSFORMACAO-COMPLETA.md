# 🚀 GUIA COMPLETO: Transformar Everest = Poker 360

## 📋 **Passo a Passo para Transformação**

### **PASSO 1: Executar Script SQL no Supabase**
1. **Abra o Supabase Dashboard** → SQL Editor
2. **Cole e execute** o script `TRANSFORMAR-EVEREST-IGUAL-POKER360.sql`
3. **Aguarde** a execução completa
4. **Verifique** se apareceu a mensagem de sucesso

### **PASSO 2: Remover Bypass do Login**
1. **Abra** o arquivo `app/login/page.tsx`
2. **Substitua todo o conteúdo** pelo código do arquivo `REMOVER-BYPASS-LOGIN.tsx`
3. **Salve** o arquivo

### **PASSO 3: Verificar Funcionamento**
1. **Execute** `npm run dev`
2. **Acesse** `http://localhost:3000/login`
3. **Teste os logins:**
   - `aluno@teste.com` / `123456` (student)
   - `admin@teste.com` / `123456` (admin)
   - `professor@teste.com` / `123456` (teacher)

### **PASSO 4: Verificar Estrutura Final**
Execute no SQL Editor para confirmar:
```sql
-- Verificar usuários criados
SELECT 
    au.email,
    au.email_confirmed_at,
    up.role,
    up.display_name
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE au.email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com')
ORDER BY up.role;
```

---

## ✅ **O Que Será Transformado**

### **ANTES (Everest Atual):**
- ❌ Sistema híbrido (Supabase + bypass)
- ❌ Estrutura conflitante de tabelas
- ❌ Políticas RLS inconsistentes
- ❌ Tabelas vazias
- ❌ Login simulado

### **DEPOIS (Igual ao Poker 360):**
- ✅ Sistema puro (apenas Supabase)
- ✅ Estrutura unificada e limpa
- ✅ Políticas RLS corretas
- ✅ Usuários reais funcionando
- ✅ Login real com 3 roles

---

## 🎯 **Estrutura Final (Igual ao Poker 360)**

### **Tabela user_profiles:**
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

### **Políticas RLS:**
```sql
-- Usuários podem ler seu próprio perfil
CREATE POLICY "users_can_read_own_profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "users_can_update_own_profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Usuários autenticados podem inserir perfis
CREATE POLICY "authenticated_users_can_insert_profiles" ON user_profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### **Usuários de Teste:**
- **aluno@teste.com** / 123456 (role: student)
- **admin@teste.com** / 123456 (role: admin)
- **professor@teste.com** / 123456 (role: teacher)

---

## 🔧 **Comandos de Verificação**

### **Verificar Estrutura:**
```sql
-- Verificar tabela criada
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;
```

### **Verificar Políticas:**
```sql
-- Verificar políticas RLS
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_profiles';
```

### **Verificar Usuários:**
```sql
-- Verificar usuários e perfis
SELECT 
    au.email,
    up.role,
    up.display_name,
    up.created_at
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE au.email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com');
```

---

## 🎉 **Resultado Final**

Após a transformação, o Everest Preparatórios terá:

✅ **Arquitetura igual ao Poker 360**  
✅ **Sistema de autenticação robusto**  
✅ **Estrutura de tabelas limpa**  
✅ **Políticas RLS corretas**  
✅ **Usuários de teste funcionais**  
✅ **3 roles funcionais** (admin, teacher, student)  
✅ **Interface moderna mantida**  

## 🚀 **Pronto para Usar!**

O sistema estará funcionando igual ao Poker 360, mas com 3 roles em vez de 2. Todos os usuários de teste estarão funcionando perfeitamente!

**Execute os scripts e transforme o Everest!** 🎯
