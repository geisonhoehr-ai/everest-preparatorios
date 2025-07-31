# 🧪 Teste de Integração Pandavideo OAuth2 - CORRIGIDO

## **✅ Configuração Completa**

### **Credenciais OAuth2 Configuradas:**
- **Client ID:** `28444mbcl1t9570i0gfnod8l7i`
- **Client Secret:** `huvj3e0rqra9uu1vfm99olqk2hvi3f9na370fdeb32lbh9nhttb`
- **Callback URL:** `https://everestpreparatorios.com.br/api/pandavideo/callback`

## **🔧 Como Testar a Integração**

### **1. Página de Teste (Recomendado)**
```
http://localhost:3004/test-pandavideo
```

Esta página permite:
- ✅ **Verificar tokens** na URL e localStorage
- ✅ **Testar a API** diretamente
- ✅ **Debug completo** do fluxo OAuth2
- ✅ **Simular redirecionamentos** com tokens

### **2. Teste Manual do OAuth2**
1. **Acesse:** `http://localhost:3004/cursos`
2. **Clique em "Conectar Pandavideo"**
3. **Selecione a aba "OAuth2 (Recomendado)"**
4. **Clique em "Conectar com OAuth2"**
5. **Autorize no Pandavideo**
6. **Verifique o redirecionamento** para `/cursos?success=pandavideo_connected&token=XXXXX`

### **3. Verificação dos Logs**
Abra o **Console do Navegador** (F12) e procure por:
```
🎥 [Pandavideo] useEffect executando...
🎥 [Pandavideo] Token encontrado na URL, salvando...
🎥 [Pandavideo] Token encontrado, fazendo requisição...
✅ [Pandavideo] 531 vídeos encontrados
```

## **🎯 Vídeos Esperados**

Baseado na sua biblioteca, você deve ver:
- ✅ **CLUBE DE REDAÇÃO** (6 vídeos)
- ✅ **CMSM** (1 vídeo)
- ✅ **CTISM** (9 vídeos)
- ✅ **EAOF INTENSIVÃO** (15 vídeos)
- ✅ **EEAR** (4 vídeos)
- ✅ **ENCONTROS AO VIVO INTENSIVO 2025** (13 vídeos)
- ✅ **Extensivo EAOF 2026** (4 vídeos)
- ✅ **Intensivo de Redação** (3 vídeos)
- ✅ **PREPARATÓRIO CIAAR PORTUGUÊS** (20+ aulas)

## **🐛 Troubleshooting**

### **Problema: Token não é obtido**
**Sintomas:**
- URL: `/cursos?error=token_exchange_failed`
- Console: "❌ [Pandavideo OAuth] Erro ao trocar código"

**Soluções:**
1. **Use a página de teste** para debug detalhado
2. **Verifique o Client Secret** no código
3. **Confirme se o OAuth2 Client está ativo** no Pandavideo
4. **Teste as credenciais** no painel do Pandavideo

### **Problema: Token não encontrado**
**Sintomas:**
- Erro: "Token de acesso não encontrado. Reconecte ao Pandavideo."
- Console: "❌ [Pandavideo] Token não encontrado"

**Soluções:**
1. **Acesse a página de teste** para verificar tokens
2. **Reconecte ao Pandavideo** clicando em "Desconectar" e depois "Conectar Pandavideo"
3. **Verifique se o redirecionamento** foi bem-sucedido
4. **Confirme se a URL** contém o token após o redirecionamento

### **Problema: Vídeos não aparecem**
**Sintomas:**
- Conectado mas sem vídeos
- Console: "Erro ao buscar vídeos"

**Soluções:**
1. **Use a página de teste** para testar a API diretamente
2. **Verifique se há vídeos** no seu Pandavideo
3. **Confirme se os vídeos estão "ready"**
4. **Teste a API diretamente** com o token
5. **Clique em "Buscar Vídeos"** manualmente

### **Problema: Player não carrega**
**Sintomas:**
- Erro: "PandaPlayer: library_id is required"

**Soluções:**
1. **Use IDs de vídeos reais** do Pandavideo
2. **Verifique se o vídeo está "ready"**
3. **Teste com diferentes vídeos**

## **📊 Logs para Monitorar**

### **Console do Navegador:**
```
🎥 [Pandavideo] useEffect executando...
🎥 [Pandavideo] URL atual: http://localhost:3004/cursos?success=pandavideo_connected&token=XXXXX
🎥 [Pandavideo] Token encontrado na URL, salvando...
🎥 [Pandavideo] Token (primeiros 10 chars): XXXXXXXXXX...
🎥 [Pandavideo] URL limpa: http://localhost:3004/cursos?success=pandavideo_connected
🎥 [Pandavideo] Configurado como conectado, agendando busca de vídeos...
🎥 [Pandavideo] Executando busca automática de vídeos...
🎥 [Pandavideo] Buscando vídeos com OAuth2...
🎥 [Pandavideo] Status de conexão: true
🎥 [Pandavideo] Tipo de conexão: oauth2
🎥 [Pandavideo] Token do cookie: encontrado
🎥 [Pandavideo] Token encontrado, fazendo requisição...
🎥 [Pandavideo] Token (primeiros 10 chars): XXXXXXXXXX...
✅ [Pandavideo] 531 vídeos encontrados
```

### **Console do Servidor:**
```
🎥 [Pandavideo OAuth] Callback recebido: { code: "...", state: "...", error: null }
✅ [Pandavideo OAuth] Token obtido com sucesso: { access_token: "***", token_type: "Bearer", expires_in: 3600 }
```

### **URLs de Redirecionamento:**
- **Sucesso:** `/cursos?success=pandavideo_connected&token=XXXXX&expires_in=3600`
- **Erro:** `/cursos?error=pandavideo_oauth_error`
- **Sem código:** `/cursos?error=no_code`
- **Falha no token:** `/cursos?error=token_exchange_failed`

## **🔍 Verificações Manuais**

### **1. Página de Teste**
Acesse: `http://localhost:3004/test-pandavideo`
- ✅ **Verificar tokens** na URL e localStorage
- ✅ **Testar API** diretamente
- ✅ **Debug completo** do fluxo

### **2. Verificar Token na URL**
Após o redirecionamento, a URL deve conter:
```
/cursos?success=pandavideo_connected&token=XXXXX&expires_in=3600
```

### **3. Verificar localStorage**
- Abra DevTools > Application > Local Storage
- Procure por `pandavideo_access_token`

### **4. Verificar Cookies**
- Abra DevTools > Application > Cookies
- Procure por `pandavideo_access_token`

### **5. Testar API Diretamente**
```bash
curl -X GET "https://api-v2.pandavideo.com.br/videos" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

## **🎯 Próximos Passos Após Sucesso**

1. **✅ Conectar com OAuth2**
2. **✅ Verificar lista de vídeos reais**
3. **✅ Criar cursos com vídeos reais**
4. **✅ Testar player de vídeo**
5. **✅ Monitorar analytics**

## **📞 Suporte**

Se encontrar problemas:

1. **Use a página de teste** para debug detalhado
2. **Verifique os logs** no console do navegador
3. **Verifique os logs** no console do servidor
4. **Teste as credenciais** no painel do Pandavideo
5. **Confirme a configuração** OAuth2 no Pandavideo

**Boa sorte com o teste! 🚀**

## **🎉 Sucesso Esperado**

Após o teste bem-sucedido, você deve ver:
- ✅ **531 vídeos** da sua biblioteca
- ✅ **Thumbnails** dos vídeos
- ✅ **IDs únicos** para cada vídeo
- ✅ **Status "ready"** para vídeos processados
- ✅ **Player funcionando** com vídeos reais

## **🔧 Correções Implementadas**

### **Problema do Token:**
- ✅ **Cookie não-httpOnly** para acesso via JavaScript
- ✅ **Token na URL** como fallback
- ✅ **localStorage** como backup
- ✅ **Limpeza automática** da URL após captura do token
- ✅ **Busca automática** de vídeos após conexão
- ✅ **Logs detalhados** para debug
- ✅ **Página de teste** para verificação manual 