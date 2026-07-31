import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { Wordmark } from './Wordmark'
import { LocaleSwitcher } from './LocaleSwitcher'

const NAV = [
  { href: '/servicios', key: 'services' },
  { href: '/integraciones', key: 'integrations' },
  { href: '/contacto', key: 'contact' },
] as const

/**
 * Cabecera del sitio comercial.
 *
 * El menú móvil usa <details>/<summary> en lugar de un estado de React: es un
 * elemento nativo que abre y cierra sin JavaScript, lo que mantiene la
 * navegación operativa con los scripts deshabilitados (FR-050).
 */
export function Header() {
  const t = useTranslations('nav')

  return (
    <header className="border-b border-line">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-(--radius-md) focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        {t('skipToContent')}
      </a>

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-5 sm:px-8">
        <Wordmark />

        <div className="hidden items-center gap-8 md:flex">
          <nav aria-label={t('menu')}>
            <ul className="flex items-center gap-7 text-[0.9375rem]">
              {NAV.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="text-muted underline-offset-[6px] transition-colors hover:text-ink hover:underline"
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <span aria-hidden="true" className="h-4 w-px bg-line" />
          <LocaleSwitcher />
        </div>

        <details className="group relative md:hidden">
          <summary
            className="flex min-h-[2.75rem] min-w-[2.75rem] cursor-pointer list-none items-center justify-center text-[0.875rem] font-medium [&::-webkit-details-marker]:hidden"
            aria-label={t('menu')}
          >
            <span className="group-open:hidden">{t('menu')}</span>
            <span className="hidden group-open:inline">{t('close')}</span>
          </summary>
          <div className="absolute right-0 top-full z-40 mt-4 w-56 border border-line bg-paper p-5 shadow-[0_12px_40px_-24px_rgba(23,25,28,0.5)]">
            <nav>
              <ul className="flex flex-col gap-4 text-[1rem]">
                {NAV.map((item) => (
                  <li key={item.key}>
                    <Link href={item.href} className="block py-1 text-ink">
                      {t(item.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-5 border-t border-line pt-4">
              <LocaleSwitcher />
            </div>
          </div>
        </details>
      </div>
    </header>
  )
}
