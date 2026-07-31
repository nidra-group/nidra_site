import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { CvDocument } from '@/components/cv/CvDocument'
import { CvDownload } from '@/components/cv/CvDownload'
import { Link } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { getProfile } from '@/lib/content'
import { getCvVersion } from '@/lib/cv/version'
import { listAvailableDownloads } from '@/lib/cv/downloads'
import { buildMetadata } from '@/lib/seo/metadata'
import { profileBaseUrl } from '@/lib/env'

type Props = { params: Promise<{ locale: Locale }> }

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

/**
 * Renderizado por petición, y la desviación está justificada.
 *
 * El selector de descargas se construye comprobando qué documentos existen en
 * `public/downloads/` (FR-040: no ofrecer una combinación que descargaría un
 * 404). Esos documentos se generan después del build, así que en un render
 * estático la comprobación ocurriría cuando todavía no existen y el selector
 * quedaría vacío para siempre.
 *
 * Es una página de baja circulación y sin datos por usuario: el costo es nulo.
 */
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'cv.meta' })
  return buildMetadata({
    locale,
    href: '/cv',
    title: t('title'),
    description: t('description'),
    baseUrl: profileBaseUrl,
  })
}

export default async function CvPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('cv')
  const profile = getProfile()
  const version = getCvVersion()
  const downloads = listAvailableDownloads()

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.person.name,
    jobTitle: profile.person.headline[locale],
    email: profile.person.email,
    url: profileBaseUrl,
    sameAs: profile.person.links.map((link) => link.url),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

      <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
        <header className="border-b border-line pb-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <h1 className="font-display text-[clamp(2.5rem,7vw,3.75rem)] leading-none tracking-[-0.025em]">
                {profile.person.name}
              </h1>
              <p className="mt-3 text-lead text-muted">{profile.person.headline[locale]}</p>
              <p className="mt-1 text-small text-muted">{profile.person.location[locale]}</p>
            </div>
            <Link
              href="/"
              className="text-small text-muted underline-offset-4 hover:text-ink hover:underline"
            >
              {t('backToSite')} →
            </Link>
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-small">
            <li>
              <a href={`mailto:${profile.person.email}`} className="link">
                {profile.person.email}
              </a>
            </li>
            {profile.person.links.map((link) => (
              <li key={link.url}>
                <a href={link.url} rel="noopener" className="link">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </header>

        <div className="my-10">
          <CvDownload
            downloads={downloads}
            version={version}
            printHref={{ pathname: '/cv/imprimir' }}
          />
        </div>

        <CvDocument profile={profile} locale={locale} />

        <footer className="mt-14 border-t border-line pt-5 text-[0.8125rem] text-muted">
          {t('download.version')} {version.date} · {version.hash}
          {' · '}
          <Link href="/cv/imprimir" className="link">
            {t('download.openPrintView')}
          </Link>
        </footer>
      </div>
    </>
  )
}
