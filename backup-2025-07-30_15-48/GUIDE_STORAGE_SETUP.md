# 🚀 Guia Completo: Configuração do Storage para Redações

## 📋 Passos para Configurar o Storage no Supabase

### 1. Criar o Bucket 'redacoes'

1. **Acesse o painel do Supabase**
2. **Vá para Storage > Buckets**
3. **Clique em "New bucket"**
4. **Configure o bucket:**
   - **Name**: `redacoes`
   - **Public**: `false` (privado)
   - **File size limit**: `50MB`
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png, image/webp, application/pdf`

### 2. Configurar Políticas RLS

1. **Vá para Storage > Policies**
2. **Selecione o bucket 'redacoes'**
3. **Clique em "New Policy"**
4. **Configure as seguintes políticas:**

#### Política 1: INSERT (Upload)
- **Policy Name**: `Users can upload files to redacoes bucket`
- **Target roles**: `authenticated`
- **Using expression**: `bucket_id = 'redacoes' AND auth.uid() IS NOT NULL`

#### Política 2: SELECT (Visualização)
- **Policy Name**: `Users can view files in redacoes bucket`
- **Target roles**: `authenticated`
- **Using expression**: `bucket_id = 'redacoes' AND auth.uid() IS NOT NULL`

#### Política 3: UPDATE (Atualização)
- **Policy Name**: `Users can update files in redacoes bucket`
- **Target roles**: `authenticated`
- **Using expression**: `bucket_id = 'redacoes' AND auth.uid() IS NOT NULL`

#### Política 4: DELETE (Exclusão)
- **Policy Name**: `Users can delete files in redacoes bucket`
- **Target roles**: `authenticated`
- **Using expression**: `bucket_id = 'redacoes' AND auth.uid() IS NOT NULL`

### 3. Executar Script SQL

Execute o script `scripts/213_storage_workaround.sql` no SQL Editor para:
- ✅ Criar a tabela `redacao_imagens`
- ✅ Configurar políticas RLS para a tabela
- ✅ Verificar a estrutura do banco

### 4. Testar o Upload

1. **Acesse**: `http://localhost:3001/redacao`
2. **Faça login** com um usuário autenticado
3. **Tente fazer upload** de uma imagem ou PDF
4. **Verifique** se o arquivo é salvo corretamente

## 🔧 Solução de Problemas

### Erro: "must be owner of table objects"
- **Causa**: Falta de privilégios para modificar políticas RLS
- **Solução**: Configure as políticas manualmente no painel do Supabase

### Erro: "row-level security policy"
- **Causa**: Políticas RLS não configuradas corretamente
- **Solução**: Verifique se todas as 4 políticas foram criadas

### Erro: "bucket does not exist"
- **Causa**: Bucket 'redacoes' não foi criado
- **Solução**: Crie o bucket manualmente no painel do Supabase

## ✅ Verificação Final

Após configurar tudo, execute este comando no SQL Editor:

```sql
-- Verificar se tudo está configurado corretamente
SELECT 
    'Status do sistema de redações:' as info;

-- Verificar bucket
SELECT 
    'Bucket:' as tipo,
    name as nome,
    public,
    file_size_limit
FROM storage.buckets 
WHERE name = 'redacoes';

-- Verificar políticas
SELECT 
    'Políticas:' as tipo,
    policyname as nome,
    cmd as operacao
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%redacoes%'
ORDER BY policyname;

-- Verificar tabela
SELECT 
    'Tabela:' as tipo,
    table_name as nome
FROM information_schema.tables 
WHERE table_name = 'redacao_imagens';
```

## 🎯 Resultado Esperado

Após seguir todos os passos:
- ✅ Upload de imagens e PDFs funcionando
- ✅ Arquivos salvos no bucket 'redacoes'
- ✅ Metadados salvos na tabela 'redacao_imagens'
- ✅ Políticas de segurança ativas
- ✅ Apenas usuários autenticados podem acessar 