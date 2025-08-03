-- ===================================================================
-- SCRIPT PARA CONFIGURAR BUCKETS DO SUPABASE STORAGE
-- Execute no SQL Editor do Supabase para criar os buckets necessários
-- ===================================================================

-- 1. BUCKET PARA REDAÇÕES
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'redacoes',
  'redacoes',
  false,
  52428800, -- 50MB
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 52428800,
  allowed_mime_types = array['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- 2. BUCKET PARA ÁUDIO DE FEEDBACK
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'feedback-audio',
  'feedback-audio',
  false,
  10485760, -- 10MB
  array['audio/wav', 'audio/mp3', 'audio/ogg', 'audio/webm']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = array['audio/wav', 'audio/mp3', 'audio/ogg', 'audio/webm'];

-- 3. BUCKET PARA TEMPLATES DE REDAÇÃO
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'templates',
  'templates',
  true, -- Público para download dos templates
  5242880, -- 5MB
  array['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 5242880,
  allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png'];

-- 4. BUCKET PARA LIVROS E MATERIAIS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'biblioteca',
  'biblioteca',
  false, -- Privado, acesso controlado
  104857600, -- 100MB
  array['application/pdf', 'application/epub+zip', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 104857600,
  allowed_mime_types = array['application/pdf', 'application/epub+zip', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- ===================================================================
-- POLÍTICAS DE SEGURANÇA (RLS) PARA OS BUCKETS
-- ===================================================================

-- REDAÇÕES: Apenas usuários autenticados podem fazer upload
-- Alunos só veem suas próprias redações, professores veem todas
CREATE POLICY "Users can upload redações"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'redacoes' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view own redações"
ON storage.objects FOR SELECT
USING (bucket_id = 'redacoes' AND (auth.uid()::text = (storage.foldername(name))[1] OR 
       EXISTS (SELECT 1 FROM user_roles WHERE user_uuid = auth.uid() AND role IN ('teacher', 'admin'))));

-- FEEDBACK AUDIO: Apenas professores podem fazer upload
CREATE POLICY "Teachers can upload feedback audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'feedback-audio' AND 
            EXISTS (SELECT 1 FROM user_roles WHERE user_uuid = auth.uid() AND role IN ('teacher', 'admin')));

CREATE POLICY "Students can view their feedback audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'feedback-audio' AND (
       auth.uid()::text = (storage.foldername(name))[1] OR 
       EXISTS (SELECT 1 FROM user_roles WHERE user_uuid = auth.uid() AND role IN ('teacher', 'admin'))
));

-- TEMPLATES: Público para leitura, apenas admins para escrita
CREATE POLICY "Public can view templates"
ON storage.objects FOR SELECT
USING (bucket_id = 'templates');

CREATE POLICY "Admins can upload templates"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'templates' AND 
            EXISTS (SELECT 1 FROM user_roles WHERE user_uuid = auth.uid() AND role = 'admin'));

-- BIBLIOTECA: Apenas usuários pagos podem acessar
CREATE POLICY "Paid users can view biblioteca"
ON storage.objects FOR SELECT
USING (bucket_id = 'biblioteca' AND (
       EXISTS (SELECT 1 FROM paid_users WHERE email = auth.email() AND status = 'active') OR
       EXISTS (SELECT 1 FROM user_roles WHERE user_uuid = auth.uid() AND role IN ('teacher', 'admin'))
));

CREATE POLICY "Teachers can upload to biblioteca"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'biblioteca' AND 
            EXISTS (SELECT 1 FROM user_roles WHERE user_uuid = auth.uid() AND role IN ('teacher', 'admin')));

-- ===================================================================
-- VERIFICAR BUCKETS CRIADOS
-- ===================================================================
SELECT 
  name as bucket_name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
ORDER BY name;

-- ===================================================================
-- INSTRUÇÕES:
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Verifique se todos os buckets foram criados
-- 3. Teste as políticas de segurança
-- 4. Configure as permissões adicionais se necessário
-- =================================================================== 