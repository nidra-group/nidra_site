import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { InquiryForm } from '@/components/site/InquiryForm'
import { PageHeader } from '@/components/site/PageHeader'
import { routing, type Locale } from '@/i18n/routing'
import { buildMetadata } from '@/lib/seo/metadata'
import { CONTACT_EMAIL } from '@/lib/contact'
import { bookingUrl } from '@/lib/env'
import { issueTimestamp, SERVICE_OPTIONS } from '@/lib/validation/inquiry'

type Props = {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

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

export default async function ContactPage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('contact')

  // La marca temporal se emite al renderizar el formulario: el servidor
  // rechaza envíos con menos de 3 segundos de antigüedad (FR-016).
  const timestamp = issueTimestamp()

  // El servicio preseleccionado llega desde la página de servicios. Se resuelve
  // en el servidor —esta página ya es dinámica por la marca temporal— para que
  // el desplegable llegue relleno también sin JavaScript. Se valida contra el
  // catálogo: un parámetro inventado se descarta en silencio en vez de dejar el
  // desplegable en un estado que no corresponde a ninguna opción.
  const requested = (await searchParams).servicio
  const initialService =
    typeof requested === 'string' && (SERVICE_OPTIONS as readonly string[]).includes(requested)
      ? requested
      : ''

  return (
    <>
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        titleAccent={t('titleAccent')}
        lead={bookingUrl ? t('lead') : t('leadNoBooking')}
      />

      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        {/* La columna izquierda es más corta que el formulario. Sin `sticky`
            deja un vacío largo a la altura del envío, que es justo donde hace
            falta tener a la vista el correo directo y qué pasa después. */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start">
          {/* Agenda primero: es el camino más corto a una conversación. Es un
              enlace y no una incrustación, así que funciona sin JavaScript y no
              gasta presupuesto de scripts en la página que convierte. */}
          <div className="lg:sticky lg:top-28">
          {/* La reserva solo se ofrece si hay un enlace de agenda configurado.
              Publicar el botón con un destino inexistente rompe el camino de
              conversión principal sin que nadie lo note. */}
          {bookingUrl && (
            <section className="surface p-7">
              <h2 className="text-heading font-bold text-ink">{t('booking.title')}</h2>
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
          <section className={bookingUrl ? 'surface mt-6 p-7' : 'surface p-7'}>
            <h2 className="text-heading font-bold text-ink">{t('next.title')}</h2>
            <ol className="mt-5 space-y-4">
              {(t.raw('next.steps') as string[]).map((step, index) => (
                <li key={step} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-[0.25em] font-mono text-[0.8125rem] leading-none text-accent"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="measure-tight text-body text-muted">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="surface mt-6 p-7">
            <h2 className="text-[1.0625rem] font-bold text-ink">{t('direct.title')}</h2>
            <p className="measure-tight mt-2 text-small text-muted">{t('direct.body')}</p>
            <p className="mt-3">
              <a href={`mailto:${CONTACT_EMAIL}`} className="link inline-flex min-h-[2.75rem] items-center">
                {CONTACT_EMAIL}
              </a>
            </p>
          </section>
        </div>

          <section className="surface p-7 sm:p-9">
            <h2 className="text-heading font-bold text-ink">{t('form.title')}</h2>
            <p className="measure-tight mt-3 text-body text-muted">{t('form.body')}</p>
            <div className="mt-8">
              <InquiryForm timestamp={timestamp} initialService={initialService} />
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
