import { useTranslations } from 'next-intl'

import { isChatEnabled } from '@/lib/env'

const UPDATED = '2026-08-03'

type Section = { title: string; body: string[] }

/**
 * Documento legal renderizado desde `messages`.
 *
 * El texto vive en los archivos de mensajes y no en este componente: cambiar la
 * política no debe requerir tocar código de presentación (FR-044).
 *
 * ── LA POLÍTICA DE PRIVACIDAD TIENE DOS ESTADOS ───────────────────────────
 * Con el asistente conversacional apagado, el sitio no tiene ninguna base de
 * datos y la política lo dice. Con el asistente encendido, guarda
 * transcripciones completas en Estados Unidos, y la política tiene que
 * declararlo.
 *
 * Las dos versiones se eligen con `NEXT_PUBLIC_CHAT_EMBED_URL`, que es LA MISMA
 * variable que monta el widget. Esa es la razón de hacerlo así y no con dos
 * archivos o una fecha: mientras el interruptor sea uno solo, es imposible
 * publicar un asistente que recoja datos junto a una política que jure que no
 * hay base de datos. La contradicción no puede existir.
 *
 * Cuando el asistente esté en producción y no haya vuelta atrás, el bloque
 * `assistantPending` de los mensajes queda muerto y se puede borrar.
 */
export function LegalDocument({ namespace }: { namespace: 'legal.privacy' | 'legal.terms' }) {
  const t = useTranslations(namespace)

  // `t.raw` LANZA si la clave no existe, no devuelve undefined. Los términos
  // no tienen bloques condicionales, así que hay que preguntar antes: con `??`
  // el build moría al prerenderizar /terminos.
  const bloque = (clave: string): Section[] => (t.has(clave) ? (t.raw(clave) as Section[]) : [])

  const sections = bloque('sections')
  const sinAsistente = bloque('assistantPending')
  const conAsistente = bloque('assistant')
  const cierre = bloque('closing')

  const todas = [...sections, ...(isChatEnabled ? conAsistente : sinAsistente), ...cierre]

  return (
    <article className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <h1 className="max-w-[18ch] font-display text-[clamp(2.25rem,5.5vw,3.25rem)] font-extrabold leading-[1.06] tracking-[-0.03em]">
        {t('title')}
      </h1>
      <p className="mt-4 text-small text-muted">
        {t('updated')}: <time dateTime={UPDATED}>{UPDATED}</time>
      </p>

      <div className="mt-14 space-y-12">
        {todas.map((section) => (
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
