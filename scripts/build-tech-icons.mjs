#!/usr/bin/env node
/**
 * Extrae de Simple Icons los trazados de los logotipos que nombran
 * `content/technologies.yaml` y `content/integrations.yaml`, y los escribe en
 * `lib/content/tech-icons.ts`.
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
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'
import * as simpleIcons from 'simple-icons'

const RAIZ = process.cwd()
const DESTINO = join(RAIZ, 'lib/content/tech-icons.ts')
const LAMINA = join(RAIZ, 'public/logos/tech.svg')

mkdirSync(join(RAIZ, 'public/logos'), { recursive: true })

const leer = (ruta) => parse(readFileSync(join(RAIZ, ruta), 'utf8'))

// Las dos listas comparten una sola lámina a propósito: hay marcas en ambas
// —n8n, Supabase, Docker— y duplicar los trazados en dos archivos obligaría al
// navegador a descargar dos veces lo mismo.
const nombrados = [
  ...leer('content/technologies.yaml'),
  ...leer('content/integrations.yaml').categories.flatMap((c) => c.items),
].map((entrada) => entrada.icon)

const identificadores = [...new Set(nombrados.filter(Boolean))].sort()

const porSlug = new Map()
for (const icono of Object.values(simpleIcons)) {
  if (icono && typeof icono === 'object' && 'slug' in icono) porSlug.set(icono.slug, icono)
}

const faltantes = identificadores.filter((id) => !porSlug.has(id))
if (faltantes.length > 0) {
  console.error(`No existen en Simple Icons: ${faltantes.join(', ')}`)
  console.error('Corregí el campo `icon` en el YAML que lo nombra, o quitalo.')
  process.exit(1)
}

/* -------------------------------------------------------------------------- */
/* 1 · La lámina de símbolos que descarga el navegador                        */
/* -------------------------------------------------------------------------- */

const simbolos = identificadores
  .map((id) => {
    const { title, path } = porSlug.get(id)
    return `  <symbol id="${id}" viewBox="0 0 24 24"><title>${title}</title><path d="${path}"/></symbol>`
  })
  .join('\n')

const lamina = `<svg xmlns="http://www.w3.org/2000/svg">
  <!-- GENERADO POR scripts/build-tech-icons.mjs — NO EDITAR A MANO.

       Los iconos de Simple Icons son CC0. Las MARCAS siguen siendo de sus
       titulares y acá se usan de forma nominativa, para describir con qué se
       trabaja. Por eso se pintan en un solo color y nunca en el suyo: un
       logotipo a color sugiere una relación comercial que no existe. -->
${simbolos}
</svg>
`

writeFileSync(LAMINA, lamina)

/* -------------------------------------------------------------------------- */
/* 2 · La lista de cuáles existen, que sí necesita el servidor                */
/* -------------------------------------------------------------------------- */

const contenido = `// GENERADO POR scripts/build-tech-icons.mjs — NO EDITAR A MANO.
//
// Qué logotipos existen en public/logos/tech.svg. Solo los nombres: los
// trazados viven en esa lámina y los descarga el navegador una sola vez.
//
// Antes acá estaban los trazados y se dibujaban dentro de cada página. Eso
// mandaba 47 KB de curvas DOS VECES —una en el HTML y otra en la carga de
// hidratación, porque React necesita reconstruir el árbol—, unos 94 KB de los
// 233 que pesaba la portada. Para el logotipo de Nidra dibujarlo en línea
// sigue siendo lo correcto: son dos trazados y ahorran una petición. Con
// veintiséis, la cuenta se da vuelta.
//
// Esta lista existe para poder decidir en el servidor si un logotipo está
// disponible: sin él, la tecnología se muestra solo con su nombre en vez de
// dejar un hueco.
//
// Para regenerar, después de tocar el YAML:  pnpm build:icons

export const TECH_ICONS = new Set<string>([
${identificadores.map((id) => `  ${JSON.stringify(id)},`).join('\n')}
])

/** La lámina de símbolos, servida como archivo estático y cacheable. */
export const TECH_SPRITE = '/logos/tech.svg'
`

writeFileSync(DESTINO, contenido)
console.log(`${identificadores.length} logotipos → public/logos/tech.svg (${Math.round(lamina.length / 1024)} KB)`)
