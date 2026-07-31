/** Capturas y comprobaciones visuales de la segunda pasada. */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:3100'
const OUT = '.shots2'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const out = {}

/* --- anillo de foco del botón primario --- */
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
await page.goto(`${BASE}/es`, { waitUntil: 'networkidle' })
for (let i = 0; i < 8; i++) await page.keyboard.press('Tab')
out.focoBotonPrimario = await page.evaluate(() => {
  const a = document.activeElement
  const cs = getComputedStyle(a)
  return {
    texto: a.textContent.trim(),
    outlineColor: cs.outlineColor,
    outlineWidth: cs.outlineWidth,
    outlineOffset: cs.outlineOffset,
    color: cs.color,
    fondoBoton: cs.backgroundColor,
    fondoDetras: getComputedStyle(a.closest('section')).backgroundColor || getComputedStyle(document.body).backgroundColor,
  }
})
const btn = await page.evaluate(() => {
  const r = document.activeElement.getBoundingClientRect()
  return { x: r.x - 20, y: r.y - 20, width: r.width + 40, height: r.height + 40 }
})
await page.screenshot({ path: `${OUT}/foco-boton-primario.png`, clip: btn })

await page.keyboard.press('Tab')
const btn2 = await page.evaluate(() => {
  const r = document.activeElement.getBoundingClientRect()
  return { x: r.x - 20, y: r.y - 20, width: r.width + 40, height: r.height + 40 }
})
await page.screenshot({ path: `${OUT}/foco-boton-secundario.png`, clip: btn2 })

/* --- proceso: cuántas columnas --- */
await page.goto(`${BASE}/es`, { waitUntil: 'networkidle' })
out.proceso = await page.evaluate(() => {
  const ol = Array.from(document.querySelectorAll('ol')).find((o) => getComputedStyle(o).display === 'grid')
  if (!ol) return null
  const cs = getComputedStyle(ol)
  const tops = new Set(Array.from(ol.children).map((li) => Math.round(li.getBoundingClientRect().top)))
  return {
    gridTemplateColumns: cs.gridTemplateColumns,
    columnas: cs.gridTemplateColumns.split(' ').length,
    pasos: ol.children.length,
    filas: tops.size,
  }
})

/* --- encabezados decorativos: los números del proceso son <p>? --- */
out.encabezadosDecorativos = await page.evaluate(() => {
  const nums = []
  document.querySelectorAll('.eyebrow').forEach((el) => nums.push({ tag: el.tagName, txt: el.textContent.trim().slice(0, 30) }))
  return nums
})

/* --- contacto: columna izquierda --- */
const cctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 })
const cp = await cctx.newPage()
await cp.goto(`${BASE}/es/contacto`, { waitUntil: 'networkidle' })
out.contactoColumnas = await cp.evaluate(() => {
  const grid = document.querySelector('div.grid')
  const [izq, der] = Array.from(grid.children)
  const ri = izq.getBoundingClientRect(), rd = der.getBoundingClientRect()
  return {
    izquierdaAlto: Math.round(ri.height),
    derechaAlto: Math.round(rd.height),
    huecoVertical: Math.round(rd.height - ri.height),
    seccionesIzquierda: Array.from(izq.querySelectorAll('section')).map((s) => s.querySelector('h2')?.textContent.trim()),
  }
})
await cp.screenshot({ path: `${OUT}/contacto-1280.png`, fullPage: true })

/* --- cv: descarga --- */
await cp.goto(`${BASE}/es/cv`, { waitUntil: 'networkidle' })
out.cvDescargas = await cp.evaluate(() =>
  Array.from(document.querySelectorAll('a[download]')).map((a) => ({ href: a.getAttribute('href'), texto: a.textContent.trim() })),
)
for (const d of out.cvDescargas) {
  const r = await cp.request.get(`${BASE}${d.href}`)
  d.status = r.status()
  d.contentType = r.headers()['content-type']
  d.bytes = (await r.body()).length
}
await cp.screenshot({ path: `${OUT}/cv-1280.png`, fullPage: true })

/* --- capturas en 4 anchos --- */
for (const [w, h] of [[320, 800], [375, 812], [768, 1024], [1280, 900]]) {
  const c = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })
  const p = await c.newPage()
  for (const [ruta, nombre] of [['/es', 'home'], ['/es/contacto', 'contacto'], ['/es/servicios', 'servicios']]) {
    await p.goto(`${BASE}${ruta}`, { waitUntil: 'networkidle' })
    await p.screenshot({ path: `${OUT}/${nombre}-${w}.png`, fullPage: true })
  }
  await c.close()
}

await browser.close()
writeFileSync(`${OUT}/visual2.json`, JSON.stringify(out, null, 2))
console.log(JSON.stringify(out, null, 2))
