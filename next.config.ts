import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

import { redirects } from './lib/seo/redirects'

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
}

export default withNextIntl(nextConfig)
