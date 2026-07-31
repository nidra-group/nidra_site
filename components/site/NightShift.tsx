import { useTranslations } from 'next-intl'

/**
 * El turno noche — la firma visual del sitio.
 *
 * Nidra es sueño en sánscrito, y lo que la empresa vende es exactamente esto:
 * un proceso que corre solo a las tres de la mañana. La tarjeta lo muestra en
 * su forma nativa —un registro de ejecución— en lugar de afirmarlo con un
 * eslogan.
 *
 * Las líneas son un ejemplo ilustrativo genérico (así lo dice la etiqueta de
 * la tarjeta): no nombran clientes ni resultados reales, para no fabricar la
 * prueba social que el sitio decidió no tener.
 *
 * Accesibilidad: el registro es decorativo-narrativo. Se expone como imagen
 * con una descripción, y las líneas quedan fuera del árbol de accesibilidad
 * para que un lector de pantalla no recite marcas de tiempo.
 */
export function NightShift() {
  const t = useTranslations('home.nightShift')
  const lines = t.raw('lines') as { time: string; text: string }[]

  return (
    <figure
      data-night
      role="img"
      aria-label={t('description')}
      className="overflow-hidden rounded-(--radius-lg) border border-line shadow-[0_24px_48px_-24px_rgb(0_0_0/0.45)]"
    >
      {/* Barra de título: nombra la pieza y admite que es un ejemplo. */}
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-3.5">
        <span className="font-mono text-[0.8125rem] font-medium tracking-wide text-ink">
          {t('title')}
        </span>
        <span className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-muted">
          {t('badge')}
        </span>
      </figcaption>

      <ol
        aria-hidden="true"
        className="space-y-2.5 px-5 py-5 font-mono text-[0.8125rem] leading-relaxed"
        style={{ '--line-count': lines.length } as React.CSSProperties}
      >
        {lines.map((line, index) => (
          <li
            key={line.time}
            className={`nightlog-line flex gap-3.5 ${index === lines.length - 1 ? 'nightlog-cursor text-accent' : ''}`}
            style={{ '--line-index': index } as React.CSSProperties}
          >
            <span className="shrink-0 tabular-nums text-muted">{line.time}</span>
            <span className={index === lines.length - 1 ? 'text-accent' : 'text-ink'}>
              {line.text}
            </span>
          </li>
        ))}
      </ol>
    </figure>
  )
}
