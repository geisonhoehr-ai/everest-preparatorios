-- Script para remover colunas Google Drive das tabelas
-- Data: 2025-01-25
-- Descrição: Remove todas as colunas relacionadas à integração Google Drive

BEGIN;

-- Remover colunas Google Drive da tabela turmas
ALTER TABLE turmas DROP COLUMN IF EXISTS drive_folder_id;
ALTER TABLE turmas DROP COLUMN IF EXISTS drive_folder_url;
ALTER TABLE turmas DROP COLUMN IF EXISTS auto_create_folders;
ALTER TABLE turmas DROP COLUMN IF EXISTS meta_alunos;
ALTER TABLE turmas DROP COLUMN IF EXISTS cor_tema;

-- Remover colunas Google Drive da tabela student_profiles
ALTER TABLE student_profiles DROP COLUMN IF EXISTS drive_folder_id;
ALTER TABLE student_profiles DROP COLUMN IF EXISTS drive_folder_url;
ALTER TABLE student_profiles DROP COLUMN IF EXISTS drive_setup_date;

-- Remover colunas Google Drive da tabela redacoes
ALTER TABLE redacoes DROP COLUMN IF EXISTS storage_type;
ALTER TABLE redacoes DROP COLUMN IF EXISTS drive_files;
ALTER TABLE redacoes DROP COLUMN IF EXISTS migration_date;

-- Remover trigger se existir
DROP TRIGGER IF EXISTS auto_setup_drive_for_student ON alunos_turmas;

-- Remover função se existir
DROP FUNCTION IF EXISTS setup_drive_for_student();

-- Verificar se as colunas foram removidas
SELECT 
    'turmas' as tabela,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'turmas' 
    AND column_name LIKE '%drive%'
UNION ALL
SELECT 
    'student_profiles' as tabela,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'student_profiles' 
    AND column_name LIKE '%drive%'
UNION ALL
SELECT 
    'redacoes' as tabela,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'redacoes' 
    AND (column_name LIKE '%drive%' OR column_name LIKE '%storage%' OR column_name LIKE '%migration%');

COMMIT;

-- Log da operação
DO $$
BEGIN
    RAISE NOTICE '✅ Colunas Google Drive removidas com sucesso das tabelas';
    RAISE NOTICE '📊 Estado atual das tabelas:';
    RAISE NOTICE '   - turmas: % colunas', (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'turmas');
    RAISE NOTICE '   - student_profiles: % colunas', (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'student_profiles');
    RAISE NOTICE '   - redacoes: % colunas', (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'redacoes');
END $$; 