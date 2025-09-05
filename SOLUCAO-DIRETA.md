# 🚨 SOLUÇÃO DIRETA PARA O ERRO 500

## ❌ PROBLEMA IDENTIFICADO

O erro `ERROR: 23503: update or delete on table "users" violates foreign key constraint "courses_teacher_id_fkey"` indica que:

1. **O usuário `7a6999a9-db96-4b08-87f1-cdc48bd4a8d6` está sendo referenciado** na tabela `courses` como `teacher_id`
2. **Não conseguimos acessar a tabela `courses`** via API (pode estar em outro schema ou ter permissões restritivas)
3. **A exclusão falha** porque há uma constraint de chave estrangeira

## 🛠️ SOLUÇÕES DISPONÍVEIS

### Opção 1: Via Supabase Dashboard (RECOMENDADO)

1. **Acesse o Supabase Dashboard**:
   - URL: https://supabase.com/dashboard
   - Projeto: `wruvehhfzkvmfyhxzmwo`

2. **Vá para SQL Editor**:
   - Execute o script `SOLUCAO-ERRO-500.sql`
   - Isso vai identificar a tabela correta e resolver as dependências

3. **Ou execute manualmente**:
   ```sql
   -- Verificar constraints
   SELECT 
       tc.table_name, 
       tc.constraint_name,
       kcu.column_name,
       ccu.table_name AS foreign_table_name
   FROM information_schema.table_constraints AS tc 
   JOIN information_schema.key_column_usage AS kcu
       ON tc.constraint_name = kcu.constraint_name
   JOIN information_schema.constraint_column_usage AS ccu
       ON ccu.constraint_name = tc.constraint_name
   WHERE tc.constraint_type = 'FOREIGN KEY' 
       AND ccu.table_name = 'users'
       AND ccu.column_name = 'id';
   ```

### Opção 2: Via Service Role Key

Se você tiver a Service Role Key do Supabase, posso criar um script que usa permissões administrativas para resolver o problema.

### Opção 3: Desabilitar Constraint Temporariamente

```sql
-- Desabilitar constraint temporariamente
ALTER TABLE courses DISABLE TRIGGER ALL;

-- Excluir usuário
DELETE FROM auth.users WHERE id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- Reabilitar constraint
ALTER TABLE courses ENABLE TRIGGER ALL;
```

## 🎯 PRÓXIMOS PASSOS

1. **Execute o script SQL** no Supabase Dashboard
2. **Identifique a tabela correta** que está causando o problema
3. **Atualize ou exclua** os registros que referenciam o usuário
4. **Exclua o usuário** do auth.users

## 📊 STATUS ATUAL

- ❌ **Usuário existe** no auth.users
- ❌ **Há dependências** na tabela courses (ou similar)
- ❌ **Constraint de chave estrangeira** impede exclusão
- ✅ **user_profiles limpo** (0 registros)

**O problema está na tabela `courses` que não conseguimos acessar via API, mas existe no banco de dados.**
