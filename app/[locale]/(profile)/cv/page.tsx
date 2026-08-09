import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { CvDocument } from '@/components/cv/CvDocument'
import { CvDownload } from '@/components/cv/CvDownload'
import { Link } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { getProfile, getYearsOfExperience } from '@/lib/content'
import { getCvVersion } from '@/lib/cv/version'
import { listAvailableDownloads } from '@/lib/cv/downloads'
import { buildMetadata } from '@/lib/seo/metadata'
import { ogImagePath } from '@/lib/seo/og-cards'
import { profileBaseUrl, publicEnv } from '@/lib/env'

type Props = { params: Promise<{ locale: Locale }> }

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

/**
 * Estática, como el resto del sitio.
 *
 * Durante un tiempo fue dinámica: el selector de descargas comprueba qué
 * documentos existen en `public/downloads/` (FR-040: no ofrecer una
 * combinación que descargaría un 404), y esos documentos se generaban después
 * del build, cuando el render estático ya había mirado un directorio vacío.
 *
 * Ahora los PDF se generan antes y se versionan, así que existen mucho antes
 * de que se renderice esta página. Volver a estático no es solo una mejora de
 * rendimiento: mientras fue dinámica, cada visita recalculaba la versión
 * preguntándole a git, y en producción no hay repositorio. Ver
 * `lib/cv/version.ts`.
 */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'cv.meta' })
  return buildMetadata({
    locale,
    // Con subdominio configurado, el perfil vive en SU RAÍZ: la dirección
    // oficial es `jmujica.nidra.cloud/es`, no `.../es/cv`, que solo
    // redirige. Declarar como canónica una dirección que rebota deja a los
    // buscadores eligiendo por su cuenta cuál indexar.
    href: publicEnv.PROFILE_URL ? '/' : '/cv',
    title: t('title'),
    // Los años se calculan del currículum y no se escriben a mano. Antes la
    // descripción decía «más de 14 años» como texto fijo: el 1 de enero se
    // desincronizaba sola y nadie se enteraba, porque una descripción para
    // buscadores no se mira nunca.
    description: t('description', { years: getYearsOfExperience(getProfile()) }),
    baseUrl: profileBaseUrl,
    // La tarjeta vive en el sitio principal aunque la página viva en el
    // subdominio: es un activo, no contenido del perfil.
    imagePath: ogImagePath('cv', locale),
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
          {/* La vuelta al sitio vive en la barra del envoltorio, no acá: en
              una esquina y a 13 px era invisible, y esta página es el destino
              de «Ver el perfil completo» desde la portada. */}
          <div>
            <h1 className="font-display text-[clamp(2.5rem,7vw,3.75rem)] font-extrabold leading-none tracking-[-0.035em]">
              {profile.person.name}
            </h1>
            <p className="mt-3 text-lead text-muted">{profile.person.headline[locale]}</p>
            <p className="mt-1 text-small text-muted">{profile.person.location[locale]}</p>
          </div>

          <ul className="mt-4 flex flex-wrap items-center gap-x-6 text-small">
            <li>
              <a href={`mailto:${profile.person.email}`} className="link inline-flex min-h-[2.75rem] items-center">
                {profile.person.email}
              </a>
            </li>
            {profile.person.links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  rel="noopener"
                  className="link inline-flex min-h-[2.75rem] items-center"
                >
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
          <Link href="/cv/imprimir" className="link inline-flex min-h-[2.75rem] items-center">
            {t('download.openPrintView')}
          </Link>
        </footer>
      </div>
    </>
  )
}
