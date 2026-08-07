import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { CAJA_LOGO, IDRA, N, N_SOLA, ORO, PAPEL } from '@/lib/brand/paths'

const leer = (ruta: string) => readFileSync(join(process.cwd(), ruta), 'utf8')

/** La barra del horizonte, tal como aparece dentro del trazado del logotipo. */
const HORIZONTE = 'H1499.33V446'

/**
 * Los archivos de marca son derivados versionados, con el mismo riesgo que
 * cualquier derivado que se commitea: envejecer en silencio.
 *
 * Si alguien retoca `lib/brand/paths.ts` y no corre `pnpm build:brand`, el
 * sitio muestra el trazado nuevo y los archivos descargables el viejo. Nadie
 * lo nota en una revisión: los dos se ven bien por separado.
 */
describe('sistema de marca', () => {
  /**
   * Qué trazado le toca a cada archivo. Se declara pieza por pieza y no se
   * deduce del nombre: `nidra-avatar.svg` no dice «símbolo» en ningún lado y
   * sin embargo lleva la n sola, que es justo el caso que una regla por
   * nombre deja pasar mal.
   */
  const GENERADOS: [ruta: string, trazado: string][] = [
    ['public/brand/nidra-logo-glow.svg', N],
    ['public/brand/nidra-logo-glow-placa.svg', N],
    ['public/brand/redes/nidra-cover-linkedin.svg', N],
    ['public/brand/nidra-symbol-glow.svg', N_SOLA],
    ['public/brand/nidra-symbol.svg', N_SOLA],
    ['public/brand/nidra-symbol-mono.svg', N_SOLA],
    ['public/brand/redes/nidra-avatar.svg', N_SOLA],
    ['app/icon.svg', N_SOLA],
  ]

  it('cada archivo generado lleva el trazado vigente', () => {
    for (const [ruta, trazado] of GENERADOS) {
      expect(
        leer(ruta).includes(trazado),
        `${ruta} quedó con un trazado viejo.\nCorré: pnpm build:brand`,
      ).toBe(true)
    }
  })

  /**
   * Esta es la que importa.
   *
   * El símbolo nació resolviendo el recorte al revés: dibujaba la barra entera
   * y la tapaba con el borde del lienzo, así que asomaba un muñón contra el
   * margen. Se ve mal sobre todo en la foto de perfil recortada en círculo.
   *
   * Se comprueba sobre el TRAZADO y no sobre el `viewBox` a propósito: volver
   * a recortar el lienzo dejaría pasar la prueba sin arreglar nada.
   */
  it('el símbolo no dibuja la barra del horizonte, ni siquiera tapada', () => {
    expect(N).toContain(HORIZONTE)
    expect(N_SOLA).not.toContain(HORIZONTE)

    for (const [ruta] of GENERADOS.filter(([, trazado]) => trazado === N_SOLA)) {
      expect(leer(ruta), `${ruta} volvió a dibujar la barra`).not.toContain(HORIZONTE)
    }
  })

  it('el logotipo completo SÍ conserva el horizonte, que es lo que sostiene «idra»', () => {
    const logo = leer('public/brand/nidra-logo-glow.svg')

    expect(logo).toContain(HORIZONTE)
    expect(logo).toContain(IDRA)
  })

  /**
   * El degradado no puede bajar el contraste por debajo del mínimo que la
   * propia paleta declara en `app/globals.css`: acento sobre papel >= 4.5:1.
   * La parada más oscura es la única que corre riesgo real.
   */
  it('la parada más oscura del oro sigue siendo legible sobre el índigo', () => {
    const luminancia = (hex: string) => {
      const [r = 0, g = 0, b = 0] = [1, 3, 5]
        .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
        .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    const contraste = (a: string, b: string) => {
      const [x, y] = [luminancia(a), luminancia(b)]
      return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
    }

    for (const parada of ORO) {
      expect(contraste(parada, PAPEL), `${parada} no llega a 4.5:1 sobre el índigo`).toBeGreaterThan(
        4.5,
      )
    }
  })

  it('el componente no guarda su propia copia del trazado', () => {
    // Nació así: el trazado pegado dentro del componente y copiado a mano en
    // otros siete archivos. Volver a pegarlo acá reabre esa puerta.
    const wordmark = leer('components/site/Wordmark.tsx')

    expect(wordmark).not.toContain('M184.168')
    expect(wordmark).toContain("from '@/lib/brand/paths'")
  })

  it('las definiciones del degradado se declaran una sola vez, no por instancia', () => {
    // El logotipo aparece dos veces por página. Si `Wordmark` trajera sus
    // propias definiciones, el documento tendría el mismo `id` repetido.
    const wordmark = leer('components/site/Wordmark.tsx')

    expect(wordmark).not.toContain('<linearGradient')
    expect(wordmark).toContain('url(#nidra-oro)')
    expect(leer('app/[locale]/layout.tsx')).toContain('<BrandDefs />')
  })

  it('la proporción declarada del logotipo es la del trazado', () => {
    expect(CAJA_LOGO.ancho / CAJA_LOGO.alto).toBeCloseTo(3.36, 2)
  })
})
