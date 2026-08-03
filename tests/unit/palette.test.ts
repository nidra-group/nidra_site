import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * La paleta es intercambiable por diseño: un solo bloque en `app/globals.css`.
 * Esta prueba es lo que hace que ese intercambio sea seguro — valida las
 * reglas de contraste que el bloque documenta, leyendo los valores reales del
 * CSS. Cambiar la paleta y romper la accesibilidad rompe el build.
 */

function parsePalette(): Record<string, string> {
  const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8')
  const root = css.match(/:root\s*\{([^}]+)\}/)?.[1] ?? ''
  const out: Record<string, string> = {}
  for (const [, name, value] of root.matchAll(/--brand-([\w-]+):\s*(#[0-9a-fA-F]{6})/g)) {
    out[name!] = value!
  }
  return out
}

function luminance(hex: string): number {
  const channel = (value: number) => {
    const c = value / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const r = channel(parseInt(hex.slice(1, 3), 16))
  const g = channel(parseInt(hex.slice(3, 5), 16))
  const b = channel(parseInt(hex.slice(5, 7), 16))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi! + 0.05) / (lo! + 0.05)
}

const palette = parsePalette()

/** Las reglas documentadas en el bloque de la paleta, verbatim. */
const RULES: [string, string, number][] = [
  ['ink', 'paper', 7],
  ['ink', 'surface', 7], // el texto de las tarjetas
  ['muted', 'paper', 4.5],
  ['muted', 'surface', 4.5],
  ['critical', 'paper', 4.5],
  ['accent', 'paper', 4.5],
  ['accent', 'surface', 4.5], // enlaces y datos dentro de una tarjeta
  ['paper', 'accent', 4.5], // botón primario: el acento es el fondo
  ['paper', 'accent-deep', 4.5], // botón primario al pasar el cursor
  // WCAG 1.4.11: el borde es lo único que delimita un campo o un botón
  // secundario. Los formularios viven dentro de tarjetas, así que la regla
  // tiene que cumplirse contra AMBOS fondos, no solo contra el papel.
  ['line-strong', 'paper', 3],
  ['line-strong', 'surface', 3],
]

describe('paleta de marca', () => {
  it('define todos los tokens que las reglas nombran', () => {
    const named = new Set(RULES.flat().filter((v) => typeof v === 'string'))
    for (const token of named) {
      expect(palette[token as string], `--brand-${token} falta en :root`).toMatch(/^#/)
    }
  })

  it.each(RULES)('%s sobre %s alcanza %s:1', (fg, bg, minimum) => {
    const ratio = contrast(palette[fg]!, palette[bg]!)
    expect(
      ratio,
      `--brand-${fg} (${palette[fg]}) sobre --brand-${bg} (${palette[bg]}) da ${ratio.toFixed(2)}:1`,
    ).toBeGreaterThanOrEqual(minimum)
  })
})

/**
 * La aparición al desplazar no vuelve a animar la opacidad.
 *
 * Animarla desde 0.01 no rompía nada visualmente, pero hacía que toda
 * herramienta de auditoría midiera el contraste MIENTRAS el elemento era casi
 * transparente y reportara 1.01:1 sobre textos cuyo contraste real es 7.82:1 y
 * 10.48:1. Costaba cuatro puntos de accesibilidad y, peor, hacía que un
 * informe externo dijera que el sitio tiene problemas de contraste.
 *
 * Es fácil de reintroducir sin querer: un desvanecido es lo primero que uno
 * agrega a una animación de entrada.
 */
describe('animación de aparición', () => {
  const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8')
  const keyframes = css.match(/@keyframes\s+reveal-up\s*\{[\s\S]*?\n\s*\}\s*\n\s*\}/)?.[0] ?? ''

  it('existe la animación', () => {
    expect(keyframes, 'No se encontró @keyframes reveal-up en app/globals.css').not.toBe('')
  })

  it('no anima la opacidad', () => {
    expect(
      /opacity\s*:/.test(keyframes),
      'reveal-up volvió a animar la opacidad.\n' +
        'Un elemento semitransparente hace que las auditorías reporten fallos\n' +
        'de contraste falsos. Animá solo `transform`.',
    ).toBe(false)
  })

  it('sigue moviendo algo, o no es una aparición', () => {
    expect(/transform\s*:/.test(keyframes)).toBe(true)
  })
})
