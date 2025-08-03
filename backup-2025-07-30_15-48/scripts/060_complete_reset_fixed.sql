-- 060_complete_reset_fixed.sql
-- RESET COMPLETO - VERSÃO CORRIGIDA

-- 1. DELETAR TODOS OS USUÁRIOS DE AUTH (CASCADE VAI LIMPAR TUDO)
DELETE FROM auth.users;

-- 2. LIMPAR APENAS TABELAS QUE EXISTEM
DELETE FROM public.user_roles WHERE true;
DELETE FROM public.paid_users WHERE true;

-- 3. LIMPAR OUTRAS TABELAS SE EXISTIREM (COM VERIFICAÇÃO)
DO $$
BEGIN
    -- Deletar da tabela wrong_cards se existir
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'wrong_cards') THEN
        DELETE FROM public.wrong_cards;
    END IF;
    
    -- Deletar da tabela student_profiles se existir
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'student_profiles') THEN
        DELETE FROM public.student_profiles;
    END IF;
END $$;

-- 4. RESETAR SEQUENCES (SE EXISTIREM)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.sequences WHERE sequence_schema = 'public' AND sequence_name = 'user_roles_id_seq') THEN
        ALTER SEQUENCE public.user_roles_id_seq RESTART WITH 1;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.sequences WHERE sequence_schema = 'public' AND sequence_name = 'paid_users_id_seq') THEN
        ALTER SEQUENCE public.paid_users_id_seq RESTART WITH 1;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.sequences WHERE sequence_schema = 'public' AND sequence_name = 'wrong_cards_id_seq') THEN
        ALTER SEQUENCE public.wrong_cards_id_seq RESTART WITH 1;
    END IF;
END $$;

-- 5. INSERIR USUÁRIOS PAGOS (PREPARAR PARA SIGNUP)
INSERT INTO public.paid_users (email, status, created_at) VALUES
('aluno@teste.com', 'active', NOW()),
('professor@teste.com', 'active', NOW()),
('admin@teste.com', 'active', NOW());

-- 6. CONFIRMAR LIMPEZA
SELECT 'RESET COMPLETO REALIZADO COM SUCESSO!' as status;
SELECT COUNT(*) as usuarios_auth FROM auth.users;
SELECT COUNT(*) as usuarios_roles FROM public.user_roles;
SELECT COUNT(*) as usuarios_pagos FROM public.paid_users; 