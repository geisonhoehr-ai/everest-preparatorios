-- 060_complete_reset.sql
-- RESET COMPLETO - LIMPAR TUDO E RECOMEÇAR

-- 1. DELETAR TODOS OS USUÁRIOS DE AUTH (CASCADE VAI LIMPAR TUDO)
DELETE FROM auth.users;

-- 2. LIMPAR TABELAS RELACIONADAS (POR GARANTIA)
DELETE FROM public.user_roles;
DELETE FROM public.paid_users;
DELETE FROM public.student_profiles;
DELETE FROM public.sm2_progress;
DELETE FROM public.wrong_cards;

-- 3. RESETAR SEQUENCES (IDs VOLTAM PARA 1)
ALTER SEQUENCE IF EXISTS public.user_roles_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.paid_users_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.wrong_cards_id_seq RESTART WITH 1;

-- 4. INSERIR USUÁRIOS PAGOS (PREPARAR PARA SIGNUP)
INSERT INTO public.paid_users (email, status, created_at) VALUES
('aluno@teste.com', 'active', NOW()),
('professor@teste.com', 'active', NOW()),
('admin@teste.com', 'active', NOW());

-- 5. CONFIRMAR LIMPEZA
SELECT 'RESET COMPLETO REALIZADO!' as status;
SELECT COUNT(*) as usuarios_auth FROM auth.users;
SELECT COUNT(*) as usuarios_roles FROM public.user_roles;
SELECT COUNT(*) as usuarios_pagos FROM public.paid_users; 