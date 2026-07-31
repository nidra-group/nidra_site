/**
 * Cabecera de página interior.
 *
 * Repite la gramática del héroe —pastilla, titular a dos tonos sobre la
 * aurora— para que ninguna página se sienta como un documento suelto pegado
 * detrás de una portada bonita. Es lo que hace que el sitio se lea como un
 * sistema y no como una plantilla con contenido encima.
 */
export function PageHeader({
  eyebrow,
  title,
  titleAccent,
  lead,
  children,
}: {
  eyebrow: string
  title: string
  titleAccent?: string
  lead?: string
  children?: React.ReactNode
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-line">
      <div className="aurora" aria-hidden="true" />
      <div className="grid-veil" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-6xl px-5 pb-20 pt-20 sm:px-8 sm:pb-24 sm:pt-24">
        <p className="pill font-mono text-[0.75rem] uppercase tracking-[0.12em] text-accent">
          {eyebrow}
        </p>

        <h1 className="mt-8 max-w-[18ch] font-display text-[clamp(2.25rem,5.5vw,3.75rem)] font-extrabold leading-[1.04] tracking-[-0.035em]">
          {title} {titleAccent && <span className="accent-word">{titleAccent}</span>}
        </h1>

        {lead && <p className="measure mt-6 text-lead text-muted">{lead}</p>}

        {children}
      </div>
    </section>
  )
}
