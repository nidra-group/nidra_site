import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { CvDocument } from '@/components/cv/CvDocument'
import { Portrait } from '@/components/cv/Portrait'
import { routing, type Locale } from '@/i18n/routing'
import { getProfile } from '@/lib/content'
import { getCvVersion } from '@/lib/cv/version'

type Props = { params: Promise<{ locale: Locale }> }

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

/**
 * Vista de impresión del currículum.
 *
 * Es el origen del documento portátil: el script de build imprime esta ruta a
 * PDF con Playwright. Por eso no hay dos maquetaciones que mantener
 * sincronizadas — si esta vista se ve bien impresa, el PDF es correcto por
 * definición (FR-039, FR-047).
 *
 * Sin navegación, sin pie, sin fondos decorativos. Los estilos de impresión
 * viven en el bloque @media print de app/globals.css.
 */
export default async function CvPrintPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('cv')
  const profile = getProfile()
  const version = getCvVersion()

  return (
    <div className="mx-auto max-w-3xl px-8 py-10 print:px-0 print:py-0">
      <p className="no-print mb-8 border border-line bg-surface/60 px-4 py-3 text-small text-muted">
        {t('printHint')}
      </p>

      {/* En el documento el retrato es más chico que en la web —24 mm— y la
          fila no se apila nunca: una hoja A4 no cambia de ancho. */}
      <header className="print-block flex items-center gap-6 border-b border-line pb-5">
        <Portrait destino="impresion" lado={92} />

        <div>
          <h1 className="font-display text-[2.5rem] font-extrabold leading-none tracking-[-0.03em] print:text-[24pt]">
            {profile.person.name}
          </h1>
          <p className="mt-2 text-lead text-muted print:text-[11pt]">
            {profile.person.headline[locale]}
          </p>
          <p className="mt-3 text-small text-muted print:text-[9pt]">
            {profile.person.location[locale]} · {profile.person.email}
            {profile.person.phone ? ` · ${profile.person.phone}` : ''}
            {profile.person.links.map((link) => ` · ${link.label}`).join('')}
          </p>
        </div>
      </header>

      <div className="mt-8">
        <CvDocument profile={profile} locale={locale} />
      </div>

      <footer className="print-block mt-10 border-t border-line pt-4 text-[0.75rem] text-muted print:text-[8pt]">
        {version.date} · {version.hash}
      </footer>
    </div>
  )
}
