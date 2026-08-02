#!/usr/bin/env node
/**
 * Extrae de Simple Icons los trazados de los logotipos que nombra
 * `content/technologies.yaml` y los escribe en `lib/content/tech-icons.ts`.
 *
 * Se genera en tiempo de construcción y no en tiempo de ejecución por dos
 * razones. Primero, el paquete completo pesa varios megabytes y sólo se usan
 * dos docenas de trazados: importarlo entero mandaría todo eso al navegador.
 * Segundo, así el sitio no depende de la disponibilidad del paquete para
 * renderizar, y el resultado queda versionado y revisable en el diff.
 *
 * Falla —y no genera nada— si un identificador del YAML no existe en el
 * paquete. Un logotipo mudo pasa desapercibido en una revisión; un build roto
 * no.
 *
 *   node scripts/build-tech-icons.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'
import * as simpleIcons from 'simple-icons'

const RAIZ = process.cwd()
const ORIGEN = join(RAIZ, 'content/technologies.yaml')
const DESTINO = join(RAIZ, 'lib/content/tech-icons.ts')

const tecnologias = parse(readFileSync(ORIGEN, 'utf8'))
const identificadores = [...new Set(tecnologias.map((t) => t.icon).filter(Boolean))].sort()

const porSlug = new Map()
for (const icono of Object.values(simpleIcons)) {
  if (icono && typeof icono === 'object' && 'slug' in icono) porSlug.set(icono.slug, icono)
}

const faltantes = identificadores.filter((id) => !porSlug.has(id))
if (faltantes.length > 0) {
  console.error(`No existen en Simple Icons: ${faltantes.join(', ')}`)
  console.error('Corregí el campo `icon` en content/technologies.yaml o quitalo.')
  process.exit(1)
}

const entradas = identificadores
  .map((id) => {
    const { title, path } = porSlug.get(id)
    return `  // ${title}\n  ${JSON.stringify(id)}: ${JSON.stringify(path)},`
  })
  .join('\n')

const contenido = `// GENERADO POR scripts/build-tech-icons.mjs — NO EDITAR A MANO.
//
// Trazados de los logotipos que nombra content/technologies.yaml, extraídos de
// Simple Icons. Se versiona a propósito: así el diff muestra cuándo cambia un
// logotipo y el sitio no depende del paquete para renderizar.
//
// Para regenerar, después de tocar el YAML:  pnpm build:icons
//
// Los iconos de Simple Icons son CC0. Las MARCAS siguen siendo de sus
// titulares y acá se usan de forma nominativa, para describir con qué se
// trabaja. Por eso se pintan en un solo color y nunca en su color corporativo:
// un logotipo a color sugiere una relación comercial que no existe.

export const TECH_ICON_PATHS: Record<string, string> = {
${entradas}
}
`

writeFileSync(DESTINO, contenido)
console.log(`${identificadores.length} logotipos escritos en lib/content/tech-icons.ts`)
