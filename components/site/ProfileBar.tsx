import { useLocale, useTranslations } from 'next-intl'

import { publicEnv } from '@/lib/env'
import { Wordmark } from './Wordmark'
import { LocaleSwitcher } from './LocaleSwitcher'

/**
 * Barra del espacio profesional.
 *
 * Deliberadamente más liviana que la cabecera comercial: acá no hay menú de
 * servicios porque el visitante vino a leer un currículum, no a comprar. Pero
 * la marca y la vuelta al sitio tienen tamaño de objetivo táctil real, que es
 * lo que faltaba.
 *
 * ── POR QUÉ LOS DOS ENLACES SON ABSOLUTOS ─────────────────────────────────
 * Esta barra se muestra en dos hosts: `nidra.cloud/es/cv` y el subdominio
 * `jmujica.nidra.cloud`. Antes usaba navegación interna a `/`, que dentro del
 * subdominio no lleva a ninguna parte: el proxy reescribe la raíz al propio
 * currículum, así que el botón de volver al sitio devolvía a la misma página
 * y parecía roto.
 *
 * Apuntar al sitio comercial por su dirección completa es lo único que
 * funciona igual desde los dos hosts.
 */
export function ProfileBar() {
  const t = useTranslations('cv')
  const locale = useLocale()
  const inicio = `${publicEnv.SITE_URL}/${locale}`

  return (
    <header className="no-print border-b border-line">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-6 px-5 py-5 sm:px-8">
        <Wordmark href={inicio} />
        <div className="flex items-center gap-6">
          <LocaleSwitcher />
          <span aria-hidden="true" className="h-4 w-px bg-line" />
          <a
            href={inicio}
            className="link inline-flex min-h-[2.75rem] items-center text-small font-medium"
          >
            {t('backToSite')} →
          </a>
        </div>
      </div>
    </header>
  )
}
