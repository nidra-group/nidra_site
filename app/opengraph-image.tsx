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
 * Usa la paleta «madrugada» en su ventana nocturna: fondo tinta con la luz de
 * alba, que es la cara más reconocible de la marca. Al cambiar la paleta en
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
          backgroundColor: '#10241e',
          padding: '80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              fontSize: 44,
              fontWeight: 700,
              color: '#f4f6f2',
              letterSpacing: '-0.02em',
            }}
          >
            nidra
          </span>
          <span
            style={{
              width: 11,
              height: 11,
              borderRadius: 11,
              backgroundColor: '#9be8c6',
              marginLeft: 7,
              marginTop: 20,
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: 74,
              fontWeight: 700,
              lineHeight: 1.05,
              color: '#f4f6f2',
              letterSpacing: '-0.03em',
              maxWidth: 940,
            }}
          >
            La IA sirve cuando llega a producción.
          </span>
          <span style={{ fontSize: 30, color: '#9fb3a9', marginTop: 28 }}>
            Software con IA para pequeñas y medianas empresas.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 64, height: 3, backgroundColor: '#9be8c6' }} />
          <span style={{ fontSize: 24, color: '#9fb3a9', marginLeft: 20 }}>nidra.cloud</span>
        </div>
      </div>
    ),
    size,
  )
}
