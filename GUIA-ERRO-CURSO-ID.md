# 🔧 Guia: Erro curso_id - Solução Completa

## ✅ **Problema Identificado**

O erro `null value in column "curso_id" of relation "classes" violates not-null constraint` foi identificado!

### 🔍 **Causa do Erro**
A tabela `classes` tem uma coluna `curso_id` que é **obrigatória** (NOT NULL) e não estava sendo fornecida no INSERT.

### 📋 **Estrutura Real da Tabela `classes`**
| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | INTEGER | ✅ | ID da turma |
| `nome` | VARCHAR | ✅ | Nome da turma |
| `max_alunos` | INTEGER | ✅ | Número máximo de alunos |
| `curso_id` | INTEGER | ✅ | **ID do curso (obrigatório)** |
| `descricao` | TEXT | ❌ | Descrição da turma |

### 📊 **Subjects Disponíveis**
| ID | Nome |
|----|------|
| 1 | Português |
| 2 | Regulamentos |

## 🛠️ **Solução Aplicada**

### **1. SQL Corrigido**
O arquivo `create-tables-corrected.sql` foi atualizado:

```sql
-- Inserir classes de exemplo (usando os nomes corretos das colunas)
-- NOTA: curso_id é obrigatório e deve referenciar subjects existentes
INSERT INTO classes (nome, max_alunos, curso_id) VALUES
('Turma A - Manhã', 30, 1),
('Turma B - Tarde', 25, 1),
('Turma C - Noite', 20, 2)
ON CONFLICT DO NOTHING;
```

### **2. Script Separado para Classes**
Criado `insert-classes-example.sql` para inserir classes separadamente:

```sql
-- Inserir classes de exemplo
INSERT INTO classes (nome, max_alunos, curso_id) VALUES
('Turma A - Manhã', 30, 1),
('Turma B - Tarde', 25, 1),
('Turma C - Noite', 20, 2)
ON CONFLICT DO NOTHING;
```

## 🚀 **Como Executar**

### **Opção 1: Executar SQL Completo**
1. Execute `create-tables-corrected.sql` no Supabase Dashboard
2. Se houver erro de RLS, execute `insert-classes-example.sql` separadamente

### **Opção 2: Executar Separadamente**
1. Execute `create-tables-corrected.sql` (sem a parte de INSERT de classes)
2. Execute `insert-classes-example.sql` separadamente

### **Opção 3: Via Interface**
1. Execute `create-tables-corrected.sql` (sem INSERT de classes)
2. Use a interface da página de membros para criar classes

## 📝 **Mapeamento de Classes**

| Classe | Curso | Subject ID | Descrição |
|--------|-------|------------|-----------|
| Turma A - Manhã | Português | 1 | Turma da manhã |
| Turma B - Tarde | Português | 1 | Turma da tarde |
| Turma C - Noite | Regulamentos | 2 | Turma da noite |

## 🔧 **Próximos Passos**

1. **Execute o SQL corrigido** no Supabase Dashboard
2. **Se houver erro de RLS**, execute `insert-classes-example.sql` separadamente
3. **Execute o script de dados de teste**:
   ```bash
   node create-test-data-simple.js
   ```
4. **Teste a página de membros**:
   - Faça login como admin/teacher
   - Acesse `/membros`
   - Verifique se os usuários aparecem

## 🎯 **Resultado Esperado**

Após executar o SQL corrigido:

✅ **Tabelas criadas** sem erros  
✅ **Classes inseridas** com curso_id válido  
✅ **Dados de exemplo** inseridos  
✅ **Página de membros** funcionando  
✅ **CRUD completo** operacional  

## 📝 **Arquivos Atualizados**

- **`create-tables-corrected.sql`** - SQL corrigido com curso_id
- **`insert-classes-example.sql`** - Script separado para classes
- **`GUIA-ERRO-CURSO-ID.md`** - Este guia

O SQL agora está correto e deve executar sem erros! 🎉
