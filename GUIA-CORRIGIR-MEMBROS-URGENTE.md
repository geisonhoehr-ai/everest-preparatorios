# 🚨 CORREÇÃO URGENTE - PÁGINA DE MEMBROS

## ❌ Problema Identificado
A página de membros não está funcionando porque:
- Tabela `student_subscriptions` não existe
- Tabela `page_permissions` não existe  
- Tabela `user_profiles` está vazia
- Tabela `classes` está vazia

## ✅ Solução

### 1. Execute o SQL no Supabase
Copie e execute o conteúdo do arquivo `fix-membros-simples.sql` no editor SQL do Supabase:

```sql
-- Execute todo o conteúdo do arquivo fix-membros-simples.sql
```

### 2. Verifique se funcionou
Após executar o SQL, a página de membros deve mostrar:
- ✅ Lista de usuários cadastrados
- ✅ Classes disponíveis
- ✅ Planos de acesso
- ✅ Funcionalidades de CRUD

## 🔧 O que o SQL faz:

1. **Cria tabelas faltando:**
   - `student_subscriptions` - relaciona usuários com classes e planos
   - `page_permissions` - controla acesso a páginas

2. **Popula dados básicos:**
   - Cria classes (Turma A, B, C)
   - Cria perfis para usuários existentes
   - Cria subscriptions básicas

3. **Configura permissões:**
   - Habilita RLS
   - Cria políticas básicas

## 🧪 Teste após executar:

1. Acesse a página de membros
2. Deve aparecer lista de usuários
3. Deve permitir criar/editar/deletar membros
4. Deve mostrar classes e planos

## ⚠️ IMPORTANTE:
Execute o SQL **AGORA** para corrigir a página de membros urgentemente!
