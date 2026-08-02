import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/**
 * Icono para iOS. `icon.svg` cubre navegadores modernos; esto, el atajo en el
 * escritorio del teléfono.
 *
 * Lee el símbolo desde `public/brand/` en vez de redibujarlo con cajas: si el
 * trazado de la marca cambia, este icono cambia con él. Una copia a mano sería
 * una cuarta versión del logotipo esperando desincronizarse.
 */
export default function AppleIcon() {
  const symbol = readFileSync(join(process.cwd(), 'public/brand/nidra-symbol.svg'), 'utf8')
  const dataUri = `data:image/svg+xml;base64,${Buffer.from(symbol).toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a1322',
        }}
      >
        <img src={dataUri} width={122} height={96} alt="" />
      </div>
    ),
    size,
  )
}
