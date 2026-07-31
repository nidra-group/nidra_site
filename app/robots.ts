import type { MetadataRoute } from 'next'

import { publicEnv } from '@/lib/env'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // La vista de impresión existe para generar el documento descargable.
      // Indexarla duplicaría el contenido del perfil sin aportar nada.
      disallow: ['/es/cv/imprimir', '/en/cv/print'],
    },
    sitemap: `${publicEnv.SITE_URL}/sitemap.xml`,
  }
}
