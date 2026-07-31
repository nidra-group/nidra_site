import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { publicEnv } from '@/lib/env'
import { Wordmark } from './Wordmark'

const CONTACT_EMAIL = 'hola@nidra.cloud'

export function Footer() {
  const t = useTranslations('footer')
  const nav = useTranslations('nav')
  const site = useTranslations('site')
  const year = new Date().getFullYear()

  return (
    <footer className="mt-[--spacing-section] border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Wordmark />
            <p className="measure-tight mt-4 text-small text-muted">{site('tagline')}</p>
          </div>

          <nav aria-label={t('sections.site')}>
            <h2 className="eyebrow mb-4">{t('sections.site')}</h2>
            <ul className="flex flex-col gap-2.5 text-small">
              <li>
                <Link href="/servicios" className="text-muted hover:text-ink">
                  {nav('services')}
                </Link>
              </li>
              <li>
                <Link href="/integraciones" className="text-muted hover:text-ink">
                  {nav('integrations')}
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-muted hover:text-ink">
                  {nav('contact')}
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label={t('sections.legal')}>
            <h2 className="eyebrow mb-4">{t('sections.legal')}</h2>
            <ul className="flex flex-col gap-2.5 text-small">
              <li>
                <Link href="/privacidad" className="text-muted hover:text-ink">
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="text-muted hover:text-ink">
                  {t('terms')}
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow mb-4">{t('sections.contact')}</h2>
            <ul className="flex flex-col gap-2.5 text-small">
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className="link">
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={publicEnv.PROFILE_URL}
                  className="text-muted hover:text-ink"
                  rel="noopener"
                >
                  {t('founder')}
                </a>
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
