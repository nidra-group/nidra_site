import type { ComponentProps, ReactNode } from 'react'

import { Link } from '@/i18n/navigation'

type Variant = 'primary' | 'secondary' | 'ghost'

const base =
  'inline-flex items-center justify-center gap-2 rounded-(--radius-md) px-6 py-3.5 ' +
  'text-[0.9375rem] font-medium leading-none transition-colors duration-150 ' +
  // 44px de alto mínimo: objetivo táctil accesible.
  'min-h-[3rem] text-center'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-paper hover:bg-accent-deep',
  secondary: 'border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-paper',
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
