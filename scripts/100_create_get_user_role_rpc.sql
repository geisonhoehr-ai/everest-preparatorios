-- Cria RPC segura para obter o role do usuário autenticado
-- Execute este script no SQL Editor do Supabase

-- Garantir que a tabela exista
-- CREATE TABLE IF NOT EXISTS public.user_roles (
--   id bigserial primary key,
--   user_uuid text unique not null,
--   email text unique,
--   role text not null default 'student',
--   created_at timestamptz default now(),
--   updated_at timestamptz default now()
-- );

-- Criar função que retorna o role do usuário atual usando auth.uid()
create or replace function public.get_role_for_current_user()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  current_role text;
begin
  select ur.role into current_role
  from public.user_roles ur
  where ur.user_uuid = auth.uid()::text
  limit 1;

  if current_role is null then
    return 'student';
  end if;

  return current_role;
end;
$$;

-- Permissões para execução da função
grant execute on function public.get_role_for_current_user() to anon, authenticated;


