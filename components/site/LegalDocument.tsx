import { useTranslations } from 'next-intl'

const UPDATED = '2026-07-30'

/**
 * Documento legal renderizado desde `messages`.
 *
 * El texto vive en los archivos de mensajes y no en este componente: cambiar la
 * política no debe requerir tocar código de presentación (FR-044).
 */
export function LegalDocument({ namespace }: { namespace: 'legal.privacy' | 'legal.terms' }) {
  const t = useTranslations(namespace)
  const sections = t.raw('sections') as { title: string; body: string[] }[]

  return (
    <article className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <h1 className="max-w-[18ch] font-display text-[clamp(2.25rem,5.5vw,3.25rem)] font-extrabold leading-[1.06] tracking-[-0.03em]">
        {t('title')}
      </h1>
      <p className="mt-4 text-small text-muted">
        {t('updated')}: <time dateTime={UPDATED}>{UPDATED}</time>
      </p>

      <div className="mt-14 space-y-12">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-heading text-ink">{section.title}</h2>
            <div className="mt-4 space-y-4">
              {section.body.map((paragraph) => (
                <p key={paragraph} className="measure text-body text-muted">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  )
}
