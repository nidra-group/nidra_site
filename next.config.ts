import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

import { redirects } from './lib/seo/redirects'
import { securityHeaders } from './lib/seo/headers'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return redirects
  },
  async headers() {
    // A todas las rutas, incluidos los archivos estáticos y las descargas.
    return [{ source: '/:path*', headers: [...securityHeaders] }]
  },
}

export default withNextIntl(nextConfig)
