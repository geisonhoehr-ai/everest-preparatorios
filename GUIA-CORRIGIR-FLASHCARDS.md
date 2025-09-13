# 🚨 Guia: Corrigir Flashcards - RLS Bloqueando

## ❌ **Problema Identificado**

Os flashcards **não funcionam** porque:

1. ✅ **Flashcards existem** - 785 flashcards de Português e Regulamentos
2. ✅ **Funções funcionam** - getCardsForReview e getNewCards estão corretas
3. ❌ **RLS bloqueando** - Row Level Security impede criação de usuários e progresso
4. ❌ **Sem usuários** - Não há usuários autenticados
5. ❌ **Sem progresso** - Não há registros em flashcard_progress

## 🔍 **Causa do Problema**

- **RLS (Row Level Security)** está bloqueando inserções
- **Usuários não podem ser criados** devido às políticas de segurança
- **Progresso de flashcards não pode ser criado** sem usuários
- **Botões não funcionam** porque não há dados para mostrar

## 🛠️ **Solução**

Execute o SQL para corrigir o problema:

### 🚀 **Como Executar**

1. **Abra o Supabase Dashboard**
2. **Vá para SQL Editor**
3. **Copie o conteúdo do arquivo `fix-flashcards-rls.sql`**
4. **Cole no SQL Editor**
5. **Execute o SQL**

### 📝 **Arquivo a Executar**

Execute o arquivo: **`fix-flashcards-rls.sql`**

Este arquivo vai:
- ✅ Desabilitar RLS temporariamente
- ✅ Criar usuário de teste
- ✅ Criar progresso de flashcards
- ✅ Reabilitar RLS
- ✅ Verificar resultado

### 📊 **Resultado Esperado**

Após executar o SQL:

**Usuário criado:**
| ID | Role |
|----|------|
| 00000000-0000-0000-0000-000000000001 | student |

**Progresso criado:**
- **10 registros** de progresso de flashcards

**Flashcards disponíveis:**
- **5 flashcards** de exemplo com topics

## 🎯 **Após Executar o SQL**

1. **Flashcards funcionarão** - Haverá usuário e progresso
2. **Botões funcionarão** - Dados estarão disponíveis
3. **Sistema estará funcional** para testes

## 🚨 **IMPORTANTE**

- Execute o SQL **IMEDIATAMENTE**
- O RLS será desabilitado temporariamente apenas para criar os dados
- Após a criação, o RLS será reabilitado para segurança

## 🔧 **Próximos Passos**

Após executar o SQL:

1. **Teste os flashcards** - Os botões devem funcionar
2. **Verifique a página de membros** - Deve mostrar o usuário criado
3. **Teste o sistema completo** - Tudo deve estar funcional

**Execute o SQL `fix-flashcards-rls.sql` no Supabase Dashboard AGORA!** 🚨
