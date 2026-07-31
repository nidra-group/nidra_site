import { useTranslations } from 'next-intl'

import type { Profile } from '@/lib/content/profile-schema'
import type { Locale } from '@/i18n/routing'

function formatPeriod(start: string, end: string | undefined, present: string): string {
  const fmt = (value: string) => {
    const [year, month] = value.split('-')
    return month ? `${month}/${year}` : year
  }
  return `${fmt(start)} — ${end ? fmt(end) : present}`
}

/**
 * Cuerpo del currículum.
 *
 * Lo comparten la página web del perfil y la vista de impresión. Es la pieza
 * que hace que el documento descargable y la web sean la MISMA maquetación y no
 * dos plantillas que derivan (FR-047).
 */
export function CvDocument({ profile, locale }: { profile: Profile; locale: Locale }) {
  const t = useTranslations('cv.sections')
  const present = useTranslations('cv')('present')

  return (
    <div className="space-y-12">
      <section className="print-block">
        <h2 className="eyebrow border-b border-line pb-2">{t('summary')}</h2>
        <p className="measure mt-4 text-body text-muted">{profile.summary[locale]}</p>
      </section>

      <section>
        <h2 className="eyebrow border-b border-line pb-2">{t('experience')}</h2>
        <div className="mt-6 space-y-9">
          {profile.experiences.map((exp) => (
            <article key={exp.id} className="print-block">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h3 className="text-[1.125rem] font-medium text-ink">
                  {exp.role[locale]}
                  <span className="font-normal text-muted"> · {exp.org}</span>
                  {exp.client && <span className="font-normal text-muted"> ({exp.client})</span>}
                </h3>
                <p className="text-small tabular-nums text-muted">
                  {formatPeriod(exp.start, exp.end, present)}
                </p>
              </div>

              <ul className="mt-3 space-y-2">
                {exp.achievements.map((item) => (
                  <li key={item[locale]} className="flex gap-3 text-body text-muted">
                    <span aria-hidden="true" className="mt-[0.7em] h-px w-3 shrink-0 bg-line" />
                    <span className="measure">{item[locale]}</span>
                  </li>
                ))}
              </ul>

              {exp.tech.length > 0 && (
                <p className="mt-3 text-small text-muted/80">{exp.tech.join(' · ')}</p>
              )}
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-12 sm:grid-cols-2">
        <section className="print-block">
          <h2 className="eyebrow border-b border-line pb-2">{t('education')}</h2>
          <ul className="mt-4 space-y-4">
            {profile.education.map((item) => (
              <li key={item.institution}>
                <p className="text-body text-ink">{item.degree[locale]}</p>
                <p className="text-small text-muted">
                  {item.institution} · {item.start}
                  {item.end ? `–${item.end}` : ''}
                </p>
              </li>
            ))}
          </ul>

          <h2 className="eyebrow mt-9 border-b border-line pb-2">{t('languages')}</h2>
          <ul className="mt-4 space-y-2">
            {profile.languages.map((lang) => (
              <li key={lang.name[locale]} className="text-body text-muted">
                <span className="text-ink">{lang.name[locale]}</span> — {lang.level[locale]}
              </li>
            ))}
          </ul>
        </section>

        <section className="print-block">
          <h2 className="eyebrow border-b border-line pb-2">{t('certifications')}</h2>
          <ul className="mt-4 space-y-2">
            {profile.certifications.map((cert) => (
              <li key={cert.name[locale]} className="text-body text-muted">
                {cert.name[locale]}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section>
        <h2 className="eyebrow border-b border-line pb-2">{t('skills')}</h2>
        <dl className="mt-5 space-y-4">
          {profile.skills.map((group) => (
            <div key={group.category[locale]} className="print-block sm:flex sm:gap-6">
              <dt className="text-small font-medium text-ink sm:w-48 sm:shrink-0">
                {group.category[locale]}
              </dt>
              <dd className="mt-1 text-body text-muted sm:mt-0">{group.items.join(' · ')}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
