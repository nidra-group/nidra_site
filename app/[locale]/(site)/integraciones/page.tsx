import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { PageHeader } from '@/components/site/PageHeader'
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
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} lead={t('lead')}>
        <p className="measure mt-6 flex items-start gap-2.5 text-small text-muted">
          <span
            aria-hidden="true"
            className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
          />
          {t('provenNote')}
        </p>
      </PageHeader>

      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <section key={category.id} id={category.id} className="surface scroll-mt-28 p-6">
              <h2 className="border-b border-line pb-4 text-[1.0625rem] font-bold text-ink">
                {category.name[locale]}
              </h2>
              <ul className="mt-5 space-y-3">
                {category.items.map((item) => (
                  <li key={item.name} className="flex items-baseline justify-between gap-3 text-body">
                    <span className={item.proven ? 'text-ink' : 'text-muted'}>{item.name}</span>
                    {item.proven && (
                      /* Antes la distinción era un punto hueco con `border-line`:
                         1.31:1 contra la tarjeta, o sea invisible, y el resto de
                         la diferencia quedaba cifrada solo en el color del texto
                         (WCAG 1.4.1). Ahora se lee. */
                      <span className="shrink-0 rounded-full border border-accent/35 bg-accent/10 px-2.5 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-accent">
                        {t('provenLabel')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <aside className="surface relative mt-16 overflow-hidden p-8 text-center sm:p-12">
          <div className="aurora opacity-50" aria-hidden="true" />
          <div className="relative z-10">
            <h2 className="mx-auto max-w-[18ch] font-display text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold leading-[1.1] tracking-[-0.03em]">
              {t('missing.title')}
            </h2>
            <p className="measure mx-auto mt-5 text-body text-muted">{t('missing.body')}</p>
            <p className="mt-8">
              <Link href="/contacto" className="link inline-flex min-h-[2.75rem] items-center font-semibold">
                {t('missing.cta')} →
              </Link>
            </p>
          </div>
        </aside>
      </div>
    </>
  )
}
