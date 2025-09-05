# 🔐 Solução para Problemas de Autenticação

## 📋 Problema Identificado

Os usuários de teste (`aluno@teste.com`, `admin@teste.com`, `professor@teste.com`) foram criados no Supabase, mas não estão funcionando porque:

1. **Email não confirmado**: O Supabase está exigindo confirmação de email
2. **Usuários existem mas não podem fazer login** devido à falta de confirmação
3. **Perfis não foram criados** na tabela `user_profiles` porque o login falha

## 🛠️ Soluções Disponíveis

### Opção 1: Confirmar Emails Manualmente (Recomendado)

1. **Acesse o Supabase Dashboard**:
   - URL: https://supabase.com/dashboard
   - Projeto: `wruvehhfzkvmfyhxzmwo`

2. **Vá para Authentication > Users**:
   - Encontre os usuários: `aluno@teste.com`, `admin@teste.com`, `professor@teste.com`
   - Para cada usuário, clique em **"Confirm user"**
   - Ou clique em **"Send confirmation email"** se preferir

3. **Após confirmar, execute**:
   ```bash
   node setup-auth-direct.js test
   ```

### Opção 2: Desabilitar Confirmação de Email (Desenvolvimento)

1. **No Supabase Dashboard**:
   - Vá para **Authentication > Settings**
   - Desabilite **"Enable email confirmations"**
   - Salve as configurações

2. **Execute o script de criação**:
   ```bash
   node setup-auth-direct.js
   ```

3. **Teste os usuários**:
   ```bash
   node setup-auth-direct.js test
   ```

### Opção 3: Usar Service Role Key (Avançado)

Se você tiver acesso à Service Role Key, posso criar um script que usa permissões administrativas para confirmar usuários automaticamente.

## 🧪 Testando a Solução

Após implementar uma das opções acima, execute:

```bash
# Testar logins
node setup-auth-direct.js test

# Verificar perfis na tabela user_profiles
node setup-auth-direct.js
```

## 🗑️ Excluindo Usuários

Para excluir um usuário específico:

```bash
# Excluir usuário (substitua pelo email)
node setup-auth-direct.js delete professor@teste.com
```

**Nota**: Isso exclui apenas o perfil da tabela `user_profiles`. Para excluir completamente do `auth.users`, use o Supabase Dashboard.

## 📊 Status Atual dos Usuários

- ✅ **aluno@teste.com**: Criado, mas email não confirmado
- ✅ **admin@teste.com**: Criado, mas email não confirmado  
- ✅ **professor@teste.com**: Criado, mas email não confirmado

## 🔧 Scripts Disponíveis

1. **`setup-auth-direct.js`**: Script principal para criar e gerenciar usuários
2. **`confirm-users.js`**: Script para reenviar emails de confirmação
3. **`create-test-users.js`**: Script alternativo para criação de usuários
4. **`fix-auth-users.js`**: Script de diagnóstico

## 🚀 Próximos Passos

1. **Escolha uma das opções acima** para resolver a confirmação de email
2. **Execute os testes** para verificar se os usuários funcionam
3. **Crie os perfis** na tabela `user_profiles` se necessário
4. **Teste o login** na aplicação web

## 📞 Suporte

Se precisar de ajuda adicional:
- Verifique os logs do Supabase Dashboard
- Execute os scripts de diagnóstico
- Consulte a documentação do Supabase sobre autenticação
