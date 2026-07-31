import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/**
 * Icono para iOS. `icon.svg` cubre navegadores modernos; esto, el atajo en el
 * escritorio del teléfono.
 *
 * Mismo símbolo que el favicon —el arco sobre la línea— dibujado con cajas en
 * vez de SVG porque `next/og` no ejecuta trazados arbitrarios. El arco se
 * aproxima con un borde superior redondeado: a 180 píxeles la diferencia con
 * el arco real es imperceptible, y el gesto (luz curva sobre horizonte recto)
 * se conserva.
 *
 * Los colores están escritos a mano: `next/og` no lee el CSS del sitio. Al
 * cambiar la paleta en `app/globals.css` hay que actualizarlos acá también.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a1322',
        }}
      >
        {/* El arco: una caja ancha y baja con el borde superior curvo, de la
            que solo se ve el borde. */}
        <div
          style={{
            width: 92,
            height: 46,
            borderTop: '15px solid #edc27c',
            borderLeft: '15px solid transparent',
            borderRight: '15px solid transparent',
            borderTopLeftRadius: 92,
            borderTopRightRadius: 92,
            marginBottom: -8,
          }}
        />
        {/* El horizonte. */}
        <div style={{ width: 124, height: 15, borderRadius: 15, backgroundColor: '#9aa9c2' }} />
      </div>
    ),
    size,
  )
}
