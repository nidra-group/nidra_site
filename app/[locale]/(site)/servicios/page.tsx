import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
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
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-20">
          <p className="eyebrow">{t('eyebrow')}</p>
          <h1 className="mt-5 max-w-[20ch] font-display text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.04] tracking-[-0.025em]">
            {t('title')}
          </h1>
          <p className="measure mt-7 text-lead text-muted">{t('lead')}</p>

          {/* Índice de anclas: en una página larga, saber qué hay antes de
              desplazarse es lo que evita que el visitante se vaya. */}
          <nav aria-label={t('indexLabel')} className="mt-10">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {services.map((service) => (
                <li key={service.id}>
                  <a href={`#${service.id}`} className="link text-small">
                    {service.name[locale]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {services.map((service, index) => (
          <section
            key={service.id}
            id={service.id}
            className="scroll-mt-8 border-b border-line py-16 last:border-b-0 sm:py-20"
          >
            <div className="grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
              <div>
                <p aria-hidden="true" className="font-display text-[1.5rem] text-muted">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h2 className="mt-3 max-w-[16ch] font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.1] tracking-[-0.02em]">
                  {service.name[locale]}
                </h2>
                <p className="measure-tight mt-5 text-body text-muted">
                  {service.summary[locale]}
                </p>

                <dl className="mt-8 border-t border-line pt-5">
                  <dt className="eyebrow">{t('timelineLabel')}</dt>
                  <dd className="mt-1.5 text-[1.0625rem] text-ink">{service.timeline[locale]}</dd>
                </dl>

                <p className="mt-7">
                  <Link
                    href={{ pathname: '/contacto', query: { servicio: service.id } }}
                    className="link text-small"
                  >
                    {t('cta')} →
                  </Link>
                </p>
              </div>

              <div className="lg:pt-14">
                <p className="eyebrow">{t('problemLabel')}</p>
                <p className="measure mt-3 text-body">{service.problem[locale]}</p>

                <p className="eyebrow mt-10">{t('deliverablesLabel')}</p>
                <ul className="mt-4 space-y-3">
                  {service.deliverables.map((item) => (
                    <li key={item[locale]} className="flex gap-3 text-body text-muted">
                      <span aria-hidden="true" className="mt-[0.65em] h-px w-4 shrink-0 bg-accent" />
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
