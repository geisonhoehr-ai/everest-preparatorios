-- Script para ver todos os usuários e criar os perfis faltantes
-- Execute este script no SQL Editor do Supabase

-- 1. Ver TODOS os usuários disponíveis
SELECT 
    id,
    email,
    created_at
FROM auth.users 
ORDER BY email;
