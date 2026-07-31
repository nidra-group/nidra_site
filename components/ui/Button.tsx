import type { ComponentProps, ReactNode } from 'react'

import { Link } from '@/i18n/navigation'

type Variant = 'primary' | 'secondary' | 'ghost'

const base =
  'inline-flex items-center justify-center gap-2 rounded-(--radius-md) px-7 py-3.5 ' +
  'text-[0.9375rem] font-semibold leading-none ' +
  'transition-[background-color,border-color,box-shadow,transform] duration-200 ' +
  // 48px de alto mínimo: objetivo táctil accesible con margen.
  'min-h-[3rem] text-center'

const variants: Record<Variant, string> = {
  // El primario lleva un halo del propio acento: sobre un fondo oscuro, un
  // botón plano se hunde; el halo lo despega del papel.
  primary:
    'bg-accent text-paper shadow-[0_0_0_0_transparent] ' +
    'hover:bg-accent-deep hover:shadow-[0_8px_28px_-8px_var(--color-accent)]',
  // El borde usa `line-strong` y no `line`: es lo único que delimita el
  // control, y `line` da 1.31:1 contra el papel — invisible (WCAG 1.4.11).
  secondary:
    'border border-line-strong bg-surface/60 text-ink backdrop-blur-sm ' +
    'hover:border-accent hover:bg-surface',
  ghost: 'text-accent hover:text-accent-deep underline underline-offset-4 px-0 min-h-0 py-1',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ComponentProps<'button'> & { variant?: Variant; children: ReactNode }) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  )
}

export function ButtonLink({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ComponentProps<typeof Link> & { variant?: Variant; children: ReactNode }) {
  return (
    <Link className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </Link>
  )
}

export function ButtonExternal({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ComponentProps<'a'> & { variant?: Variant; children: ReactNode }) {
  return (
    <a className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </a>
  )
}
