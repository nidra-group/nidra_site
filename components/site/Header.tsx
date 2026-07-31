import { useTranslations } from 'next-intl'

import { ButtonLink } from '@/components/ui/Button'
import { Wordmark } from './Wordmark'
import { LocaleSwitcher } from './LocaleSwitcher'
import { MobileNav } from './MobileNav'
import { NavLink } from './NavLink'

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
    // Fija con desenfoque: mantiene la navegación y el cambio de idioma a un
    // clic en páginas largas sin robar protagonismo — el fondo translúcido la
    // funde con el papel.
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/70 backdrop-blur-xl">
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
                  <NavLink href={item.href}>{t(item.key)}</NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <span aria-hidden="true" className="h-4 w-px bg-line" />
          <LocaleSwitcher />
          <ButtonLink
            href="/contacto"
            className="min-h-0 px-5 py-2.5 text-[0.875rem]"
          >
            {t('headerCta')}
          </ButtonLink>
        </div>

        <MobileNav />
      </div>
    </header>
  )
}
