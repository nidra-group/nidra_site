import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/** Icono para iOS. `icon.svg` cubre navegadores modernos; esto, el atajo en el escritorio. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#17191c',
          color: '#f7f5f1',
          fontSize: 112,
          fontFamily: 'Georgia, serif',
        }}
      >
        N
      </div>
    ),
    size,
  )
}
