#!/usr/bin/env node

/**
 * Script para testar URLs da Pandavideo e extrair áudio
 * 
 * Este script testa diferentes estratégias para reproduzir
 * apenas o áudio de vídeos da Pandavideo
 */

const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')

// URLs de teste da Pandavideo (URLs reais fornecidas pelo usuário)
const TEST_URLS = [
  'https://player-vz-e9d62059-4a4.tv.pandavideo.com.br/embed/?v=e13112a8-6545-49e7-ba1c-9825b15c9c09'
]

/**
 * Testa se uma URL responde
 */
function testUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    
    const req = protocol.get(url, (res) => {
      resolve({
        url,
        status: res.statusCode,
        headers: res.headers,
        contentType: res.headers['content-type']
      })
    })
    
    req.on('error', (err) => {
      reject({ url, error: err.message })
    })
    
    req.setTimeout(10000, () => {
      req.destroy()
      reject({ url, error: 'Timeout' })
    })
  })
}

/**
 * Gera URLs alternativas para tentar extrair áudio
 */
function generateAudioUrls(videoUrl) {
  const urls = []
  
  // URL original
  urls.push(videoUrl)
  
  // Estratégias para extrair áudio
  const strategies = [
    '?audio_only=1',
    '?format=audio',
    '?stream=audio',
    '?audio=1',
    '?type=audio',
    '?media=audio',
    '?playback=audio',
    '?mode=audio',
    '?output=audio',
    '?extract=audio'
  ]
  
  strategies.forEach(strategy => {
    if (videoUrl.includes('?')) {
      urls.push(`${videoUrl}&${strategy.substring(1)}`)
    } else {
      urls.push(`${videoUrl}${strategy}`)
    }
  })
  
  // Tentar com diferentes extensões
  const audioExtensions = ['.mp3', '.aac', '.ogg', '.wav', '.m4a']
  audioExtensions.forEach(ext => {
    const baseUrl = videoUrl.split('?')[0]
    urls.push(`${baseUrl}${ext}`)
  })
  
  return urls
}

/**
 * Testa todas as URLs geradas
 */
async function testAllUrls(videoUrl) {
  console.log(`\n🔍 Testando URLs para: ${videoUrl}`)
  console.log('=' .repeat(60))
  
  const audioUrls = generateAudioUrls(videoUrl)
  const results = []
  
  for (const url of audioUrls) {
    try {
      console.log(`⏳ Testando: ${url}`)
      const result = await testUrl(url)
      results.push(result)
      
      if (result.status === 200) {
        console.log(`✅ SUCESSO: ${url}`)
        console.log(`   Status: ${result.status}`)
        console.log(`   Content-Type: ${result.contentType}`)
        
        // Verificar se é áudio
        if (result.contentType && result.contentType.includes('audio')) {
          console.log(`   🎵 É ÁUDIO!`)
        } else if (result.contentType && result.contentType.includes('video')) {
          console.log(`   🎥 É VÍDEO (mas pode funcionar no player de áudio)`)
        }
      } else {
        console.log(`❌ Falhou: ${url} (Status: ${result.status})`)
      }
    } catch (error) {
      console.log(`❌ Erro: ${url} - ${error.error}`)
      results.push({ url, error: error.error })
    }
  }
  
  return results
}

/**
 * Gera código HTML para testar no navegador
 */
function generateTestHTML(results) {
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teste de URLs da Pandavideo</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #1a1a1a; color: white; }
        .url-test { margin: 20px 0; padding: 15px; border: 1px solid #333; border-radius: 8px; }
        .success { border-color: #4CAF50; background: rgba(76, 175, 80, 0.1); }
        .error { border-color: #f44336; background: rgba(244, 67, 54, 0.1); }
        audio { width: 100%; margin: 10px 0; }
        .info { font-size: 12px; color: #888; margin: 5px 0; }
    </style>
</head>
<body>
    <h1>🎧 Teste de URLs da Pandavideo</h1>
    <p>Teste as URLs abaixo para verificar se funcionam no player de áudio:</p>
    
    ${results.map(result => `
    <div class="url-test ${result.status === 200 ? 'success' : 'error'}">
        <h3>${result.url}</h3>
        <div class="info">
            Status: ${result.status || 'Erro'}<br>
            Content-Type: ${result.contentType || 'N/A'}<br>
            ${result.error ? `Erro: ${result.error}` : ''}
        </div>
        ${result.status === 200 ? `
        <audio controls preload="metadata">
            <source src="${result.url}" type="audio/mpeg">
            <source src="${result.url}" type="audio/mp4">
            <source src="${result.url}" type="audio/ogg">
            Seu navegador não suporta o elemento de áudio.
        </audio>
        ` : ''}
    </div>
    `).join('')}
    
    <script>
        // Teste automático de todas as URLs
        document.addEventListener('DOMContentLoaded', function() {
            const audioElements = document.querySelectorAll('audio');
            audioElements.forEach((audio, index) => {
                audio.addEventListener('loadstart', () => {
                    console.log('Carregando áudio:', audio.src);
                });
                audio.addEventListener('canplay', () => {
                    console.log('✅ Áudio pode ser reproduzido:', audio.src);
                });
                audio.addEventListener('error', (e) => {
                    console.log('❌ Erro no áudio:', audio.src, e);
                });
            });
        });
    </script>
</body>
</html>
  `
  
  const htmlPath = path.join(__dirname, 'pandavideo-test.html')
  fs.writeFileSync(htmlPath, html)
  console.log(`\n📄 Arquivo HTML gerado: ${htmlPath}`)
  console.log('Abra este arquivo no navegador para testar as URLs visualmente')
}

/**
 * Função principal
 */
async function main() {
  console.log('🎧 TESTE DE URLs DA PANDAVIDEO')
  console.log('==============================')
  
  if (TEST_URLS.length === 0) {
    console.log('⚠️  Nenhuma URL de teste configurada.')
    console.log('Edite o arquivo e adicione suas URLs da Pandavideo na variável TEST_URLS')
    return
  }
  
  const allResults = []
  
  for (const videoUrl of TEST_URLS) {
    const results = await testAllUrls(videoUrl)
    allResults.push(...results)
  }
  
  // Gerar relatório
  console.log('\n📊 RELATÓRIO FINAL')
  console.log('==================')
  
  const successfulUrls = allResults.filter(r => r.status === 200)
  const audioUrls = successfulUrls.filter(r => r.contentType && r.contentType.includes('audio'))
  const videoUrls = successfulUrls.filter(r => r.contentType && r.contentType.includes('video'))
  
  console.log(`✅ URLs que respondem: ${successfulUrls.length}`)
  console.log(`🎵 URLs de áudio: ${audioUrls.length}`)
  console.log(`🎥 URLs de vídeo: ${videoUrls.length}`)
  
  if (audioUrls.length > 0) {
    console.log('\n🎵 URLs DE ÁUDIO FUNCIONAIS:')
    audioUrls.forEach(url => {
      console.log(`   ${url.url}`)
    })
  }
  
  if (videoUrls.length > 0) {
    console.log('\n🎥 URLs DE VÍDEO (podem funcionar no player de áudio):')
    videoUrls.forEach(url => {
      console.log(`   ${url.url}`)
    })
  }
  
  // Gerar HTML de teste
  generateTestHTML(allResults)
  
  console.log('\n💡 DICAS:')
  console.log('1. URLs de vídeo podem funcionar no player de áudio HTML5')
  console.log('2. Teste as URLs no navegador para verificar compatibilidade')
  console.log('3. Algumas URLs podem precisar de autenticação')
  console.log('4. Use o arquivo HTML gerado para testes visuais')
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  testUrl,
  generateAudioUrls,
  testAllUrls
}
