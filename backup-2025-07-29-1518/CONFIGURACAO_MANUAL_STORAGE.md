# 🔧 Configuração Manual das Políticas RLS no Supabase

## 🚨 **Problema Atual:**
```
StorageApiError: new row violates row-level security policy
```

## 📋 **Solução Manual (Recomendada):**

### **1. Acesse o Painel do Supabase**
- Vá para [supabase.com](https://supabase.com)
- Faça login na sua conta
- Selecione seu projeto

### **2. Configure o Bucket 'redacoes'**
1. **Vá para Storage > Buckets**
2. **Clique no bucket 'redacoes'**
3. **Configure:**
   - ✅ **Public**: `false` (privado)
   - ✅ **File size limit**: `50MB`
   - ✅ **Allowed MIME types**: `image/jpeg, image/jpg, image/png, image/webp, application/pdf`

### **3. Configure as Políticas RLS**
1. **Vá para Storage > Policies**
2. **Selecione o bucket 'redacoes'**
3. **Clique em "New Policy"**
4. **Configure as seguintes políticas:**

#### **Política 1: INSERT (Upload)**
- **Policy Name**: `Allow upload to redacoes`
- **Target roles**: `authenticated`
- **Using expression**: `bucket_id = 'redacoes'`

#### **Política 2: SELECT (Visualização)**
- **Policy Name**: `Allow view redacoes files`
- **Target roles**: `authenticated`
- **Using expression**: `bucket_id = 'redacoes'`

#### **Política 3: UPDATE (Atualização)**
- **Policy Name**: `Allow update redacoes files`
- **Target roles**: `authenticated`
- **Using expression**: `bucket_id = 'redacoes'`

#### **Política 4: DELETE (Exclusão)**
- **Policy Name**: `Allow delete redacoes files`
- **Target roles**: `authenticated`
- **Using expression**: `bucket_id = 'redacoes'`

### **4. Verificação**
Após configurar, você deve ver:
- ✅ **4 políticas ativas** para o bucket 'redacoes'
- ✅ **Bucket configurado** como privado
- ✅ **RLS habilitado** automaticamente

## 🛠️ **Solução Alternativa (SQL):**

Se preferir usar SQL, execute este script:

```sql
-- Execute no SQL Editor do Supabase
scripts/217_fix_rls_error_final.sql
```

## 🧪 **Teste Após Configuração:**

1. **Acesse**: `http://localhost:3003/redacao`
2. **Faça login** com um usuário autenticado
3. **Tente fazer upload** de uma imagem ou PDF
4. **Verifique** se não há mais erros de RLS

## 🔍 **Verificação de Sucesso:**

### **No Console do Navegador (F12):**
- ✅ **Sem erros vermelhos**
- ✅ **Mensagens de sucesso** no upload
- ✅ **Arquivos aparecem** no preview

### **No Supabase Storage:**
- ✅ **Arquivos salvos** no bucket 'redacoes'
- ✅ **Metadados corretos** (nome, tamanho, tipo)

### **No Banco de Dados:**
- ✅ **Redação criada** na tabela 'redacoes'
- ✅ **Imagens registradas** na tabela 'redacao_imagens'

## 🚨 **Se o Problema Persistir:**

### **Opção 1: Bucket Público Temporário**
1. Configure o bucket como **público** temporariamente
2. Teste o upload
3. Depois configure como privado novamente

### **Opção 2: Políticas Mais Permissivas**
```sql
-- Política mais permissiva (apenas para teste)
CREATE POLICY "Allow all authenticated users" 
ON storage.objects 
FOR ALL 
TO authenticated 
USING (bucket_id = 'redacoes')
WITH CHECK (bucket_id = 'redacoes');
```

### **Opção 3: Desabilitar RLS Temporariamente**
```sql
-- Apenas para teste (NÃO recomendado para produção)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

## 🎯 **Resultado Esperado:**

Após a configuração correta:
- ✅ **Upload funcionando** sem erros
- ✅ **Arquivos salvos** no storage
- ✅ **Metadados registrados** no banco
- ✅ **Interface responsiva** e intuitiva

**Configure manualmente no painel do Supabase e teste novamente!** 🚀 