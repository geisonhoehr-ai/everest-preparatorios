# 🗄️ Guia de Mapeamento das Tabelas do Supabase

## 🎯 **Objetivo**

Este guia contém scripts SQL para mapear e verificar todas as tabelas do banco de dados Supabase do projeto Everest. Use estes scripts para entender a estrutura completa do banco e verificar o estado atual das tabelas.

## 📋 **Scripts Disponíveis**

### **1. `map-all-supabase-tables.sql` - Mapeamento Completo**
- **Uso**: Mapeamento completo de todas as tabelas do Supabase
- **Inclui**: Tabelas dos schemas public, auth, storage, extensions
- **Detalhes**: Colunas, tipos, constraints, índices, políticas RLS
- **Tamanho**: Script extenso com informações detalhadas

### **2. `map-project-tables-simple.sql` - Mapeamento do Projeto**
- **Uso**: Foco nas tabelas específicas do projeto Everest
- **Inclui**: Apenas tabelas do schema public
- **Detalhes**: Colunas, tipos, contagem de registros
- **Tamanho**: Script médio, mais focado

### **3. `check-existing-tables.sql` - Verificação Rápida**
- **Uso**: Verificar quais tabelas já existem
- **Inclui**: Lista de tabelas existentes com status
- **Detalhes**: Contagem de registros por tabela
- **Tamanho**: Script pequeno e rápido

### **4. `check-table-structure.sql` - Estrutura das Tabelas**
- **Uso**: Verificar a estrutura (colunas) das tabelas principais
- **Inclui**: Colunas, tipos, tamanhos, nullable, defaults
- **Detalhes**: Estrutura detalhada de cada tabela
- **Tamanho**: Script médio, focado na estrutura

## 🚀 **Como Usar**

### **Passo 1: Acessar o Supabase**
1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **SQL Editor**

### **Passo 2: Executar os Scripts**
1. **Copie o conteúdo** do script desejado
2. **Cole no SQL Editor**
3. **Execute** clicando em "Run"

### **Passo 3: Analisar os Resultados**
- Os resultados aparecerão em **tabelas organizadas**
- Cada seção tem uma **categoria** para facilitar a leitura
- Use os **filtros** do Supabase para navegar pelos resultados

## 📊 **Tabelas Esperadas no Projeto**

### **Tabelas Principais:**
- ✅ `user_profiles` - Perfis de usuários
- ✅ `subjects` - Matérias/Disciplinas
- ✅ `topics` - Tópicos das matérias
- ✅ `questions` - Perguntas dos quizzes
- ✅ `quizzes` - Quizzes
- ✅ `quiz_attempts` - Tentativas de quiz
- ✅ `flashcards` - Flashcards
- ✅ `user_progress` - Progresso dos usuários

### **Tabelas do Evercast:**
- ✅ `audio_courses` - Cursos de áudio
- ✅ `audio_modules` - Módulos de áudio
- ✅ `audio_lessons` - Aulas de áudio

### **Tabelas do Calendário:**
- ✅ `calendar_events` - Eventos do calendário

### **Tabelas de Gestão de Membros:**
- ✅ `classes` - Turmas/Classes
- ✅ `access_plans` - Planos de acesso
- ✅ `page_permissions` - Permissões por página
- ✅ `student_subscriptions` - Assinaturas de estudantes
- ✅ `temporary_passwords` - Senhas provisórias

## 🔍 **Interpretando os Resultados**

### **Status das Tabelas:**
- ✅ **Existe** - Tabela criada e funcionando
- ❌ **Não existe** - Tabela não foi criada ainda
- ❓ **Outra tabela** - Tabela não reconhecida

### **Contagem de Registros:**
- **0 registros** - Tabela vazia
- **1-100 registros** - Poucos dados
- **100+ registros** - Tabela com dados

### **Estrutura das Colunas:**
- **Tipo**: `uuid`, `text`, `timestamp`, `boolean`, etc.
- **Tamanho**: Máximo de caracteres (para text/varchar)
- **Nullable**: Se pode ser NULL
- **Padrão**: Valor padrão da coluna

## 📈 **Exemplo de Uso**

### **Cenário 1: Verificar se todas as tabelas foram criadas**
```sql
-- Execute: check-existing-tables.sql
-- Resultado: Lista de todas as tabelas com status ✅ ou ❌
```

### **Cenário 2: Verificar a estrutura de uma tabela específica**
```sql
-- Execute: check-table-structure.sql
-- Resultado: Estrutura detalhada de todas as tabelas principais
```

### **Cenário 3: Mapeamento completo do banco**
```sql
-- Execute: map-all-supabase-tables.sql
-- Resultado: Informações completas de todas as tabelas
```

## 🚨 **Problemas Comuns**

### **Tabela não existe:**
- **Causa**: Script de criação não foi executado
- **Solução**: Execute o script de criação correspondente

### **Tabela vazia:**
- **Causa**: Tabela criada mas sem dados
- **Solução**: Execute scripts de inserção de dados

### **Estrutura incorreta:**
- **Causa**: Script de criação com erro
- **Solução**: Verifique e execute novamente o script

## 🔧 **Scripts de Criação Correspondentes**

### **Para criar tabelas que não existem:**
- `create-members-management-tables.sql` - Tabelas de gestão de membros
- `create-calendar-events-table.sql` - Tabela de eventos do calendário
- Scripts específicos para cada funcionalidade

### **Para inserir dados:**
- `insert-eaof-2026-cronograma.sql` - Cronograma EAOF 2026
- Scripts de inserção de dados iniciais

## 📊 **Relatório de Status**

### **Tabelas Críticas (Devem existir):**
- `user_profiles` - Sistema de autenticação
- `subjects` - Funcionalidade de quiz
- `topics` - Organização de conteúdo
- `questions` - Perguntas dos quizzes
- `quizzes` - Quizzes
- `flashcards` - Flashcards

### **Tabelas de Funcionalidades:**
- `audio_courses` - Evercast
- `calendar_events` - Calendário
- `classes` - Gestão de membros
- `access_plans` - Planos de acesso
- `page_permissions` - Controle de acesso

### **Tabelas de Suporte:**
- `quiz_attempts` - Histórico de tentativas
- `user_progress` - Progresso dos usuários
- `student_subscriptions` - Assinaturas
- `temporary_passwords` - Senhas provisórias

## 🎯 **Próximos Passos**

### **Após executar os scripts:**
1. **Identifique** tabelas faltantes
2. **Execute** scripts de criação correspondentes
3. **Verifique** se as estruturas estão corretas
4. **Insira** dados iniciais se necessário
5. **Teste** as funcionalidades

## ⚠️ **Observações Importantes**

- **Execute os scripts** no Supabase SQL Editor
- **Verifique os resultados** antes de prosseguir
- **Faça backup** antes de alterações importantes
- **Teste em ambiente de desenvolvimento** primeiro
- **Documente** qualquer alteração feita

---

**Use estes scripts para manter o banco de dados organizado e verificar o status de todas as tabelas do projeto!** 🎉
