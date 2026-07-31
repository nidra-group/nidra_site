'use client'

import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
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
      <div className="absolute right-0 top-full z-40 mt-4 w-60 border border-ink/15 bg-surface p-5 shadow-[0_20px_50px_-20px_rgba(23,25,28,0.45)]">
        <nav>
          <ul className="flex flex-col">
            {NAV.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className="block py-3 text-[1.0625rem] text-ink">
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-3 border-t border-line pt-3">
          <LocaleSwitcher />
        </div>
      </div>
    </details>
  )
}
