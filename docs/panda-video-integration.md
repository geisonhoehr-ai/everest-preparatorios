# Integração com Panda Video - Extração de Áudio

## Visão Geral

Esta integração permite extrair apenas o áudio dos vídeos da sua conta na Panda Video, convertendo-os para formato otimizado e reproduzindo-os no sistema Evercast.

## Funcionalidades

### 1. Gerenciador de Vídeos Panda Video
- Lista todos os vídeos da sua conta
- Extrai áudio dos vídeos HLS
- Converte para formato otimizado (WAV/MP3)
- Interface intuitiva para gerenciamento

### 2. Player de Áudio Otimizado
- Reprodução apenas de áudio (sem vídeo)
- Controles de volume e progresso
- Otimizado para streams HLS
- Suporte a diferentes formatos de áudio

### 3. API da Panda Video
- Integração completa com a API v2 oficial
- Download de vídeos via endpoint oficial: `https://download-us01.pandavideo.com:7443/videos/{video_id}/download`
- Obtenção de URLs HLS e metadados de vídeos
- Tratamento de erros robusto
- Baseado na documentação oficial: [Panda Video API Reference](https://pandavideo.readme.io/reference/download-video)

## Configuração

### 1. Obter Chave API da Panda Video

1. Acesse o Dashboard da Panda Video
2. Vá para **Configurações** → **API**
3. Gere uma nova chave API
4. Copie a chave gerada

### 2. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```env
# Configurações da Panda Video
NEXT_PUBLIC_PANDA_VIDEO_API_KEY=panda-3046a07e6e8a7ff8e7a9f20b13bb39513b25ee5c2d12bd7a0f452332abf0ae3e
NEXT_PUBLIC_PANDA_VIDEO_BASE_URL=https://api.pandavideo.com/v2
NEXT_PUBLIC_PANDA_VIDEO_CLIENT_ID=3d69uvb4oqm1qoi8e74kvch1v4
NEXT_PUBLIC_PANDA_VIDEO_CLIENT_SECRET=1fu129jsanubuet2thmetsih75cd4iv83r8ve3bcm33b5ka0im2c
```

**Nota**: A implementação utiliza a API v2 da Panda Video, que é a versão mais recente e estável.

### 3. Instalar Dependências

O sistema utiliza as seguintes bibliotecas:
- `hls.js` - Para reprodução de streams HLS
- Web Audio API - Para processamento de áudio
- MediaRecorder API - Para gravação de áudio

## Como Usar

### 1. Acessar o Gerenciador

1. Faça login como professor ou administrador
2. Vá para a página **Evercast**
3. Clique em **"Abrir Gerenciador Panda Video"**
4. Digite sua chave API da Panda Video
5. Clique em **"Carregar Vídeos"**

### 2. Extrair Áudio

1. Na lista de vídeos, clique em **"Extrair Áudio"** no vídeo desejado
2. Aguarde o processamento (pode levar alguns minutos)
3. O áudio será automaticamente reproduzido no player

### 3. Gerenciar Áudio Extraído

- Use os controles do player para reproduzir/pausar
- Ajuste o volume conforme necessário
- Feche o player clicando no X

## Limitações e Considerações

### 1. Limitações Técnicas
- **CORS**: Alguns vídeos podem ter restrições de CORS
- **Tamanho**: Vídeos muito grandes podem demorar para processar
- **Formato**: Apenas vídeos HLS são suportados
- **Navegador**: Requer navegadores modernos com suporte a Web Audio API

### 2. Considerações de Performance
- **Memória**: Processamento de áudio consome memória
- **Rede**: Download de vídeos consome banda
- **CPU**: Conversão de áudio é intensiva em CPU

### 3. Direitos e Política
- Respeite os direitos autorais dos vídeos
- Use apenas vídeos que você possui
- Siga as políticas de uso da Panda Video

## Solução de Problemas

### 1. Erro de Chave API
- Verifique se a chave está correta
- Confirme se a chave tem permissões adequadas
- Teste a chave no dashboard da Panda Video

### 2. Erro de CORS
- Alguns vídeos podem ter restrições de CORS
- Tente com vídeos diferentes
- Entre em contato com o suporte da Panda Video

### 3. Erro de Processamento
- Verifique se o navegador suporta Web Audio API
- Tente com vídeos menores
- Verifique a conexão de internet

### 4. Player Não Funciona
- Verifique se o HLS.js está carregado
- Teste com URLs HLS diferentes
- Verifique os logs do console

## Suporte

Para problemas específicos:
1. Verifique os logs do console do navegador
2. Teste com vídeos diferentes
3. Entre em contato com o suporte técnico
4. Consulte a documentação da Panda Video

## Endpoints Utilizados

### API v2 da Panda Video
- **Listar vídeos**: `GET https://api.pandavideo.com/v2/videos`
- **Obter vídeo**: `GET https://api.pandavideo.com/v2/videos/{video_id}`
- **Download de vídeo**: `POST https://download-us01.pandavideo.com:7443/videos/{video_id}/download`

### Autenticação
- **Método**: API Key no header `Authorization`
- **Formato**: `Authorization: sua_chave_api_aqui`

### Respostas da API
- **200**: Sucesso
- **400**: Requisição inválida
- **401**: Não autorizado (chave API inválida)
- **404**: Vídeo não encontrado

## Changelog

### v1.1.0
- Atualização para API v2 da Panda Video
- Implementação do endpoint oficial de download
- Melhor mapeamento de dados da API
- Documentação atualizada com referências oficiais

### v1.0.0
- Integração inicial com API da Panda Video
- Gerenciador de vídeos
- Player de áudio otimizado
- Extração de áudio via Web Audio API
- Conversão para formatos otimizados
