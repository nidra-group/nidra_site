import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { PageHeader } from '@/components/site/PageHeader'
import { ServiceIcon } from '@/components/ui/ServiceIcon'
import { routing, type Locale } from '@/i18n/routing'
import { getServices } from '@/lib/content'
import { buildMetadata } from '@/lib/seo/metadata'

type Props = { params: Promise<{ locale: Locale }> }

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'services.meta' })
  return buildMetadata({
    locale,
    href: '/servicios',
    title: t('title'),
    description: t('description'),
  })
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('services')
  const services = getServices()

  return (
    <>
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        titleAccent={t('titleAccent')}
        lead={t('lead')}
      >
        {/* Índice de anclas: en una página larga, saber qué hay antes de
            desplazarse es lo que evita que el visitante se vaya. */}
        <nav aria-label={t('indexLabel')} className="mt-12">
          <ul className="flex flex-wrap gap-2.5">
            {services.map((service) => (
              <li key={service.id}>
                <a
                  href={`#${service.id}`}
                  className="surface surface-interactive flex items-center gap-2.5 px-4 py-2.5 text-small text-ink"
                >
                  <span className="text-accent">
                    <ServiceIcon id={service.id} className="h-4 w-4" />
                  </span>
                  {service.name[locale]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>

      <div className="mx-auto max-w-6xl space-y-5 px-5 py-20 sm:px-8 sm:py-24">
        {services.map((service, index) => (
          <section
            key={service.id}
            id={service.id}
            className="surface scroll-mt-28 p-8 sm:p-10"
          >
            <div className="grid gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
              <div>
                <div className="flex items-center gap-4">
                  <span className="chip">
                    <ServiceIcon id={service.id} />
                  </span>
                  <span aria-hidden="true" className="font-mono text-[0.8125rem] text-muted">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <h2 className="mt-6 max-w-[16ch] font-display text-[clamp(1.625rem,3.2vw,2.25rem)] font-extrabold leading-[1.1] tracking-[-0.03em]">
                  {service.name[locale]}
                </h2>
                <p className="measure-tight mt-5 text-body text-muted">
                  {service.summary[locale]}
                </p>

                <dl className="mt-8 border-t border-line pt-5">
                  <dt className="eyebrow eyebrow-muted">{t('timelineLabel')}</dt>
                  <dd className="mt-2 font-mono text-[1.0625rem] text-accent">
                    {service.timeline[locale]}
                  </dd>
                </dl>

                <p className="mt-7">
                  <Link
                    href={{ pathname: '/contacto', query: { servicio: service.id } }}
                    className="link inline-flex min-h-[2.75rem] items-center text-small font-semibold"
                  >
                    {t('cta')} →
                  </Link>
                </p>
              </div>

              <div>
                <p className="eyebrow">{t('problemLabel')}</p>
                <p className="measure mt-3 text-body">{service.problem[locale]}</p>

                <p className="eyebrow mt-10">{t('deliverablesLabel')}</p>
                <ul className="mt-4 space-y-3">
                  {service.deliverables.map((item) => (
                    <li key={item[locale]} className="flex gap-3.5 text-body text-muted">
                      <span
                        aria-hidden="true"
                        className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                      />
                      <span className="measure">{item[locale]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}
      </div>
    </>
  )
}
