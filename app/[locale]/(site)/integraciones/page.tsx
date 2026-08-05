import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { PageHeader } from '@/components/site/PageHeader'
import { TechLogo } from '@/components/site/TechLogo'
import { TECH_ICONS } from '@/lib/content/tech-icons'
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
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        titleAccent={t('titleAccent')}
        lead={t('lead')}
      />

      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            /* El hueco del logotipo se reserva por categoría y no por
               plataforma. Reservarlo siempre dejaría sangrada toda una tarjeta
               como Facturación, donde NINGUNA marca tiene trazado disponible;
               no reservarlo nunca dejaría los nombres en zigzag en las mixtas,
               que son la mayoría. */
            const conLogo = category.items.some(
              (item) => item.icon && TECH_ICONS.has(item.icon),
            )

            return (
              <section key={category.id} id={category.id} className="surface scroll-mt-28 p-6">
                <h2 className="border-b border-line pb-4 text-[1.0625rem] font-bold text-ink">
                  {category.name[locale]}
                </h2>
                {/* Todas las plataformas se muestran igual. El campo `proven`
                    sigue existiendo en el contenido y sigue ordenando la lista
                    —las de experiencia demostrable van primero— pero ya no se
                    anuncia: quién tiene o no trabajo en producción con cada
                    herramienta es una conversación de reunión, no un dato que
                    el visitante necesite. */}
                <ul className="mt-5 space-y-3">
                  {category.items.map((item) => (
                    <li
                      key={item.name}
                      className="flex items-center gap-2.5 text-body text-ink/85"
                    >
                      {conLogo && (
                        <span className="flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center">
                          <TechLogo
                            icon={item.icon}
                            className="h-full w-full fill-current text-muted"
                          />
                        </span>
                      )}
                      {item.name}
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
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
