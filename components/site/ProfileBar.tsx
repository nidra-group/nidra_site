import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { Wordmark } from './Wordmark'
import { LocaleSwitcher } from './LocaleSwitcher'

/**
 * Barra del espacio profesional.
 *
 * Deliberadamente más liviana que la cabecera comercial: acá no hay menú de
 * servicios porque el visitante vino a leer un currículum, no a comprar. Pero
 * la marca y la vuelta al sitio tienen tamaño de objetivo táctil real, que es
 * lo que faltaba.
 */
export function ProfileBar() {
  const t = useTranslations('cv')

  return (
    <header className="no-print border-b border-line">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-6 px-5 py-5 sm:px-8">
        <Wordmark />
        <div className="flex items-center gap-6">
          <LocaleSwitcher />
          <span aria-hidden="true" className="h-4 w-px bg-line" />
          <Link
            href="/"
            className="link inline-flex min-h-[2.75rem] items-center text-small font-medium"
          >
            {t('backToSite')} →
          </Link>
        </div>
      </div>
    </header>
  )
}
