/**
 * Diagrama de flujo del héroe.
 *
 * Es el objeto que la portada necesitaba: un sistema real —fuentes dispersas
 * que entran, un proceso que las ordena, salidas que van a producción— en el
 * lenguaje con el que un equipo de ingeniería dibuja su arquitectura en una
 * pizarra. No es una decoración intercambiable: es lo que Nidra construye.
 *
 * Detalles que importan:
 *
 * - Animación SOLO de `opacity` y `stroke-dashoffset`. La auditoría midió que
 *   animar `transform` sobre elementos con `filter: blur()` tira el
 *   desplazamiento a 22 fps; esto se compone en la GPU y no re-rasteriza nada.
 * - `aria-hidden`: el diagrama ilustra el mensaje del titular, no agrega
 *   información. Un lector de pantalla que recitara sus nodos solo estorbaría.
 * - Sin movimiento con `prefers-reduced-motion`: los pulsos desaparecen y el
 *   diagrama queda completo y quieto. Nunca depende del efecto para leerse.
 */
export function FlowDiagram() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 520 380"
      fill="none"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* El trazo se apaga hacia los bordes para que el diagrama se funda
            con el fondo en vez de terminar en un corte seco. */}
        <linearGradient id="flow-edge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.06" />
          <stop offset="50%" stopColor="var(--color-accent)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.06" />
        </linearGradient>
        <radialGradient id="flow-core">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.32" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Halo del núcleo */}
      <circle cx="260" cy="190" r="120" fill="url(#flow-core)" />

      {/* Aristas: cuatro entradas dispersas → núcleo → tres salidas */}
      <g stroke="url(#flow-edge)" strokeWidth="1.25">
        <path d="M64 62 C150 62 170 150 226 178" />
        <path d="M64 148 C140 148 160 172 226 186" />
        <path d="M64 232 C140 232 160 208 226 196" />
        <path d="M64 318 C150 318 170 230 226 204" />
        <path d="M294 178 C350 150 370 78 456 78" />
        <path d="M294 190 C360 190 380 190 456 190" />
        <path d="M294 202 C350 230 370 302 456 302" />
      </g>

      {/* Pulsos: un guion corto que recorre cada arista. Es el dato pasando
          por el sistema, que es exactamente lo que la empresa construye. */}
      <g
        className="flow-pulse"
        stroke="var(--color-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="16 340"
      >
        <path d="M64 62 C150 62 170 150 226 178" style={{ '--i': 0 } as React.CSSProperties} />
        <path d="M64 148 C140 148 160 172 226 186" style={{ '--i': 1 } as React.CSSProperties} />
        <path d="M64 232 C140 232 160 208 226 196" style={{ '--i': 2 } as React.CSSProperties} />
        <path d="M64 318 C150 318 170 230 226 204" style={{ '--i': 3 } as React.CSSProperties} />
        <path d="M294 178 C350 150 370 78 456 78" style={{ '--i': 4 } as React.CSSProperties} />
        <path d="M294 190 C360 190 380 190 456 190" style={{ '--i': 5 } as React.CSSProperties} />
        <path d="M294 202 C350 230 370 302 456 302" style={{ '--i': 6 } as React.CSSProperties} />
      </g>

      {/* Nodos de entrada: sistemas sueltos, sin conectar entre sí */}
      <g>
        {[62, 148, 232, 318].map((y, index) => (
          <g key={y} className="flow-node" style={{ '--i': index } as React.CSSProperties}>
            <rect
              x="30"
              y={y - 13}
              width="34"
              height="26"
              rx="7"
              fill="var(--color-surface)"
              stroke="var(--color-line-strong)"
            />
            <path
              d={`M39 ${y - 4}h16M39 ${y}h16M39 ${y + 4}h10`}
              stroke="var(--color-muted)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        ))}
      </g>

      {/* Núcleo: el proceso que Nidra pone en medio */}
      <g>
        <rect
          x="226"
          y="156"
          width="68"
          height="68"
          rx="18"
          fill="var(--color-surface)"
          stroke="var(--color-accent)"
          strokeOpacity="0.55"
        />
        <g
          stroke="var(--color-accent)"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="260" cy="190" r="6.5" />
          <path d="M260 168v9M260 203v9M238 190h9M273 190h9" />
        </g>
      </g>

      {/* Salidas: destinos en producción, ya conectados */}
      <g>
        {[78, 190, 302].map((y, index) => (
          <g key={y} className="flow-node" style={{ '--i': index + 4 } as React.CSSProperties}>
            <rect
              x="456"
              y={y - 13}
              width="34"
              height="26"
              rx="7"
              fill="var(--color-surface)"
              stroke="var(--color-accent)"
              strokeOpacity="0.45"
            />
            <path
              d={`M465 ${y + 1}l4 4 8-9`}
              stroke="var(--color-accent)"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ))}
      </g>
    </svg>
  )
}
