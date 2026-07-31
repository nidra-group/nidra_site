import { useTranslations } from 'next-intl'

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

  return (
    <section className="no-print border border-line bg-surface/50 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 className="text-[1.0625rem] font-medium text-ink">{t('title')}</h2>
        <p className="text-[0.8125rem] tabular-nums text-muted">
          {t('version')} {version.date} · {version.hash}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-3">
        {downloads.map((download) => (
          <a
            key={download.locale}
            href={download.href}
            download={download.fileName}
            className="inline-flex min-h-[2.75rem] items-center rounded-[--radius-md] bg-accent px-5 text-[0.9375rem] font-medium text-paper hover:bg-accent-deep"
          >
            {t('formatPdf')} · {download.locale.toUpperCase()}
          </a>
        ))}

        <Link
          href={printHref}
          className="inline-flex min-h-[2.75rem] items-center rounded-[--radius-md] border border-ink/25 px-5 text-[0.9375rem] font-medium text-ink hover:border-ink hover:bg-ink hover:text-paper"
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
