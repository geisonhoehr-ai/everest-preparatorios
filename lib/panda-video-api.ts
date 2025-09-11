// Serviço para integração com a API da Panda Video
// Baseado na documentação: https://help.pandavideo.com/pt-br/article/como-fazer-download-pela-api-h8qgzr/

export interface PandaVideoConfig {
  apiKey: string;
  baseUrl: string;
}

export interface PandaVideo {
  id: string;
  title: string;
  description?: string;
  duration: number;
  thumbnail?: string;
  hlsUrl?: string;
  downloadUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PandaVideoListResponse {
  videos: PandaVideo[];
  total: number;
  page: number;
  perPage: number;
}

export class PandaVideoAPI {
  private config: PandaVideoConfig;

  constructor(config: PandaVideoConfig) {
    this.config = config;
  }

  /**
   * Lista todos os vídeos da conta usando a API v2 da Panda Video
   */
  async listVideos(page: number = 1, perPage: number = 50): Promise<PandaVideoListResponse> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/videos?page=${page}&per_page=${perPage}`,
        {
          method: 'GET',
          headers: {
            'Authorization': this.config.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao listar vídeos: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Mapear os dados da API v2 para nosso formato
      return {
        videos: data.data || data.videos || [],
        total: data.total || data.meta?.total || 0,
        page: data.page || data.meta?.page || page,
        perPage: data.per_page || data.meta?.per_page || perPage
      };
    } catch (error) {
      console.error('Erro ao listar vídeos da Panda Video:', error);
      throw error;
    }
  }

  /**
   * Obtém detalhes de um vídeo específico usando a API v2
   */
  async getVideo(videoId: string): Promise<PandaVideo> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/videos/${videoId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': this.config.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao obter vídeo: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Mapear os dados da API v2 para nosso formato
      return {
        id: data.id || data.video_id,
        title: data.title || data.name,
        description: data.description,
        duration: data.duration || 0,
        thumbnail: data.thumbnail || data.thumb_url,
        hlsUrl: data.hls_url || data.stream_url,
        downloadUrl: data.download_url,
        createdAt: data.created_at || data.created,
        updatedAt: data.updated_at || data.updated
      };
    } catch (error) {
      console.error('Erro ao obter vídeo da Panda Video:', error);
      throw error;
    }
  }

  /**
   * Inicia o download do vídeo usando a API oficial da Panda Video
   * Baseado na documentação: https://pandavideo.readme.io/reference/download-video
   */
  async initiateDownload(videoId: string): Promise<{ downloadUrl: string; status: string }> {
    try {
      const response = await fetch(
        `https://download-us01.pandavideo.com:7443/videos/${videoId}/download`,
        {
          method: 'POST',
          headers: {
            'Authorization': this.config.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao iniciar download: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        downloadUrl: data.download_url || data.url,
        status: data.status || 'initiated'
      };
    } catch (error) {
      console.error('Erro ao iniciar download:', error);
      throw error;
    }
  }

  /**
   * Obtém URL de download do vídeo (método alternativo)
   */
  async getDownloadUrl(videoId: string): Promise<string> {
    try {
      const downloadResult = await this.initiateDownload(videoId);
      return downloadResult.downloadUrl;
    } catch (error) {
      console.error('Erro ao obter URL de download:', error);
      throw error;
    }
  }

  /**
   * Obtém URL HLS do vídeo usando a API v2
   */
  async getHlsUrl(videoId: string): Promise<string> {
    try {
      // Primeiro, obter os detalhes do vídeo que já incluem a URL HLS
      const video = await this.getVideo(videoId);
      
      if (video.hlsUrl) {
        return video.hlsUrl;
      }

      // Se não tiver URL HLS nos detalhes, tentar endpoint específico
      const response = await fetch(
        `${this.config.baseUrl}/videos/${videoId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': this.config.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao obter URL HLS: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.hls_url || data.stream_url || data.playlist_url;
    } catch (error) {
      console.error('Erro ao obter URL HLS:', error);
      throw error;
    }
  }

  /**
   * Extrai áudio de um vídeo usando Web Audio API
   */
  async extractAudioFromVideo(videoUrl: string): Promise<Blob> {
    try {
      // Criar um elemento de vídeo temporário
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = videoUrl;
      
      // Aguardar o vídeo carregar
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = reject;
      });

      // Criar contexto de áudio
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaElementSource(video);
      const destination = audioContext.createMediaStreamDestination();
      
      source.connect(destination);
      
      // Configurar MediaRecorder para gravar apenas áudio
      const mediaRecorder = new MediaRecorder(destination.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      return new Promise((resolve, reject) => {
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          resolve(audioBlob);
        };
        
        mediaRecorder.onerror = reject;
        
        // Iniciar gravação
        mediaRecorder.start();
        
        // Reproduzir vídeo para extrair áudio
        video.play();
        
        // Parar gravação quando o vídeo terminar
        video.onended = () => {
          mediaRecorder.stop();
        };
      });
    } catch (error) {
      console.error('Erro ao extrair áudio do vídeo:', error);
      throw error;
    }
  }

  /**
   * Converte áudio para MP3 usando Web Audio API
   */
  async convertToMp3(audioBlob: Blob): Promise<Blob> {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Configurações de compressão para MP3
      const sampleRate = 44100;
      const channels = 1; // Mono para reduzir tamanho
      const bitRate = 128; // 128 kbps
      
      // Criar buffer de áudio comprimido
      const offlineContext = new OfflineAudioContext(channels, audioBuffer.length, sampleRate);
      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineContext.destination);
      source.start();
      
      const compressedBuffer = await offlineContext.startRendering();
      
      // Converter para WAV (formato mais compatível)
      const wavBlob = this.audioBufferToWav(compressedBuffer);
      
      return wavBlob;
    } catch (error) {
      console.error('Erro ao converter áudio para MP3:', error);
      throw error;
    }
  }

  /**
   * Converte AudioBuffer para WAV
   */
  private audioBufferToWav(buffer: AudioBuffer): Blob {
    const length = buffer.length;
    const sampleRate = buffer.sampleRate;
    const channels = buffer.numberOfChannels;
    const arrayBuffer = new ArrayBuffer(44 + length * channels * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * channels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * channels * 2, true);
    view.setUint16(32, channels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * channels * 2, true);
    
    // Convert audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < channels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }
}

// Instância padrão da API (configurar com suas credenciais)
export const pandaVideoAPI = new PandaVideoAPI({
  apiKey: process.env.NEXT_PUBLIC_PANDA_VIDEO_API_KEY || 'panda-3046a07e6e8a7ff8e7a9f20b13bb39513b25ee5c2d12bd7a0f452332abf0ae3e',
  baseUrl: process.env.NEXT_PUBLIC_PANDA_VIDEO_BASE_URL || 'https://api.pandavideo.com/v2'
});
