# 🔧 Guia SQL Corrigido - Página de Membros

## ✅ **Problema Resolvido**

O erro `column "name" of relation "classes" does not exist` foi corrigido! 

**Causa do erro:** A tabela `classes` usa nomes de colunas em português:
- ❌ `name` → ✅ `nome`
- ❌ `max_students` → ✅ `max_alunos`

## 🛠️ **SQL Corrigido**

O arquivo `create-tables-corrected.sql` foi atualizado com os nomes corretos das colunas:

```sql
-- Inserir classes de exemplo (usando os nomes corretos das colunas)
INSERT INTO classes (nome, max_alunos) VALUES
('Turma A - Manhã', 30),
('Turma B - Tarde', 25),
('Turma C - Noite', 20)
ON CONFLICT DO NOTHING;
```

## 📋 **Estrutura Real das Tabelas**

### **Tabela `classes`**
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INTEGER | ID da turma |
| `nome` | VARCHAR | Nome da turma |
| `max_alunos` | INTEGER | Número máximo de alunos |
| `descricao` | TEXT | Descrição da turma |

### **Tabela `user_profiles`**
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `user_id` | UUID | ID do usuário |
| `role` | VARCHAR | Role (admin, teacher, student) |
| `display_name` | VARCHAR | Nome de exibição |

## 🚀 **Próximos Passos**

1. **Execute o SQL corrigido** no Supabase Dashboard:
   - Copie o conteúdo de `create-tables-corrected.sql`
   - Cole no SQL Editor do Supabase
   - Execute

2. **Execute o script de dados de teste**:
   ```bash
   node create-test-data-simple.js
   ```

3. **Teste a página de membros**:
   - Faça login como admin/teacher
   - Acesse `/membros`
   - Verifique se os usuários aparecem

## 🎯 **Resultado Esperado**

Após executar o SQL corrigido:

✅ **Tabelas criadas** sem erros  
✅ **Dados de exemplo** inseridos  
✅ **Página de membros** funcionando  
✅ **CRUD completo** operacional  

## 📝 **Arquivos Atualizados**

- **`create-tables-corrected.sql`** - SQL corrigido com nomes de colunas corretos
- **`GUIA-SQL-CORRIGIDO.md`** - Este guia

O SQL agora está correto e deve executar sem erros! 🎉
