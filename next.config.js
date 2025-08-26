/** @type {import('next').NextConfig} */
const nextConfig = {
  // Otimizações de performance
  experimental: {
    // Otimizar carregamento de páginas
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Melhorar performance de navegação
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Configurações de build
  // swcMinify: true, // Removido para evitar warnings
  
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
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
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

  // Configurações de webpack para otimização
  webpack: (config, { dev, isServer }) => {
    // Otimizações apenas para produção
    if (!dev && !isServer) {
      // Otimizar chunks
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
          },
          // Separar lucide-react em chunk próprio
          lucide: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: 'lucide',
            chunks: 'all',
            priority: 20,
          },
        },
      }
      
      // Otimizar tree shaking
      config.optimization.usedExports = true
      config.optimization.sideEffects = false
    }

    return config
  },

  // Configurações de compressão
  compress: true,

  // Configurações de ambiente
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Configurações de trailing slash
  trailingSlash: false,

  // Configurações de output
  output: 'standalone',

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
