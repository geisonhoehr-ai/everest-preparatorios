-- Criar perfil de Admin
-- Execute este SQL no Supabase SQL Editor

-- Desabilitar RLS temporariamente
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Inserir perfil de Admin
INSERT INTO public.user_profiles (user_id, role, display_name)
VALUES (
    '00000000-0000-0000-0000-000000000001', -- ID temporário para admin
    'admin',
    'Administrador Everest'
)
ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();

-- Reabilitar RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Verificar resultado
SELECT * FROM public.user_profiles WHERE role = 'admin';

