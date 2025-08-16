-- Script para inserir e-mails de usuários do Memberkit na tabela paid_users
-- Substitua os e-mails de exemplo pelos e-mails reais dos seus usuários.

INSERT INTO paid_users (email) VALUES
('usuario1@seucurso.com'),
('usuario2@seucurso.com'),
('usuario3@seucurso.com'),
('geisonhoehr@gmail.com') -- Inclua seu próprio e-mail se ainda não estiver lá
-- Adicione mais linhas (email),
-- para cada e-mail de usuário do seu curso
ON CONFLICT (email) DO NOTHING; -- Isso evita erros se um e-mail já existir
