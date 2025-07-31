# 🔍 Guia de Verificação Detalhada - Problemas Identificados

## 🎯 **Problemas Encontrados nos Logs**

### ❌ **Problema 1: Erro de Relacionamento no Banco**
```
❌ Erro ao buscar redações: {
  code: 'PGRST200',
  details: "Searched for a foreign key relationship between 'redacoes' and 'turmas' in the schema 'public', but no matches were found.",
  message: "Could not find a relationship between 'redacoes' and 'turmas' in the schema cache"
}
```

### ❌ **Problema 2: Erro de TypeScript**
```
Property 'avatar_url' does not exist on type '{ full_name: any; 
```

## 🔧 **Soluções Passo a Passo**

### **Passo 1: Executar Script de Correção do Banco**

Execute o script SQL para corrigir os problemas:

```bash
# No terminal, execute:
psql "postgresql://postgres:postgres@localhost:5432/postgres" -f scripts/249_fix_database_issues.sql
```

**Ou execute manualmente no Supabase SQL Editor:**

```sql
-- 1. Verificar estrutura atual
SELECT 
  'Tabela turmas existe:' as info,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'turmas'
  ) as turmas_existe;

-- 2. Verificar estrutura da tabela redacoes
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'redacoes'
ORDER BY ordinal_position;

-- 3. Verificar estrutura da tabela profiles
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;
```

### **Passo 2: Corrigir Relacionamento entre Redações e Turmas**

```sql
-- Adicionar coluna turma_id se não existir
ALTER TABLE redacoes ADD COLUMN IF NOT EXISTS turma_id TEXT;

-- Criar foreign key
ALTER TABLE redacoes 
ADD CONSTRAINT IF NOT EXISTS fk_redacoes_turma_id 
FOREIGN KEY (turma_id) REFERENCES turmas(id);

-- Criar turmas de teste
INSERT INTO turmas (id, nome, descricao, professor_uuid, codigo_acesso, periodo, ativa) VALUES 
('turma-teste-1', 'Turma de Teste 1', 'Turma para testes do sistema', '00000000-0000-0000-0000-000000000001', 'TESTE001', 'Manhã', true),
('turma-teste-2', 'Turma de Teste 2', 'Turma para testes do sistema', '00000000-0000-0000-0000-000000000001', 'TESTE002', 'Tarde', true)
ON CONFLICT (id) DO NOTHING;
```

### **Passo 3: Corrigir Estrutura da Tabela Profiles**

```sql
-- Adicionar colunas se não existirem
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Verificar estrutura final
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;
```

### **Passo 4: Verificar Correções**

```sql
-- Verificar se foreign key foi criada
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'redacoes';

-- Verificar dados de teste
SELECT COUNT(*) as total_turmas FROM turmas WHERE id LIKE 'turma-teste-%';
```

## 🧪 **Testes para Verificar Correções**

### **Teste 1: Verificar se o Erro de Relacionamento Sumiu**

1. Acesse a página do professor (`/teacher`)
2. Verifique no console se ainda aparece o erro:
```
❌ Erro ao buscar redações: Could not find a relationship between 'redacoes' and 'turmas'
```

**Resultado esperado:** O erro deve ter sumido.

### **Teste 2: Verificar se o Erro de TypeScript Sumiu**

1. Verifique se ainda aparece no terminal:
```
Property 'avatar_url' does not exist on type
```

**Resultado esperado:** O erro deve ter sumido.

### **Teste 3: Testar Funcionalidade de Redações**

1. Acesse `/redacao`
2. Tente fazer upload de uma redação
3. Verifique se salva corretamente

**Resultado esperado:** Upload deve funcionar sem erros.

## 🔍 **Logs Esperados Após Correção**

### **Logs Positivos:**
```
✅ [SUPABASE] Cliente criado com sucesso
✅ [AUTH_MANAGER] Instância única criada
✅ [MIDDLEWARE] User authenticated: true professor@teste.com
✅ [Server Action] Buscando redações do professor...
✅ Encontradas X redações
```

### **Logs que NÃO devem aparecer:**
```
❌ Could not find a relationship between 'redacoes' and 'turmas'
❌ Property 'avatar_url' does not exist
❌ Multiple GoTrueClient instances detected
❌ Failed to parse cookie string
```

## 🚨 **Se Ainda Houver Problemas**

### **Problema 1: Script SQL não executou**
```bash
# Verificar se o psql está instalado
psql --version

# Tentar conectar manualmente
psql "postgresql://postgres:postgres@localhost:5432/postgres"
```

### **Problema 2: Erro persiste após correção**
1. Verifique se o script foi executado completamente
2. Reinicie o servidor: `npm run dev`
3. Limpe cache do navegador

### **Problema 3: Novos erros aparecem**
1. Verifique os logs do console
2. Execute o script de verificação: `scripts/248_test_auth_system.sql`
3. Compare com os resultados esperados

## 📊 **Métricas de Sucesso**

✅ **Zero erros de relacionamento** no banco  
✅ **Zero erros de TypeScript** no terminal  
✅ **Upload de redações funcionando**  
✅ **Página do professor carregando** sem erros  
✅ **Logs limpos** no console  

---

🎯 **Objetivo:** Resolver os problemas específicos identificados nos logs para que o sistema funcione perfeitamente! 