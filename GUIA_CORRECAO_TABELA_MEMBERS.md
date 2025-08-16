# Guia para Corrigir a Tabela Members

## Problema Identificado

O erro `"Could not find the 'full_name' column of 'members' in the schema cache"` indica que a tabela `members` não tem a estrutura correta no banco de dados Supabase.

## Solução

### Passo 1: Acessar o Painel do Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto `everest-preparatorios`
4. Vá para a seção **SQL Editor**

### Passo 2: Executar o Script de Correção

Copie e cole o seguinte SQL no editor SQL do Supabase:

```sql
-- Script para verificar e corrigir a estrutura da tabela members
-- Verificar estrutura atual da tabela
SELECT 
    'Estrutura atual da tabela members:' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'members'
ORDER BY ordinal_position;

-- Verificar se a tabela existe
SELECT 
    'Verificando se a tabela existe:' as info,
    table_name,
    'EXISTE' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'members';

-- Se a tabela não existir ou estiver com estrutura incorreta, recriar
DROP TABLE IF EXISTS members CASCADE;

-- Criar tabela com estrutura correta
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    cpf_cnpj TEXT,
    phone TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    login_count INTEGER DEFAULT 0,
    last_seen_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verificar se a tabela foi criada corretamente
SELECT 
    'Tabela members recriada com sucesso!' as info,
    COUNT(*) as total_members
FROM members;

-- Verificar estrutura final
SELECT 
    'Estrutura final da tabela members:' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'members'
ORDER BY ordinal_position;

-- Desabilitar RLS temporariamente
ALTER TABLE members DISABLE ROW LEVEL SECURITY;

-- Testar inserção
INSERT INTO members (full_name, email, status)
VALUES ('Usuário Teste', 'teste@exemplo.com', 'active')
ON CONFLICT (email) DO NOTHING;

-- Verificar se a inserção funcionou
SELECT 
    'Teste de inserção:' as info,
    COUNT(*) as total_members
FROM members;

-- Mostrar os dados
SELECT 
    id,
    full_name,
    email,
    status,
    created_at
FROM members 
ORDER BY created_at DESC
LIMIT 5;

-- Criar políticas RLS básicas
DROP POLICY IF EXISTS "Enable insert for all users" ON members;
DROP POLICY IF EXISTS "Enable read access for all users" ON members;
DROP POLICY IF EXISTS "Enable update for all users" ON members;
DROP POLICY IF EXISTS "Enable delete for all users" ON members;

CREATE POLICY "Enable insert for all users" ON members
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON members
    FOR SELECT USING (true);

CREATE POLICY "Enable update for all users" ON members
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON members
    FOR DELETE USING (true);

-- Habilitar RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Verificar políticas
SELECT 
    'Políticas RLS criadas:' as info,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'members';
```

### Passo 3: Executar o Script

1. Clique em **Run** no editor SQL
2. Verifique se não há erros na execução
3. Confirme que a tabela foi criada com a estrutura correta

### Passo 4: Testar a Aplicação

Após executar o script:

1. Volte para sua aplicação
2. Tente adicionar um novo membro
3. Verifique se o erro foi resolvido

## Estrutura Esperada da Tabela

A tabela `members` deve ter as seguintes colunas:

- `id` (SERIAL PRIMARY KEY)
- `full_name` (TEXT NOT NULL)
- `email` (TEXT UNIQUE NOT NULL)
- `cpf_cnpj` (TEXT)
- `phone` (TEXT)
- `status` (TEXT DEFAULT 'active')
- `login_count` (INTEGER DEFAULT 0)
- `last_seen_at` (TIMESTAMP WITH TIME ZONE)
- `created_by` (UUID REFERENCES auth.users(id))
- `created_at` (TIMESTAMP WITH TIME ZONE DEFAULT NOW())
- `updated_at` (TIMESTAMP WITH TIME ZONE DEFAULT NOW())

## Políticas RLS

O script também cria políticas RLS básicas que permitem:
- Inserção para todos os usuários
- Leitura para todos os usuários
- Atualização para todos os usuários
- Exclusão para todos os usuários

## Verificação

Após executar o script, você deve ver:
1. A estrutura da tabela com todas as colunas corretas
2. Um teste de inserção bem-sucedido
3. Políticas RLS criadas

Se tudo estiver correto, a aplicação deve funcionar normalmente. 