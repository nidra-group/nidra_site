import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { locales, type Locale } from '@/i18n/routing'
import { getCvVersion, cvFileName } from './version'

export type Download = {
  locale: Locale
  href: string
  fileName: string
}

/**
 * Descargas efectivamente disponibles (FR-040).
 *
 * La lista se construye comprobando qué archivos existen tras el build, no
 * declarando una lista a mano. Si la generación de un documento falla, esa
 * combinación simplemente no se ofrece, en lugar de mostrar un botón que
 * descarga un 404.
 */
export function listAvailableDownloads(): Download[] {
  let version
  try {
    version = getCvVersion()
  } catch {
    return []
  }

  return locales.flatMap((locale) => {
    const fileName = cvFileName(locale, version)
    const absolute = join(process.cwd(), 'public', 'downloads', fileName)
    if (!existsSync(absolute)) return []
    return [{ locale, href: `/downloads/${fileName}`, fileName }]
  })
}
