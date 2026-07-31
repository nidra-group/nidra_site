'use client'

import { Link, usePathname } from '@/i18n/navigation'

/**
 * Enlace de navegación con estado de página actual.
 *
 * Sin esto, las tres entradas del menú se pintan igual en todas las rutas y
 * nadie sabe dónde está parado. El estado se marca por partida doble —color y
 * subrayado para quien mira, `aria-current` para quien escucha— porque el
 * color por sí solo no es un indicador accesible (WCAG 1.4.1).
 */
export function NavLink({
  href,
  children,
}: {
  href: React.ComponentProps<typeof Link>['href']
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const active = pathname === href

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={
        active
          ? 'inline-flex min-h-[2.75rem] items-center font-medium text-ink underline decoration-accent decoration-2 underline-offset-[6px]'
          : 'inline-flex min-h-[2.75rem] items-center text-muted underline-offset-[6px] transition-colors hover:text-ink hover:underline'
      }
    >
      {children}
    </Link>
  )
}
