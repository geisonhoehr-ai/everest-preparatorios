# 🚨 SOLUÇÃO RÁPIDA - Erro de RLS no Storage

## ❌ **Problema:**
```
StorageApiError: new row violates row-level security policy
```

## ✅ **Solução Imediata:**

### **Opção 1: Script SQL (Recomendado)**
1. **Acesse** o SQL Editor do Supabase
2. **Execute** o script: `scripts/219_final_rls_fix_complete.sql`
3. **Verifique** se 4 políticas foram criadas
4. **Teste** o upload novamente

### **Opção 2: Configuração Manual**
1. **Vá para** Supabase > Storage > Buckets
2. **Clique** no bucket "redacoes"
3. **Vá para** "Policies"
4. **Crie 4 políticas:**

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

## 🧪 **Teste Após Configuração:**

1. **Acesse**: `http://localhost:3003/redacao`
2. **Faça login** com usuário autenticado
3. **Tente fazer upload** de uma imagem ou PDF
4. **Verifique** se não há mais erros

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

### **Opção 3: Bucket Público Temporário**
1. Configure o bucket como **público** temporariamente
2. Teste o upload
3. Depois configure como privado novamente

### **Opção 4: Política Mais Permissiva**
```sql
-- Execute no SQL Editor
CREATE POLICY "Allow all authenticated users" 
ON storage.objects 
FOR ALL 
TO authenticated 
USING (bucket_id = 'redacoes')
WITH CHECK (bucket_id = 'redacoes');
```

## 🎯 **Resultado Esperado:**

Após a configuração correta:
- ✅ **Upload funcionando** sem erros
- ✅ **Arquivos salvos** no storage
- ✅ **Metadados registrados** no banco
- ✅ **Interface responsiva** e intuitiva

**Execute o script SQL e teste novamente!** 🚀 