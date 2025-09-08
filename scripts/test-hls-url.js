#!/usr/bin/env node

/**
 * Script para testar URLs HLS da Pandavideo
 * 
 * Este script testa se a URL HLS funciona e pode ser reproduzida
 */

const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')

// URL HLS da Pandavideo
const HLS_URL = 'https://b-vz-e9d62059-4a4.tv.pandavideo.com.br/e13112a8-6545-49e7-ba1c-9825b15c9c09/playlist.m3u8'

/**
 * Testa se uma URL HLS responde
 */
function testHLSUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    
    const req = protocol.get(url, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          headers: res.headers,
          contentType: res.headers['content-type'],
          data: data.substring(0, 1000) // Primeiros 1000 caracteres
        })
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
 * Analisa o conteúdo M3U8
 */
function analyzeM3U8(content) {
  const lines = content.split('\n')
  const analysis = {
    isM3U8: false,
    version: null,
    streams: [],
    segments: []
  }
  
  lines.forEach((line, index) => {
    line = line.trim()
    
    if (line === '#EXTM3U') {
      analysis.isM3U8 = true
    } else if (line.startsWith('#EXT-X-VERSION:')) {
      analysis.version = line.split(':')[1]
    } else if (line.startsWith('#EXT-X-STREAM-INF:')) {
      const nextLine = lines[index + 1]
      if (nextLine && !nextLine.startsWith('#')) {
        analysis.streams.push({
          info: line,
          url: nextLine
        })
      }
    } else if (line.startsWith('#EXTINF:')) {
      const nextLine = lines[index + 1]
      if (nextLine && !nextLine.startsWith('#')) {
        analysis.segments.push({
          duration: line.split(':')[1],
          url: nextLine
        })
      }
    }
  })
  
  return analysis
}

/**
 * Gera HTML de teste para HLS
 */
function generateHLSTestHTML(result) {
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teste HLS - Pandavideo</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #1a1a1a; color: white; }
        .test-container { margin: 20px 0; padding: 15px; border: 1px solid #333; border-radius: 8px; }
        .success { border-color: #4CAF50; background: rgba(76, 175, 80, 0.1); }
        .error { border-color: #f44336; background: rgba(244, 67, 54, 0.1); }
        audio, video { width: 100%; margin: 10px 0; }
        .info { font-size: 12px; color: #888; margin: 5px 0; }
        .stream-info { background: rgba(255, 255, 255, 0.1); padding: 10px; border-radius: 4px; margin: 10px 0; }
        pre { background: rgba(0, 0, 0, 0.3); padding: 10px; border-radius: 4px; overflow-x: auto; }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
</head>
<body>
    <h1>🎧 Teste HLS - Pandavideo</h1>
    <p>Teste da URL HLS da Pandavideo para reprodução de áudio:</p>
    
    <div class="test-container ${result.status === 200 ? 'success' : 'error'}">
        <h3>URL HLS: ${result.url}</h3>
        <div class="info">
            Status: ${result.status || 'Erro'}<br>
            Content-Type: ${result.contentType || 'N/A'}<br>
            ${result.error ? `Erro: ${result.error}` : ''}
        </div>
        
        ${result.status === 200 ? `
        <div class="stream-info">
            <h4>Análise do M3U8:</h4>
            <pre>${result.data}</pre>
        </div>
        
        <h4>Teste de Reprodução:</h4>
        
        <div class="stream-info">
            <h5>🎵 Teste de Áudio (HLS.js)</h5>
            <audio id="audioPlayer" controls preload="metadata">
                Seu navegador não suporta o elemento de áudio.
            </audio>
            <div id="audioStatus" class="info"></div>
        </div>
        
        <div class="stream-info">
            <h5>🎥 Teste de Vídeo (HLS.js)</h5>
            <video id="videoPlayer" controls preload="metadata" style="max-width: 100%; height: auto;">
                Seu navegador não suporta o elemento de vídeo.
            </video>
            <div id="videoStatus" class="info"></div>
        </div>
        
        <div class="stream-info">
            <h5>🔧 Teste de Áudio (Nativo)</h5>
            <audio id="nativeAudio" controls preload="metadata">
                <source src="${result.url}" type="application/vnd.apple.mpegurl">
                Seu navegador não suporta HLS nativo.
            </audio>
            <div id="nativeStatus" class="info"></div>
        </div>
        ` : ''}
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const hlsUrl = '${result.url}';
            
            // Teste com HLS.js
            if (Hls.isSupported()) {
                console.log('✅ HLS.js suportado');
                
                // Teste de áudio
                const audioPlayer = document.getElementById('audioPlayer');
                const audioStatus = document.getElementById('audioStatus');
                
                if (audioPlayer) {
                    const audioHls = new Hls();
                    audioHls.loadSource(hlsUrl);
                    audioHls.attachMedia(audioPlayer);
                    
                    audioHls.on(Hls.Events.MANIFEST_PARSED, function() {
                        audioStatus.innerHTML = '✅ Manifest carregado com sucesso!';
                        console.log('✅ Audio HLS manifest carregado');
                    });
                    
                    audioHls.on(Hls.Events.ERROR, function(event, data) {
                        audioStatus.innerHTML = '❌ Erro: ' + data.details;
                        console.error('❌ Audio HLS error:', data);
                    });
                }
                
                // Teste de vídeo
                const videoPlayer = document.getElementById('videoPlayer');
                const videoStatus = document.getElementById('videoStatus');
                
                if (videoPlayer) {
                    const videoHls = new Hls();
                    videoHls.loadSource(hlsUrl);
                    videoHls.attachMedia(videoPlayer);
                    
                    videoHls.on(Hls.Events.MANIFEST_PARSED, function() {
                        videoStatus.innerHTML = '✅ Manifest carregado com sucesso!';
                        console.log('✅ Video HLS manifest carregado');
                    });
                    
                    videoHls.on(Hls.Events.ERROR, function(event, data) {
                        videoStatus.innerHTML = '❌ Erro: ' + data.details;
                        console.error('❌ Video HLS error:', data);
                    });
                }
                
            } else if (audioPlayer.canPlayType('application/vnd.apple.mpegurl')) {
                console.log('✅ HLS nativo suportado (Safari)');
                document.getElementById('nativeStatus').innerHTML = '✅ HLS nativo suportado!';
            } else {
                console.log('❌ HLS não suportado');
                document.getElementById('audioStatus').innerHTML = '❌ HLS não suportado neste navegador';
                document.getElementById('videoStatus').innerHTML = '❌ HLS não suportado neste navegador';
            }
        });
    </script>
</body>
</html>
  `
  
  const htmlPath = path.join(__dirname, 'hls-test.html')
  fs.writeFileSync(htmlPath, html)
  console.log(`\n📄 Arquivo HTML gerado: ${htmlPath}`)
  console.log('Abra este arquivo no navegador para testar a URL HLS visualmente')
}

/**
 * Função principal
 */
async function main() {
  console.log('🎧 TESTE DE URL HLS - PANDAVIDEO')
  console.log('=================================')
  console.log(`URL: ${HLS_URL}`)
  console.log('')
  
  try {
    console.log('⏳ Testando URL HLS...')
    const result = await testHLSUrl(HLS_URL)
    
    console.log(`✅ Status: ${result.status}`)
    console.log(`📄 Content-Type: ${result.contentType}`)
    console.log(`📊 Tamanho: ${result.data.length} caracteres`)
    
    if (result.status === 200) {
      console.log('\n📋 Conteúdo M3U8:')
      console.log('=' .repeat(50))
      console.log(result.data)
      console.log('=' .repeat(50))
      
      // Analisar o conteúdo
      const analysis = analyzeM3U8(result.data)
      console.log('\n🔍 Análise:')
      console.log(`   É M3U8: ${analysis.isM3U8}`)
      console.log(`   Versão: ${analysis.version || 'N/A'}`)
      console.log(`   Streams: ${analysis.streams.length}`)
      console.log(`   Segmentos: ${analysis.segments.length}`)
      
      if (analysis.streams.length > 0) {
        console.log('\n📺 Streams disponíveis:')
        analysis.streams.forEach((stream, index) => {
          console.log(`   ${index + 1}. ${stream.info}`)
          console.log(`      URL: ${stream.url}`)
        })
      }
      
      // Gerar HTML de teste
      generateHLSTestHTML(result)
      
      console.log('\n💡 PRÓXIMOS PASSOS:')
      console.log('1. Abra o arquivo HTML gerado no navegador')
      console.log('2. Teste se o áudio reproduz corretamente')
      console.log('3. Verifique se funciona no domínio everestpreparatorios.com.br')
      console.log('4. Configure o EverCast para usar esta URL HLS')
      
    } else {
      console.log(`❌ Erro: Status ${result.status}`)
    }
    
  } catch (error) {
    console.log(`❌ Erro ao testar URL: ${error.error}`)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  testHLSUrl,
  analyzeM3U8
}
