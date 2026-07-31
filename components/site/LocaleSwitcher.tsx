'use client'

import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'

import { Link, usePathname } from '@/i18n/navigation'
import { locales } from '@/i18n/routing'

/**
 * Selector de idioma.
 *
 * Usa `usePathname` y `<Link>` de i18n/navigation, que traducen el segmento al
 * cambiar de idioma: desde `/es/servicios` lleva a `/en/services`, no a
 * `/en/servicios`. Construir el href a mano rompería esa traducción.
 *
 * Se renderiza como enlaces y no como un <select> con JavaScript, para que
 * funcione sin scripts (FR-050).
 */
export function LocaleSwitcher() {
  const t = useTranslations('language')
  const current = useLocale()
  const pathname = usePathname()

  return (
    <nav aria-label={t('label')} className="-my-2 flex items-center text-[0.8125rem]">
      {locales.map((locale, index) => {
        const isCurrent = locale === current
        return (
          <span key={locale} className="flex items-center">
            {index > 0 && (
              <span aria-hidden="true" className="mx-1.5 text-line">
                /
              </span>
            )}
            <Link
              href={pathname}
              locale={locale}
              hrefLang={locale}
              aria-current={isCurrent ? 'true' : undefined}
              aria-label={isCurrent ? undefined : t('switchTo')}
              className={
                'inline-flex min-h-[2.75rem] min-w-[2.75rem] items-center justify-center ' +
                (isCurrent
                  ? 'font-medium text-ink'
                  : 'text-muted underline-offset-4 hover:text-ink hover:underline')
              }
            >
              {locale.toUpperCase()}
            </Link>
          </span>
        )
      })}
    </nav>
  )
}
