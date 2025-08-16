-- 🚀 Script SIMPLES para corrigir a tabela redacao_imagens
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar estrutura da tabela redacoes
SELECT 
    'Estrutura da tabela redacoes:' as info;
    
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'redacoes'
ORDER BY ordinal_position;

-- 2. Opção 1: Desabilitar RLS temporariamente (mais simples)
ALTER TABLE redacao_imagens DISABLE ROW LEVEL SECURITY;

SELECT '✅ RLS desabilitado temporariamente na tabela redacao_imagens' as status;

-- 3. Opção 2: Se preferir manter RLS, mas com política permissiva
/*
-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Usuários podem ver imagens de suas próprias redações" ON redacao_imagens;
DROP POLICY IF EXISTS "Usuários podem inserir imagens em suas redações" ON redacao_imagens;
DROP POLICY IF EXISTS "Usuários podem atualizar imagens de suas redações" ON redacao_imagens;
DROP POLICY IF EXISTS "Usuários podem deletar imagens de suas redações" ON redacao_imagens;

-- Criar uma política permissiva temporária
CREATE POLICY "Permitir tudo temporariamente" 
ON redacao_imagens 
FOR ALL 
USING (true) 
WITH CHECK (true);

SELECT '✅ Política permissiva criada temporariamente' as status;
*/

-- 4. Verificar status final
SELECT 
    'Status Final' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'redacao_imagens')
        THEN '✅ Tabela existe'
        ELSE '❌ Tabela não existe'
    END as tabela_existe,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE tablename = 'redacao_imagens' 
            AND rowsecurity = false
        )
        THEN '✅ RLS desabilitado'
        ELSE '⚠️ RLS ainda ativo'
    END as rls_status;

-- 5. Importante: Depois de testar, você deve reabilitar o RLS
-- ALTER TABLE redacao_imagens ENABLE ROW LEVEL SECURITY;