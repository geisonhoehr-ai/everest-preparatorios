# 🔐 CONFIGURAÇÃO DE AMBIENTE - EVEREST PREPARATÓRIOS

## ⚠️ IMPORTANTE: SEGURANÇA

**NUNCA commite credenciais reais no Git!**

## 📋 Variáveis de Ambiente Necessárias

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```bash
# =====================================================
# SUPABASE CONFIGURATION
# =====================================================
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui

# =====================================================
# CONFIGURAÇÕES GERAIS
# =====================================================
CUSTOM_KEY=sua_chave_personalizada
NODE_ENV=development
```

## 🚀 Como Configurar

### 1. **Desenvolvimento Local:**
```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Edite com suas credenciais
nano .env.local
```

### 2. **Deploy no Vercel:**
1. Acesse o painel do Vercel
2. Vá em Settings > Environment Variables
3. Adicione as variáveis necessárias
4. Configure para Production, Preview e Development

### 3. **Deploy em Outros Provedores:**
- Configure as variáveis de ambiente no painel do provedor
- NUNCA hardcode credenciais no código

## 🔒 Credenciais do Supabase

### **NEXT_PUBLIC_SUPABASE_URL:**
- URL do seu projeto Supabase
- Pode ser exposta no frontend
- Formato: `https://seu-projeto.supabase.co`

### **NEXT_PUBLIC_SUPABASE_ANON_KEY:**
- Chave anônima do Supabase
- Pode ser exposta no frontend
- Encontrada em: Supabase Dashboard > Settings > API

### **SUPABASE_SERVICE_ROLE_KEY:**
- Chave de serviço do Supabase
- **NUNCA expor no frontend**
- Usada apenas em Server Actions
- Encontrada em: Supabase Dashboard > Settings > API

## ✅ Verificação

Após configurar, teste se as variáveis estão sendo carregadas:

```bash
npm run dev
```

Se houver erro de "undefined", verifique se:
1. O arquivo `.env.local` existe
2. As variáveis estão com os nomes corretos
3. Não há espaços extras nos nomes das variáveis

## 🚨 Problemas Comuns

### **Erro: "NEXT_PUBLIC_SUPABASE_URL is undefined"**
- Verifique se o arquivo `.env.local` existe
- Confirme se a variável está com o nome correto
- Reinicie o servidor de desenvolvimento

### **Erro: "Invalid API key"**
- Verifique se a chave está correta
- Confirme se está usando a chave anônima (não a service role)
- Verifique se o projeto Supabase está ativo

## 📚 Documentação Adicional

- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/local-development#env-file)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
