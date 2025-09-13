# 🎓 Guia: Criar Curso EXTENSIVO EAOF 2026

## 🎯 **Objetivo**

Criar o curso **EXTENSIVO EAOF 2026** e a turma **TURMA Á - EAOF 2026** no sistema.

## 🛠️ **Solução**

### **Passo 1: Executar SQL**

Execute o arquivo `create-eaof-2026.sql` no **Supabase Dashboard > SQL Editor**:

```sql
-- 1. Inserir subject EXTENSIVO EAOF 2026
INSERT INTO subjects (name) VALUES
('EXTENSIVO EAOF 2026')
ON CONFLICT DO NOTHING;

-- 2. Inserir turma TURMA Á - EAOF 2026
INSERT INTO classes (nome, max_alunos, curso_id, descricao) VALUES
('TURMA Á - EAOF 2026', 50, (SELECT id FROM subjects WHERE name = 'EXTENSIVO EAOF 2026'), 'Turma do curso extensivo EAOF 2026')
ON CONFLICT DO NOTHING;

-- 3. Verificar se foram criados
SELECT 'Subjects criados:' as info;
SELECT * FROM subjects ORDER BY id;

SELECT 'Classes criadas:' as info;
SELECT c.*, s.name as subject_name 
FROM classes c 
LEFT JOIN subjects s ON c.curso_id = s.id 
ORDER BY c.id;
```

### **Passo 2: Verificar Resultado**

Após executar o SQL, você deve ver:

**Subjects criados:**
| ID | Nome |
|----|------|
| 1 | Português |
| 2 | Regulamentos |
| 3 | **EXTENSIVO EAOF 2026** |

**Classes criadas:**
| ID | Nome | Max Alunos | Curso ID | Subject Name |
|----|------|------------|----------|--------------|
| 1 | Turma A - Manhã | 30 | 1 | Português |
| 2 | Turma B - Tarde | 25 | 1 | Português |
| 3 | Turma C - Noite | 20 | 2 | Regulamentos |
| 4 | **TURMA Á - EAOF 2026** | 50 | 3 | **EXTENSIVO EAOF 2026** |

## 📊 **Estrutura Criada**

### **Subject: EXTENSIVO EAOF 2026**
- **ID**: 3 (gerado automaticamente)
- **Nome**: EXTENSIVO EAOF 2026
- **Tipo**: Curso/Matéria

### **Turma: TURMA Á - EAOF 2026**
- **ID**: 4 (gerado automaticamente)
- **Nome**: TURMA Á - EAOF 2026
- **Max Alunos**: 50
- **Curso ID**: 3 (referência ao EXTENSIVO EAOF 2026)
- **Descrição**: Turma do curso extensivo EAOF 2026

## 🔧 **Próximos Passos**

### **1. Criar Usuários para a Turma**
Execute o script de criação de dados de teste:
```bash
node create-test-data-simple.js
```

### **2. Atribuir Usuários à Turma EAOF 2026**
Na página de membros (`/membros`):
1. Edite um usuário
2. Selecione a turma "TURMA Á - EAOF 2026"
3. Salve as alterações

### **3. Testar a Página de Membros**
1. Faça login como admin/teacher
2. Acesse `/membros`
3. Verifique se a turma EAOF 2026 aparece nas opções
4. Teste criar/editar usuários para esta turma

## 📝 **Arquivos Criados**

- **`create-eaof-2026.sql`** - SQL para criar curso e turma
- **`create-eaof-2026-course.js`** - Script Node.js (com erro de RLS)
- **`GUIA-CRIAR-EAOF-2026.md`** - Este guia

## 🎯 **Resultado Final**

Após executar o SQL:

✅ **Curso EXTENSIVO EAOF 2026** criado  
✅ **Turma TURMA Á - EAOF 2026** criada  
✅ **Relacionamento** entre curso e turma estabelecido  
✅ **Página de membros** pode usar a nova turma  
✅ **Sistema** pronto para receber alunos do EAOF 2026  

## 🚀 **Uso na Página de Membros**

A nova turma estará disponível na página de membros:

1. **Criar novo membro** → Selecionar "TURMA Á - EAOF 2026"
2. **Editar membro existente** → Alterar para "TURMA Á - EAOF 2026"
3. **Filtrar membros** → Por turma "TURMA Á - EAOF 2026"

O curso e turma EAOF 2026 estão prontos para uso! 🎉
