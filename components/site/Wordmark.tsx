import { Link } from '@/i18n/navigation'

/**
 * Marca denominativa de Nidra.
 *
 * ── ESPACIO RESERVADO PARA EL LOGOTIPO ──
 * La empresa todavía no tiene logo. Hasta que exista, la marca se compone
 * tipográficamente con la fuente display, que es una solución legítima y no un
 * marcador de posición feo.
 *
 * Cuando haya logotipo:
 *   1. Colocar el SVG en `public/brand/nidra.svg`
 *   2. Reemplazar el <span> de abajo por el <svg> en línea o un <Image>
 *   3. Conservar el <Link>, el `aria-label` y las dimensiones del contenedor,
 *      para no alterar el desplazamiento de la cabecera
 *
 * El alto del contenedor está fijado a propósito: cambiar de texto a imagen no
 * debe mover nada alrededor.
 */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Nidra — inicio"
      className={`inline-flex h-8 items-center ${className}`}
    >
      <span className="font-display text-[1.5rem] font-extrabold leading-none tracking-[-0.035em] text-ink">
        nidra
      </span>
      <span
        aria-hidden="true"
        className="ml-[0.18em] inline-block h-[6px] w-[6px] translate-y-[0.3em] rounded-full bg-accent"
      />
    </Link>
  )
}
