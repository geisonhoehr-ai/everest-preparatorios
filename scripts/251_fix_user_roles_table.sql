-- Script para corrigir a tabela user_roles
-- Altera o campo user_uuid de uuid para text para aceitar emails

-- 1. Verificar se a tabela existe e sua estrutura atual
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_roles';

-- 2. Dropar a tabela se existir (cuidado: isso apaga todos os dados)
DROP TABLE IF EXISTS user_roles CASCADE;

-- 3. Recriar a tabela com a estrutura correta
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_uuid TEXT NOT NULL UNIQUE, -- Alterado de UUID para TEXT para aceitar emails
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar índice para melhor performance
CREATE INDEX idx_user_roles_user_uuid ON user_roles(user_uuid);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- 5. Desabilitar RLS temporariamente para inserção de dados de teste
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- 6. Inserir dados de teste para verificar se está funcionando
INSERT INTO user_roles (user_uuid, role) VALUES 
('teste@example.com', 'student'),
('admin@example.com', 'admin'),
('teacher@example.com', 'teacher');

-- 7. Verificar se os dados foram inseridos corretamente
SELECT * FROM user_roles;

-- 8. Reabilitar RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 9. Criar políticas RLS permissivas (temporariamente)
CREATE POLICY "Enable insert for all users" ON user_roles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for all users" ON user_roles FOR SELECT USING (true);
CREATE POLICY "Enable update for all users" ON user_roles FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON user_roles FOR DELETE USING (true);

-- 10. Verificar as políticas criadas
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_roles';

-- 11. Limpar dados de teste
DELETE FROM user_roles WHERE user_uuid IN ('teste@example.com', 'admin@example.com', 'teacher@example.com');

-- 12. Verificar estrutura final
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_roles'
ORDER BY ordinal_position; 