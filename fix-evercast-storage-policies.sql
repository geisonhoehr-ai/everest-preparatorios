-- Verificar políticas existentes do bucket evercast-audio
SELECT * FROM storage.policies WHERE bucket_id = 'evercast-audio';

-- Remover políticas existentes se houver
DELETE FROM storage.policies WHERE bucket_id = 'evercast-audio';

-- Criar política para permitir upload público
INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression)
VALUES (
  'evercast-audio-upload-policy',
  'evercast-audio',
  'Permitir upload público de áudio',
  'true',
  'true'
);

-- Criar política para permitir leitura pública
INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression)
VALUES (
  'evercast-audio-read-policy',
  'evercast-audio',
  'Permitir leitura pública de áudio',
  'true',
  'true'
);

-- Verificar se o bucket está configurado como público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'evercast-audio';

-- Verificar configuração final
SELECT 
  id,
  name,
  public,
  created_at
FROM storage.buckets 
WHERE id = 'evercast-audio';

-- Verificar políticas criadas
SELECT 
  id,
  bucket_id,
  name,
  definition,
  check_expression
FROM storage.policies 
WHERE bucket_id = 'evercast-audio';
