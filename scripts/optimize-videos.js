#!/usr/bin/env node

/**
 * Script para otimização de vídeos MP4
 * Reduz o tamanho dos vídeos para melhorar performance
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configurações de otimização
const VIDEO_OPTIMIZATION = {
  // Configurações para vídeos de depoimento (mobile-first)
  caseSucesso: {
    width: 720,
    height: 1280, // 9:16 aspect ratio
    bitrate: '500k',
    preset: 'fast',
    crf: 28,
    format: 'mp4',
    codec: 'libx264'
  },
  
  // Configurações para vídeos principais
  main: {
    width: 1280,
    height: 720,
    bitrate: '1000k',
    preset: 'fast',
    crf: 23,
    format: 'mp4',
    codec: 'libx264'
  }
};

// Lista de vídeos para otimizar
const VIDEOS_TO_OPTIMIZE = [
  {
    input: '/public/case-sucesso-1.mp4',
    output: '/public/case-sucesso-1-optimized.mp4',
    config: VIDEO_OPTIMIZATION.caseSucesso
  },
  {
    input: '/public/case-sucesso-2.mp4',
    output: '/public/case-sucesso-2-optimized.mp4',
    config: VIDEO_OPTIMIZATION.caseSucesso
  },
  {
    input: '/public/case-sucesso-3.mp4',
    output: '/public/case-sucesso-3-optimized.mp4',
    config: VIDEO_OPTIMIZATION.caseSucesso
  }
];

function checkFFmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.error('❌ FFmpeg não encontrado. Instale o FFmpeg para otimizar vídeos.');
    console.log('📥 Instalação: https://ffmpeg.org/download.html');
    return false;
  }
}

function optimizeVideo(inputPath, outputPath, config) {
  const command = [
    'ffmpeg',
    '-i', inputPath,
    '-c:v', config.codec,
    '-preset', config.preset,
    '-crf', config.crf.toString(),
    '-b:v', config.bitrate,
    '-s', `${config.width}x${config.height}`,
    '-c:a', 'aac',
    '-b:a', '128k',
    '-movflags', '+faststart',
    '-y', // Sobrescrever arquivo existente
    outputPath
  ].join(' ');

  try {
    console.log(`🎬 Otimizando: ${path.basename(inputPath)}`);
    execSync(command, { stdio: 'inherit' });
    
    // Verificar tamanhos
    const originalSize = fs.statSync(inputPath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    
    console.log(`✅ Otimizado: ${path.basename(outputPath)}`);
    console.log(`📊 Redução: ${(originalSize / 1024 / 1024).toFixed(1)}MB → ${(optimizedSize / 1024 / 1024).toFixed(1)}MB (${reduction}%)`);
    
    return { success: true, reduction };
  } catch (error) {
    console.error(`❌ Erro ao otimizar ${inputPath}:`, error.message);
    return { success: false, error: error.message };
  }
}

function createWebMVersion(mp4Path) {
  const webmPath = mp4Path.replace('.mp4', '.webm');
  const command = [
    'ffmpeg',
    '-i', mp4Path,
    '-c:v', 'libvpx-vp9',
    '-crf', '30',
    '-b:v', '500k',
    '-c:a', 'libopus',
    '-b:a', '128k',
    '-y',
    webmPath
  ].join(' ');

  try {
    console.log(`🎬 Criando versão WebM: ${path.basename(mp4Path)}`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ WebM criado: ${path.basename(webmPath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao criar WebM:`, error.message);
    return false;
  }
}

function generateVideoManifest() {
  const manifest = {
    videos: VIDEOS_TO_OPTIMIZE.map(video => ({
      name: path.basename(video.input, '.mp4'),
      mp4: video.output.replace('/public', ''),
      webm: video.output.replace('/public', '').replace('.mp4', '.webm'),
      poster: video.output.replace('/public', '').replace('.mp4', '.jpg')
    }))
  };

  fs.writeFileSync(
    path.join(__dirname, '../public/video-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  
  console.log('📋 Manifesto de vídeos gerado: public/video-manifest.json');
}

function main() {
  console.log('🚀 Iniciando otimização de vídeos...\n');

  if (!checkFFmpeg()) {
    process.exit(1);
  }

  let totalReduction = 0;
  let successCount = 0;

  VIDEOS_TO_OPTIMIZE.forEach(video => {
    const inputPath = path.join(__dirname, '..', video.input);
    const outputPath = path.join(__dirname, '..', video.output);

    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  Vídeo não encontrado: ${inputPath}`);
      return;
    }

    const result = optimizeVideo(inputPath, outputPath, video.config);
    
    if (result.success) {
      totalReduction += result.reduction;
      successCount++;
      
      // Criar versão WebM para melhor compatibilidade
      createWebMVersion(outputPath);
    }
  });

  console.log('\n📊 Resumo da Otimização:');
  console.log(`✅ Vídeos otimizados: ${successCount}/${VIDEOS_TO_OPTIMIZE.length}`);
  console.log(`📉 Redução média: ${(totalReduction / successCount).toFixed(1)}%`);
  
  generateVideoManifest();
  
  console.log('\n🎉 Otimização concluída!');
  console.log('💡 Dica: Atualize os componentes para usar os vídeos otimizados.');
}

if (require.main === module) {
  main();
}

module.exports = { optimizeVideo, createWebMVersion };
