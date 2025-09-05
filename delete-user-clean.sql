-- Script limpo para excluir usuario e resolver erros de foreign key
-- Execute no SQL Editor do Supabase Dashboard

-- Verificar dependencias
SELECT 'courses' as tabela, COUNT(*) as total FROM courses WHERE teacher_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6'
UNION ALL
SELECT 'temas_redacao' as tabela, COUNT(*) as total FROM temas_redacao WHERE criado_por = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6'
UNION ALL
SELECT 'user_profiles' as tabela, COUNT(*) as total FROM user_profiles WHERE user_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- Atualizar courses
UPDATE courses SET teacher_id = NULL WHERE teacher_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- Atualizar temas_redacao
UPDATE temas_redacao SET criado_por = NULL WHERE criado_por = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- Excluir user_profiles
DELETE FROM user_profiles WHERE user_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- Verificar se nao ha mais dependencias
SELECT 'courses' as tabela, COUNT(*) as total FROM courses WHERE teacher_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6'
UNION ALL
SELECT 'temas_redacao' as tabela, COUNT(*) as total FROM temas_redacao WHERE criado_por = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6'
UNION ALL
SELECT 'user_profiles' as tabela, COUNT(*) as total FROM user_profiles WHERE user_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- Excluir usuario
DELETE FROM auth.users WHERE id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- Verificar resultado final
SELECT 'auth.users' as tabela, COUNT(*) as total FROM auth.users WHERE id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6'
UNION ALL
SELECT 'courses' as tabela, COUNT(*) as total FROM courses WHERE teacher_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6'
UNION ALL
SELECT 'temas_redacao' as tabela, COUNT(*) as total FROM temas_redacao WHERE criado_por = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6'
UNION ALL
SELECT 'user_profiles' as tabela, COUNT(*) as total FROM user_profiles WHERE user_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';
