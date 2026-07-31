import { useLocale, useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import type { Download } from '@/lib/cv/downloads'
import type { CvVersion } from '@/lib/cv/version'

/**
 * Selector de descarga del currículum.
 *
 * Solo ofrece combinaciones cuyo archivo existe (FR-040). La versión web
 * imprimible siempre está disponible porque es una ruta, no un archivo
 * generado: es el camino que nunca falla.
 */
export function CvDownload({
  downloads,
  version,
  printHref,
}: {
  downloads: Download[]
  version: CvVersion
  printHref: { pathname: '/cv/imprimir' }
}) {
  const t = useTranslations('cv.download')
  const locale = useLocale()

  return (
    <section className="surface no-print p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 className="text-[1.0625rem] font-medium text-ink">{t('title')}</h2>
        <p className="text-[0.8125rem] tabular-nums text-muted">
          {t('version')} {version.date} · {version.hash}
        </p>
      </div>

      {/* Solo la descarga del idioma que se está leyendo es primaria. Tres
          controles del mismo peso compiten entre sí y ninguno gana: quien
          entra en español quiere el PDF en español, y el resto son
          alternativas. */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {downloads.map((download) => (
          <a
            key={download.locale}
            href={download.href}
            download={download.fileName}
            className={
              download.locale === locale
                ? 'inline-flex min-h-[2.75rem] items-center rounded-(--radius-md) bg-accent px-5 text-[0.9375rem] font-semibold text-paper hover:bg-accent-deep'
                : 'inline-flex min-h-[2.75rem] items-center rounded-(--radius-md) border border-line-strong px-5 text-[0.9375rem] font-medium text-ink hover:border-accent'
            }
          >
            {t('formatPdf')} · {download.locale.toUpperCase()}
          </a>
        ))}

        <Link
          href={printHref}
          className="inline-flex min-h-[2.75rem] items-center rounded-(--radius-md) border border-line-strong px-5 text-[0.9375rem] font-medium text-ink hover:border-accent"
        >
          {t('formatWeb')}
        </Link>
      </div>

      {downloads.length === 0 && (
        <p className="mt-4 text-small text-muted">{t('unavailable')}</p>
      )}
    </section>
  )
}
