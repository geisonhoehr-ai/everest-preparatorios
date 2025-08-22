-- Corrigir a função RPC get_role_for_current_user que está retornando null
-- Execute este script no SQL Editor do Supabase

-- Primeiro, vamos verificar se a função existe e como está
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname = 'get_role_for_current_user';

-- Agora vamos recriar a função com a lógica corrigida
CREATE OR REPLACE FUNCTION public.get_role_for_current_user()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  current_role text;
BEGIN
  -- Obter o ID do usuário autenticado
  current_user_id := auth.uid();
  
  -- Debug: log do ID do usuário
  RAISE NOTICE 'Usuário autenticado ID: %', current_user_id;
  
  -- Se não há usuário autenticado, retornar null
  IF current_user_id IS NULL THEN
    RAISE NOTICE 'Nenhum usuário autenticado';
    RETURN 'student';
  END IF;
  
  -- Buscar o role do usuário
  SELECT ur.role INTO current_role
  FROM public.user_roles ur
  WHERE ur.user_uuid = current_user_id::text
  LIMIT 1;
  
  -- Debug: log do resultado
  RAISE NOTICE 'Role encontrado: %', current_role;
  
  -- Se não encontrou role, retornar 'student' como padrão
  IF current_role IS NULL THEN
    RAISE NOTICE 'Role não encontrado, retornando student como padrão';
    RETURN 'student';
  END IF;
  
  -- Retornar o role encontrado
  RAISE NOTICE 'Retornando role: %', current_role;
  RETURN current_role;
END;
$$;

-- Garantir permissões
GRANT EXECUTE ON FUNCTION public.get_role_for_current_user() TO anon, authenticated;

-- Testar a função
-- SELECT public.get_role_for_current_user() as current_role;

-- Verificar se a função foi criada corretamente
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname = 'get_role_for_current_user';
