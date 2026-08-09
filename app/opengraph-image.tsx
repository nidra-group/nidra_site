import { ImageResponse } from 'next/og'

import { defaultLocale } from '@/i18n/routing'
import { OgCard, OG_SIZE } from '@/lib/seo/og-card'
import { ogCopy } from '@/lib/seo/og-cards'

export const alt = 'Nidra — Desarrollo de software con IA para PyMEs'
export const size = OG_SIZE
export const contentType = 'image/png'

/**
 * La tarjeta del dominio pelado.
 *
 * `nidra.cloud` sin idioma redirige a `/es`, pero no todo rastreador sigue la
 * redirección antes de buscar la vista previa. Esta existe para que ese caso
 * también muestre algo.
 *
 * Las tarjetas de las páginas viven en `/og/<idioma>/<página>`: ver
 * `lib/seo/og-cards.ts`. Esta es la misma que la de la portada en español, y no
 * una segunda versión escrita aparte, para que las dos digan lo mismo.
 */
export default function OpengraphImage() {
  return new ImageResponse(<OgCard {...ogCopy('home', defaultLocale)} />, size)
}
