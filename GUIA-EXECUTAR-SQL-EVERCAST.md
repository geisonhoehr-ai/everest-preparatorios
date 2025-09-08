# 🚨 GUIA URGENTE - Executar SQL do EverCast

## ❌ PROBLEMA IDENTIFICADO
As tabelas do EverCast **NÃO foram criadas** no banco de dados. Por isso a página EverCast não está funcionando.

## ✅ SOLUÇÃO

### 1. Acesse o Painel do Supabase
- Vá para: https://supabase.com/dashboard
- Entre no seu projeto Everest

### 2. Execute o SQL
- Clique em **"SQL Editor"** no menu lateral
- Clique em **"New query"**
- Copie **TODO** o conteúdo do arquivo `CRIAR-TABELAS-EVERCAST-URGENTE.sql`
- Cole no editor
- Clique em **"Run"** (ou Ctrl+Enter)

### 3. Verifique se funcionou
Após executar, você deve ver:
```
Tabelas do EverCast criadas com sucesso!
```

E uma lista com:
- audio_courses
- audio_modules  
- audio_lessons
- audio_progress

### 4. Aguarde alguns minutos
- O Supabase pode levar alguns minutos para atualizar o cache
- Após 2-3 minutos, teste a página EverCast novamente

## 🔍 COMO VERIFICAR SE FUNCIONOU

### No Painel do Supabase:
1. Vá para **"Table Editor"**
2. Você deve ver as 4 tabelas do EverCast listadas
3. Clique em `audio_courses` - deve ter pelo menos 1 curso de exemplo

### Na Página EverCast:
1. Acesse a página EverCast no seu sistema
2. Deve aparecer o curso "Extensivo EAOF 2026 - Português e Redação"
3. Tente criar uma nova aula - deve funcionar sem erros

## ⚠️ IMPORTANTE
- **Execute o SQL COMPLETO** - não apenas uma parte
- **Aguarde a execução terminar** - pode levar alguns segundos
- **Não feche o navegador** durante a execução

## 🆘 SE AINDA NÃO FUNCIONAR
1. Verifique se há erros no SQL Editor
2. Tente executar o SQL novamente
3. Aguarde mais alguns minutos para o cache atualizar
4. Verifique se você está no projeto correto do Supabase

---
**Status atual:** ❌ Tabelas não criadas - EverCast não funciona
**Após executar SQL:** ✅ Tabelas criadas - EverCast funcionará
