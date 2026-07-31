import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { InquiryForm } from '@/components/site/InquiryForm'
import { routing, type Locale } from '@/i18n/routing'
import { buildMetadata } from '@/lib/seo/metadata'
import { bookingUrl } from '@/lib/env'
import { issueTimestamp } from '@/lib/validation/inquiry'

const CONTACT_EMAIL = 'hola@nidra.cloud'

type Props = { params: Promise<{ locale: Locale }> }

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

/**
 * Única página con renderizado dinámico del sitio, y la desviación está
 * justificada en el plan.
 *
 * El formulario lleva una marca temporal firmada que el servidor rechaza si
 * tiene más de una hora (defensa anti-bot, FR-016). En una página estática esa
 * marca se hornea en el HTML durante el build, así que una hora después del
 * despliegue TODOS los envíos se rechazan y el sitio pierde el 100% de las
 * consultas en silencio.
 *
 * Emitirla por petición es la única solución que además sigue funcionando sin
 * JavaScript: pedirla con `fetch` al montar dejaría el formulario inservible
 * para quien no ejecuta scripts, incumpliendo FR-050.
 */
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contact.meta' })
  return buildMetadata({
    locale,
    href: '/contacto',
    title: t('title'),
    description: t('description'),
  })
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('contact')

  // La marca temporal se emite al renderizar el formulario: el servidor
  // rechaza envíos con menos de 3 segundos de antigüedad (FR-016).
  const timestamp = issueTimestamp()

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <p className="eyebrow">{t('eyebrow')}</p>
      <h1 className="mt-5 max-w-[16ch] font-display text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.04] tracking-[-0.025em]">
        {t('title')}
      </h1>
      <p className="measure mt-6 text-lead text-muted">{t('lead')}</p>

      <div className="mt-16 grid gap-x-16 gap-y-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* Agenda primero: es el camino más corto a una conversación. Es un
            enlace y no una incrustación, así que funciona sin JavaScript y no
            gasta presupuesto de scripts en la página que convierte. */}
        <div>
          {/* La reserva solo se ofrece si hay un enlace de agenda configurado.
              Publicar el botón con un destino inexistente rompe el camino de
              conversión principal sin que nadie lo note. */}
          {bookingUrl && (
            <section className="border-t border-ink/20 pt-6">
              <h2 className="text-heading text-ink">{t('booking.title')}</h2>
              <p className="measure-tight mt-3 text-body text-muted">{t('booking.body')}</p>
              <p className="mt-5">
                <a href={bookingUrl} rel="noopener" className="link">
                  {t('booking.cta')} →
                </a>
              </p>
              <p className="mt-2 text-[0.8125rem] text-muted">{t('booking.note')}</p>
            </section>
          )}

          {/* Qué pasa después de enviar. Responder esto antes de que lo
              pregunten es lo que baja la fricción de un formulario frío. */}
          <section className={bookingUrl ? 'mt-12 border-t border-line pt-6' : 'border-t border-ink/20 pt-6'}>
            <h2 className="text-heading text-ink">{t('next.title')}</h2>
            <ol className="mt-5 space-y-4">
              {(t.raw('next.steps') as string[]).map((step, index) => (
                <li key={step} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-[0.15em] font-display text-[1.125rem] leading-none text-muted"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="measure-tight text-body text-muted">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-12 border-t border-line pt-6">
            <h2 className="text-[1.0625rem] font-medium text-ink">{t('direct.title')}</h2>
            <p className="measure-tight mt-2 text-small text-muted">{t('direct.body')}</p>
            <p className="mt-3">
              <a href={`mailto:${CONTACT_EMAIL}`} className="link">
                {CONTACT_EMAIL}
              </a>
            </p>
          </section>
        </div>

        <section className="border-t border-ink/20 pt-6">
          <h2 className="text-heading text-ink">{t('form.title')}</h2>
          <p className="measure-tight mt-3 text-body text-muted">{t('form.body')}</p>
          <div className="mt-8">
            <InquiryForm timestamp={timestamp} />
          </div>
        </section>
      </div>
    </div>
  )
}
