import type { Metadata } from 'next'

import { getPathname } from '@/i18n/navigation'
import { locales, type Locale } from '@/i18n/routing'
import { publicEnv } from '@/lib/env'

type Href = Parameters<typeof getPathname>[0]['href']

/**
 * Open Graph no usa códigos de idioma sueltos: pide `idioma_TERRITORIO`.
 *
 * El sitio publicaba `og:locale="es"`, que no es un valor válido de la
 * especificación. El rastreador de Facebook —el mismo que usan WhatsApp y
 * Messenger para armar la tarjeta— descarta el campo cuando no puede
 * interpretarlo, así que la vista previa quedaba sin idioma declarado y podía
 * mostrarse con la tipografía y el formato de número equivocados.
 *
 * `es_AR` y no `es_ES`: el territorio es una señal de mercado, y el sitio
 * vende en Argentina.
 */
const OG_LOCALE: Record<Locale, string> = {
  es: 'es_AR',
  en: 'en_US',
}

/**
 * Directivas de indexación.
 *
 * `max-image-preview: large` es la que importa y la que faltaba: sin ella
 * Google muestra una miniatura de unos 100 px al lado del resultado, o
 * ninguna. Con ella la imagen de la tarjeta —la que lleva el logotipo— ocupa
 * el ancho del resultado. Es el mismo activo que ya existe, mostrado grande.
 *
 * Los dos `-1` levantan los límites de longitud del extracto y de la vista
 * previa de vídeo: no hay motivo para pedirle a Google que recorte.
 */
const ROBOTS = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
} as const

/**
 * Metadatos por página con canónica y enlaces alternos por idioma.
 *
 * Las URLs se resuelven con `getPathname`, no concatenando cadenas: es lo que
 * hace que el enlace alterno apunte a `/en/services` y no a `/en/servicios`.
 */
export function buildMetadata({
  locale,
  href,
  title,
  description,
  baseUrl = publicEnv.SITE_URL,
  imagePath,
  index = true,
}: {
  locale: Locale
  href: Href
  title: string
  description: string
  baseUrl?: string
  /**
   * Ruta de la tarjeta propia de esta página, relativa al sitio.
   *
   * Se pasa cuando el segmento tiene su `opengraph-image.tsx`. Al fijar
   * `openGraph` a mano, Next deja de aplicar la convención de archivos: si no
   * se nombra acá, la tarjeta generada existe pero nadie la anuncia.
   */
  imagePath?: string
  /** En falso para las páginas que no deben indexarse (la vista de impresión). */
  index?: boolean
}): Metadata {
  const canonical = `${baseUrl}${getPathname({ href, locale })}`

  const languages = Object.fromEntries(
    locales.map((alt) => [alt, `${baseUrl}${getPathname({ href, locale: alt })}`]),
  )

  const image = `${publicEnv.SITE_URL}${imagePath ?? '/opengraph-image'}`

  return {
    title,
    description,
    alternates: { canonical, languages },
    robots: index ? ROBOTS : { index: false, follow: false },
    openGraph: {
      type: 'website',
      siteName: 'Nidra',
      locale: OG_LOCALE[locale],
      // El otro idioma, para que el rastreador sepa que la página existe
      // traducida. Es la contraparte en Open Graph de los `hreflang`.
      alternateLocale: locales.filter((alt) => alt !== locale).map((alt) => OG_LOCALE[alt]),
      title,
      description,
      url: canonical,
      // Declarar `summary_large_image` sin imagen produce una tarjeta grande y
      // vacía cada vez que alguien comparte el enlace. Al fijar `openGraph` a
      // mano hay que declararla acá: Next ya no la agrega sola.
      //
      // `type` va escrito porque la URL no termina en `.png`: es una ruta
      // generada. Un rastreador que decide por la extensión no tiene de dónde
      // deducirlo, y sin tipo algunos descartan la imagen y muestran la tarjeta
      // chica, sin logotipo.
      images: [{ url: image, width: 1200, height: 630, alt: title, type: 'image/png' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}
