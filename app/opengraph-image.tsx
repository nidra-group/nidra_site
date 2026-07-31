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
 * Usa los mismos colores que la paleta de marca. Al cambiar la paleta en
 * `app/globals.css`, actualizar también estos valores: `next/og` no lee CSS.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#f7f5f1',
          padding: '80px',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 44, color: '#17191c', letterSpacing: '-0.01em' }}>Nidra</span>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 10,
              backgroundColor: '#1e5c50',
              marginLeft: 6,
              marginTop: 18,
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: 76,
              lineHeight: 1.05,
              color: '#17191c',
              letterSpacing: '-0.025em',
              maxWidth: 900,
            }}
          >
            La IA sirve cuando llega a producción.
          </span>
          <span style={{ fontSize: 30, color: '#5b6167', marginTop: 28 }}>
            Software con IA para pequeñas y medianas empresas.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 64, height: 3, backgroundColor: '#1e5c50' }} />
          <span style={{ fontSize: 24, color: '#5b6167', marginLeft: 20 }}>nidra.cloud</span>
        </div>
      </div>
    ),
    size,
  )
}
