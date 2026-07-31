import { Link } from '@/i18n/navigation'

/**
 * La marca de Nidra: la palabra apoyada en el horizonte, con el arco
 * naciendo de la propia línea base.
 *
 * ── EL SISTEMA ────────────────────────────────────────────────────────────
 * La marca vive a tres escalas y cada una es un fragmento de la anterior, así
 * que el símbolo y el nombre se refuerzan en vez de competir:
 *
 *   C · esta pieza          — web, membrete, pie de correo
 *   B · el monograma        — icono de aplicación, foto de perfil (`Monogram`)
 *   A · el arco solo        — pestaña del navegador, sello
 *                             (`public/brand/nidra-symbol.svg`, `app/icon.svg`)
 *
 * ── POR QUÉ ASÍ ───────────────────────────────────────────────────────────
 * La línea NO cruza las letras. Una horizontal a media altura sobre una
 * palabra se lee como texto tachado —es el gesto universal de «cancelado»—,
 * que es lo peor que le puede pasar a un nombre. Acá la línea es el suelo: la
 * palabra se apoya en el horizonte y el arco asoma justo antes de la ene,
 * como el sol rompiendo la línea al principio del nombre.
 *
 * El texto es TEXTO, no una imagen: se puede seleccionar, lo lee un lector de
 * pantalla, escala con la tipografía del sistema y no pesa nada. Solo el
 * horizonte es SVG, porque solo el horizonte es geometría.
 *
 * Para la versión con la palabra en trazados —imprenta, bordado, un
 * proveedor que no tenga Manrope— hay que exportarla una vez; el símbolo en
 * `public/brand/` ya es portátil porque es geometría pura.
 */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Nidra — inicio"
      className={`inline-flex h-8 w-fit items-center ${className}`}
    >
      {/* Dos correcciones que el conjunto necesita para no descolocarse:

          1. `w-fit` en el enlace, o se estira al contenedor de la cabecera y
             arrastra el horizonte 200 píxeles a la derecha del nombre.
          2. El horizonte va POSICIONADO, no en el flujo. Un SVG en el flujo
             aporta su ancho propio al cálculo del contenedor y termina
             mandando él: la línea salía más ancha que la palabra y colgaba
             solo hacia un lado. Fuera del flujo, el ancho lo fija la palabra
             y el horizonte la calca exactamente. */}
      <span className="relative inline-flex w-fit flex-col">
        <span className="font-display text-[1.5rem] font-extrabold leading-none tracking-[-0.035em] text-ink">
          nidra
        </span>
        <span aria-hidden="true" className="block h-[0.42em]" />
        <Horizon />
      </span>
    </Link>
  )
}

/**
 * El horizonte con el sol asomando: arco a la izquierda, línea hacia la
 * derecha. Un solo trazo continuo partido en dos colores — el oro es la luz
 * que ya llegó, el azul es la noche que todavía no se fue.
 *
 * `preserveAspectRatio="none"` estiraría el arco y lo volvería un óvalo. Se
 * evita dejando que el ancho mande y el alto siga: el conjunto escala como
 * una unidad.
 */
function Horizon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 16"
      width="120"
      height="16"
      // Los atributos fijan la proporción; las clases dejan que el ancho lo
      // mande la palabra de arriba y el alto siga solo. Sin los atributos, un
      // SVG sin dimensiones cae a la altura de reemplazo del navegador y el
      // horizonte se aplasta a tres píxeles.
      className="absolute inset-x-0 bottom-0 h-auto w-full"
      fill="none"
      // Apertura 45%, no la maestra del 32%: acá el horizonte se dibuja a unos
      // 57 píxeles de ancho y con la apertura maestra el arco sube 2 píxeles
      // contra un trazo de 1,6 — se lee como un bulto, no como un arco. Es la
      // misma corrección óptica que lleva el favicon, en menor medida.
    >
      <path
        d="M 42 13 L 118 13"
        stroke="var(--color-muted)"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M 2 13 A 26.722 26.722 0 0 1 42 13"
        stroke="var(--color-accent)"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * El monograma: la ene partida por el umbral.
 *
 * Oro por encima de la línea, azul apagado por debajo. Es el paso intermedio
 * de la escalera de reducción — sirve para foto de perfil e icono de
 * aplicación, donde hay entre 40 y 180 píxeles.
 *
 * A 16 píxeles NO se usa: la ene cortada se vuelve una mancha. Ahí va el arco
 * solo, que es lo que sirve `app/icon.svg`.
 */
export function Monogram({ size = 64, className = '' }: { size?: number; className?: string }) {
  const cut = size * 0.6
  const id = `nidra-mono-${size}`

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Nidra"
    >
      <defs>
        <clipPath id={`${id}-up`}>
          <rect x="0" y="0" width={size} height={cut} />
        </clipPath>
        <clipPath id={`${id}-down`}>
          <rect x="0" y={cut} width={size} height={size - cut} />
        </clipPath>
        {/* La línea se abre al pasar por la letra en vez de cruzarla: sin
            esto la ene queda tachada, igual que la palabra. */}
        <mask id={`${id}-mask`}>
          <rect width={size} height={size} fill="#fff" />
          <text
            x={size / 2}
            y={size * 0.8}
            fontFamily="var(--font-display)"
            fontWeight="800"
            fontSize={size * 0.8}
            fill="#000"
            stroke="#000"
            strokeWidth={size * 0.09}
            textAnchor="middle"
          >
            n
          </text>
        </mask>
      </defs>

      <line
        x1={size * 0.04}
        y1={cut}
        x2={size * 0.96}
        y2={cut}
        stroke="var(--color-muted)"
        strokeWidth={size * 0.045}
        strokeLinecap="round"
        mask={`url(#${id}-mask)`}
      />
      {(
        [
          [`${id}-up`, 'var(--color-accent)', 1],
          [`${id}-down`, 'var(--color-muted)', 0.62],
        ] as const
      ).map(([clip, fill, opacity]) => (
        <text
          key={clip}
          x={size / 2}
          y={size * 0.8}
          fontFamily="var(--font-display)"
          fontWeight="800"
          fontSize={size * 0.8}
          fill={fill}
          opacity={opacity}
          textAnchor="middle"
          clipPath={`url(#${clip})`}
        >
          n
        </text>
      ))}
    </svg>
  )
}
