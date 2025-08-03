-- Script simples para configurar storage de avatares
-- Data: 2025-01-28

-- 1. CRIAR BUCKET PARA AVATARES
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-avatars',
  'user-avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. CRIAR TABELA DE PERFIS (se não existir)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. HABILITAR RLS NA TABELA PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS RLS SIMPLES PARA PROFILES
-- Permitir que usuários vejam seus próprios perfis
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Permitir que usuários insiram seus próprios perfis
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Permitir que usuários atualizem seus próprios perfis
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 5. CRIAR POLÍTICAS RLS SIMPLES PARA STORAGE
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

-- 6. CRIAR FUNÇÃO PARA ATUALIZAR TIMESTAMP
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. CRIAR TRIGGER PARA ATUALIZAR TIMESTAMP
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 8. VERIFICAÇÃO FINAL
SELECT '=== VERIFICAÇÃO FINAL ===' as info;

-- Verificar se o bucket foi criado
SELECT 
  'Bucket criado:' as tipo,
  id,
  name,
  public,
  file_size_limit
FROM storage.buckets 
WHERE id = 'user-avatars';

-- Verificar se a tabela profiles existe
SELECT 
  'Tabela profiles:' as tipo,
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT 
  'Políticas RLS:' as tipo,
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE tablename IN ('profiles', 'objects')
ORDER BY tablename, policyname;

SELECT '=== SCRIPT CONCLUÍDO ===' as info; 