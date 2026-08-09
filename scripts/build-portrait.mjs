#!/usr/bin/env node
/**
 * Prepara el retrato del currículum a partir de `content/cv/retrato-original.jpg`.
 *
 *   pnpm build:portrait
 *
 * ── POR QUÉ DOS ARCHIVOS Y NO UNO ─────────────────────────────────────────
 * El mismo retrato aparece sobre dos fondos opuestos: la página web es azul
 * casi negro, el PDF descargable es papel blanco. Un solo archivo obliga a
 * elegir cuál de los dos se ve mal.
 *
 *   web        lleva viñeta —el borde del disco se apaga hacia afuera— y un
 *              toque cálido. Sin la viñeta, un disco claro sobre fondo oscuro
 *              se lee como una calcomanía pegada encima.
 *   impresión  va limpio y neutro. Esa misma viñeta, sobre papel, es un cerco
 *              gris alrededor de la cara.
 *
 * ── POR QUÉ EL RECORTE ES CIRCULAR Y NO CUADRADO CON CSS ──────────────────
 * El PDF lo imprime Chromium, y ahí `border-radius` sobre una imagen depende
 * de cómo se aplaste la capa al rasterizar. Con el círculo horneado en el PNG
 * —transparente por fuera— el resultado no depende del renderizador: el
 * archivo YA es un círculo.
 *
 * Se usa el Chromium de Playwright, igual que `build-brand.mjs`: es el mismo
 * motor que dibuja el sitio, así que el retrato que se ve en la web y el que
 * entra al PDF salen de la misma tubería.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright'

const RAIZ = process.cwd()
const ORIGEN = join(RAIZ, 'content/cv/retrato-original.jpg')
const DESTINO = join(RAIZ, 'public/brand/retrato')

mkdirSync(DESTINO, { recursive: true })

/* -------------------------------------------------------------------------- */
/* El encuadre                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Qué trozo del original entra en el círculo, en tanto por uno del ancho y del
 * alto de la foto.
 *
 * No es un centrado automático: la cara no está en el centro geométrico del
 * archivo. Estos cuatro números salieron de mirar el resultado, y si se cambia
 * la foto hay que volver a mirarlo —no hay forma de acertar a ciegas—.
 *
 * La regla que se buscó: los ojos a un tercio de la altura del círculo, y aire
 * suficiente arriba para que la cabeza no toque el borde.
 */
const ENCUADRE = { x: 0.025, y: 0.0, ancho: 0.87, alto: 0.88 }

/** Lo que mide el PNG. Se muestra a 128 px, así que sobra para pantallas densas y para el PDF. */
const LADO = 448

/* -------------------------------------------------------------------------- */
/* El tratamiento                                                              */
/* -------------------------------------------------------------------------- */

/** Oro de la marca, el mismo de `lib/brand/paths.ts`. */
const ORO = '#edc27c'

const VARIANTES = [
  {
    archivo: 'juan-mujica-web.png',
    /**
     * Menos saturación y algo más de contraste: la foto es una toma de
     * teléfono con luz de oficina, y al lado de una paleta de cuatro colores
     * el exceso de información cromática la delata como material ajeno.
     */
    filtro: 'saturate(0.9) contrast(1.06) brightness(1.02)',
    /** Oro al 10 % en `soft-light`: empuja los medios tonos hacia la temperatura del sitio sin teñir la piel. */
    tinte: `background: ${ORO}; opacity: 0.10; mix-blend-mode: soft-light;`,
    /**
     * La viñeta. Transparente hasta el 62 % del radio y de ahí al borde se
     * oscurece hasta el color del papel del sitio. Es lo que hace que el disco
     * termine en el fondo en vez de recortarse contra él.
     */
    vineta:
      'background: radial-gradient(circle at 50% 42%, ' +
      'rgba(10,19,34,0) 62%, rgba(10,19,34,0.35) 86%, rgba(10,19,34,0.72) 100%);',
  },
  {
    archivo: 'juan-mujica-impresion.png',
    // Sobre papel no hay nada que integrar: solo se corrige que la impresión
    // aplana el contraste.
    filtro: 'saturate(0.95) contrast(1.08)',
    tinte: '',
    vineta: '',
  },
]

/* -------------------------------------------------------------------------- */

const foto = readFileSync(ORIGEN)
const fotoUri = `data:image/jpeg;base64,${foto.toString('base64')}`

const navegador = await chromium.launch()
const pagina = await navegador.newPage({ deviceScaleFactor: 1 })
await pagina.setViewportSize({ width: LADO, height: LADO })

const generados = []

for (const { archivo, filtro, tinte, vineta } of VARIANTES) {
  await pagina.setContent(`
    <style>
      html, body { margin: 0; padding: 0; background: transparent; }
      /* El círculo se recorta acá, sobre un elemento que no es la imagen: así
         la foto puede desbordar su caja para encuadrarse sin arrastrar el
         recorte con ella. */
      .disco {
        position: relative;
        width: ${LADO}px; height: ${LADO}px;
        border-radius: 50%;
        overflow: hidden;
      }
      .disco img {
        position: absolute;
        width: ${(100 / ENCUADRE.ancho).toFixed(4)}%;
        height: ${(100 / ENCUADRE.alto).toFixed(4)}%;
        left: ${(-100 * (ENCUADRE.x / ENCUADRE.ancho)).toFixed(4)}%;
        top: ${(-100 * (ENCUADRE.y / ENCUADRE.alto)).toFixed(4)}%;
        object-fit: cover;
        filter: ${filtro};
      }
      .capa { position: absolute; inset: 0; }
    </style>
    <div class="disco">
      <img src="${fotoUri}">
      ${tinte ? `<div class="capa" style="${tinte}"></div>` : ''}
      ${vineta ? `<div class="capa" style="${vineta}"></div>` : ''}
    </div>
  `)
  await pagina.locator('.disco img').waitFor()

  const png = await pagina.locator('.disco').screenshot({ omitBackground: true })
  writeFileSync(join(DESTINO, archivo), png)
  generados.push([`public/brand/retrato/${archivo}`, png.length])
}

await navegador.close()

for (const [ruta, bytes] of generados) {
  console.log(`  ${ruta}  ${(bytes / 1024).toFixed(0)} KB`)
}
