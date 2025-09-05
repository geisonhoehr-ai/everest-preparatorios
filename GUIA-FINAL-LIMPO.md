# GUIA FINAL - Transformar Everest Igual ao Poker 360

## Problema Identificado
Existe um trigger no Supabase que tenta inserir na tabela user_roles que nao existe mais.

## Solucao Final

### PASSO 1: Criar Estrutura
1. Execute TRANSFORMAR-EVEREST-LIMPO.sql no SQL Editor do Supabase
2. Aguarde a confirmacao de sucesso

### PASSO 2: Criar Usuarios
1. Execute CRIAR-USUARIOS-LIMPO.sql no SQL Editor do Supabase
2. Aguarde a confirmacao de sucesso

### PASSO 3: Testar o Sistema
1. Execute npm run dev
2. Acesse http://localhost:3000/login
3. Teste os logins:
   - aluno@teste.com / 123456
   - admin@teste.com / 123456
   - professor@teste.com / 123456

## Scripts Finais

1. TRANSFORMAR-EVEREST-LIMPO.sql - Cria estrutura limpa
2. CRIAR-USUARIOS-LIMPO.sql - Cria usuarios sem triggers
3. test-login.js - Testa sistema

## O Que Sera Criado

### Usuarios de Teste
- aluno@teste.com / 123456 (role: student)
- admin@teste.com / 123456 (role: admin)  
- professor@teste.com / 123456 (role: teacher)

### Estrutura Final
- Tabela user_profiles (igual ao Poker 360)
- Politicas RLS corretas
- Usuarios confirmados
- Perfis criados automaticamente

## Execute os Scripts

1. Primeiro: TRANSFORMAR-EVEREST-LIMPO.sql
2. Segundo: CRIAR-USUARIOS-LIMPO.sql
3. Terceiro: Teste o sistema

Agora deve funcionar perfeitamente!
