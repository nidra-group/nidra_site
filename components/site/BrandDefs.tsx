import { CAL, ORO } from '@/lib/brand/paths'

/**
 * El degradado y el halo de la marca, declarados UNA vez por documento.
 *
 * ── POR QUÉ NO VAN DENTRO DE `Wordmark` ───────────────────────────────────
 * El logotipo aparece dos veces en cada página —cabecera y pie—, y en el
 * currículum tres. Si cada instancia trajera sus propias definiciones, el
 * documento tendría el mismo `id` repetido dos y tres veces. El navegador
 * resuelve `url(#…)` con la PRIMERA coincidencia, así que se vería bien igual;
 * pero es HTML inválido, ensucia cualquier auditoría de accesibilidad y deja
 * una trampa para el día que las definiciones dejen de ser idénticas.
 *
 * Va montado en el layout raíz, así que cubre tanto el sitio comercial como el
 * subdominio del perfil.
 *
 * ── POR QUÉ NO USA `display: none` ────────────────────────────────────────
 * Un `<defs>` no se dibuja nunca, así que el SVG contenedor no necesita
 * ocultarse con `display: none` —y no conviene: hay motores que dejan de
 * resolver las referencias hacia adentro de un subárbol así. Un lienzo de
 * 0 × 0 fuera de flujo hace lo mismo sin ese riesgo.
 */
export function BrandDefs() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute' }}
    >
      <defs>
        {/* En diagonal: la luz entra por arriba a la izquierda y el oro se
            hunde hacia abajo a la derecha, que es de donde sale la lectura
            metálica. Sin unidades declaradas se ajusta a la caja de CADA
            forma que lo use, así que la n sola y el logotipo entero reciben
            el degradado completo y no un recorte de él. */}
        <linearGradient id="nidra-oro" x1="0" y1="0" x2="1" y2="1">
          {ORO.map((color, i) => (
            <stop key={color} offset={[0, 0.4, 0.72, 1][i]} stopColor={color} />
          ))}
        </linearGradient>

        {/* Vertical y de recorrido corto: «idra» tiene que leerse como una
            sola masa de cal, no como una segunda pieza metálica compitiendo
            con la n. */}
        <linearGradient id="nidra-cal" x1="0" y1="0" x2="0" y2="1">
          {CAL.map((color, i) => (
            <stop key={color} offset={i} stopColor={color} />
          ))}
        </linearGradient>

        {/* El halo NO es un resplandor agregado encima: es una copia de la
            propia n difuminada, que se pinta detrás al 40 %. Por eso la luz
            sale de la forma en vez de parecer un efecto pegado. */}
        <filter id="nidra-halo" x="-15%" y="-15%" width="130%" height="130%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
    </svg>
  )
}
