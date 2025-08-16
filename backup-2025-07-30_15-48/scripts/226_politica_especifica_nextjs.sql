-- 🎯 POLÍTICA ESPECÍFICA PARA NEXT.JS
-- Execute este script no SQL Editor do Supabase
-- Política mais específica para resolver o erro do storage-js

-- 1. LIMPEZA
SELECT 
    '=== LIMPEZA ===' as info;

-- Remover política atual de INSERT
DROP POLICY IF EXISTS "Allow upload for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "temp_allow_all_uploads" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_upload_redacoes" ON storage.objects;

-- 2. CRIAR POLÍTICA MAIS ESPECÍFICA
SELECT 
    '=== CRIANDO POLÍTICA ESPECÍFICA ===' as info;

-- Política mais específica para Next.js
CREATE POLICY "authenticated_upload_redacoes" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'redacoes' AND 
  auth.uid() IS NOT NULL
);

-- 3. VERIFICAR POLÍTICA CRIADA
SELECT 
    '=== VERIFICANDO POLÍTICA ===' as info;

SELECT 
    'Política criada:' as tipo,
    policyname as nome,
    cmd as operacao,
    roles as usuarios,
    qual as condicao
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname = 'authenticated_upload_redacoes';

-- 4. INSTRUÇÕES PARA TESTE
SELECT 
    '=== INSTRUÇÕES PARA TESTE ===' as info;

SELECT 
    '✅ Política específica criada' as resultado;
SELECT 
    '✅ Execute o debug de autenticação' as resultado;
SELECT 
    '✅ Teste o upload com o código otimizado' as resultado;

-- 5. CÓDIGO DE UPLOAD OTIMIZADO
SELECT 
    '=== CÓDIGO DE UPLOAD OTIMIZADO ===' as info;

SELECT 
    'const uploadFile = async (file) => {' as codigo;
SELECT 
    '  try {' as codigo;
SELECT 
    '    console.log("🚀 Iniciando upload...");' as codigo;
SELECT 
    '    const { data: { user }, error: authError } = await supabase.auth.getUser();' as codigo;
SELECT 
    '    if (authError || !user) throw new Error("Usuário não autenticado");' as codigo;
SELECT 
    '    const fileName = `${user.id}/${Date.now()}.${file.name.split(".").pop()}`;' as codigo;
SELECT 
    '    const { data, error } = await supabase.storage.from("redacoes").upload(fileName, file);' as codigo;
SELECT 
    '    if (error) throw error;' as codigo;
SELECT 
    '    return data;' as codigo;
SELECT 
    '  } catch (error) {' as codigo;
SELECT 
    '    console.error("💥 Erro:", error);' as codigo;
SELECT 
    '    throw error;' as codigo;
SELECT 
    '  }' as codigo;
SELECT 
    '};' as codigo;