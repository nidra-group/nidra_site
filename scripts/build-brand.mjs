#!/usr/bin/env node
/**
 * Genera el sistema de marca desde `lib/brand/paths.ts`: los SVG de
 * `public/brand/`, el favicon de `app/icon.svg` y los PNG para redes.
 *
 * Existe por la misma razón que `build-tech-icons.mjs`: el trazado del
 * logotipo estaba copiado a mano en siete archivos, y cada copia era una
 * versión más esperando desincronizarse. Ahora hay una sola y todo lo demás se
 * deriva de ella.
 *
 * Los PNG se generan con el Chromium de Playwright, que ya es dependencia del
 * proyecto para las pruebas de extremo a extremo. No es una elección de
 * comodidad: los degradados y el desenfoque los dibuja el MISMO motor que va a
 * usar quien mire el sitio, así que el PNG que sube a LinkedIn y el SVG que
 * sirve la web no pueden divergir.
 *
 *   pnpm build:brand
 */
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright'

const RAIZ = process.cwd()
const MARCA = join(RAIZ, 'public/brand')
const REDES = join(MARCA, 'redes')

mkdirSync(REDES, { recursive: true })

/* -------------------------------------------------------------------------- */
/* Los trazados, leídos de su única copia                                      */
/* -------------------------------------------------------------------------- */

// Se lee con expresión regular en vez de importarse porque este script es
// JavaScript y el origen es TypeScript. El archivo existe solo para guardar
// estas constantes, así que su forma es estable y no hay nada que interpretar.
const fuente = readFileSync(join(RAIZ, 'lib/brand/paths.ts'), 'utf8')
const constante = (nombre) => {
  const hallazgo = fuente.match(new RegExp(`export const ${nombre} =\\s*\\n?\\s*'([^']+)'`))
  if (!hallazgo) throw new Error(`no encontré ${nombre} en lib/brand/paths.ts`)
  return hallazgo[1]
}

const N = constante('N')
const IDRA = constante('IDRA')

const CORTE = [
  'M539.296 345.498H1499.33V446H384.562V226.034C384.562 225.015 384.554 224.004 384.537 223H539.296V345.498Z',
  'M539.296 223V446H384.562V226.034C384.562 225.015 384.554 224.004 384.537 223H539.296Z',
]
if (!N.includes(CORTE[0])) throw new Error('cambió el trazado: revisá el corte del horizonte')
const N_SOLA = N.replace(CORTE[0], CORTE[1])

const PAPEL = '#0a1322'
const ORO_PLANO = '#edc27c'

/* -------------------------------------------------------------------------- */
/* Piezas                                                                      */
/* -------------------------------------------------------------------------- */

const DEFS = `
  <defs>
    <linearGradient id="oro" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#F4E0A6"/>
      <stop offset="0.4" stop-color="#EAC57C"/>
      <stop offset="0.72" stop-color="#D3A052"/>
      <stop offset="1" stop-color="#B9893A"/>
    </linearGradient>
    <linearGradient id="cal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#F7F1E7"/>
      <stop offset="1" stop-color="#E8DFCE"/>
    </linearGradient>
    <filter id="halo" x="-15%" y="-15%" width="130%" height="130%">
      <feGaussianBlur stdDeviation="8"/>
    </filter>
  </defs>`

/** El halo es una copia difuminada del propio trazado, no un resplandor aparte. */
const conHalo = (d, sangria = '  ') =>
  `${sangria}<path fill="url(#oro)" opacity="0.4" filter="url(#halo)" d="${d}"/>\n` +
  `${sangria}<path fill="url(#oro)" d="${d}"/>`

const NOTA = `<!-- GENERADO POR scripts/build-brand.mjs — NO EDITAR A MANO.

     La n es el sol naciente y de su pie nace el horizonte, que corre hacia la
     derecha mientras «idra» se apoya encima. Una banda horizontal de 31
     unidades atraviesa el logotipo ENTERO a la altura y = 192..223: no es una
     ranura en una letra, es un plano que cruza todo.

     El trazado vive en lib/brand/paths.ts. Para regenerar:  pnpm build:brand -->`

const svg = (viewBox, cuerpo, nota = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="Nidra">\n` +
  `  <title>Nidra</title>\n  ${NOTA}${nota}\n${cuerpo}\n</svg>\n`

const generados = []
const escribir = (ruta, contenido) => {
  writeFileSync(join(RAIZ, ruta), contenido)
  generados.push(ruta)
}

/* ── 1 · Logotipo completo, premium ────────────────────────────────────────
 * El lienzo se agranda 40 unidades por lado: el halo se difumina hacia afuera
 * y sin ese margen el borde del SVG lo corta en seco. */
escribir(
  'public/brand/nidra-logo-glow.svg',
  svg('-40 -40 1580 526', `${DEFS}\n${conHalo(N)}\n  <path fill="url(#cal)" d="${IDRA}"/>`),
)

/* ── 2 · Logotipo completo con placa, para cuando no se controla el fondo ── */
escribir(
  'public/brand/nidra-logo-glow-placa.svg',
  svg(
    '0 0 1800 626',
    `${DEFS}\n  <rect width="1800" height="626" fill="${PAPEL}"/>\n` +
      `  <g transform="translate(150 90)">\n${conHalo(N, '    ')}\n` +
      `    <path fill="url(#cal)" d="${IDRA}"/>\n  </g>`,
  ),
)

/* ── 3 · El símbolo: la n SOLA ─────────────────────────────────────────────
 * Sin marco de recorte. El símbolo anterior dejaba la barra dibujada y la
 * tapaba con el borde del lienzo, así que asomaba un muñón contra el margen.
 * Acá la barra no está en el trazado. */
const CAJA_SIMBOLO = '-40 -40 619.3 526'

escribir('public/brand/nidra-symbol-glow.svg', svg(CAJA_SIMBOLO, `${DEFS}\n${conHalo(N_SOLA)}`))

escribir(
  'public/brand/nidra-symbol.svg',
  svg(CAJA_SIMBOLO, `  <path fill="${ORO_PLANO}" d="${N_SOLA}"/>`),
)

escribir(
  'public/brand/nidra-symbol-mono.svg',
  svg(
    '0 0 539.3 446',
    `  <path fill="currentColor" d="${N_SOLA}"/>`,
    '\n  <!-- Una tinta: hereda el color del contexto. Sello, bordado, factura. -->',
  ),
)

/* ── 4 · Favicon ───────────────────────────────────────────────────────────
 * Los colores van escritos porque un favicon no lee el CSS del sitio. Sin
 * degradado y sin halo: a 16 píxeles el degradado se aplasta a un tono sucio y
 * el desenfoque se come el contorno. */
const ESCALA = 40 / 446 // la n ocupa 40 de los 64, centrada
escribir(
  'app/icon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  ${NOTA}
  <rect width="64" height="64" rx="14" fill="${PAPEL}"/>
  <g transform="translate(${(64 - 539.3 * ESCALA) / 2} 12) scale(${ESCALA.toFixed(6)})">
    <path fill="${ORO_PLANO}" d="${N_SOLA}"/>
  </g>
</svg>
`,
)

/* ── 5 · Foto de perfil ────────────────────────────────────────────────────
 * LinkedIn la muestra cuadrada; Instagram, WhatsApp y X la recortan EN
 * CÍRCULO. Escalada a 520 de alto, la media diagonal de la n es 408 unidades
 * contra un radio de 500: entra entera en el círculo inscrito. */
escribir(
  'public/brand/redes/nidra-avatar.svg',
  svg(
    '0 0 1000 1000',
    `${DEFS}\n  <rect width="1000" height="1000" fill="${PAPEL}"/>\n` +
      `  <g transform="translate(185.6 240) scale(1.1659)">\n${conHalo(N_SOLA, '    ')}\n  </g>`,
  ),
)

/* ── 6 · Portada de LinkedIn ───────────────────────────────────────────────
 * La marca va a la DERECHA a propósito: LinkedIn encima la foto de perfil en
 * la esquina inferior izquierda, y ahí taparía la n. */
escribir(
  'public/brand/redes/nidra-cover-linkedin.svg',
  svg(
    '0 0 1128 191',
    `${DEFS}\n  <rect width="1128" height="191" fill="${PAPEL}"/>\n` +
      `  <g transform="translate(756 51) scale(0.20)">\n${conHalo(N, '    ')}\n` +
      `    <path fill="url(#cal)" d="${IDRA}"/>\n  </g>`,
  ),
)

/* -------------------------------------------------------------------------- */
/* Los PNG que piden las redes                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Ninguna red acepta SVG: LinkedIn, Instagram y X piden PNG o JPG. Los tamaños
 * no son redondeos estéticos, son los que pide cada plataforma.
 *
 * El destino es una ruta relativa a `public/brand/`, porque no todo lo de acá
 * es para redes: los dos últimos son los iconos del manifiesto de aplicación
 * web —lo que ve quien guarda el sitio en la pantalla de inicio del teléfono—,
 * y ahí un PNG es obligatorio: ningún Android lee el SVG del manifiesto.
 */
const EXPORTAR = [
  ['public/brand/redes/nidra-avatar.svg', 'redes/nidra-avatar-1000.png', 1000, 1000, true],
  ['public/brand/redes/nidra-avatar.svg', 'redes/nidra-avatar-400.png', 400, 400, true],
  ['public/brand/redes/nidra-avatar.svg', 'redes/nidra-avatar-300.png', 300, 300, true],
  ['public/brand/redes/nidra-avatar.svg', 'nidra-icon-192.png', 192, 192, true],
  ['public/brand/redes/nidra-avatar.svg', 'nidra-icon-512.png', 512, 512, true],
  // Portada de página de empresa: 1128×191 exacto, y el doble para pantallas
  // de alta densidad, que es donde se nota el borde del degradado.
  ['public/brand/redes/nidra-cover-linkedin.svg', 'redes/nidra-cover-linkedin.png', 1128, 191, true],
  ['public/brand/redes/nidra-cover-linkedin.svg', 'redes/nidra-cover-linkedin@2x.png', 2256, 382, true],
  // El logotipo suelto, con fondo transparente, para presentaciones y firmas.
  ['public/brand/nidra-logo-glow.svg', 'redes/nidra-logo-1580.png', 1580, 526, false],
  // Y con placa, para cuando el fondo lo pone otro.
  ['public/brand/nidra-logo-glow-placa.svg', 'redes/nidra-logo-placa-1800.png', 1800, 626, true],
]

const navegador = await chromium.launch()
const pagina = await navegador.newPage({ deviceScaleFactor: 1 })

for (const [origen, destino, ancho, alto, opaco] of EXPORTAR) {
  const contenido = readFileSync(join(RAIZ, origen), 'utf8')
  const uri = `data:image/svg+xml;base64,${Buffer.from(contenido).toString('base64')}`

  await pagina.setViewportSize({ width: ancho, height: alto })
  await pagina.setContent(
    `<style>html,body{margin:0;padding:0;background:transparent}
     img{display:block;width:${ancho}px;height:${alto}px}</style>
     <img src="${uri}">`,
  )
  await pagina.locator('img').waitFor()

  await pagina.screenshot({
    path: join(MARCA, destino),
    omitBackground: !opaco,
    clip: { x: 0, y: 0, width: ancho, height: alto },
  })
  generados.push(`public/brand/${destino}`)
}

await navegador.close()

console.log(generados.map((r) => `  ${r}`).join('\n'))
console.log(`\n${generados.length} archivos`)
