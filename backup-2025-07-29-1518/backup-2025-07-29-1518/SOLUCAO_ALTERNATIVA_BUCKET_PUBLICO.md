# 🚨 SOLUÇÃO ALTERNATIVA - Bucket Público Temporário

## ❌ **Problema Persistente:**
```
StorageApiError: new row violates row-level security policy
```

## ✅ **Solução Alternativa (Mais Simples):**

### **Passo 1: Configurar Bucket como Público Temporariamente**

1. **Acesse** o Supabase Dashboard
2. **Vá para** Storage > Buckets
3. **Clique** no bucket "redacoes"
4. **Configure** como "Public" (temporariamente)
5. **Salve** as configurações

### **Passo 2: Testar Upload**

1. **Acesse**: `http://localhost:3003/redacao`
2. **Faça login** com usuário autenticado
3. **Tente fazer upload** de uma imagem ou PDF
4. **Verifique** se funciona

### **Passo 3: Reconfigurar como Privado (Após Funcionar)**

1. **Volte** para Storage > Buckets
2. **Configure** como "Private" novamente
3. **Adicione** políticas RLS manualmente:

#### **Políticas Manuais:**
```
INSERT: bucket_id = 'redacoes'
SELECT: bucket_id = 'redacoes'
UPDATE: bucket_id = 'redacoes'
DELETE: bucket_id = 'redacoes'
```

## 🧪 **Teste Rápido:**

### **Opção 1: Bucket Público (Mais Rápido)**
```sql
-- Execute no SQL Editor
UPDATE storage.buckets 
SET public = true 
WHERE name = 'redacoes';
```

### **Opção 2: Política Mais Permissiva**
```sql
-- Execute no SQL Editor
CREATE POLICY "Allow all users" 
ON storage.objects 
FOR ALL 
TO public 
USING (bucket_id = 'redacoes')
WITH CHECK (bucket_id = 'redacoes');
```

## 🔍 **Verificação:**

### **Se Funcionar com Bucket Público:**
- ✅ **Upload funcionando**
- ✅ **Arquivos salvos**
- ✅ **Metadados registrados**

### **Próximos Passos:**
1. **Reconfigurar** como privado
2. **Adicionar** políticas RLS corretas
3. **Testar** novamente

## 🚨 **Se Nada Funcionar:**

### **Última Opção: Bucket Público Permanente**
```sql
-- Execute no SQL Editor
UPDATE storage.buckets 
SET public = true 
WHERE name = 'redacoes';

-- Remover todas as políticas
DROP POLICY IF EXISTS "Allow all authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Allow all users" ON storage.objects;
```

## 🎯 **Resultado Esperado:**

Após configurar como público:
- ✅ **Upload funcionando** imediatamente
- ✅ **Sem erros de RLS**
- ✅ **Sistema operacional**

**Configure como público temporariamente e teste!** 🚀 