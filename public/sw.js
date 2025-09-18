// Service Worker para EverCast - Background Audio
const CACHE_NAME = 'evercast-v1'
const AUDIO_CACHE_NAME = 'evercast-audio-v1'

// Arquivos para cache
const STATIC_FILES = [
  '/',
  '/evercast',
  '/manifest.json',
  '/icons/evercast-icon-192.png',
  '/icons/evercast-icon-512.png'
]

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker instalando...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Cache aberto')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log('✅ Arquivos estáticos em cache')
        return self.skipWaiting()
      })
  )
})

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker ativando...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== AUDIO_CACHE_NAME) {
              console.log('🗑️ Removendo cache antigo:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('✅ Service Worker ativo')
        return self.clients.claim()
      })
  )
})

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Cache de áudio
  if (request.destination === 'audio' || url.pathname.match(/\.(mp3|wav|m4a|aac|ogg)$/)) {
    event.respondWith(
      caches.open(AUDIO_CACHE_NAME)
        .then((cache) => {
          return cache.match(request)
            .then((response) => {
              if (response) {
                console.log('🎵 Áudio servido do cache:', url.pathname)
                return response
              }

              return fetch(request)
                .then((networkResponse) => {
                  if (networkResponse.ok) {
                    cache.put(request, networkResponse.clone())
                    console.log('🎵 Áudio adicionado ao cache:', url.pathname)
                  }
                  return networkResponse
                })
                .catch(() => {
                  // Fallback para áudio offline
                  return new Response('Áudio não disponível offline', {
                    status: 404,
                    statusText: 'Not Found'
                  })
                })
            })
        })
    )
    return
  }

  // Cache de páginas
  if (request.method === 'GET' && request.destination === 'document') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            console.log('📄 Página servida do cache:', url.pathname)
            return response
          }

          return fetch(request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                const responseClone = networkResponse.clone()
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseClone)
                    console.log('📄 Página adicionada ao cache:', url.pathname)
                  })
              }
              return networkResponse
            })
            .catch(() => {
              // Fallback para página offline
              return caches.match('/evercast')
                .then((fallbackResponse) => {
                  if (fallbackResponse) {
                    return fallbackResponse
                  }
                  return new Response('Página não disponível offline', {
                    status: 404,
                    statusText: 'Not Found'
                  })
                })
            })
        })
    )
    return
  }

  // Cache de recursos estáticos
  if (request.method === 'GET' && (
    request.destination === 'image' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font'
  )) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response
          }

          return fetch(request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                const responseClone = networkResponse.clone()
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseClone)
                  })
              }
              return networkResponse
            })
        })
    )
    return
  }
})

// Gerenciar mensagens do cliente
self.addEventListener('message', (event) => {
  const { type, data } = event.data

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break

    case 'CACHE_AUDIO':
      if (data.url) {
        caches.open(AUDIO_CACHE_NAME)
          .then((cache) => {
            return fetch(data.url)
              .then((response) => {
                if (response.ok) {
                  cache.put(data.url, response)
                  console.log('🎵 Áudio pré-cacheado:', data.url)
                }
              })
          })
      }
      break

    case 'CLEAR_AUDIO_CACHE':
      caches.delete(AUDIO_CACHE_NAME)
        .then(() => {
          console.log('🗑️ Cache de áudio limpo')
        })
      break

    case 'GET_CACHE_SIZE':
      caches.open(AUDIO_CACHE_NAME)
        .then((cache) => {
          return cache.keys()
        })
        .then((keys) => {
          event.ports[0].postMessage({
            type: 'CACHE_SIZE',
            size: keys.length
          })
        })
      break

    default:
      console.log('❓ Mensagem desconhecida:', type)
  }
})

// Notificações push (para futuras funcionalidades)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body,
      icon: '/icons/evercast-icon-192.png',
      badge: '/icons/evercast-icon-72.png',
      tag: 'evercast-notification',
      data: data.data,
      actions: [
        {
          action: 'open',
          title: 'Abrir EverCast',
          icon: '/icons/play-96.png'
        },
        {
          action: 'dismiss',
          title: 'Dispensar',
          icon: '/icons/close-96.png'
        }
      ]
    }

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/evercast')
    )
  }
})

// Background sync (para futuras funcionalidades)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Implementar sincronização em background
      console.log('🔄 Sincronização em background')
    )
  }
})

console.log('🎧 Service Worker EverCast carregado')