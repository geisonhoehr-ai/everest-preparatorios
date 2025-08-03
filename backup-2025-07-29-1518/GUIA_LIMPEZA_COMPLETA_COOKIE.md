# 🧹 GUIA DE LIMPEZA COMPLETA - Cookie Corrompido

## 🚨 **Problema Identificado:**
```
Failed to parse cookie string: SyntaxError: Unexpected token 'b', "base64-eyJ"... is not valid JSON
```

## ✅ **Solução Completa:**

### **Passo 1: Execute o Script SQL**
1. **Acesse** o SQL Editor do Supabase
2. **Execute** o script: `scripts/228_solucao_cookie_corrompido.sql`
3. **Verifique** se o bucket está como `public: true`

### **Passo 2: Limpeza Completa do Navegador**

#### **Chrome/Edge:**
1. **Pressione** `Ctrl + Shift + Delete`
2. **Selecione** "Todo o período"
3. **Marque** TODAS as opções:
   - ✅ Cookies e dados do site
   - ✅ Histórico de navegação
   - ✅ Dados de formulários
   - ✅ Cache de imagens e arquivos
   - ✅ Senhas salvas
   - ✅ Dados de sites
4. **Clique** em "Limpar dados"
5. **Feche TODAS as abas** do navegador
6. **Feche o navegador completamente**
7. **Abra o navegador novamente**

#### **Firefox:**
1. **Pressione** `Ctrl + Shift + Delete`
2. **Selecione** "Tudo"
3. **Clique** em "Limpar agora"
4. **Feche TODAS as abas** do navegador
5. **Feche o Firefox completamente**
6. **Abra o Firefox novamente**

### **Passo 3: Modo Privado/Anônimo**
1. **Abra** uma janela privada/anônima
2. **Acesse**: `http://localhost:3003/redacao`
3. **Faça login** novamente (usuário e senha)
4. **Teste** o upload

### **Passo 4: Verificação**
1. **Abra** o console do navegador (F12)
2. **Verifique** se não há mais erros de cookie
3. **Teste** o upload de uma imagem ou PDF

## 🔍 **Verificação de Sucesso:**

### **No Console do Navegador (F12):**
- ✅ **Sem erros de cookie**
- ✅ **Sem "Multiple GoTrueClient instances"**
- ✅ **Sem erros de RLS**
- ✅ **Mensagens de sucesso** no upload

### **No Supabase Storage:**
- ✅ **Arquivos salvos** no bucket 'redacoes'
- ✅ **Bucket configurado** como público
- ✅ **Metadados corretos** (nome, tamanho, tipo)

### **No Banco de Dados:**
- ✅ **Redação criada** na tabela 'redacoes'
- ✅ **Imagens registradas** na tabela 'redacao_imagens'

## 🚨 **Se Ainda Não Funcionar:**

### **Última Opção: Navegador Diferente**
1. **Use** um navegador diferente (Chrome → Firefox ou vice-versa)
2. **Acesse**: `http://localhost:3003/redacao`
3. **Faça login** novamente
4. **Teste** o upload

## 🎯 **Resultado Esperado:**

Após a limpeza completa:
- ✅ **Cookie limpo** e funcional
- ✅ **Bucket público** sem RLS
- ✅ **Upload funcionando** imediatamente
- ✅ **Sem múltiplas instâncias**
- ✅ **Sistema operacional** completamente

## 📋 **Próximos Passos (Após Funcionar):**

1. **Confirme** que o upload funciona
2. **Configure** como privado novamente
3. **Adicione** políticas RLS corretas
4. **Teste** novamente

**Execute o script SQL e faça a limpeza completa dos cookies!** 🚀