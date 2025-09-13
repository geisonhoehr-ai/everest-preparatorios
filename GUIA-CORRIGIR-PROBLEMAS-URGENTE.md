# 🚨 Guia: Corrigir Problemas Urgentes

## ❌ **Problemas Identificados**

1. **Matéria EXTENSIVO EAOF 2026** - ✅ Existe (múltiplas vezes)
2. **Flashcards não funcionam** - ❌ Não há topics nem flashcards
3. **Página de membros vazia** - ❌ Não há usuários
4. **Usuário geisonhoehr@gmail.com** - ❌ Não existe

## 🔍 **Causa dos Problemas**

- **RLS (Row Level Security)** está bloqueando inserções
- **Estruturas de tabelas** diferentes do esperado
- **Dados não foram criados** devido às políticas de segurança

## 🛠️ **Solução Urgente**

Execute o SQL para corrigir todos os problemas:

### 🚀 **Como Executar**

1. **Abra o Supabase Dashboard**
2. **Vá para SQL Editor**
3. **Copie o conteúdo do arquivo `fix-rls-and-create-data.sql`**
4. **Cole no SQL Editor**
5. **Execute o SQL**

### 📝 **Arquivo a Executar**

Execute o arquivo: **`fix-rls-and-create-data.sql`**

Este arquivo vai:
- ✅ Desabilitar RLS temporariamente
- ✅ Limpar subjects duplicados
- ✅ Criar 4 topics para EAOF 2026
- ✅ Criar 12 flashcards de exemplo
- ✅ Criar turma EAOF 2026
- ✅ Criar usuário de teste
- ✅ Reabilitar RLS
- ✅ Verificar resultado

### 📊 **Resultado Esperado**

Após executar o SQL:

**Subjects EAOF:**
| ID | Nome |
|----|------|
| 5 | EXTENSIVO EAOF 2026 |

**Topics EAOF:**
| ID | Nome | Subject ID |
|----|------|------------|
| matematica-basica | Matemática Básica | 5 |
| portugues-eaof | Português EAOF | 5 |
| conhecimentos-gerais | Conhecimentos Gerais | 5 |
| raciocinio-logico | Raciocínio Lógico | 5 |

**Flashcards EAOF:**
- **12 flashcards** distribuídos nos 4 topics
- **3 flashcards por topic**

**Classes EAOF:**
| ID | Nome | Max Alunos | Curso ID |
|----|------|------------|----------|
| 1 | TURMA Á - EAOF 2026 | 50 | 5 |

**Usuários:**
| ID | Role |
|----|------|
| 00000000-0000-0000-0000-000000000001 | admin |

## 🎯 **Após Executar o SQL**

1. **Flashcards funcionarão** - Haverá topics e flashcards
2. **Página de membros** mostrará o usuário criado
3. **Sistema estará funcional** para testes

## 🚨 **IMPORTANTE**

- Execute o SQL **IMEDIATAMENTE**
- O RLS será desabilitado temporariamente apenas para criar os dados
- Após a criação, o RLS será reabilitado para segurança

**Execute o SQL `fix-rls-and-create-data.sql` no Supabase Dashboard AGORA!** 🚨
