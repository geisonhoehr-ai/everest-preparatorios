# 🔄 FORÇAR ATUALIZAÇÃO DO CACHE SUPABASE

## 🚨 PROBLEMA ATUAL
- ✅ **Tabelas criadas** (confirmado pelo resultado que você mostrou)
- ❌ **Cache não atualizado** (erro "schema cache" persiste)
- ❌ **Módulos não aparecem** na página EverCast

## 🔧 SOLUÇÕES PARA FORÇAR ATUALIZAÇÃO

### **Opção 1: Reset da API Key (Recomendado)**
1. **Painel Supabase** → **Settings** → **API**
2. **Clique em "Reset API Key"** (botão vermelho)
3. **Aguarde 2-3 minutos**
4. **Teste a página EverCast**

### **Opção 2: Reiniciar o Projeto Supabase**
1. **Painel Supabase** → **Settings** → **General**
2. **Clique em "Restart Project"**
3. **Aguarde 5-10 minutos**
4. **Teste a página EverCast**

### **Opção 3: Verificar no Table Editor**
1. **Painel Supabase** → **Table Editor**
2. **Verifique se as tabelas aparecem:**
   - `audio_courses`
   - `audio_modules` 
   - `audio_lessons`
   - `audio_progress`
3. **Se aparecem:** problema é só cache
4. **Se não aparecem:** execute o SQL novamente

### **Opção 4: Re-executar o SQL**
Se as tabelas não aparecem no Table Editor:
1. **Painel Supabase** → **SQL Editor**
2. **Execute novamente:** `CRIAR-TABELAS-EVERCAST-URGENTE.sql`
3. **Aguarde 5 minutos**
4. **Teste a página EverCast**

## 🎯 TESTE APÓS ATUALIZAÇÃO

**Quando o cache atualizar, você deve ver:**
1. ✅ **Página EverCast carrega** sem erros no console
2. ✅ **Curso "Extensivo EAOF 2026"** aparece
3. ✅ **Módulos criados** aparecem na lista
4. ✅ **Aulas podem ser criadas** e salvas

## ⚠️ IMPORTANTE
- **NÃO execute o SQL múltiplas vezes** sem verificar se as tabelas existem
- **Aguarde sempre** após reset/restart (2-10 minutos)
- **Teste sempre** após cada tentativa

## 🕐 TEMPO ESTIMADO
- **Reset API Key:** 2-3 minutos
- **Restart Project:** 5-10 minutos  
- **Re-executar SQL:** 5 minutos
- **Total máximo:** 15 minutos

---
**Status:** ⏳ Aguardando atualização do cache Supabase
