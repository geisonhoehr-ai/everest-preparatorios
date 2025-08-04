-- Script simplificado para corrigir storage RLS no Supabase
-- Usar apenas operações permitidas pelo usuário

-- 1. Verificar buckets existentes
SELECT name, public FROM storage.buckets;

-- 2. Criar bucket 'redacoes' se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('redacoes', 'redacoes', false, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- 3. Criar bucket 'redacao_imagens' se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('redacao_imagens', 'redacao_imagens', false, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 4. Criar bucket 'redacao_audio' se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('redacao_audio', 'redacao_audio', false, 52428800, ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'])
ON CONFLICT (id) DO NOTHING;

-- 5. Verificar se os buckets foram criados
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name IN ('redacoes', 'redacao_imagens', 'redacao_audio');

-- 6. Verificar políticas existentes (apenas leitura)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 7. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 8. Testar acesso do usuário atual
SELECT 
    'Current user info' as test,
    auth.uid() as user_id,
    auth.role() as user_role;

-- 9. Verificar se o usuário pode listar buckets
SELECT 
    'Can list buckets' as test,
    COUNT(*) as bucket_count
FROM storage.buckets;

-- 10. Instruções para configurar RLS via Dashboard
-- IMPORTANTE: As políticas RLS devem ser configuradas via Dashboard do Supabase
-- 1. Vá para Storage > Policies
-- 2. Adicione as seguintes políticas para o bucket 'redacoes':
--    - INSERT: auth.uid()::text = (storage.foldername(name))[1]
--    - SELECT: auth.uid()::text = (storage.foldername(name))[1] OR auth.role() = 'authenticated'
--    - UPDATE: auth.uid()::text = (storage.foldername(name))[1]
--    - DELETE: auth.uid()::text = (storage.foldername(name))[1]

-- 11. Comentário final
-- Este script cria apenas os buckets. As políticas RLS devem ser configuradas
-- manualmente via Dashboard do Supabase devido às limitações de permissão. 