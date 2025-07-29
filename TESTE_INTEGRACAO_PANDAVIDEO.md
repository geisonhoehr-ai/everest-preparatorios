# 🧪 Teste de Integração Pandavideo OAuth2

## **✅ Configuração Completa**

### **Credenciais OAuth2 Configuradas:**
- **Client ID:** `28444mbcl1t9570i0gfnod8l7i`
- **Client Secret:** `huvj3e0rqra9uu1vfm99olqk2hvi3f9na370fdeb32lbh9nhttb`
- **Callback URL:** `https://everestpreparatorios.com.br/api/pandavideo/callback`

## **🔧 Como Testar a Integração**

### **1. Acesse a Página de Cursos**
```
http://localhost:3003/cursos
```

### **2. Configure OAuth2**
1. **Clique na aba "Configurar"** (se você é professor/admin)
2. **Clique em "Conectar Pandavideo"**
3. **Selecione a aba "OAuth2 (Recomendado)"**
4. **Verifique se as credenciais estão preenchidas:**
   - Client ID: `28444mbcl1t9570i0gfnod8l7i`
   - Client Secret: `huvj3e0rqra9uu1vfm99olqk2hvi3f9na370fdeb32lbh9nhttb`
5. **Clique em "Conectar com OAuth2"**

### **3. Fluxo OAuth2**
1. **Você será redirecionado** para o Pandavideo
2. **Autorize o acesso** para "Curso Everest"
3. **Será redirecionado de volta** para `/cursos?success=pandavideo_connected`
4. **Verifique se aparece:** "Conectado ao Pandavideo" com badge "OAuth2"

### **4. Verificar Vídeos**
1. **Após conectar, você deve ver:**
   - ✅ Status "Conectado ao Pandavideo"
   - ✅ Badge "OAuth2"
   - ✅ Lista de vídeos do seu Pandavideo
   - ✅ Status de cada vídeo (Pronto, Processando, Erro)

## **🐛 Troubleshooting**

### **Problema: Erro no Callback**
**Sintomas:**
- URL: `/cursos?error=pandavideo_oauth_error`
- Console: "❌ [Pandavideo OAuth] Erro"

**Soluções:**
1. **Verifique as credenciais** no componente
2. **Confirme a URL de callback** no Pandavideo
3. **Teste a URL de callback** diretamente

### **Problema: Token não é obtido**
**Sintomas:**
- URL: `/cursos?error=token_exchange_failed`
- Console: "❌ [Pandavideo OAuth] Erro ao trocar código"

**Soluções:**
1. **Verifique o Client Secret** no código
2. **Confirme se o OAuth2 Client está ativo** no Pandavideo
3. **Teste as credenciais** no painel do Pandavideo

### **Problema: Vídeos não aparecem**
**Sintomas:**
- Conectado mas sem vídeos
- Console: "Erro ao buscar vídeos"

**Soluções:**
1. **Verifique se há vídeos** no seu Pandavideo
2. **Confirme se os vídeos estão "Prontos"**
3. **Teste a API diretamente** com o token

## **📊 Logs para Monitorar**

### **Console do Navegador:**
```
🎥 [Pandavideo OAuth] Iniciando fluxo OAuth: https://app.pandavideo.com.br/oauth/authorize?...
```

### **Console do Servidor:**
```
🎥 [Pandavideo OAuth] Callback recebido: { code: "...", state: "...", error: null }
✅ [Pandavideo OAuth] Token obtido com sucesso: { access_token: "***", token_type: "Bearer", expires_in: 3600 }
```

### **URLs de Redirecionamento:**
- **Sucesso:** `/cursos?success=pandavideo_connected`
- **Erro:** `/cursos?error=pandavideo_oauth_error`
- **Sem código:** `/cursos?error=no_code`
- **Falha no token:** `/cursos?error=token_exchange_failed`

## **🔍 Verificações Manuais**

### **1. Testar URL de Callback**
```
https://everestpreparatorios.com.br/api/pandavideo/callback?code=test&state=test
```

### **2. Verificar Cookies**
- Abra DevTools > Application > Cookies
- Procure por `pandavideo_access_token`

### **3. Testar API Diretamente**
```bash
curl -X GET "https://api-v2.pandavideo.com.br/videos" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

## **🎯 Próximos Passos Após Sucesso**

1. **✅ Conectar com OAuth2**
2. **✅ Verificar lista de vídeos**
3. **✅ Criar cursos com vídeos reais**
4. **✅ Testar player de vídeo**
5. **✅ Monitorar analytics**

## **📞 Suporte**

Se encontrar problemas:

1. **Verifique os logs** no console do navegador
2. **Verifique os logs** no console do servidor
3. **Teste as credenciais** no painel do Pandavideo
4. **Confirme a configuração** OAuth2 no Pandavideo

**Boa sorte com o teste! 🚀** 