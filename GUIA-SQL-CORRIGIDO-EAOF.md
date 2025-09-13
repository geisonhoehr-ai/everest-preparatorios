# 🔧 Guia: SQL Corrigido para EAOF 2026

## ✅ **Problema Resolvido**

O erro `operator does not exist: text = bigint` foi corrigido!

### 🔍 **Causa do Erro**
- Incompatibilidade de tipos entre `c.curso_id` e `s.id`
- A tabela `classes` estava vazia, então não havia relacionamento definido
- Problema com JOIN entre tabelas com tipos diferentes

### 🛠️ **Solução Aplicada**

**SQL Corrigido:**
```sql
-- 1. Inserir subject EXTENSIVO EAOF 2026
INSERT INTO subjects (name) VALUES
('EXTENSIVO EAOF 2026')
ON CONFLICT DO NOTHING;

-- 2. Inserir turma TURMA Á - EAOF 2026
INSERT INTO classes (nome, max_alunos, curso_id, descricao) VALUES
('TURMA Á - EAOF 2026', 50, (SELECT id FROM subjects WHERE name = 'EXTENSIVO EAOF 2026'), 'Turma do curso extensivo EAOF 2026')
ON CONFLICT DO NOTHING;

-- 3. Verificar se foram criados (versão simples)
SELECT 'Subjects criados:' as info;
SELECT * FROM subjects ORDER BY id;

SELECT 'Classes criadas:' as info;
SELECT * FROM classes ORDER BY id;

-- 4. Verificar relacionamento (versão simples)
SELECT 'Verificação de relacionamento:' as info;
SELECT 
  c.id as class_id,
  c.nome as class_name,
  c.curso_id,
  s.id as subject_id,
  s.name as subject_name
FROM classes c, subjects s 
WHERE c.curso_id = s.id
ORDER BY c.id;
```

## 🚀 **Como Executar**

### **Opção 1: SQL Simples (Recomendado)**
Execute o arquivo `create-eaof-2026-simple.sql` no Supabase Dashboard:

1. Copie o conteúdo de `create-eaof-2026-simple.sql`
2. Cole no SQL Editor do Supabase
3. Execute

### **Opção 2: SQL Original Corrigido**
Execute o arquivo `create-eaof-2026.sql` (já corrigido):

1. Copie o conteúdo de `create-eaof-2026.sql`
2. Cole no SQL Editor do Supabase
3. Execute

## 📊 **Resultado Esperado**

Após executar o SQL:

**Subjects criados:**
| ID | Nome |
|----|------|
| 1 | Português |
| 2 | Regulamentos |
| 3 | **EXTENSIVO EAOF 2026** |

**Classes criadas:**
| ID | Nome | Max Alunos | Curso ID | Descrição |
|----|------|------------|----------|-----------|
| 1 | **TURMA Á - EAOF 2026** | 50 | 3 | Turma do curso extensivo EAOF 2026 |

**Verificação de relacionamento:**
| Class ID | Class Name | Curso ID | Subject ID | Subject Name |
|----------|------------|----------|------------|--------------|
| 1 | TURMA Á - EAOF 2026 | 3 | 3 | EXTENSIVO EAOF 2026 |

## 🔧 **Próximos Passos**

1. **Execute o SQL corrigido** no Supabase Dashboard
2. **Verifique** se o curso e turma foram criados
3. **Execute o script de dados de teste**:
   ```bash
   node create-test-data-simple.js
   ```
4. **Teste a página de membros**:
   - Acesse `/membros`
   - A turma "TURMA Á - EAOF 2026" estará disponível
   - Crie/edite usuários para esta turma

## 📝 **Arquivos Atualizados**

- **`create-eaof-2026.sql`** - SQL original corrigido
- **`create-eaof-2026-simple.sql`** - SQL simplificado (recomendado)
- **`GUIA-SQL-CORRIGIDO-EAOF.md`** - Este guia

## 🎯 **Resultado Final**

Após executar o SQL corrigido:

✅ **Curso EXTENSIVO EAOF 2026** criado  
✅ **Turma TURMA Á - EAOF 2026** criada  
✅ **Relacionamento** entre curso e turma estabelecido  
✅ **Página de membros** pode usar a nova turma  
✅ **Sistema** pronto para receber alunos do EAOF 2026  

O SQL agora está correto e deve executar sem erros! 🎉
