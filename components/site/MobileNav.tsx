'use client'

import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'

import { Link, usePathname } from '@/i18n/navigation'
import { ButtonLink } from '@/components/ui/Button'
import { LocaleSwitcher } from './LocaleSwitcher'

const NAV = [
  { href: '/servicios', key: 'services' },
  { href: '/integraciones', key: 'integrations' },
  { href: '/contacto', key: 'contact' },
] as const

/**
 * Menú móvil.
 *
 * Se apoya en <details>/<summary>, que abre y cierra sin JavaScript: esa es la
 * base y funciona siempre (FR-050). El JavaScript solo agrega dos comodidades
 * que la etiqueta nativa no trae —cerrar con Escape y al hacer clic fuera— y su
 * ausencia no rompe nada.
 */
export function MobileNav() {
  const t = useTranslations('nav')
  const ref = useRef<HTMLDetailsElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const details = ref.current
    if (!details) return

    const close = () => {
      details.open = false
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && details.open) {
        close()
        details.querySelector('summary')?.focus()
      }
    }

    const onPointerDown = (event: PointerEvent) => {
      if (details.open && event.target instanceof Node && !details.contains(event.target)) {
        close()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [])

  // Al navegar, el panel quedaba abierto tapando el título de la página nueva.
  useEffect(() => {
    if (ref.current) ref.current.open = false
  }, [pathname])

  return (
    <details ref={ref} className="group relative md:hidden">
      <summary
        className="flex min-h-[2.75rem] min-w-[2.75rem] cursor-pointer list-none items-center justify-center px-2 text-[0.9375rem] font-medium [&::-webkit-details-marker]:hidden"
        aria-label={t('menu')}
      >
        <span className="group-open:hidden">{t('menu')}</span>
        <span className="hidden group-open:inline">{t('close')}</span>
      </summary>

      {/* Fondo distinto del de la página y sombra marcada: sin eso el panel se
          confunde con el contenido que hay detrás. */}
      <div className="fixed inset-x-0 top-[var(--header-h,4.5rem)] z-40 border-y border-line bg-paper/95 px-5 py-4 shadow-[0_24px_60px_-24px_rgb(0_0_0/0.85)] backdrop-blur-xl">
        <nav aria-label={t('menu')}>
          <ul className="flex flex-col">
            {NAV.map((item) => {
              const active = pathname === item.href
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-[3rem] items-center border-b border-line text-[1.0625rem] ${
                      active ? 'font-semibold text-accent' : 'text-ink'
                    }`}
                  >
                    {t(item.key)}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="mt-4 flex items-center justify-between gap-4">
          <LocaleSwitcher />
          <ButtonLink href="/contacto" className="min-h-[2.75rem] px-5 py-2.5 text-[0.875rem]">
            {t('headerCta')}
          </ButtonLink>
        </div>
      </div>
    </details>
  )
}
