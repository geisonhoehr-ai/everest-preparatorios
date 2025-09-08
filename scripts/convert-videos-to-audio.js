#!/usr/bin/env node

/**
 * Script para converter vídeos da Pandavideo para MP3
 * 
 * Este script ajuda a baixar e converter vídeos para áudio MP3
 * para uso no EverCast
 * 
 * PRÉ-REQUISITOS:
 * 1. Instalar FFmpeg: https://ffmpeg.org/download.html
 * 2. Instalar yt-dlp: pip install yt-dlp
 * 3. Ter acesso aos vídeos da Pandavideo
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Configurações
const CONFIG = {
  // Pasta onde os vídeos estão armazenados
  videoInputDir: './videos',
  // Pasta onde os MP3s serão salvos
  audioOutputDir: './public/audio/evercast',
  // Qualidade do áudio (0-9, onde 0 é melhor qualidade)
  audioQuality: '2',
  // Formato de saída
  outputFormat: 'mp3',
  // Bitrate do áudio
  audioBitrate: '192k'
}

// Estrutura dos cursos (baseada nos dados mockados)
const COURSES = {
  'extensivo-eaof-2026': {
    name: 'Extensivo EAOF 2026 - Português e Redação',
    modules: {
      'frente-1-fonetica-morfologia': {
        name: 'FRENTE 1 - Fonética e Morfologia',
        lessons: [
          { id: '1', title: 'Aula 1 - Fonética', videoFile: 'fonetica-aula1.mp4' },
          { id: '2', title: 'Aula 1.2 - EAOF (Separação Silábica)', videoFile: 'separacao-silabica.mp4' },
          { id: '3', title: 'Aula 2 - Acentuação Gráfica', videoFile: 'acentuacao-grafica.mp4' },
          { id: '4', title: 'Aula 3 - Ortografia', videoFile: 'ortografia.mp4' },
          { id: '5', title: 'Aula 4 - Morfologia (estrutura e formação das palavras)', videoFile: 'morfologia-estrutura.mp4' },
          { id: '6', title: 'Aula 04 - PARTE 2 - CIAAR (Morfologia)', videoFile: 'morfologia-parte2.mp4' },
          { id: '7', title: 'Aula 5 - Morfologia (introdução às classes de palavras)', videoFile: 'morfologia-classes.mp4' },
          { id: '8', title: 'Aula 6 - Morfologia (artigos e substantivos)', videoFile: 'morfologia-artigos.mp4' }
        ]
      },
      'frente-2-periodo-simples': {
        name: 'FRENTE 2 - Período Simples',
        lessons: [
          { id: '9', title: 'Aula 1 - Estrutura da Oração', videoFile: 'estrutura-oracao.mp4' },
          { id: '10', title: 'Aula 2 - Sujeito e Predicado', videoFile: 'sujeito-predicado.mp4' },
          { id: '11', title: 'Aula 3 - Complementos Verbais', videoFile: 'complementos-verbais.mp4' },
          { id: '12', title: 'Aula 4 - Adjuntos', videoFile: 'adjuntos.mp4' },
          { id: '13', title: 'Aula 5 - Aposto e Vocativo', videoFile: 'aposto-vocativo.mp4' }
        ]
      }
    }
  }
}

/**
 * Verifica se FFmpeg está instalado
 */
function checkFFmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'pipe' })
    console.log('✅ FFmpeg encontrado')
    return true
  } catch (error) {
    console.error('❌ FFmpeg não encontrado. Instale em: https://ffmpeg.org/download.html')
    return false
  }
}

/**
 * Cria a estrutura de pastas necessária
 */
function createDirectories() {
  if (!fs.existsSync(CONFIG.audioOutputDir)) {
    fs.mkdirSync(CONFIG.audioOutputDir, { recursive: true })
    console.log(`📁 Pasta criada: ${CONFIG.audioOutputDir}`)
  }
}

/**
 * Converte um vídeo para MP3
 */
function convertVideoToAudio(videoPath, audioPath) {
  try {
    const command = `ffmpeg -i "${videoPath}" -vn -acodec mp3 -ab ${CONFIG.audioBitrate} -ar 44100 -ac 2 "${audioPath}" -y`
    
    console.log(`🔄 Convertendo: ${path.basename(videoPath)}`)
    execSync(command, { stdio: 'pipe' })
    console.log(`✅ Convertido: ${path.basename(audioPath)}`)
    
    return true
  } catch (error) {
    console.error(`❌ Erro ao converter ${videoPath}:`, error.message)
    return false
  }
}

/**
 * Gera o arquivo de configuração JSON para o EverCast
 */
function generateEverCastConfig() {
  const config = {
    courses: {},
    lastUpdated: new Date().toISOString()
  }

  for (const [courseId, course] of Object.entries(COURSES)) {
    config.courses[courseId] = {
      name: course.name,
      modules: {}
    }

    for (const [moduleId, module] of Object.entries(course.modules)) {
      config.courses[courseId].modules[moduleId] = {
        name: module.name,
        lessons: module.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          audioUrl: `/audio/evercast/${lesson.videoFile.replace('.mp4', '.mp3')}`,
          moduleId: moduleId,
          courseId: courseId
        }))
      }
    }
  }

  const configPath = path.join(CONFIG.audioOutputDir, 'evercast-config.json')
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
  console.log(`📄 Configuração salva: ${configPath}`)
}

/**
 * Processa todos os vídeos de um curso
 */
function processCourse(courseId, course) {
  console.log(`\n🎓 Processando curso: ${course.name}`)
  
  for (const [moduleId, module] of Object.entries(course.modules)) {
    console.log(`\n📚 Módulo: ${module.name}`)
    
    for (const lesson of module.lessons) {
      const videoPath = path.join(CONFIG.videoInputDir, lesson.videoFile)
      const audioFileName = lesson.videoFile.replace('.mp4', '.mp3')
      const audioPath = path.join(CONFIG.audioOutputDir, audioFileName)
      
      if (fs.existsSync(videoPath)) {
        convertVideoToAudio(videoPath, audioPath)
      } else {
        console.log(`⚠️  Vídeo não encontrado: ${videoPath}`)
      }
    }
  }
}

/**
 * Função principal
 */
function main() {
  console.log('🎧 EVERCAST - Conversor de Vídeos para Áudio')
  console.log('==========================================\n')
  
  // Verificações iniciais
  if (!checkFFmpeg()) {
    process.exit(1)
  }
  
  createDirectories()
  
  // Verificar se a pasta de vídeos existe
  if (!fs.existsSync(CONFIG.videoInputDir)) {
    console.log(`📁 Criando pasta de vídeos: ${CONFIG.videoInputDir}`)
    fs.mkdirSync(CONFIG.videoInputDir, { recursive: true })
    console.log(`\n📋 INSTRUÇÕES:`)
    console.log(`1. Coloque os vídeos da Pandavideo na pasta: ${CONFIG.videoInputDir}`)
    console.log(`2. Renomeie os arquivos conforme a estrutura definida no script`)
    console.log(`3. Execute o script novamente`)
    return
  }
  
  // Processar todos os cursos
  for (const [courseId, course] of Object.entries(COURSES)) {
    processCourse(courseId, course)
  }
  
  // Gerar configuração
  generateEverCastConfig()
  
  console.log('\n🎉 Conversão concluída!')
  console.log(`📁 Áudios salvos em: ${CONFIG.audioOutputDir}`)
  console.log('🎧 Agora você pode usar o EverCast!')
}

// Executar se chamado diretamente
if (require.main === module) {
  main()
}

module.exports = {
  convertVideoToAudio,
  generateEverCastConfig,
  COURSES,
  CONFIG
}
