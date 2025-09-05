# SOLUCOES PARA CONFIRMACAO DE EMAIL

## Problema
O Supabase ainda exige confirmacao de email mesmo com os campos preenchidos.

## Solucao 1: Forcar Confirmacao (Recomendado)
Execute FORCAR-CONFIRMACAO-EMAILS.sql no SQL Editor do Supabase

## Solucao 2: Recriar Usuarios
Execute RECRIAR-USUARIOS-CONFIRMADOS.sql no SQL Editor do Supabase

## Solucao 3: Desabilitar Confirmacao no Dashboard
1. Acesse Supabase Dashboard
2. Vá para Authentication > Settings
3. Clique em Email Auth
4. Desabilite "Enable email confirmations"
5. Salve as configurações

## Solucao 4: Usar Service Role Key
Criar um script que usa a service role key para criar usuários já confirmados.

## Teste apos Executar
```bash
node test-login.js
```

## Qual Solucao Tentar Primeiro?

1. **FORCAR-CONFIRMACAO-EMAILS.sql** - Tenta atualizar os usuários existentes
2. **RECRIAR-USUARIOS-CONFIRMADOS.sql** - Remove e recria os usuários
3. **Desabilitar no Dashboard** - Configuração global do Supabase

Recomendo tentar a Solucao 1 primeiro, depois a Solucao 2 se não funcionar.
