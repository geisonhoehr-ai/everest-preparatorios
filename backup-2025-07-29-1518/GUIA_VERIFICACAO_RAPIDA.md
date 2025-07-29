# 🎯 GUIA DE VERIFICAÇÃO RÁPIDA - RLS

## ❌ **Problema Identificado:**
```
RLS está bloqueando a operação de upload porque não há uma política configurada que permita ao usuário atual inserir arquivos no bucket.
```

## ✅ **Solução Definitiva:**

### **Passo 1: Execute o Script SQL**
1. **Acesse** o SQL Editor do Supabase
2. **Execute** o script: `scripts/222_solucao_definitiva_rls.sql`
3. **Verifique** se 4 políticas foram criadas

### **Passo 2: Verificação de Autenticação**
```javascript
// Verifique se há um usuário logado
const { data: { user } } = await supabase.auth.getUser()
console.log('Usuário atual:', user)
```

### **Passo 3: Teste o Upload**
1. **Acesse**: `http://localhost:3003/redacao`
2. **Faça login** com usuário autenticado
3. **Tente fazer upload** de uma imagem ou PDF
4. **Verifique** se não há mais erros

## 🔍 **Verificação de Sucesso:**

### **✅ Checklist Completo:**

#### **1. Usuário Autenticado?**
- ✅ Verificar se há usuário logado
- ✅ Console deve mostrar: `Usuário atual: {id: "...", email: "..."}`

#### **2. Bucket Existe?**
- ✅ Bucket 'redacoes' deve existir
- ✅ Configurado como privado (`public: false`)
- ✅ Limite de 50MB configurado

#### **3. Políticas RLS Configuradas?**
- ✅ 4 políticas criadas:
  - `Allow upload for authenticated users` (INSERT)
  - `Allow view for authenticated users` (SELECT)
  - `Allow update for authenticated users` (UPDATE)
  - `Allow delete for authenticated users` (DELETE)

#### **4. Nome do Bucket Correto?**
- ✅ Código usando: `bucket_id = 'redacoes'`
- ✅ Bucket existe com nome: `redacoes`

## 🧪 **Teste Rápido:**

### **Opção 1: Script SQL (Recomendado)**
```sql
-- Execute no SQL Editor
scripts/222_solucao_definitiva_rls.sql
```

### **Opção 2: Configuração Manual**
1. **Vá para** Supabase > Storage > Buckets
2. **Clique** no bucket "redacoes"
3. **Vá para** "Policies"
4. **Crie 4 políticas:**

#### **Política 1: INSERT**
```sql
CREATE POLICY "Allow upload for authenticated users" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'redacoes');
```

#### **Política 2: SELECT**
```sql
CREATE POLICY "Allow view for authenticated users" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (bucket_id = 'redacoes');
```

#### **Política 3: UPDATE**
```sql
CREATE POLICY "Allow update for authenticated users" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'redacoes');
```

#### **Política 4: DELETE**
```sql
CREATE POLICY "Allow delete for authenticated users" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'redacoes');
```

## 🚨 **Se Ainda Não Funcionar:**

### **Última Opção: Bucket Público Temporário**
```sql
-- Execute no SQL Editor
UPDATE storage.buckets 
SET public = true 
WHERE name = 'redacoes';
```

## 🎯 **Resultado Esperado:**

Após a configuração:
- ✅ **4 políticas ativas** para bucket redacoes
- ✅ **Bucket configurado** como privado
- ✅ **Upload funcionando** sem erros
- ✅ **Arquivos salvos** no storage
- ✅ **Metadados registrados** no banco

**Execute o script SQL e teste imediatamente!** 🚀 