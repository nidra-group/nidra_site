import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ButtonLink, ButtonExternal } from '@/components/ui/Button'
import { Link } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { getServices, getTechnologies, getProfile, getYearsOfExperience } from '@/lib/content'
import { buildMetadata } from '@/lib/seo/metadata'
import { publicEnv } from '@/lib/env'

type Props = { params: Promise<{ locale: Locale }> }

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home.meta' })
  return buildMetadata({
    locale,
    href: '/',
    title: t('title'),
    description: t('description'),
  })
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('home')
  const services = getServices()
  const technologies = getTechnologies()
  const years = getYearsOfExperience(getProfile())

  const steps = t.raw('process.steps') as { title: string; body: string }[]

  return (
    <>
      {/* ── Héroe ──────────────────────────────────────────────────────────
          Alineado a la izquierda y asimétrico a propósito. El héroe centrado
          con título gigante y dos botones debajo es el patrón más repetido de
          la web de IA y le resta credibilidad al mensaje. */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
          <p className="eyebrow">{t('hero.eyebrow')}</p>

          <h1 className="mt-6 max-w-[19ch] font-display text-[clamp(2.5rem,7.5vw,4.5rem)] leading-[1.02] tracking-[-0.025em]">
            {t('hero.title')}{' '}
            <span className="italic text-muted">{t('hero.titleAccent')}</span>
          </h1>

          <p className="measure mt-8 text-lead text-muted">{t('hero.lead')}</p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonExternal
              href={publicEnv.BOOKING_URL}
              rel="noopener"
              className="sm:w-auto"
            >
              {t('hero.primaryCta')}
            </ButtonExternal>
            <ButtonLink href="/servicios" variant="secondary">
              {t('hero.secondaryCta')}
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* ── Franja de credibilidad ─────────────────────────────────────────
          Datos verificables separados por reglas finas, no tarjetas con
          sombra. Tres tarjetas idénticas con ícono redondo arriba es el otro
          patrón que delata una plantilla. */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
            <div className="py-9 md:pr-10">
              <p className="font-display text-[3rem] leading-none text-ink">{years}</p>
              <p className="mt-2 text-small font-medium text-ink">{t('credibility.experience')}</p>
              <p className="measure-tight mt-1.5 text-small text-muted">
                {t('credibility.experienceDetail')}
              </p>
            </div>
            <div className="py-9 md:px-10">
              <p className="eyebrow">{t('credibility.focus')}</p>
              <p className="measure-tight mt-3 text-small text-muted">
                {t('credibility.focusDetail')}
              </p>
            </div>
            <div className="py-9 md:pl-10">
              <p className="eyebrow">{t('credibility.location')}</p>
              <p className="measure-tight mt-3 text-small text-muted">
                {t('credibility.locationDetail')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Servicios ──────────────────────────────────────────────────────
          Lista numerada de dos columnas en vez de una grilla de tarjetas. Se
          lee como un índice editorial y deja que los títulos —que es lo que
          importa— tengan peso tipográfico real. */}
      <section className="mx-auto max-w-6xl px-5 py-(--spacing-section) sm:px-8">
        <div className="md:flex md:items-end md:justify-between md:gap-12">
          <div>
            <p className="eyebrow">{t('services.eyebrow')}</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,2.75rem)] leading-[1.08] tracking-[-0.02em]">
              {t('services.title')}
            </h2>
          </div>
          <p className="measure-tight mt-4 text-body text-muted md:mt-0 md:text-right">
            {t('services.lead')}
          </p>
        </div>

        <ol className="mt-14 border-t border-line">
          {services.map((service, index) => (
            <li key={service.id} className="border-b border-line">
              <Link
                href={{ pathname: '/servicios', hash: service.id }}
                className="group grid gap-x-8 gap-y-2 py-7 md:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.1fr)] md:items-baseline"
              >
                <span
                  aria-hidden="true"
                  className="font-display text-[1.25rem] text-muted md:text-[1.5rem]"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-heading text-ink underline-offset-[6px] group-hover:underline">
                  {service.name[locale]}
                </h3>
                <p className="text-small text-muted">{service.summary[locale]}</p>
              </Link>
            </li>
          ))}
        </ol>

        <p className="mt-8">
          <Link href="/servicios" className="link text-small">
            {t('services.cta')} →
          </Link>
        </p>
      </section>

      {/* ── Proceso ────────────────────────────────────────────────────────*/}
      <section className="border-y border-line bg-surface/50">
        <div className="mx-auto max-w-6xl px-5 py-(--spacing-section) sm:px-8">
          <p className="eyebrow">{t('process.eyebrow')}</p>
          <div className="mt-4 md:flex md:items-end md:justify-between md:gap-12">
            <h2 className="max-w-[16ch] font-display text-[clamp(2rem,4.5vw,2.75rem)] leading-[1.08] tracking-[-0.02em]">
              {t('process.title')}
            </h2>
            <p className="measure-tight mt-4 text-body text-muted md:mt-0">{t('process.lead')}</p>
          </div>

          <ol className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title} className="border-t border-ink/20 pt-5">
                <p className="eyebrow text-accent">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-3 text-[1.1875rem] font-medium leading-snug text-ink">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-small text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Tecnologías ────────────────────────────────────────────────────
          Marcas denominativas en texto, no logotipos. Evita la "sopa de
          logos" y, sobre todo, evita insinuar una relación comercial que no
          existe (FR-028). La nota lo dice de forma explícita. */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <p className="eyebrow">{t('technologies.eyebrow')}</p>
        <ul className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
          {technologies.map((tech) => (
            <li key={tech.name} className="text-[1.0625rem] text-ink/70">
              {tech.name}
            </li>
          ))}
        </ul>
        <p className="measure mt-6 text-[0.8125rem] leading-relaxed text-muted">
          {t('technologies.note')}
        </p>
      </section>

      {/* ── Cierre ─────────────────────────────────────────────────────────*/}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-(--spacing-section) sm:px-8">
          <h2 className="max-w-[20ch] font-display text-[clamp(2rem,5vw,3.25rem)] leading-[1.05] tracking-[-0.02em]">
            {t('closing.title')}
          </h2>
          <p className="measure mt-6 text-lead text-muted">{t('closing.lead')}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonExternal href={publicEnv.BOOKING_URL} rel="noopener">
              {t('closing.primaryCta')}
            </ButtonExternal>
            <ButtonLink href="/contacto" variant="secondary">
              {t('closing.secondaryCta')}
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
