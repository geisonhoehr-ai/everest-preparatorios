-- SCRIPT PARA REMOVER INTEGRAÇÃO COM GOOGLE DRIVE
-- Este script remove todas as colunas e funcionalidades relacionadas ao Google Drive

-- 1. REMOVER COLUNAS DA TABELA TURMAS
ALTER TABLE turmas DROP COLUMN IF EXISTS drive_folder_id;
ALTER TABLE turmas DROP COLUMN IF EXISTS drive_folder_url;

-- 2. REMOVER COLUNAS DA TABELA STUDENT_PROFILES
ALTER TABLE student_profiles DROP COLUMN IF EXISTS drive_folder_id;
ALTER TABLE student_profiles DROP COLUMN IF EXISTS drive_folder_url;
ALTER TABLE student_profiles DROP COLUMN IF EXISTS drive_setup_date;

-- 3. REMOVER COLUNAS DA TABELA REDACOES
ALTER TABLE redacoes DROP COLUMN IF EXISTS storage_type;
ALTER TABLE redacoes DROP COLUMN IF EXISTS drive_files;
ALTER TABLE redacoes DROP COLUMN IF EXISTS migration_date;

-- 4. REMOVER ÍNDICES RELACIONADOS AO DRIVE
DROP INDEX IF EXISTS idx_turmas_drive_folder_id;
DROP INDEX IF EXISTS idx_student_profiles_drive_folder;
DROP INDEX IF EXISTS idx_turmas_drive_folder;

-- 5. REMOVER VIEWS RELACIONADAS AO DRIVE
DROP VIEW IF EXISTS v_drive_status;

-- 6. REMOVER FUNÇÕES RELACIONADAS AO DRIVE
DROP FUNCTION IF EXISTS auto_setup_drive_for_student();
DROP FUNCTION IF EXISTS get_drive_stats();

-- 7. REMOVER TRIGGERS RELACIONADOS AO DRIVE
DROP TRIGGER IF EXISTS trigger_auto_setup_drive ON alunos_turmas;

-- 8. REMOVER POLICIES RLS RELACIONADAS AO DRIVE
DROP POLICY IF EXISTS "Students can update own drive info" ON student_profiles;
DROP POLICY IF EXISTS "Teachers can view student drive info" ON student_profiles;

-- 9. VERIFICAR SE HÁ OUTRAS REFERÊNCIAS AO DRIVE
-- (Comentários removidos automaticamente com as colunas)

-- 10. CONFIRMAR REMOÇÃO
SELECT 
    'Tabelas atualizadas:' as info,
    COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('turmas', 'student_profiles', 'redacoes');

-- 11. VERIFICAR ESTRUTURA DAS TABELAS PRINCIPAIS
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('turmas', 'student_profiles', 'redacoes')
ORDER BY table_name, ordinal_position;

-- MENSAGEM DE CONFIRMAÇÃO
DO $$
BEGIN
    RAISE NOTICE '✅ Integração com Google Drive removida com sucesso!';
    RAISE NOTICE '📁 Todas as colunas, índices, views e funções relacionadas ao Drive foram removidas.';
    RAISE NOTICE '💾 O sistema agora usa exclusivamente o Supabase Storage.';
END $$; 