'use client';

import React, { useState, useEffect } from 'react';
import { PandaVideoAPI, PandaVideo } from '@/lib/panda-video-api';

interface PandaVideoManagerProps {
  onAudioExtracted?: (audioBlob: Blob, video: PandaVideo) => void;
  onError?: (error: string) => void;
}

export default function PandaVideoManager({ onAudioExtracted, onError }: PandaVideoManagerProps) {
  const [videos, setVideos] = useState<PandaVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');

  const pandaAPI = new PandaVideoAPI({
    apiKey: apiKey || process.env.NEXT_PUBLIC_PANDA_VIDEO_API_KEY || '',
    baseUrl: process.env.NEXT_PUBLIC_PANDA_VIDEO_BASE_URL || 'https://api.pandavideo.com/v1'
  });

  // Carregar vídeos da conta
  const loadVideos = async () => {
    if (!apiKey) {
      setError('Chave API da Panda Video é obrigatória');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await pandaAPI.listVideos();
      setVideos(response.videos);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar vídeos';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Extrair áudio de um vídeo
  const extractAudio = async (video: PandaVideo) => {
    setExtracting(video.id);
    setError(null);

    try {
      // Obter URL HLS do vídeo
      const hlsUrl = await pandaAPI.getHlsUrl(video.id);
      
      // Extrair áudio do stream HLS
      const audioBlob = await pandaAPI.extractAudioFromVideo(hlsUrl);
      
      // Converter para formato otimizado
      const mp3Blob = await pandaAPI.convertToMp3(audioBlob);
      
      // Notificar sucesso
      onAudioExtracted?.(mp3Blob, video);
      
      // Mostrar notificação de sucesso
      alert(`Áudio extraído com sucesso!\nTamanho: ${(mp3Blob.size / 1024 / 1024).toFixed(2)} MB`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao extrair áudio';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setExtracting(null);
    }
  };

  // Formatar duração em minutos:segundos
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Gerenciador de Vídeos Panda Video
      </h2>

      {/* Configuração da API */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chave API da Panda Video
        </label>
        <div className="flex gap-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Digite sua chave API da Panda Video"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={loadVideos}
            disabled={!apiKey || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Carregando...' : 'Carregar Vídeos'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Obtenha sua chave API em: Dashboard Panda Video → Configurações → API
        </p>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Lista de vídeos */}
      {videos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Seus Vídeos ({videos.length})
          </h3>
          
          <div className="grid gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {video.thumbnail && (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-16 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900">{video.title}</h4>
                      <p className="text-sm text-gray-500">
                        Duração: {formatDuration(video.duration)}
                      </p>
                      {video.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {video.description.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => extractAudio(video)}
                    disabled={extracting === video.id}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {extracting === video.id ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Extraindo...
                      </div>
                    ) : (
                      'Extrair Áudio'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensagem quando não há vídeos */}
      {videos.length === 0 && !loading && apiKey && (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum vídeo encontrado na sua conta.</p>
          <p className="text-sm">Verifique se a chave API está correta.</p>
        </div>
      )}
    </div>
  );
}
