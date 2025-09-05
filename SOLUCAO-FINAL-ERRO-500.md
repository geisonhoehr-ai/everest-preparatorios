# ✅ SOLUÇÃO FINAL PARA O ERRO 500

## 🔍 PROBLEMA CONFIRMADO

O erro `ERROR: 23503: update or delete on table "users" violates foreign key constraint "courses_teacher_id_fkey"` está acontecendo porque:

- ✅ **Tabela `courses` existe** no banco de dados
- ✅ **Constraint `courses_teacher_id_fkey`** na coluna `teacher_id` 
- ✅ **Usuário `7a6999a9-db96-4b08-87f1-cdc48bd4a8d6`** está sendo referenciado
- ❌ **Tabela não acessível via API** (permissões restritivas)

## 🛠️ SOLUÇÃO DEFINITIVA

### Execute este script SQL no Supabase Dashboard:

```sql
-- 1. Verificar dependências
SELECT 
    id,
    title,
    teacher_id,
    created_at
FROM courses 
WHERE teacher_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 2. Atualizar para remover referência
UPDATE courses 
SET teacher_id = NULL 
WHERE teacher_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 3. Excluir dependências em user_profiles
DELETE FROM user_profiles 
WHERE user_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 4. Verificar se não há mais dependências
SELECT 
    'courses' as tabela,
    COUNT(*) as total
FROM courses 
WHERE teacher_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6'

UNION ALL

SELECT 
    'user_profiles' as tabela,
    COUNT(*) as total
FROM user_profiles 
WHERE user_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 5. Excluir usuário do auth.users
DELETE FROM auth.users 
WHERE id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';
```

## 📋 INSTRUÇÕES PASSO A PASSO

1. **Acesse o Supabase Dashboard**:
   - URL: https://supabase.com/dashboard
   - Projeto: `wruvehhfzkvmfyhxzmwo`

2. **Vá para SQL Editor**:
   - Clique em "SQL Editor" no menu lateral

3. **Execute o script acima**:
   - Cole o código SQL
   - Clique em "Run"

4. **Verifique o resultado**:
   - Deve mostrar `total: 0` para todas as tabelas
   - O usuário deve ser excluído com sucesso

## 🎯 RESULTADO ESPERADO

Após executar o script:
- ✅ **courses**: `teacher_id` será `NULL` (sem referência)
- ✅ **user_profiles**: Registros excluídos
- ✅ **auth.users**: Usuário excluído
- ✅ **Erro 500**: Resolvido

## 📊 STATUS ATUAL

- ❌ **courses**: Tem dependências (não acessível via API)
- ✅ **user_profiles**: Limpo (0 registros)
- ❌ **auth.users**: Usuário ainda existe
- ❌ **Constraint**: Impede exclusão

**Execute o script SQL no Supabase Dashboard para resolver definitivamente!** 🚀
