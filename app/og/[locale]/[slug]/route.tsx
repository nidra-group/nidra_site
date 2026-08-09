import { ImageResponse } from 'next/og'

import { locales, type Locale } from '@/i18n/routing'
import { OgCard, OG_SIZE } from '@/lib/seo/og-card'
import { OG_SLUGS, ogCopy, type OgSlug } from '@/lib/seo/og-cards'

/**
 * Las tarjetas de vista previa, una por página y por idioma.
 *
 * Es un manejador de ruta y no un `opengraph-image.tsx` por segmento: la razón
 * está explicada en `lib/seo/og-cards.ts`, y en una línea es que el segmento en
 * inglés lo traduce el proxy y la imagen no pasa por ahí.
 *
 * `force-static` más `generateStaticParams` las hornea todas durante el build:
 * en producción son archivos, no una función que se despierta cuando alguien
 * pega un enlace en WhatsApp. Importa más de lo habitual porque el rastreador
 * de WhatsApp abandona la vista previa si la imagen tarda.
 */
export const dynamic = 'force-static'

export function generateStaticParams() {
  return locales.flatMap((locale) => OG_SLUGS.map((slug) => ({ locale, slug })))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string; slug: string }> },
) {
  const { locale, slug } = await params

  if (!locales.includes(locale as Locale) || !OG_SLUGS.includes(slug as OgSlug)) {
    return new Response('Not found', { status: 404 })
  }

  return new ImageResponse(<OgCard {...ogCopy(slug as OgSlug, locale as Locale)} />, {
    ...OG_SIZE,
    headers: {
      // Un año. La tarjeta solo cambia cuando cambia el texto de la página, y
      // entonces cambia el build entero. Sin esto Vercel sirve
      // `must-revalidate`, y cada vez que alguien comparte el enlace el
      // rastreador vuelve a pedir 65 KB.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
