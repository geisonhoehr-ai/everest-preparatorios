# 🎥 Guia de Integração Pandavideo

## **📋 Passos para Conectar sua Conta Pandavideo**

### **🔐 Método OAuth2 (Recomendado)**

#### **1. Configurar OAuth2 Client no Pandavideo**

1. **Acesse sua conta Pandavideo:**
   - Vá para: https://app.pandavideo.com.br/configuracoes/integracoes
   - Faça login na sua conta

2. **Criar um novo OAuth2 Client:**
   - Clique em "NOVO OAUTH2 CLIENT"
   - Preencha os campos:
     - **Nome do cliente:** "Curso Everest"
     - **URL do site:** "https://everestpreparatorios.com.br"
     - **URL de callback (https):** `https://everestpreparatorios.com.br/api/pandavideo/callback`
   - Clique em "CRIAR CLIENTE"

3. **Copiar as credenciais:**
   - Anote o **Client ID** e **Client Secret** gerados
   - Guarde essas informações com segurança

#### **2. Conectar na Plataforma**

1. **Acesse a página de Cursos:**
   - Vá para `/cursos` na plataforma
   - Se você é professor/admin, clique na aba "Configurar"

2. **Configure OAuth2:**
   - Clique em "Conectar Pandavideo"
   - Selecione a aba "OAuth2 (Recomendado)"
   - Insira o **Client ID** e **Client Secret**
   - Clique em "Conectar com OAuth2"

3. **Autorizar acesso:**
   - Você será redirecionado para o Pandavideo
   - Autorize o acesso para "Curso Everest"
   - Será redirecionado de volta para a plataforma

### **🔑 Método API Key (Alternativo)**

#### **1. Obter sua API Key**

1. **Acesse sua conta Pandavideo:**
   - Vá para: https://app.pandavideo.com.br/api-keys
   - Faça login na sua conta

2. **Criar uma nova API Key:**
   - Clique em "Criar Nova API Key"
   - Dê um nome como "Everest Preparatórios"
   - Configure as permissões necessárias

#### **2. Configurar Permissões da API Key**

Certifique-se de que sua API Key tenha estas permissões:

- ✅ **Videos** - Ler todos os vídeos
- ✅ **Folders** - Ler todas as pastas  
- ✅ **Analytics** - Acessar dados de analytics
- ✅ **Metadata** - Acessar metadados dos vídeos

#### **3. Conectar na Plataforma**

1. **Acesse a página de Cursos:**
   - Vá para `/cursos` na plataforma
   - Se você é professor/admin, clique na aba "Configurar"

2. **Insira sua API Key:**
   - Clique em "Conectar Pandavideo"
   - Selecione a aba "API Key"
   - Cole sua API Key no campo
   - Clique em "Conectar com API Key"

### **4. Importar seus Vídeos**

Após conectar, você verá:

- ✅ **Lista de todos os seus vídeos** do Pandavideo
- ✅ **Status de cada vídeo** (Pronto, Processando, Erro)
- ✅ **Duração e metadados** de cada vídeo
- ✅ **Thumbnails** automáticos

### **5. Criar Cursos com seus Vídeos**

1. **Vá para a aba "Gerenciar":**
   - Clique em "Novo Curso"
   - Preencha as informações do curso

2. **Associe um vídeo Pandavideo:**
   - No campo "ID do Vídeo Pandavideo"
   - Cole o ID do vídeo que você quer usar
   - O ID aparece na lista de vídeos conectados

### **6. Estrutura Recomendada**

Para organizar melhor seus cursos, sugerimos:

```
📁 Pandavideo
├── 📁 EAOF 2026
│   ├── 🎥 Aula 1 - Boas-vindas
│   ├── 🎥 Aula 2 - Gramática Básica
│   └── 🎥 Aula 3 - Interpretação de Textos
├── 📁 EEAR 2026
│   ├── 🎥 Aula 1 - Introdução
│   └── 🎥 Aula 2 - Matemática
└── 📁 Redação
    ├── 🎥 Aula 1 - Estrutura
    └── 🎥 Aula 2 - Argumentação
```

### **7. Recursos Avançados**

#### **Analytics e Métricas:**
- 📊 **Tempo de visualização** por aluno
- 📈 **Taxa de conclusão** dos cursos
- 🎯 **Pontos de abandono** nos vídeos
- 📱 **Dispositivos** mais utilizados

#### **Segurança:**
- 🔒 **Watermark** automático nos vídeos
- 🛡️ **DRM** para proteção de conteúdo
- 📍 **Geolocalização** de visualizações
- ⏰ **Controle de acesso** por tempo

#### **Recursos de Engajamento:**
- 🎯 **Mini-ganchos** para capturar atenção
- 📝 **Legendas automáticas** com IA
- 🌍 **Dublagens** em múltiplos idiomas
- 📊 **Testes A/B** de thumbnails

### **8. Troubleshooting**

#### **Problema: OAuth2 não funciona**
**Solução:**
- Verifique se o Client ID e Client Secret estão corretos
- Confirme se a URL de callback está configurada corretamente
- Verifique se o OAuth2 Client está ativo no Pandavideo

#### **Problema: API Key não funciona**
**Solução:**
- Verifique se a API Key está correta
- Confirme se as permissões estão configuradas
- Teste a API Key no painel do Pandavideo

#### **Problema: Vídeos não aparecem**
**Solução:**
- Verifique se os vídeos estão "Prontos" no Pandavideo
- Aguarde o processamento se estiver "Processando"
- Verifique se a autenticação tem permissão de leitura

#### **Problema: Player não carrega**
**Solução:**
- Verifique se o ID do vídeo está correto
- Confirme se o vídeo está público ou acessível
- Teste o embed diretamente no Pandavideo

### **9. Dicas de Otimização**

#### **Para Professores:**
- 🎬 **Crie playlists** no Pandavideo para organizar
- 📝 **Use descrições** detalhadas nos vídeos
- 🏷️ **Adicione tags** para facilitar busca
- 📊 **Monitore analytics** regularmente

#### **Para Alunos:**
- ⏯️ **Use a função "Continuar de onde parou"**
- 📱 **Assista em diferentes dispositivos**
- 📝 **Faça anotações** durante as aulas
- ⭐ **Avalie os cursos** para ajudar outros

### **10. Suporte**

Se precisar de ajuda:

- 📧 **Email:** suporte@everest.com
- 💬 **Chat:** Disponível na plataforma
- 📞 **WhatsApp:** (11) 99999-9999
- 📚 **Documentação:** https://pandavideo.readme.io

---

## **🎯 Próximos Passos**

1. **Configure OAuth2** seguindo o guia acima (recomendado)
2. **Teste a conexão** na aba "Configurar"
3. **Importe seus vídeos** para a plataforma
4. **Crie seus primeiros cursos** com conteúdo real
5. **Monitore o desempenho** através dos analytics

**Boa sorte com seus cursos! 🚀** 