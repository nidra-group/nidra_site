import type { MetadataRoute } from 'next'

import { getPathname } from '@/i18n/navigation'
import { locales, type Locale } from '@/i18n/routing'
import { CONTENT_UPDATED } from '@/lib/seo/content-date'
import { ogImagePath, type OgSlug } from '@/lib/seo/og-cards'
import { publicEnv } from '@/lib/env'

/**
 * Las rutas del sitio y, cuando la tienen, su tarjeta de vista previa.
 *
 * La tarjeta se declara acá además de en los metadatos de la página porque el
 * mapa del sitio es lo que le da a Google la imagen asociada a cada URL sin
 * tener que rastrearla primero. Las legales no tienen tarjeta propia: heredan
 * la de la portada, y anunciarla acá diría que la imagen es de esa página.
 */
type Href = Parameters<typeof getPathname>[0]['href']

const SITE_ROUTES: readonly (readonly [href: Href, card: OgSlug | null])[] = [
  ['/', 'home'],
  ['/servicios', 'services'],
  ['/integraciones', 'integrations'],
  ['/contacto', 'contact'],
  ['/privacidad', null],
  ['/terminos', null],
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

  for (const [href, card] of SITE_ROUTES) {
    for (const locale of locales) {
      entries.push({
        url: `${publicEnv.SITE_URL}${getPathname({ href, locale })}`,
        lastModified: CONTENT_UPDATED,
        changeFrequency: 'monthly',
        priority: href === '/' ? 1 : 0.8,
        ...(card ? { images: [`${publicEnv.SITE_URL}${ogImagePath(card, locale)}`] } : {}),
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
