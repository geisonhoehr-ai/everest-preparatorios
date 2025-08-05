# 🔧 Solução para Erro de Refresh Token do Supabase

## ❌ Problema
```
AuthApiError: Invalid Refresh Token: Refresh Token Not Found
```

## ✅ Soluções Rápidas

### 1. **Limpeza Manual (Mais Rápida)**
Abra o console do navegador (F12) e execute:

```javascript
// Limpar localStorage
localStorage.clear()

// Limpar sessionStorage  
sessionStorage.clear()

// Recarregar a página
window.location.reload()
```

### 2. **Limpeza Específica do Supabase**
```javascript
// Remover apenas dados do Supabase
const keysToRemove = []
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i)
  if (key && (key.includes('supabase') || key.includes('sb-'))) {
    keysToRemove.push(key)
  }
}
keysToRemove.forEach(key => localStorage.removeItem(key))
```

### 3. **Usando o Componente AuthTokenFix**
Adicione o componente `AuthTokenFix` na página de login:

```tsx
import { AuthTokenFix } from '@/components/auth-token-fix'

// No seu componente de login
{showTokenFix && <AuthTokenFix />}
```

### 4. **Script de Diagnóstico**
Execute o script de diagnóstico:

```bash
node fix_refresh_token.js
```

## 🔍 Causas Comuns

1. **Token Expirado**: O refresh token expirou e não foi renovado
2. **Dados Corrompidos**: Dados de autenticação corrompidos no localStorage
3. **Configuração Incorreta**: Problemas na configuração do cliente Supabase
4. **Cache do Navegador**: Cache antigo interferindo na autenticação

## 🛠️ Prevenção

### 1. **Melhorar Tratamento de Erros**
No arquivo `lib/auth-simple.ts`, já implementamos:

```typescript
if (error.message?.includes('Refresh Token')) {
  console.log('🔄 [AUTH] Token expirado, limpando sessão...')
  try {
    await supabase.auth.signOut()
    console.log('✅ [AUTH] Sessão limpa com sucesso')
  } catch (signOutError) {
    console.error('❌ [AUTH] Erro ao limpar sessão:', signOutError)
  }
}
```

### 2. **Configuração Otimizada**
No arquivo `lib/supabase/client.ts`:

```typescript
{
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
}
```

## 🚀 Solução Automática

### 1. **Detectar o Erro**
```typescript
// No seu hook de autenticação
if (error?.message?.includes('Refresh Token')) {
  // Mostrar componente de correção
  setShowTokenFix(true)
}
```

### 2. **Limpeza Automática**
```typescript
const clearAuthData = async () => {
  // Limpar localStorage
  localStorage.clear()
  
  // Fazer logout
  await supabase.auth.signOut()
  
  // Recarregar página
  window.location.reload()
}
```

## 📋 Checklist de Verificação

- [ ] Limpar localStorage e sessionStorage
- [ ] Fazer logout e login novamente
- [ ] Verificar variáveis de ambiente do Supabase
- [ ] Reiniciar servidor de desenvolvimento
- [ ] Limpar cache do navegador
- [ ] Verificar configuração do cliente Supabase

## 🎯 Resultado Esperado

Após aplicar as soluções:
- ✅ Erro de refresh token resolvido
- ✅ Login funcionando normalmente
- ✅ Sessão persistindo corretamente
- ✅ Auto-refresh de tokens funcionando

## 📞 Suporte

Se o problema persistir:
1. Verifique os logs no console do navegador
2. Execute o script de diagnóstico
3. Verifique a configuração do Supabase no painel
4. Entre em contato com o suporte técnico 