/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações de imagem
  images: {
    domains: ['localhost', 'everestpreparatorios.com.br'],
    formats: ['image/webp', 'image/avif'],
  },

  // Headers de segurança e performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/globals.css',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/css',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/css/(.*)',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/css',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/(.*)\\.css',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/css',
          },
        ],
      },
    ]
  },

  // Configurações de redirecionamento
  async redirects() {
    return [
      {
        source: '/teacher',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  },

  // Configurações de ambiente - SEM CREDENCIAIS HARDCODED
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    // Removidas credenciais hardcoded por segurança
  },

  // Configurações de trailing slash
  trailingSlash: false,

  // Headers de segurança
  poweredByHeader: false,

  // Modo estrito do React
  reactStrictMode: true,

  // Configurações de TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // Configurações de ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
