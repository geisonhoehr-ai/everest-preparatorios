# Credenciais da Panda Video

## Configuração Atual

### Chave API
```
panda-3046a07e6e8a7ff8e7a9f20b13bb39513b25ee5c2d12bd7a0f452332abf0ae3e
```

### Client ID
```
3d69uvb4oqm1qoi8e74kvch1v4
```

### Client Secret
```
1fu129jsanubuet2thmetsih75cd4iv83r8ve3bcm33b5ka0im2c
```

### Endpoint da API
```
https://api.pandavideo.com/v2
```

## Como Usar

1. **Configurar variáveis de ambiente** no arquivo `.env.local`:
   ```env
   NEXT_PUBLIC_PANDA_VIDEO_API_KEY=panda-3046a07e6e8a7ff8e7a9f20b13bb39513b25ee5c2d12bd7a0f452332abf0ae3e
   NEXT_PUBLIC_PANDA_VIDEO_BASE_URL=https://api.pandavideo.com/v2
   NEXT_PUBLIC_PANDA_VIDEO_CLIENT_ID=3d69uvb4oqm1qoi8e74kvch1v4
   NEXT_PUBLIC_PANDA_VIDEO_CLIENT_SECRET=1fu129jsanubuet2thmetsih75cd4iv83r8ve3bcm33b5ka0im2c
   ```

2. **Testar a conexão** usando o componente de teste na página Evercast

3. **Gerenciar vídeos** usando o gerenciador de vídeos da Panda Video

## Segurança

⚠️ **Importante**: Estas credenciais são sensíveis e devem ser mantidas em segurança. Não as compartilhe publicamente.

- Use variáveis de ambiente para armazenar as credenciais
- Não commite as credenciais no repositório Git
- Use diferentes credenciais para desenvolvimento e produção
