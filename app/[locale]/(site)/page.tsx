import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ButtonLink, ButtonExternal } from '@/components/ui/Button'
import { ServiceIcon } from '@/components/ui/ServiceIcon'
import { TechGrid } from '@/components/site/TechGrid'
import { FlowDiagram } from '@/components/site/FlowDiagram'
import { Link } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { getServices, getTechnologies, getProfile, getYearsOfExperience } from '@/lib/content'
import { buildMetadata } from '@/lib/seo/metadata'
import { ogImagePath } from '@/lib/seo/og-cards'
import { bookingUrl, profileHref } from '@/lib/env'

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
    imagePath: ogImagePath('home', locale),
    title: t('title'),
    description: t('description'),
  })
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('home')
  const present = (await getTranslations('cv'))('present')
  const services = getServices()
  const technologies = getTechnologies()
  const profile = getProfile()
  const years = getYearsOfExperience(profile)
  const linkedin = profile.person.links.find((link) => link.type === 'linkedin')

  const steps = t.raw('process.steps') as { title: string; body: string }[]
  const pains = t.raw('pain.items') as { title: string; body: string }[]
  const investment = t.raw('investment.items') as { title: string; body: string }[]

  return (
    <>
      {/* ── Héroe ──────────────────────────────────────────────────────────
          Centrado y a gran escala sobre la aurora. La luz ambiente y la
          retícula son puro CSS: no hay lienzo, ni vídeo, ni imagen que
          descargar, así que el efecto no cuesta nada en el presupuesto de
          rendimiento. */}
      <section className="relative isolate overflow-hidden">
        <div className="aurora" aria-hidden="true">
          {/* La franja verde-cian del crepúsculo, a media altura. Solo va en
              el héroe: es el momento más alto del cielo de la marca y
              repetirla en cada sección la volvería un adorno. */}
          <div className="aurora-band" />
        </div>
        <div className="grid-veil" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-5xl px-5 pb-24 pt-20 text-center sm:px-8 sm:pb-32 sm:pt-28">
          <p className="pill mx-auto font-mono text-[0.75rem] uppercase tracking-[0.12em] text-accent">
            {t('hero.eyebrow')}
          </p>

          <h1 className="mx-auto mt-8 max-w-[15ch] font-display text-[clamp(2.25rem,7vw,5rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">
            {t('hero.title')} <span className="accent-word">{t('hero.titleAccent')}</span>
          </h1>

          <p className="mx-auto mt-7 max-w-[52ch] text-lead text-muted">{t('hero.lead')}</p>

          <div className="mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {bookingUrl ? (
              <ButtonExternal href={bookingUrl} rel="noopener">
                {t('hero.primaryCta')}
              </ButtonExternal>
            ) : (
              <ButtonLink href="/contacto">{t('closing.secondaryCta')}</ButtonLink>
            )}
            <ButtonLink href="/servicios" variant="secondary">
              {t('hero.secondaryCta')}
            </ButtonLink>
          </div>

          {/* El objeto del héroe: sistemas sueltos que entran, un proceso en
              el medio, salidas ya en producción. Es lo que Nidra construye,
              dibujado como lo dibujaría un equipo de ingeniería. Se oculta en
              móvil, donde no hay ancho para que se lea. */}
          <div
            aria-hidden="true"
            className="mx-auto mt-16 hidden h-[300px] w-full max-w-4xl md:block"
          >
            <FlowDiagram />
          </div>

          {/* Franja de credibilidad. Los tres datos son verificables: los años
              se calculan del currículum, el foco describe el trabajo y la
              ubicación es la real. No hay métricas de clientes porque la
              empresa todavía no las tiene, e inventarlas es la forma más
              rápida de perder la confianza que el sitio busca. */}
          <dl className="mt-16 grid gap-4 text-left sm:grid-cols-3">
            {[
              {
                hue: 'a',
                label: t('credibility.experience'),
                value: (
                  <>
                    {years}
                    <span className="accent-word">+</span>
                  </>
                ),
                detail: t('credibility.experienceDetail'),
              },
              {
                hue: 'b',
                label: t('credibility.ownershipLabel'),
                value: t('credibility.ownershipValue'),
                detail: t('credibility.ownershipDetail'),
              },
              {
                hue: 'c',
                label: t('credibility.regionLabel'),
                value: t('credibility.regionValue'),
                detail: t('credibility.locationDetail'),
              },
            ].map((stat) => (
              <div key={stat.label} data-hue={stat.hue} className="surface p-7 text-left">
                <span aria-hidden="true" className="dot" />
                <dt className="eyebrow eyebrow-muted mt-4">{stat.label}</dt>
                <dd className="mt-3 font-display text-[2.75rem] font-extrabold leading-none tracking-[-0.03em]">
                  {stat.value}
                </dd>
                <dd className="mt-3 text-small text-muted">{stat.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── El punto de partida ────────────────────────────────────────────
          Reconocimiento antes que oferta.

          Quien llega acá no busca «una agencia de IA»: tiene un problema
          concreto y todavía no sabe que tiene nombre. Esta sección describe
          su semana con precisión para que se reconozca, y recién después la
          página le ofrece algo. Sin este bloque, el sitio arrancaba hablando
          de sí mismo.

          El costo va al final y en su propia caja: es el dato que convierte
          una molestia tolerada en un número que se puede comparar contra un
          presupuesto. */}
      <section className="mx-auto max-w-6xl px-5 pb-24 pt-4 sm:px-8">
        <div className="text-center">
          <p className="eyebrow">{t('pain.eyebrow')}</p>
          <h2 className="mx-auto mt-5 max-w-[20ch] font-display text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.06] tracking-[-0.03em]">
            {t('pain.title')} <span className="accent-word">{t('pain.titleAccent')}</span>
          </h2>
          <p className="measure mx-auto mt-5 text-body text-muted">{t('pain.lead')}</p>
        </div>

        <ul className="reveal mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pains.map((pain) => (
            <li key={pain.title} className="surface flex flex-col p-7">
              <h3 className="text-heading font-bold text-ink">{pain.title}</h3>
              <p className="mt-3 text-small text-muted">{pain.body}</p>
            </li>
          ))}

          {/* El costo ocupa la última celda de la grilla: cierra la lista de
              síntomas con la cifra, en vez de quedar suelto debajo. */}
          <li className="surface flex flex-col justify-center border-accent/30 bg-accent/5 p-7">
            <p className="text-body font-medium text-ink">{t('pain.cost')}</p>
          </li>
        </ul>
      </section>

      {/* ── Servicios ──────────────────────────────────────────────────────
          Grilla de tarjetas enlazadas. Cada una lleva el icono de su propio
          servicio, no un adorno intercambiable. */}
      <section className="mx-auto max-w-6xl px-5 pb-28 pt-24 sm:px-8">
        <div className="text-center">
          <p className="eyebrow">{t('services.eyebrow')}</p>
          <h2 className="mx-auto mt-5 max-w-[18ch] font-display text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.06] tracking-[-0.03em]">
            {t('services.title')} <span className="accent-word">{t('services.titleAccent')}</span>
          </h2>
          <p className="measure mx-auto mt-5 text-body text-muted">{t('services.lead')}</p>
        </div>

        <ul className="reveal mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <li key={service.id}>
              <Link
                href={{ pathname: '/servicios', hash: service.id }}
                className="surface surface-interactive group flex h-full flex-col p-7"
              >
                <span className="chip">
                  <ServiceIcon id={service.id} />
                </span>
                <h3 className="mt-6 text-heading font-bold text-ink transition-colors group-hover:text-accent">
                  {service.name[locale]}
                </h3>
                <p className="mt-3 text-small text-muted">{service.summary[locale]}</p>
                <span className="mt-auto flex items-center gap-2.5 pt-7 font-mono text-[0.75rem] uppercase tracking-[0.12em] text-muted transition-colors group-hover:text-accent">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                  {service.timeline[locale]}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-center">
          <Link href="/servicios" className="link inline-flex min-h-[2.75rem] items-center text-small font-semibold">
            {t('services.cta')} →
          </Link>
        </p>
      </section>

      {/* ── Proceso ────────────────────────────────────────────────────────
          Línea de tiempo real: el orden importa porque cada etapa depende de
          la anterior. Acá la numeración sí informa, no decora. */}
      <section className="border-y border-line bg-surface/35">
        <div className="mx-auto max-w-6xl px-5 py-(--spacing-section) sm:px-8">
          <div className="lg:grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-x-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="eyebrow">{t('process.eyebrow')}</p>
              <h2 className="mt-5 max-w-[14ch] font-display text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.06] tracking-[-0.03em]">
                {t('process.title')}{' '}
                <span className="accent-word">{t('process.titleAccent')}</span>
              </h2>
              <p className="measure-tight mt-5 text-body text-muted">{t('process.lead')}</p>
            </div>

            <ol className="reveal mt-14 space-y-4 lg:mt-0">
              {steps.map((step, index) => (
                <li key={step.title} className="surface flex gap-5 p-6 sm:p-7">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 font-mono text-[0.8125rem] font-medium text-accent"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-heading font-bold text-ink">{step.title}</h3>
                    <p className="mt-2.5 text-small text-muted">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── La inversión ───────────────────────────────────────────────────
          La objeción real de una PyME no es «no me sirve»: es «no me da el
          presupuesto». Esta sección no baja el precio, cambia la unidad de
          medida — de cuánto sale a en cuánto se paga — y entrega el método
          para que el lector haga la cuenta con sus propios números.

          El cierre es deliberadamente el argumento más fuerte del sitio:
          decir «si no da, te lo digo» es lo único que distingue a un
          proveedor de alguien que quiere vender igual. */}
      <section className="mx-auto max-w-6xl px-5 py-(--spacing-section) sm:px-8">
        <div className="lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-x-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">{t('investment.eyebrow')}</p>
            <h2 className="mt-5 max-w-[16ch] font-display text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.06] tracking-[-0.03em]">
              {t('investment.title')}{' '}
              <span className="accent-word">{t('investment.titleAccent')}</span>
            </h2>
            <p className="measure-tight mt-5 text-body text-muted">{t('investment.lead')}</p>
          </div>

          <div className="mt-14 lg:mt-0">
            <ul className="reveal space-y-4">
              {investment.map((item) => (
                <li key={item.title} className="surface p-6 sm:p-7">
                  <h3 className="text-heading font-bold text-ink">{item.title}</h3>
                  <p className="mt-2.5 text-small text-muted">{item.body}</p>
                </li>
              ))}
            </ul>

            <p className="surface mt-4 border-accent/30 bg-accent/5 p-6 text-body font-medium text-ink sm:p-7">
              {t('investment.close')}
            </p>
          </div>
        </div>
      </section>

      {/* ── Quién está detrás ──────────────────────────────────────────────
          Una agencia recién fundada no tiene reseñas ni casos propios, y
          fabricarlos es exactamente lo que hace que un sitio deje de merecer
          confianza. Lo único verificable que hay es la trayectoria del
          fundador, así que se muestra tal cual: puestos, organizaciones y
          fechas, derivados del mismo YAML que produce el currículum y los PDF.
          Si un dato cambia ahí, cambia acá. */}
      <section className="mx-auto max-w-6xl px-5 py-(--spacing-section) sm:px-8">
        <div className="surface relative overflow-hidden p-8 sm:p-12">
          <div className="aurora opacity-40" aria-hidden="true" />
          <div className="relative z-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-x-16">
            <div>
              <p className="eyebrow">{t('founder.eyebrow')}</p>
              <h2 className="mt-5 max-w-[16ch] font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-extrabold leading-[1.08] tracking-[-0.03em]">
                {t('founder.title')}
              </h2>
              <p className="measure mt-6 text-body text-muted">{t('founder.lead', { years })}</p>
              <p className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
                {/* Absoluto, no interno: el perfil vive en su propio
                    subdominio cuando está configurado. Ver profileHref. */}
                <a
                  href={profileHref(locale)}
                  className="link inline-flex min-h-[2.75rem] items-center text-small font-semibold"
                >
                  {t('founder.ctaProfile')} →
                </a>
                {linkedin && (
                  <a href={linkedin.url} rel="noopener" target="_blank" className="link text-small">
                    {t('founder.ctaLinkedin')} ↗
                  </a>
                )}
              </p>
            </div>

            <div className="mt-12 lg:mt-1.5">
              <p className="eyebrow eyebrow-muted">{t('founder.trackRecord')}</p>
              <ul className="mt-5">
                {profile.experiences.slice(0, 4).map((exp) => (
                  <li
                    key={exp.id}
                    className="flex items-baseline justify-between gap-5 border-b border-line py-4 last:border-0"
                  >
                    <span className="text-small">
                      <span className="font-semibold text-ink">{exp.org}</span>
                      {exp.client && <span className="text-muted"> · {exp.client}</span>}
                      <span className="block text-muted">{exp.role[locale]}</span>
                    </span>
                    <span className="shrink-0 font-mono text-[0.8125rem] tabular-nums text-muted">
                      {`${exp.start.slice(0, 4)}–${exp.end ? exp.end.slice(0, 4) : present}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ── Tecnologías ────────────────────────────────────────────────────
          Sección propia: con veintiocho herramientas en cuatro categorías ya
          no es un dato al pie de la trayectoria.

          Los logotipos van en un solo color y se encienden al pasar el
          cursor. Además de evitar la sopa de logos, el monocromo evita la
          lectura de «socio oficial» que produce un logotipo a color — y esa
          relación no existe (FR-028). La nota de abajo lo dice explícito. */}
      <section className="border-t border-line bg-surface/25">
        <div className="mx-auto max-w-6xl px-5 py-(--spacing-section) sm:px-8">
          <div className="lg:grid lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-x-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="eyebrow">{t('technologies.eyebrow')}</p>
              <h2 className="mt-5 max-w-[15ch] font-display text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.06] tracking-[-0.03em]">
                {t('technologies.title')}{' '}
                <span className="accent-word">{t('technologies.titleAccent')}</span>
              </h2>
              <p className="measure-tight mt-5 text-body text-muted">{t('technologies.lead')}</p>
              <p className="measure-tight mt-6 text-[0.8125rem] leading-relaxed text-muted">
                {t('technologies.note')}
              </p>
            </div>

            <div className="reveal mt-14 lg:mt-0">
              <TechGrid technologies={technologies} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Cierre ─────────────────────────────────────────────────────────*/}
      <section className="relative isolate overflow-hidden border-t border-line">
        <div className="aurora" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-4xl px-5 py-(--spacing-section) text-center sm:px-8">
          <h2 className="mx-auto max-w-[18ch] font-display text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[1.04] tracking-[-0.035em]">
            {t('closing.title')}
          </h2>
          <p className="measure mx-auto mt-6 text-lead text-muted">{t('closing.lead')}</p>
          <div className="mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {bookingUrl && (
              <ButtonExternal href={bookingUrl} rel="noopener">
                {t('closing.primaryCta')}
              </ButtonExternal>
            )}
            <ButtonLink href="/contacto" variant={bookingUrl ? 'secondary' : 'primary'}>
              {t('closing.secondaryCta')}
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
