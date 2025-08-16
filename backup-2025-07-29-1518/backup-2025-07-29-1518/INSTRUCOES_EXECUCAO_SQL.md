# 📋 Instruções para Executar Scripts SQL no Supabase

## 🚨 **PROBLEMA IDENTIFICADO**

O erro mostra que a tabela `redacao_imagens` não existe. Esta é a tabela essencial para armazenar as imagens/PDFs das redações.

## 📝 **SCRIPT RÁPIDO PARA EXECUTAR**

### **Execute APENAS este script:**
```sql
-- Copie e cole no SQL Editor do Supabase
-- Arquivo: scripts/207_create_redacao_imagens_simple.sql
```

## 🔧 **COMO EXECUTAR NO SUPABASE**

### **Passo 1: Acessar SQL Editor**
1. Vá para o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Clique em "SQL Editor" no menu lateral

### **Passo 2: Executar o Script**
1. Clique em "New Query"
2. Cole TODO o conteúdo do arquivo `scripts/207_create_redacao_imagens_simple.sql`
3. Clique em "Run" (ou pressione Ctrl+Enter)

### **Passo 3: Verificar Resultados**
Você deve ver:
- ✅ "Tabela redacao_imagens criada com sucesso"
- ✅ "RLS configurado"
- ✅ "Índices criados"

## 📊 **O QUE SERÁ CRIADO**

### **Tabela `redacao_imagens`:**
- `id` - Identificador único
- `redacao_id` - Referência à redação
- `url` - URL da imagem/PDF
- `ordem` - Ordem das imagens
- `rotation` - Rotação da imagem
- `file_name` - Nome do arquivo
- `file_size` - Tamanho do arquivo
- `mime_type` - Tipo do arquivo
- `created_at` - Data de criação
- `updated_at` - Data de atualização

### **Funcionalidades:**
- ✅ Row Level Security (RLS) ativo
- ✅ Políticas de acesso configuradas
- ✅ Índices para performance
- ✅ Relacionamento com tabela `redacoes`

## 🎯 **RESULTADO ESPERADO**

Após executar o script, você deve ver:

```
✅ Tabela redacao_imagens existe
✅ RLS configurado
✅ Índices criados
```

## 🚀 **PRÓXIMOS PASSOS**

1. **Execute o script** no Supabase
2. **Teste a página** `/redacao` novamente
3. **Faça upload** de um PDF ou imagem
4. **Verifique** se o upload funciona

## ❓ **SE HOUVER ERROS**

### **Erro: "relation already exists"**
- ✅ Perfeito! A tabela já foi criada
- Continue testando a aplicação

### **Erro: "relation 'redacoes' does not exist"**
- Execute primeiro os outros scripts para criar a tabela `redacoes`
- Depois execute este script

### **Erro: "permission denied"**
- Verifique se você tem acesso de admin no Supabase
- Use a conta principal do projeto

## 📞 **SCRIPTS ADICIONAIS (SE NECESSÁRIO)**

Se precisar criar todas as tabelas do sistema de redação:

1. `scripts/204_verify_redacao_tables.sql` - Verificação
2. `scripts/205_fix_redacoes_table.sql` - Criar tabela redacoes
3. `scripts/206_fix_redacoes_user_uuid.sql` - Corrigir user_uuid
4. `scripts/203_create_missing_redacao_tables.sql` - Criar outras tabelas

---

**Status: 🟡 Aguardando execução do script**
**Próximo: Executar script 207 no Supabase**