// Exemplo de uso da API da Panda Video para download de vídeos
// Baseado na documentação oficial: https://pandavideo.readme.io/reference/download-video

// Configuração
const API_KEY = 'sua_chave_api_aqui';
const VIDEO_ID = 'id_do_video_aqui';

// Função para listar vídeos
async function listVideos() {
  try {
    const response = await fetch('https://api.pandavideo.com/v2/videos', {
      method: 'GET',
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao listar vídeos: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Vídeos encontrados:', data);
    return data;
  } catch (error) {
    console.error('Erro:', error);
    throw error;
  }
}

// Função para obter detalhes de um vídeo
async function getVideoDetails(videoId) {
  try {
    const response = await fetch(`https://api.pandavideo.com/v2/videos/${videoId}`, {
      method: 'GET',
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao obter vídeo: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Detalhes do vídeo:', data);
    return data;
  } catch (error) {
    console.error('Erro:', error);
    throw error;
  }
}

// Função para iniciar download de vídeo
async function downloadVideo(videoId) {
  try {
    const response = await fetch(
      `https://download-us01.pandavideo.com:7443/videos/${videoId}/download`,
      {
        method: 'POST',
        headers: {
          'Authorization': API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao iniciar download: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Download iniciado:', data);
    return data;
  } catch (error) {
    console.error('Erro:', error);
    throw error;
  }
}

// Função para extrair áudio de um vídeo
async function extractAudioFromVideo(videoId) {
  try {
    // 1. Obter detalhes do vídeo
    const videoDetails = await getVideoDetails(videoId);
    
    // 2. Iniciar download
    const downloadResult = await downloadVideo(videoId);
    
    // 3. Criar elemento de vídeo temporário
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = downloadResult.downloadUrl || downloadResult.url;
    
    // 4. Aguardar carregamento
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = resolve;
      video.onerror = reject;
    });

    // 5. Configurar Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaElementSource(video);
    const destination = audioContext.createMediaStreamDestination();
    
    source.connect(destination);
    
    // 6. Configurar MediaRecorder
    const mediaRecorder = new MediaRecorder(destination.stream, {
      mimeType: 'audio/webm;codecs=opus'
    });
    
    const chunks = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    
    // 7. Iniciar gravação
    return new Promise((resolve, reject) => {
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        console.log('Áudio extraído:', audioBlob);
        resolve(audioBlob);
      };
      
      mediaRecorder.onerror = reject;
      
      mediaRecorder.start();
      video.play();
      
      video.onended = () => {
        mediaRecorder.stop();
      };
    });
  } catch (error) {
    console.error('Erro ao extrair áudio:', error);
    throw error;
  }
}

// Exemplo de uso
async function exemploCompleto() {
  try {
    console.log('🎬 Iniciando exemplo de integração com Panda Video...');
    
    // 1. Listar vídeos
    console.log('📋 Listando vídeos...');
    const videos = await listVideos();
    
    if (videos.data && videos.data.length > 0) {
      const primeiroVideo = videos.data[0];
      console.log('🎥 Primeiro vídeo:', primeiroVideo);
      
      // 2. Extrair áudio
      console.log('🎵 Extraindo áudio...');
      const audioBlob = await extractAudioFromVideo(primeiroVideo.id);
      
      // 3. Criar URL para download
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log('✅ Áudio extraído com sucesso! URL:', audioUrl);
      
      // 4. Criar link de download
      const downloadLink = document.createElement('a');
      downloadLink.href = audioUrl;
      downloadLink.download = `${primeiroVideo.title || 'audio'}.webm`;
      downloadLink.textContent = 'Baixar Áudio';
      document.body.appendChild(downloadLink);
      
    } else {
      console.log('❌ Nenhum vídeo encontrado na conta');
    }
    
  } catch (error) {
    console.error('❌ Erro no exemplo:', error);
  }
}

// Executar exemplo (descomente para testar)
// exemploCompleto();

// Exportar funções para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    listVideos,
    getVideoDetails,
    downloadVideo,
    extractAudioFromVideo,
    exemploCompleto
  };
}
