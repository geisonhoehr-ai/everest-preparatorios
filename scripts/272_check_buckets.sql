-- Script para verificar se os buckets foram criados corretamente

-- 1. Verificar todos os buckets existentes
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets
ORDER BY name;

-- 2. Verificar especificamente o bucket 'redacoes'
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'redacoes';

-- 3. Tentar criar o bucket novamente se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('redacoes', 'redacoes', false, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- 4. Verificar novamente após tentativa de criação
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'redacoes';

-- 5. Contar total de buckets
SELECT 
    'Total buckets' as info,
    COUNT(*) as count
FROM storage.buckets; 