-- 062_fix_rls_paid_users.sql
-- CORRIGIR RLS PARA PAID_USERS

-- 1. DESABILITAR RLS TEMPORARIAMENTE PARA PAID_USERS
ALTER TABLE public.paid_users DISABLE ROW LEVEL SECURITY;

-- 2. CRIAR POLÍTICA PARA PERMITIR LEITURA PÚBLICA
DROP POLICY IF EXISTS "Allow public read access to paid_users" ON public.paid_users;
CREATE POLICY "Allow public read access to paid_users" 
ON public.paid_users FOR SELECT 
USING (true);

-- 3. REABILITAR RLS
ALTER TABLE public.paid_users ENABLE ROW LEVEL SECURITY;

-- 4. VERIFICAR DADOS
SELECT 'PAID_USERS CONFIGURADO PARA ACESSO PÚBLICO' as status;
SELECT email, status FROM public.paid_users; 