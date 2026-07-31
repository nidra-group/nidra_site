import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { getIntegrations } from '@/lib/content'
import { buildMetadata } from '@/lib/seo/metadata'

type Props = { params: Promise<{ locale: Locale }> }

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'integrations.meta' })
  return buildMetadata({
    locale,
    href: '/integraciones',
    title: t('title'),
    description: t('description'),
  })
}

export default async function IntegrationsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('integrations')
  const categories = getIntegrations()

  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-20">
          <p className="eyebrow">{t('eyebrow')}</p>
          <h1 className="mt-5 max-w-[18ch] font-display text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.04] tracking-[-0.025em]">
            {t('title')}
          </h1>
          <p className="measure mt-7 text-lead text-muted">{t('lead')}</p>
          <p className="measure mt-5 flex items-start gap-2.5 text-small text-muted">
            <span
              aria-hidden="true"
              className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
            />
            {t('provenNote')}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <section key={category.id} id={category.id} className="scroll-mt-8">
              <h2 className="border-b border-line pb-3 text-[1.0625rem] font-medium text-ink">
                {category.name[locale]}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {category.items.map((item) => (
                  <li key={item.name} className="flex items-baseline gap-2.5 text-body">
                    <span
                      aria-hidden="true"
                      className={
                        item.proven
                          ? 'h-1.5 w-1.5 shrink-0 rounded-full bg-accent'
                          : 'h-1.5 w-1.5 shrink-0 rounded-full border border-line'
                      }
                    />
                    <span className={item.proven ? 'text-ink' : 'text-muted'}>{item.name}</span>
                    {item.proven && <span className="sr-only">— {t('provenLabel')}</span>}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <aside className="mt-20 border-t border-ink/20 pt-10">
          <h2 className="max-w-[18ch] font-display text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.1] tracking-[-0.02em]">
            {t('missing.title')}
          </h2>
          <p className="measure mt-4 text-body text-muted">{t('missing.body')}</p>
          <p className="mt-6">
            <Link href="/contacto" className="link">
              {t('missing.cta')} →
            </Link>
          </p>
        </aside>
      </div>
    </>
  )
}
