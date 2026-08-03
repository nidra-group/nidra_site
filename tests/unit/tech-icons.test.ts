import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { parse } from 'yaml'
import { describe, expect, it } from 'vitest'

import { TECH_ICONS, TECH_SPRITE } from '@/lib/content/tech-icons'

const leer = (ruta: string) => readFileSync(join(process.cwd(), ruta), 'utf8')

/**
 * La lámina de logotipos es un archivo generado y versionado, con el mismo
 * riesgo que cualquier derivado que se commitea: envejecer en silencio.
 *
 * Si alguien agrega una tecnología al YAML y no corre `pnpm build:icons`, el
 * logotipo simplemente no aparece. Nadie lo nota en una revisión: la cápsula
 * se ve bien, solo que sin icono.
 */
describe('lámina de logotipos', () => {
  const lamina = leer('public/logos/tech.svg')
  const yaml = parse(leer('content/technologies.yaml')) as { name: string; icon?: string }[]
  const pedidos = [...new Set(yaml.map((t) => t.icon).filter(Boolean))] as string[]

  it('tiene un símbolo por cada logotipo que nombra el contenido', () => {
    const faltan = pedidos.filter((id) => !lamina.includes(`id="${id}"`))

    expect(faltan, `Falta el logotipo de: ${faltan.join(', ')}.\nCorré: pnpm build:icons`).toEqual(
      [],
    )
  })

  it('la lista que usa el servidor coincide con la lámina', () => {
    expect([...TECH_ICONS].sort()).toEqual(pedidos.sort())
  })

  it('apunta a un archivo estático, no a un trazado en línea', () => {
    expect(TECH_SPRITE).toBe('/logos/tech.svg')
  })
})

/**
 * Los trazados no vuelven al HTML.
 *
 * Dibujarlos dentro de la página los mandaba DOS veces —una en el marcado y
 * otra en la carga de hidratación, porque React reconstruye el árbol—: unos
 * 94 KB de los 233 que pesaba la portada, para dibujar iconos decorativos.
 *
 * Es un cambio fácil de revertir sin querer, porque dibujar un SVG en línea es
 * lo natural al escribir el componente.
 */
describe('la grilla referencia, no dibuja', () => {
  it('TechGrid no contiene ningún trazado', () => {
    const fuente = leer('components/site/TechGrid.tsx')

    expect(
      /<path\s/.test(fuente),
      'TechGrid volvió a dibujar trazados en línea.\n' +
        'Referencialos con <use href={`${TECH_SPRITE}#${id}`} />.',
    ).toBe(false)
  })

  it('tech-icons.ts no vuelve a cargar con los trazados', () => {
    const generado = leer('lib/content/tech-icons.ts')

    // Un trazado de Simple Icons pasa holgado los 200 caracteres; un nombre
    // de logotipo no llega a 30.
    expect(
      /"[^"]{200,}"/.test(generado),
      'lib/content/tech-icons.ts volvió a incluir trazados.\n' +
        'Tiene que listar solo nombres: los trazados viven en la lámina.',
    ).toBe(false)
  })
})
