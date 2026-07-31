import type { Metadata } from 'next'

import { getPathname } from '@/i18n/navigation'
import { locales, type Locale } from '@/i18n/routing'
import { publicEnv } from '@/lib/env'

type Href = Parameters<typeof getPathname>[0]['href']

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
}: {
  locale: Locale
  href: Href
  title: string
  description: string
  baseUrl?: string
}): Metadata {
  const canonical = `${baseUrl}${getPathname({ href, locale })}`

  const languages = Object.fromEntries(
    locales.map((alt) => [alt, `${baseUrl}${getPathname({ href, locale: alt })}`]),
  )

  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      type: 'website',
      siteName: 'Nidra',
      locale,
      title,
      description,
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}
