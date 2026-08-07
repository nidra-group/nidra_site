import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

export const alt = 'Nidra — Desarrollo de software con IA para PyMEs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Imagen de vista previa para redes sociales.
 *
 * Sin esto, cada vez que alguien comparte el enlace en LinkedIn, WhatsApp o
 * Slack aparece una tarjeta grande y vacía —`summary_large_image` está
 * declarado en los metadatos—, que es el peor primer contacto posible para un
 * sitio cuyo objetivo es generar confianza.
 *
 * Usa la paleta de noche del sitio: fondo casi negro con el acento menta,
 * que es la cara con la que la marca se presenta. Al cambiar la paleta en
 * `app/globals.css`, actualizar también estos valores: `next/og` no lee CSS.
 */
export default function OpengraphImage() {
  /**
   * El logotipo real, leído de `public/brand/`: si el trazado cambia, esta
   * imagen cambia con él.
   *
   * Va la versión premium y no la plana porque este es el único lugar del
   * sistema donde la marca se ve grande de verdad —280 px de ancho sobre 1200—
   * y a ese tamaño el degradado metálico se lee. En la cabecera, a 30 px de
   * alto, apenas se insinúa.
   *
   * El halo, en cambio, NO se ve acá y no hay nada que arreglar: a 280 px el
   * desenfoque mide 1,4 px al 40 % de opacidad, o sea por debajo de lo que el
   * ojo separa del fondo. Se probó hornearlo en un PNG con Chromium y los
   * píxeles del borde salieron iguales, así que el PNG era un archivo generado
   * de más para un efecto invisible. El halo existe para la marca grande:
   * presentación, portada, foto de perfil.
   */
  const logo = readFileSync(join(process.cwd(), 'public/brand/nidra-logo-glow.svg'), 'utf8')
  const logoUri = `data:image/svg+xml;base64,${Buffer.from(logo).toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0a1322',
          padding: '80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* El logotipo real, no una reconstrucción. 280 × 93 es la proporción
            del lienzo con halo —1580 × 526—, no la del trazado a secas. */}
        <img src={logoUri} width={280} height={93} alt="" />

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Mismo titular que el héroe. Si el relato de la portada cambia y
              esto no, quien comparte el enlace anuncia una promesa distinta
              de la que va a encontrar al hacer clic. */}
          <span
            style={{
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.06,
              color: '#f4efe6',
              letterSpacing: '-0.03em',
              maxWidth: 960,
            }}
          >
            Las horas que perdés todas las semanas tienen solución
          </span>
          <span style={{ fontSize: 29, color: '#9aa9c2', marginTop: 26 }}>
            Sistemas hechos a la medida de tu empresa, sin licencias por persona.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 64, height: 3, backgroundColor: '#edc27c' }} />
          <span style={{ fontSize: 24, color: '#9aa9c2', marginLeft: 20 }}>nidra.cloud</span>
        </div>
      </div>
    ),
    size,
  )
}
