# Guia para Corrigir a Tabela student_profiles

## Problema Identificado
A tabela `student_profiles` tem o campo `user_uuid` como tipo `uuid`, mas o código está tentando inserir emails (texto) neste campo, causando o erro:
```
invalid input syntax for type uuid: "email@example.com"
```

## Solução
Precisamos alterar o campo `user_uuid` de `uuid` para `text` para aceitar emails.

## Passos para Executar

### 1. Acessar o Painel do Supabase
1. Vá para [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Acesse o projeto `everest-preparatorios`
4. Clique em **SQL Editor** no menu lateral

### 2. Executar o Script SQL
1. Clique em **New Query**
2. Copie e cole todo o conteúdo do arquivo `scripts/254_fix_student_profiles_table.sql`
3. Clique em **Run** para executar o script

### 3. Verificar o Resultado
O script irá:
- ✅ Verificar a estrutura atual da tabela
- ✅ Dropar e recriar a tabela com a estrutura correta
- ✅ Inserir dados de teste para verificação
- ✅ Configurar políticas RLS
- ✅ Limpar dados de teste
- ✅ Mostrar a estrutura final

### 4. Estrutura Esperada Após a Correção
```sql
CREATE TABLE student_profiles (
    id SERIAL PRIMARY KEY,
    user_uuid TEXT NOT NULL UNIQUE, -- Agora aceita emails
    nome_completo TEXT,
    total_flashcards INTEGER DEFAULT 0,
    completed_flashcards INTEGER DEFAULT 0,
    total_quizzes INTEGER DEFAULT 0,
    completed_quizzes INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_study_time INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    first_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. Políticas RLS Criadas
- ✅ "Enable insert for all users" - Permite inserção
- ✅ "Enable select for all users" - Permite leitura
- ✅ "Enable update for all users" - Permite atualização
- ✅ "Enable delete for all users" - Permite exclusão

## Após Executar o Script

1. **Teste a aplicação** - Acesse `http://localhost:3001/dashboard`
2. **Verifique se o dashboard carrega** - O erro de criação de perfil deve estar resolvido
3. **Teste outras funcionalidades** - Flashcards, quizzes, etc.

## Observações Importantes

⚠️ **Atenção**: Este script irá **apagar todos os dados** da tabela `student_profiles` existentes. Se você tiver dados importantes nesta tabela, faça backup antes de executar.

✅ **Benefício**: Após a correção, você poderá usar emails como identificadores de usuário, o que é mais prático para o sistema.

## Próximos Passos

1. Execute o script SQL no painel do Supabase
2. Teste a funcionalidade do dashboard na aplicação
3. Verifique se o erro `❌ Erro ao criar perfil inicial: {}` foi resolvido 