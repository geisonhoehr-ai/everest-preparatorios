# 🧪 Guia de Teste Final - Sistema de Upload de Redações

## 🎯 **Status Atual:**
- ✅ **Servidor rodando**: `http://localhost:3003`
- ✅ **Bucket 'redacoes'**: Criado no Supabase
- ✅ **Tabela 'redacao_imagens'**: Criada no banco
- ✅ **Código atualizado**: Suporte a imagens e PDFs

## 📋 **Passos para Teste:**

### **1. Acesse a Aplicação**
```
http://localhost:3003/redacao
```

### **2. Faça Login**
- Use um usuário autenticado (aluno ou professor)
- Verifique se está logado corretamente

### **3. Teste Upload de Imagem**
1. **Clique em "Selecionar Arquivos"**
2. **Escolha uma imagem** (JPG, PNG, etc.)
3. **Verifique se aparece no preview**
4. **Preencha os campos obrigatórios:**
   - Título da redação
   - Tema selecionado
5. **Clique em "Enviar Redação"**

### **4. Teste Upload de PDF**
1. **Clique em "Selecionar Arquivos"**
2. **Escolha um arquivo PDF**
3. **Verifique se aparece o ícone PDF no preview**
4. **Preencha os campos obrigatórios**
5. **Clique em "Enviar Redação"**

### **5. Teste Múltiplos Arquivos**
1. **Selecione vários arquivos** (imagens + PDFs)
2. **Verifique se todos aparecem no preview**
3. **Envie a redação**

## 🔍 **O que Verificar:**

### **✅ Comportamentos Esperados:**
- ✅ **Preview de imagens**: Mostra a imagem em miniatura
- ✅ **Preview de PDFs**: Mostra ícone PDF + nome do arquivo
- ✅ **Validação**: Aceita apenas imagens e PDFs
- ✅ **Upload sem erros**: Não mostra erros no console
- ✅ **Redação salva**: Aparece na listagem após envio
- ✅ **Arquivos salvos**: Verificáveis no Supabase Storage

### **❌ Problemas a Observar:**
- ❌ **Erro de RLS**: "row-level security policy"
- ❌ **Erro de bucket**: "bucket does not exist"
- ❌ **Erro de autenticação**: "user not authenticated"
- ❌ **Erro de upload**: "file too large" ou "invalid type"

## 🛠️ **Solução de Problemas:**

### **Se aparecer erro de RLS:**
1. Execute no SQL Editor:
   ```sql
   scripts/215_optimize_bucket_settings.sql
   ```
2. Configure políticas manualmente no painel do Supabase

### **Se aparecer erro de bucket:**
1. Verifique se o bucket 'redacoes' existe no painel
2. Configure como privado com limite de 50MB

### **Se aparecer erro de autenticação:**
1. Verifique se está logado
2. Tente fazer logout e login novamente

## 📊 **Verificação no Supabase:**

### **1. Verificar Storage:**
- Vá para **Storage > Buckets**
- Clique no bucket **'redacoes'**
- Verifique se os arquivos foram enviados

### **2. Verificar Banco de Dados:**
- Vá para **Table Editor**
- Verifique a tabela **'redacoes'**
- Verifique a tabela **'redacao_imagens'**

### **3. Verificar Logs:**
- Abra o **Console do navegador** (F12)
- Verifique se não há erros vermelhos
- Procure por mensagens de sucesso

## 🎉 **Teste de Sucesso:**

Se tudo funcionar corretamente, você deve ver:
- ✅ **Arquivos no preview** antes do envio
- ✅ **Mensagem de sucesso** após envio
- ✅ **Redação na listagem** com imagens/PDFs
- ✅ **Arquivos no Supabase Storage**
- ✅ **Registros no banco de dados**

## 🚀 **Próximos Passos:**

Após confirmar que o upload funciona:
1. **Teste com diferentes tipos de arquivo**
2. **Teste com arquivos grandes** (próximo do limite)
3. **Teste a visualização** das redações enviadas
4. **Teste a correção** pelo professor

**Boa sorte no teste! O sistema está pronto!** 🎯 