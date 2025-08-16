-- Script para corrigir as políticas RLS da tabela redacoes

-- Habilitar RLS na tabela redacoes
ALTER TABLE redacoes ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes conflitantes
DROP POLICY IF EXISTS "Users can insert their own redacoes" ON redacoes;
DROP POLICY IF EXISTS "Users can view their own redacoes" ON redacoes;
DROP POLICY IF EXISTS "Users can update their own redacoes" ON redacoes;
DROP POLICY IF EXISTS "Users can delete their own redacoes" ON redacoes;
DROP POLICY IF EXISTS "Teachers can view all redacoes" ON redacoes;
DROP POLICY IF EXISTS "Teachers can update all redacoes" ON redacoes;

-- Criar políticas para alunos (podem inserir, visualizar e atualizar suas próprias redações)
CREATE POLICY "Users can insert their own redacoes" ON redacoes
    FOR INSERT WITH CHECK (auth.uid() = user_uuid);

CREATE POLICY "Users can view their own redacoes" ON redacoes
    FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "Users can update their own redacoes" ON redacoes
    FOR UPDATE USING (auth.uid() = user_uuid);

-- Criar políticas para professores (podem visualizar e atualizar todas as redações)
CREATE POLICY "Teachers can view all redacoes" ON redacoes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_uuid = auth.uid() 
            AND role = 'teacher'
        )
    );

CREATE POLICY "Teachers can update all redacoes" ON redacoes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_uuid = auth.uid() 
            AND role = 'teacher'
        )
    );

-- Verificar políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'redacoes'
ORDER BY policyname;

-- Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'redacoes'; 