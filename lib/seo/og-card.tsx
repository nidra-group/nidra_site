import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * La tarjeta que ve quien recibe un enlace del sitio por WhatsApp, LinkedIn,
 * Slack o Telegram.
 *
 * Durante mucho tiempo hubo una sola, escrita en español, para las trece
 * páginas y los dos idiomas: compartir `/servicios` mostraba el titular de la
 * portada, y compartir `/en` mostraba una tarjeta en español. La tarjeta es lo
 * único que se ve antes de decidir si se hace clic, así que anunciaba una
 * página distinta de la que había del otro lado.
 *
 * Acá vive el dibujo; `app/og/[locale]/[slug]/route.tsx` decide qué texto le
 * toca a cada página.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const

/** La paleta de noche del sitio. `next/og` no lee CSS: al cambiar `app/globals.css`, cambiar acá. */
const PAPEL = '#0a1322'
const TINTA = '#f4efe6'
const TINTA_TENUE = '#9aa9c2'
const ACENTO = '#edc27c'

/**
 * El logotipo real, leído de `public/brand/`: si el trazado cambia, la tarjeta
 * cambia con él.
 *
 * Va la versión premium y no la plana porque este es el único lugar del sistema
 * donde la marca se ve grande de verdad —280 px de ancho sobre 1200— y a ese
 * tamaño el degradado metálico se lee. En la cabecera, a 30 px de alto, apenas
 * se insinúa.
 *
 * El halo, en cambio, NO se ve acá y no hay nada que arreglar: a 280 px el
 * desenfoque mide 1,4 px al 40 % de opacidad, o sea por debajo de lo que el ojo
 * separa del fondo. Se probó hornearlo en un PNG con Chromium y los píxeles del
 * borde salieron iguales, así que el PNG era un archivo generado de más para un
 * efecto invisible. El halo existe para la marca grande: presentación, portada,
 * foto de perfil.
 *
 * Se lee una sola vez por proceso, no una por tarjeta.
 */
const LOGO_URI = (() => {
  const svg = readFileSync(join(process.cwd(), 'public/brand/nidra-logo-glow.svg'), 'utf8')
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
})()

export type Tarjeta = {
  /** El nombre de la sección. Va arriba del titular y es lo que distingue una tarjeta de otra. */
  eyebrow: string
  title: string
  subtitle: string
}

/**
 * El titular se dibuja en un cuerpo u otro según lo largo que sea.
 *
 * Con un tamaño fijo, «Qué incluye cada servicio y en cuánto tiempo se
 * entrega» se comía el subtítulo y se salía del lienzo. No hay medición de
 * texto en `next/og`, así que el corte va por número de caracteres, que para
 * una sola familia tipográfica es suficientemente fiel.
 */
function cuerpoDelTitular(title: string): number {
  if (title.length > 62) return 50
  if (title.length > 42) return 58
  return 68
}

export function OgCard({ eyebrow, title, subtitle }: Tarjeta) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: PAPEL,
        padding: '80px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* El logotipo real, no una reconstrucción. 280 × 93 es la proporción del
          lienzo con halo —1580 × 526—, no la del trazado a secas.

          Va `<img>` y no `next/image`: esto no es una página, es un lienzo que
          `next/og` convierte a PNG durante el build. `next/image` necesita el
          navegador y el servidor de imágenes de Next, que acá no existen. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_URI} width={280} height={93} alt="" />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontSize: 24,
            color: ACENTO,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 22,
          }}
        >
          {eyebrow}
        </span>
        {/* El titular de la propia página. Si el relato cambia y esto no, quien
            comparte el enlace anuncia una promesa distinta de la que va a
            encontrar al hacer clic. */}
        <span
          style={{
            fontSize: cuerpoDelTitular(title),
            fontWeight: 700,
            lineHeight: 1.06,
            color: TINTA,
            letterSpacing: '-0.03em',
            maxWidth: 980,
          }}
        >
          {title}
        </span>
        <span style={{ fontSize: 29, color: TINTA_TENUE, marginTop: 26, maxWidth: 940 }}>
          {subtitle}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: 64, height: 3, backgroundColor: ACENTO }} />
        <span style={{ fontSize: 24, color: TINTA_TENUE, marginLeft: 20 }}>nidra.cloud</span>
      </div>
    </div>
  )
}
