/**
 * Segunda pasada de auditoría: verificación de las correcciones.
 * Uso: BASE_URL=http://localhost:3100 node scripts/verify2.mjs
 */
import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:3100'
const OUT = '.shots2'
mkdirSync(OUT, { recursive: true })

const ROUTES = [
  '/es', '/en', '/es/servicios', '/es/integraciones', '/es/contacto',
  '/es/privacidad', '/es/terminos', '/es/cv', '/es/cv/imprimir', '/en/services',
]
const WIDTHS = [320, 375, 768, 1280]

const browser = await chromium.launch()
const report = {}

/* ---------------------------------------------------------------- enlaces */
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await ctx.newPage()

const linkReport = { anchorsSinHref: [], destinos: {}, jsErrors: [] }
page.on('pageerror', (e) => linkReport.jsErrors.push(String(e)))

for (const route of ROUTES) {
  const resp = await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' })
  const data = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a'))
    return {
      sinHref: anchors
        .filter((a) => !a.getAttribute('href') || a.getAttribute('href').trim() === '')
        .map((a) => ({ text: a.textContent.trim().slice(0, 40), cls: a.className.slice(0, 50) })),
      hrefs: anchors.map((a) => a.getAttribute('href')),
    }
  })
  if (data.sinHref.length) linkReport.anchorsSinHref.push({ route, items: data.sinHref })
  for (const h of data.hrefs) {
    if (!h || h.startsWith('mailto:') || h.startsWith('#') || h.startsWith('tel:')) continue
    const url = h.startsWith('http') ? h : `${BASE}${h}`
    if (!url.startsWith(BASE)) { linkReport.destinos[url] = 'externo (no verificado)'; continue }
    if (linkReport.destinos[url]) continue
    const r = await page.request.get(url, { maxRedirects: 5 }).catch((e) => ({ status: () => 'ERR ' + e.message }))
    linkReport.destinos[url] = r.status()
  }
  report[`status ${route}`] = resp.status()
}
report.enlaces = linkReport

/* ------------------------------------------------- formulario: estados */
const formReport = {}

// (a) resumen de errores + foco al primer campo inválido
await page.goto(`${BASE}/es/contacto`, { waitUntil: 'networkidle' })
await page.waitForTimeout(3500) // superar MIN_AGE_MS
await page.click('button[type="submit"]')
await page.waitForTimeout(1500)
formReport.invalido = await page.evaluate(() => {
  const alerta = document.querySelector('[role="alert"]')
  const activo = document.activeElement
  return {
    hayResumen: Boolean(alerta),
    textoResumen: alerta?.textContent.trim().slice(0, 300) ?? null,
    focoEn: activo ? `${activo.tagName}[name=${activo.getAttribute('name')}]` : null,
    camposAriaInvalid: Array.from(document.querySelectorAll('[aria-invalid="true"]')).map((e) => e.getAttribute('name')),
    mencionaCorreo: (alerta?.textContent ?? '').includes('@'),
  }
})
await page.screenshot({ path: `${OUT}/form-invalido.png`, fullPage: true })

// (b) envío válido -> debe llegar a 'unavailable' (sin credenciales), NO a 'rejected'
await page.goto(`${BASE}/es/contacto`, { waitUntil: 'networkidle' })
await page.waitForTimeout(3500)
await page.fill('input[name="name"]', 'Ana Pérez')
await page.fill('input[name="email"]', 'ana@ejemplo.com')
await page.selectOption('select[name="service"]', { index: 1 })
await page.fill('textarea[name="message"]', 'Quiero automatizar la carga de facturas de proveedores, hoy es manual.')
await page.click('button[type="submit"]')
await page.waitForTimeout(2500)
formReport.envioValido = await page.evaluate(() => {
  const alerta = document.querySelector('[role="alert"]')
  const ok = document.querySelector('[role="status"]')
  return {
    exito: Boolean(ok),
    alerta: alerta?.textContent.trim().slice(0, 400) ?? null,
    mencionaCorreoAlternativo: (alerta?.textContent ?? '').includes('hola@nidra.cloud'),
    valoresConservados: {
      name: document.querySelector('input[name=name]')?.value,
      email: document.querySelector('input[name=email]')?.value,
      service: document.querySelector('select[name=service]')?.value,
      message: document.querySelector('textarea[name=message]')?.value?.slice(0, 30),
    },
  }
})
await page.screenshot({ path: `${OUT}/form-fallo.png`, fullPage: true })

// (c) REGRESIÓN: ¿el <select> sigue siendo editable tras un error?
formReport.selectTrasError = await page.evaluate(() => {
  const s = document.querySelector('select[name="service"]')
  return { antes: s?.value, opciones: s?.options.length }
})
await page.selectOption('select[name="service"]', { index: 3 }).catch(() => {})
await page.waitForTimeout(400)
formReport.selectTrasError.despuesDeCambiar = await page.evaluate(
  () => document.querySelector('select[name="service"]')?.value,
)
formReport.selectTrasError.indiceEsperado = await page.evaluate(
  () => document.querySelector('select[name="service"]')?.options[3]?.value,
)

// (d) marca temporal muy nueva (<3s) -> 'rejected'
await page.goto(`${BASE}/es/contacto`, { waitUntil: 'networkidle' })
await page.fill('input[name="name"]', 'Ana Pérez')
await page.fill('input[name="email"]', 'ana@ejemplo.com')
await page.selectOption('select[name="service"]', { index: 1 })
await page.fill('textarea[name="message"]', 'Mensaje enviado demasiado rápido para ser humano, prueba.')
await page.click('button[type="submit"]')
await page.waitForTimeout(2000)
formReport.envioRapido = await page.evaluate(() => {
  const a = document.querySelector('[role="alert"]')
  return { alerta: a?.textContent.trim().slice(0, 300) ?? null, mencionaCorreo: (a?.textContent ?? '').includes('hola@nidra.cloud') }
})
report.formulario = formReport

/* ------------------------------------------------------- nota privacidad */
await page.goto(`${BASE}/es/contacto`, { waitUntil: 'networkidle' })
report.notaPrivacidad = await page.evaluate(() => {
  const btn = document.querySelector('button[type="submit"]')
  if (!btn) return null
  const cont = btn.closest('div')
  const nota = cont?.querySelector('p')
  return {
    texto: nota?.textContent.trim().slice(0, 160) ?? null,
    enlace: nota?.querySelector('a')?.getAttribute('href') ?? null,
    distanciaPx: nota && btn ? Math.round(nota.getBoundingClientRect().top - btn.getBoundingClientRect().bottom) : null,
  }
})

/* ------------------------------------------------- menú móvil (375) */
const mctx = await browser.newContext({ viewport: { width: 375, height: 812 } })
const mp = await mctx.newPage()
await mp.goto(`${BASE}/es`, { waitUntil: 'networkidle' })
const menu = {}
await mp.click('summary')
await mp.waitForTimeout(300)
menu.abreOk = await mp.evaluate(() => document.querySelector('details')?.open)
await mp.screenshot({ path: `${OUT}/menu-abierto.png` })
await mp.keyboard.press('Escape')
await mp.waitForTimeout(300)
menu.cierraConEscape = await mp.evaluate(() => !document.querySelector('details')?.open)
menu.focoTrasEscape = await mp.evaluate(() => document.activeElement?.tagName)
await mp.click('summary')
await mp.waitForTimeout(200)
await mp.mouse.click(20, 600)
await mp.waitForTimeout(300)
menu.cierraConClicFuera = await mp.evaluate(() => !document.querySelector('details')?.open)
// regresión: ¿se cierra al navegar?
await mp.click('summary')
await mp.waitForTimeout(200)
await mp.click('details nav a')
await mp.waitForTimeout(1200)
menu.cierraAlNavegar = await mp.evaluate(() => !document.querySelector('details')?.open)
menu.urlTrasNavegar = mp.url()
await mp.screenshot({ path: `${OUT}/menu-tras-navegar.png` })
// objetivos táctiles del selector de idioma
await mp.goto(`${BASE}/es`, { waitUntil: 'networkidle' })
await mp.click('summary')
await mp.waitForTimeout(300)
menu.selectorIdioma = await mp.evaluate(() =>
  Array.from(document.querySelectorAll('details nav[aria-label] a, details a[hreflang]')).map((a) => {
    const r = a.getBoundingClientRect()
    return { texto: a.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height) }
  }),
)
report.menuMovil = menu

/* ---------------------------------- medidas: longitud de línea real */
const medidas = {}
await page.goto(`${BASE}/es`, { waitUntil: 'networkidle' })
medidas.home = await page.evaluate(() => {
  const out = []
  document.querySelectorAll('p.measure, p.measure-tight').forEach((el) => {
    const cs = getComputedStyle(el)
    const w = el.getBoundingClientRect().width
    // medir ancho real de caracter con canvas
    const c = document.createElement('canvas').getContext('2d')
    c.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
    const t = el.textContent.trim()
    const charW = c.measureText(t).width / t.length
    out.push({
      cls: el.className.split(' ').find((x) => x.startsWith('measure')),
      px: parseFloat(cs.fontSize),
      anchoPx: Math.round(w),
      caracteres: Math.round(w / charW),
      texto: t.slice(0, 40),
    })
  })
  return out
})
report.longitudLinea = medidas

/* ---------------------------- contraste, desbordes, encabezados, foco */
const porAncho = {}
for (const width of WIDTHS) {
  const c = await browser.newContext({ viewport: { width, height: 900 } })
  const p = await c.newPage()
  porAncho[width] = {}
  for (const route of ROUTES) {
    await p.goto(`${BASE}${route}`, { waitUntil: 'networkidle' })
    porAncho[width][route] = await p.evaluate(() => {
      const parse = (s) => { const m = s.match(/[\d.]+/g); return m ? [+m[0], +m[1], +m[2], m[3] === undefined ? 1 : +m[3]] : null }
      const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) }
      const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05) }
      const effBg = (el) => { let n = el; while (n && n !== document.documentElement) { const c = parse(getComputedStyle(n).backgroundColor); if (c && c[3] > 0.95) return c; n = n.parentElement } return [255, 255, 255, 1] }

      const contraste = []; const vistos = new Set()
      document.querySelectorAll('body *').forEach((el) => {
        if (!Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim().length > 1)) return
        const cs = getComputedStyle(el)
        if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return
        const fg = parse(cs.color); if (!fg) return
        const r = ratio(fg, effBg(el)); const px = parseFloat(cs.fontSize)
        const grande = px >= 24 || (px >= 18.66 && +cs.fontWeight >= 700)
        const need = grande ? 3 : 4.5
        if (r < need - 0.02) {
          const k = cs.color + px; if (vistos.has(k)) return; vistos.add(k)
          contraste.push({ ratio: +r.toFixed(2), need, color: cs.color, px, texto: el.textContent.trim().slice(0, 45) })
        }
      })

      const docW = document.documentElement.clientWidth
      const desbordes = []
      document.querySelectorAll('body *').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.width === 0) return
        if (r.right > docW + 1 || r.left < -1) desbordes.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 45), left: Math.round(r.left), right: Math.round(r.right), txt: el.textContent.trim().slice(0, 30) })
      })

      const encabezados = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map((h) => ({ n: +h.tagName[1], t: h.textContent.trim().slice(0, 55) }))
      let saltos = []
      let prev = 0
      for (const h of encabezados) { if (prev && h.n > prev + 1) saltos.push(`h${prev} -> h${h.n}: "${h.t}"`); prev = h.n }
      const h1s = encabezados.filter((h) => h.n === 1)

      const tactiles = []
      document.querySelectorAll('a,button,input,select,textarea,summary,[role="button"]').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) return
        if (r.height < 44) tactiles.push({ tag: el.tagName, txt: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 28), w: Math.round(r.width), h: Math.round(r.height) })
      })

      return {
        contraste,
        desbordes,
        scrollHoriz: document.documentElement.scrollWidth > docW + 1 ? { scrollW: document.documentElement.scrollWidth, docW } : null,
        saltosEncabezado: saltos,
        cantidadH1: h1s.length,
        h1: h1s.map((h) => h.t),
        encabezados,
        tactilesChicos: tactiles,
      }
    })
  }
  await c.close()
}
report.porAncho = porAncho

/* ------------------------------------------------------------- foco */
await page.goto(`${BASE}/es`, { waitUntil: 'networkidle' })
const foco = []
for (let i = 0; i < 14; i++) {
  await page.keyboard.press('Tab')
  foco.push(await page.evaluate(() => {
    const a = document.activeElement
    if (!a || a === document.body) return null
    const cs = getComputedStyle(a)
    const r = a.getBoundingClientRect()
    return {
      tag: a.tagName,
      txt: (a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 30),
      outline: cs.outlineWidth + ' ' + cs.outlineStyle + ' ' + cs.outlineColor,
      visible: r.top >= 0 && r.bottom <= window.innerHeight,
    }
  }))
}
report.ordenFoco = foco

await ctx.close(); await mctx.close(); await browser.close()
writeFileSync(`${OUT}/verify2.json`, JSON.stringify(report, null, 2))
console.log('escrito .shots2/verify2.json')
