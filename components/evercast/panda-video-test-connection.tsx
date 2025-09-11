'use client';

import React, { useState } from 'react';
import { pandaVideoAPI } from '@/lib/panda-video-api';

export default function PandaVideoTestConnection() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setError(null);
    setResult(null);

    try {
      console.log('🔍 Testando conexão com a API da Panda Video...');
      
      // Teste 1: Listar vídeos
      const videos = await pandaVideoAPI.listVideos(1, 5);
      console.log('✅ Vídeos carregados:', videos);
      
      setResult({
        success: true,
        videosCount: videos.videos.length,
        totalVideos: videos.total,
        videos: videos.videos.slice(0, 3) // Mostrar apenas os primeiros 3
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro na conexão:', err);
      setError(errorMessage);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border-2 border-blue-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        🔗 Teste de Conexão - Panda Video API
      </h2>
      
      <div className="space-y-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Chave API:</strong> panda-67b0e45386fbde4995819c39285ea4325fc883d2ea7626316602c0d4cea565ea
          </p>
          <p className="text-sm text-blue-600 mt-1">
            <strong>Endpoint:</strong> https://api.pandavideo.com/v2
          </p>
        </div>

        <button
          onClick={testConnection}
          disabled={testing}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {testing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Testando Conexão...
            </>
          ) : (
            '🧪 Testar Conexão com API'
          )}
        </button>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <strong>Erro:</strong> {error}
            </div>
          </div>
        )}

        {result && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              <strong>✅ Conexão Bem-sucedida!</strong>
            </div>
            
            <div className="text-sm space-y-1">
              <p><strong>Total de vídeos na conta:</strong> {result.totalVideos}</p>
              <p><strong>Vídeos carregados:</strong> {result.videosCount}</p>
            </div>

            {result.videos.length > 0 && (
              <div className="mt-3">
                <p className="font-semibold mb-2">📹 Primeiros vídeos encontrados:</p>
                <div className="space-y-2">
                  {result.videos.map((video: any, index: number) => (
                    <div key={video.id || index} className="p-2 bg-white rounded border text-xs">
                      <p><strong>ID:</strong> {video.id}</p>
                      <p><strong>Título:</strong> {video.title || video.name || 'Sem título'}</p>
                      <p><strong>Duração:</strong> {video.duration || 'N/A'} segundos</p>
                      <p><strong>HLS URL:</strong> {video.hls_url || video.stream_url ? 'Disponível' : 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
