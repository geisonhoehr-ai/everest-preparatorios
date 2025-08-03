-- Script SEGURO para configurar avatar storage
-- Data: 2025-01-28
-- NÃO AFETA: auth.users, user_roles, login, permissões
-- APENAS ADICIONA: bucket storage e coluna user_id opcional

-- 1. CRIAR BUCKET PARA AVATARES (SEGURANÇA TOTAL)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-avatars',
  'user-avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. CRIAR POLÍTICAS RLS PARA STORAGE (SEGURANÇA TOTAL)
-- Permitir upload de avatares para todos os usuários autenticados
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-avatars' AND 
    auth.role() = 'authenticated'
  );

-- Permitir visualização pública de avatares
CREATE POLICY "Public can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-avatars');

-- Permitir que usuários autenticados atualizem avatares
CREATE POLICY "Authenticated users can update avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'user-avatars' AND 
    auth.role() = 'authenticated'
  );

-- Permitir que usuários autenticados deletem avatares
CREATE POLICY "Authenticated users can delete avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-avatars' AND 
    auth.role() = 'authenticated'
  );

-- 3. ADICIONAR COLUNA user_id À TABELA PROFILES (OPCIONAL)
-- Só adiciona se não existir, não quebra nada
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN user_id UUID;
    RAISE NOTICE 'Coluna user_id adicionada com sucesso (opcional)';
  ELSE
    RAISE NOTICE 'Coluna user_id já existe';
  END IF;
END $$;

-- 4. VERIFICAÇÃO DE SEGURANÇA
SELECT '=== VERIFICAÇÃO DE SEGURANÇA ===' as info;

-- Verificar se auth.users não foi afetada
SELECT 
  'Auth users intacta:' as tipo,
  COUNT(*) as total_users
FROM auth.users;

-- Verificar se user_roles não foi afetada
SELECT 
  'User roles intacta:' as tipo,
  COUNT(*) as total_roles
FROM user_roles;

-- Verificar se o bucket foi criado
SELECT 
  'Bucket criado:' as tipo,
  id,
  name,
  public,
  file_size_limit
FROM storage.buckets 
WHERE id = 'user-avatars';

-- Verificar políticas RLS do storage
SELECT 
  'Políticas RLS Storage:' as tipo,
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE tablename = 'objects' AND cmd LIKE '%user-avatars%'
ORDER BY policyname;

SELECT '=== SCRIPT SEGURO CONCLUÍDO ===' as info; 