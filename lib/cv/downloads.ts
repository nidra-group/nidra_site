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
 * La lista se construye comprobando qué archivos existen, no declarando una
 * lista a mano. Si falta un documento, esa combinación simplemente no se
 * ofrece, en lugar de mostrar un botón que descarga un 404.
 *
 * La comprobación ocurre AL CONSTRUIR, no al atender la visita: los PDF se
 * versionan en el repositorio, así que ya están en su sitio cuando se
 * renderiza la página. El nombre de cada archivo lleva el hash del último
 * commit del perfil, lo que hace imposible servir un documento viejo como si
 * fuera el actual: si el perfil cambió y nadie regeneró, el nombre que se
 * busca no existe y la descarga no se ofrece.
 */
export function listAvailableDownloads(): Download[] {
  const version = getCvVersion()

  return locales.flatMap((locale) => {
    const fileName = cvFileName(locale, version)
    const absolute = join(process.cwd(), 'public', 'downloads', fileName)
    if (!existsSync(absolute)) return []
    return [{ locale, href: `/downloads/${fileName}`, fileName }]
  })
}
