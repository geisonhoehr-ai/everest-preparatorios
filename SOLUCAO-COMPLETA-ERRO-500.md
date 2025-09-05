# ✅ SOLUÇÃO COMPLETA PARA TODOS OS ERROS 500

## 🔍 PROBLEMAS IDENTIFICADOS

O usuário `7a6999a9-db96-4b08-87f1-cdc48bd4a8d6` está causando múltiplos erros de foreign key:

1. **`courses_teacher_id_fkey`** - Tabela `courses`, coluna `teacher_id`
2. **`temas_redacao_criado_por_fkey`** - Tabela `temas_redacao`, coluna `criado_por`
3. **`user_profiles`** - Tabela `user_profiles`, coluna `user_id`

## 🛠️ SOLUÇÃO DEFINITIVA

### Execute este script SQL no Supabase Dashboard:

```sql
-- 1. Verificar todas as dependências
SELECT 'courses' as tabela, COUNT(*) as total FROM courses WHERE teacher_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6'
UNION ALL
SELECT 'temas_redacao' as tabela, COUNT(*) as total FROM temas_redacao WHERE criado_por = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6'
UNION ALL
SELECT 'user_profiles' as tabela, COUNT(*) as total FROM user_profiles WHERE user_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 2. Atualizar courses para remover referência
UPDATE courses SET teacher_id = NULL WHERE teacher_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 3. Atualizar temas_redacao para remover referência
UPDATE temas_redacao SET criado_por = NULL WHERE criado_por = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 4. Excluir dependências em user_profiles
DELETE FROM user_profiles WHERE user_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 5. Verificar se não há mais dependências
SELECT 'courses' as tabela, COUNT(*) as total FROM courses WHERE teacher_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6'
UNION ALL
SELECT 'temas_redacao' as tabela, COUNT(*) as total FROM temas_redacao WHERE criado_por = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6'
UNION ALL
SELECT 'user_profiles' as tabela, COUNT(*) as total FROM user_profiles WHERE user_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 6. Excluir usuário do auth.users
DELETE FROM auth.users WHERE id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 7. Verificar resultado final
SELECT 'auth.users' as tabela, COUNT(*) as total FROM auth.users WHERE id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6'
UNION ALL
SELECT 'courses' as tabela, COUNT(*) as total FROM courses WHERE teacher_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6'
UNION ALL
SELECT 'temas_redacao' as tabela, COUNT(*) as total FROM temas_redacao WHERE criado_por = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6'
UNION ALL
SELECT 'user_profiles' as tabela, COUNT(*) as total FROM user_profiles WHERE user_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';
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
- ✅ **temas_redacao**: `criado_por` será `NULL` (sem referência)
- ✅ **user_profiles**: Registros excluídos
- ✅ **auth.users**: Usuário excluído
- ✅ **Todos os erros 500**: Resolvidos

## 📊 STATUS ATUAL

- ❌ **courses**: Tem dependências (não acessível via API)
- ❌ **temas_redacao**: Tem dependências (não acessível via API)
- ✅ **user_profiles**: Limpo (0 registros)
- ❌ **auth.users**: Usuário ainda existe
- ❌ **Constraints**: Impedem exclusão

## 🚀 ARQUIVOS CRIADOS

1. **`fix-all-constraints.sql`** - Script SQL completo
2. **`fix-all-constraints.js`** - Script JavaScript (para referência)
3. **`SOLUCAO-COMPLETA-ERRO-500.md`** - Este arquivo

**Execute o script SQL no Supabase Dashboard para resolver todos os erros 500!** 🎉
