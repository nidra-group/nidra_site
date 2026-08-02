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
  // Lee el logotipo real desde `public/brand/` en vez de redibujarlo: si el
  // trazado cambia, esta imagen cambia con él.
  const logo = readFileSync(join(process.cwd(), 'public/brand/nidra-logo.svg'), 'utf8')
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
        {/* El logotipo real, no una reconstrucción. */}
        <img src={logoUri} width={268} height={80} alt="" />

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
