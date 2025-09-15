-- DESABILITAR CONFIRMAÇÃO DE EMAIL NO SUPABASE
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar configurações atuais
SELECT 'Configurações atuais:' as status;
SELECT * FROM auth.config;

-- 2. Atualizar configuração para não exigir confirmação
UPDATE auth.config 
SET 
  enable_signup = true,
  enable_confirmations = false,
  enable_recoveries = true,
  enable_email_change = true
WHERE id = 1;

-- 3. Verificar se foi atualizado
SELECT 'Configurações após atualização:' as status;
SELECT * FROM auth.config;