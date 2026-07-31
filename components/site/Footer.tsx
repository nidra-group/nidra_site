import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { CONTACT_EMAIL } from '@/lib/contact'
import { Wordmark } from './Wordmark'

export function Footer() {
  const t = useTranslations('footer')
  const nav = useTranslations('nav')
  const site = useTranslations('site')
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Wordmark />
            <p className="measure-tight mt-4 text-small text-muted">{site('tagline')}</p>
          </div>

          <nav aria-label={t('sections.site')}>
            <p className="eyebrow mb-4">{t('sections.site')}</p>
            <ul className="flex flex-col text-small">
              <li>
                <Link href="/servicios" className="flex min-h-[2.75rem] items-center text-muted hover:text-ink">
                  {nav('services')}
                </Link>
              </li>
              <li>
                <Link href="/integraciones" className="flex min-h-[2.75rem] items-center text-muted hover:text-ink">
                  {nav('integrations')}
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="flex min-h-[2.75rem] items-center text-muted hover:text-ink">
                  {nav('contact')}
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label={t('sections.legal')}>
            <p className="eyebrow mb-4">{t('sections.legal')}</p>
            <ul className="flex flex-col text-small">
              <li>
                <Link href="/privacidad" className="flex min-h-[2.75rem] items-center text-muted hover:text-ink">
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="flex min-h-[2.75rem] items-center text-muted hover:text-ink">
                  {t('terms')}
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <p className="eyebrow mb-4">{t('sections.contact')}</p>
            <ul className="flex flex-col text-small">
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className="link inline-flex min-h-[2.75rem] items-center">
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <Link href="/cv" className="flex min-h-[2.75rem] items-center text-muted hover:text-ink">
                  {t('founder')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-12 border-t border-line pt-6 text-[0.8125rem] text-muted">
          © {year} Nidra. {t('rights')}
        </p>
      </div>
    </footer>
  )
}
