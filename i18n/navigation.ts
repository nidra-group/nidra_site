import { createNavigation } from 'next-intl/navigation'

import { routing } from './routing'

/**
 * Ayudantes de navegación tipados.
 *
 * Todo el código MUST usar estos en lugar de construir URLs concatenando
 * cadenas: son los que traducen el segmento según el idioma activo. Un
 * `<a href={`/${locale}/servicios`}>` se saltea la traducción y publica una
 * URL en inglés con segmento en español.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
