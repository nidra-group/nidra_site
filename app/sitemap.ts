import type { MetadataRoute } from 'next'

import { getPathname } from '@/i18n/navigation'
import { locales, type Locale } from '@/i18n/routing'
import { publicEnv } from '@/lib/env'

const SITE_ROUTES = [
  '/',
  '/servicios',
  '/integraciones',
  '/contacto',
  '/privacidad',
  '/terminos',
] as const

/**
 * Mapa del sitio generado desde las rutas reales (FR-052).
 *
 * Las URLs se resuelven con `getPathname`, así que el mapa publica
 * `/en/services` y no `/en/servicios`. Construirlas concatenando cadenas
 * publicaría direcciones que no existen.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const href of SITE_ROUTES) {
    for (const locale of locales) {
      entries.push({
        url: `${publicEnv.SITE_URL}${getPathname({ href, locale })}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: href === '/' ? 1 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((alt: Locale) => [
              alt,
              `${publicEnv.SITE_URL}${getPathname({ href, locale: alt })}`,
            ]),
          ),
        },
      })
    }
  }

  return entries
}
