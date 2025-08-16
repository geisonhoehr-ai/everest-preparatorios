-- 🔧 Script para corrigir as políticas RLS da tabela redacao_imagens
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, vamos verificar qual coluna de usuário existe na tabela redacoes
SELECT 
    'Colunas de usuário na tabela redacoes:' as info;
    
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'redacoes' 
AND column_name IN ('aluno_id', 'user_uuid', 'user_id', 'usuario_id')
ORDER BY column_name;

-- 2. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Usuários podem ver imagens de suas próprias redações" ON redacao_imagens;
DROP POLICY IF EXISTS "Usuários podem inserir imagens em suas redações" ON redacao_imagens;
DROP POLICY IF EXISTS "Usuários podem atualizar imagens de suas redações" ON redacao_imagens;
DROP POLICY IF EXISTS "Usuários podem deletar imagens de suas redações" ON redacao_imagens;

-- 3. Criar políticas corrigidas usando user_uuid (que parece ser a coluna existente)
-- Política para SELECT
CREATE POLICY "Usuários podem ver imagens de suas próprias redações" 
ON redacao_imagens 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 
        FROM redacoes r 
        WHERE r.id = redacao_imagens.redacao_id 
        AND r.user_uuid = auth.uid()
    )
);

-- Política para INSERT
CREATE POLICY "Usuários podem inserir imagens em suas redações" 
ON redacao_imagens 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM redacoes r 
        WHERE r.id = redacao_imagens.redacao_id 
        AND r.user_uuid = auth.uid()
    )
);

-- Política para UPDATE
CREATE POLICY "Usuários podem atualizar imagens de suas redações" 
ON redacao_imagens 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 
        FROM redacoes r 
        WHERE r.id = redacao_imagens.redacao_id 
        AND r.user_uuid = auth.uid()
    )
);

-- Política para DELETE
CREATE POLICY "Usuários podem deletar imagens de suas redações" 
ON redacao_imagens 
FOR DELETE 
USING (
    EXISTS (
        SELECT 1 
        FROM redacoes r 
        WHERE r.id = redacao_imagens.redacao_id 
        AND r.user_uuid = auth.uid()
    )
);

-- 4. Alternativa: Se preferir políticas mais permissivas para teste
-- Descomente as linhas abaixo se quiser permitir acesso temporário a todos
/*
DROP POLICY IF EXISTS "Permitir tudo temporariamente" ON redacao_imagens;
CREATE POLICY "Permitir tudo temporariamente" 
ON redacao_imagens 
FOR ALL 
USING (true) 
WITH CHECK (true);
*/

-- 5. Verificar políticas criadas
SELECT 
    'Políticas RLS da tabela redacao_imagens:' as info;
    
SELECT 
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'redacao_imagens'
ORDER BY policyname;

-- 6. Status final
SELECT 
    'Status Final' as sistema,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'redacao_imagens')
        THEN '✅ Tabela redacao_imagens existe'
        ELSE '❌ Tabela redacao_imagens não existe'
    END as tabela,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'redacao_imagens')
        THEN '✅ RLS configurado'
        ELSE '❌ RLS não configurado'
    END as rls,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'redacao_imagens') as qtd_policies;