-- 🚀 Script SIMPLES para corrigir políticas RLS do Storage
-- Execute este script no SQL Editor do Supabase

-- 1. Criar bucket se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'redacoes',
    'redacoes',
    false,
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Remover TODAS as políticas existentes do storage.objects
DROP POLICY IF EXISTS "Usuários podem fazer upload de arquivos de redação" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem ver arquivos de suas redações" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar arquivos de suas redações" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar arquivos de suas redações" ON storage.objects;

-- 3. Criar política SIMPLES para INSERT (permitir upload para usuários autenticados)
CREATE POLICY "Permitir upload para usuários autenticados" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
    bucket_id = 'redacoes' 
    AND auth.uid() IS NOT NULL
);

-- 4. Criar política SIMPLES para SELECT (permitir visualização para usuários autenticados)
CREATE POLICY "Permitir visualização para usuários autenticados" 
ON storage.objects 
FOR SELECT 
USING (
    bucket_id = 'redacoes' 
    AND auth.uid() IS NOT NULL
);

-- 5. Criar política SIMPLES para UPDATE
CREATE POLICY "Permitir atualização para usuários autenticados" 
ON storage.objects 
FOR UPDATE 
USING (
    bucket_id = 'redacoes' 
    AND auth.uid() IS NOT NULL
);

-- 6. Criar política SIMPLES para DELETE
CREATE POLICY "Permitir exclusão para usuários autenticados" 
ON storage.objects 
FOR DELETE 
USING (
    bucket_id = 'redacoes' 
    AND auth.uid() IS NOT NULL
);

-- 7. Habilitar RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 8. Verificar resultado
SELECT 
    'Políticas criadas:' as info,
    policyname as nome,
    cmd as operacao
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname; 